// M5 API tests: referrals (codes, tracking, milestones, payouts), disputes,
// admin (users/stats), emails (log-only mode).
// Run: node m5-test.js (API must be running at localhost:4000)

const API = "http://localhost:4000/api/v1";
let passed = 0;
let failed = 0;

async function req(method, path, body, token) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function check(name, cond) {
  if (cond) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}`);
  }
}

async function signupLogin(email, role, extra) {
  const password = "Test123!";
  const s = await req("POST", "/auth/signup", {
    email,
    password,
    role,
    firstName: "M5",
    lastName: "User",
    ...(extra || {}),
  });
  const { data } = await req("POST", "/auth/login", { email, password });
  return {
token: data.accessToken,
    id: data.user?.id,
    verificationToken: s.data?.verificationToken,
  };
}

(async () => {
  console.log("M5 Tests: Referrals, Disputes, Admin, Emails\n");

  const ts = Date.now();
  const referrer = await signupLogin(`m5ref${ts}@test.com`, "brand");
  const stranger = await signupLogin(`m5stranger${ts}@test.com`, "creator");
  check("Setup: referrer + stranger", !!referrer.token && !!stranger.token);

  // Admin (seeded on boot in non-production)
  const adminLogin = await req("POST", "/auth/login", {
    email: "admin@pacten.demo",
    password: "AdminPass123",
  });
  const adminToken = adminLogin.data?.accessToken;
  check("Setup: admin login", !!adminToken);

  // ---- Referral code ----
  const me1 = await req("GET", "/referrals/me", null, referrer.token);
  check("Referral dashboard returns code", me1.status === 200 && !!me1.data.code);
  check("Referral link present", !!me1.data.link && me1.data.link.includes("/r/"));
  const code = me1.data.code;
  const me2 = await req("GET", "/referrals/me", null, referrer.token);
  check("Code is stable (idempotent)", me2.data.code === code);

  // ---- Click tracking ----
  const clicksBefore = me1.data.clicks;
  const click = await req("GET", `/referrals/r/${code}`);
  check("Click tracked (200)", click.status === 200 && click.data.ok === true);
  const me3 = await req("GET", "/referrals/me", null, referrer.token);
  check("Click count incremented", me3.data.clicks === clicksBefore + 1);
  const badClick = await req("GET", "/referrals/r/NOPE1234");
  check("Bad code -> 404", badClick.status === 404);

  // ---- Attribution on signup ----
  const referred = await signupLogin(`m5referred${ts}@test.com`, "creator", {
    referralCode: code,
  });
  check("Signup with referral code", !!referred.token);
  const dash1 = await req("GET", "/referrals/me", null, referrer.token);
  check("Referral recorded (pending)", dash1.data.stats.total === 1);
  check("Pending earning not yet available", dash1.data.stats.availableCents === 0);

  // Bad codes are silently ignored
  const badRef = await signupLogin(`m5badref${ts}@test.com`, "brand", {
    referralCode: "ZZZZ9999",
  });
  check("Bad referral code ignored", !!badRef.token);
  const dashBad = await req("GET", "/referrals/me", null, referrer.token);
  check("Bad code created no referral", dashBad.data.stats.total === 1);

  // ---- Qualification (CHANGED — client final rules, Oct 2026) ----
  // A free signup alone earns NOTHING now, and email verification is not a
  // qualifying action. Earnings come from the referred user's subscription
  // payments (20% of the first three) and first completed paid deal (10%
  // of Pacten's commission). Milestone cash rewards are removed.
  const verify = await req("GET", `/auth/verify?token=${referred.verificationToken}`);
  check("Referred user verified", verify.status === 200);
  const dashV = await req("GET", "/referrals/me", null, referrer.token);
  check("Verification alone: referral still pending", dashV.data.stats.successful === 0);
  check("Verification alone: no earnings", dashV.data.stats.availableCents === 0);

  // Referred creator pays for Elite twice ($79 -> 20% = 1580 each)
  const cPlans = await req("GET", "/subscriptions/plans?role=creator", null, referred.token);
  const elitePlan = cPlans.data.find((p) => p.code === "creator-elite");
  await req("POST", "/subscriptions/checkout", { planId: elitePlan.id }, referred.token);
  await req("POST", "/subscriptions/checkout", { planId: elitePlan.id }, referred.token);
  const dash2 = await req("GET", "/referrals/me", null, referrer.token);
  check("Referral -> successful after payments", dash2.data.stats.successful === 1);
  check(
    "Subscription earnings available (2 x 1580)",
    dash2.data.stats.availableCents === 3160
  );
  check(
    "Recent referral row present",
    dash2.data.recent.length === 1 && dash2.data.recent[0].status === "successful"
  );

  // ---- Payout request ----
  const poor = await req(
    "POST",
    "/referrals/payouts",
    { amountCents: 99999999 },
    referrer.token
  );
  check("Insufficient balance -> 400", poor.status === 400);
  // $25 minimum withdrawal: a fresh referrer with a small balance is refused
  const smallRef = await signupLogin(`m5small${ts}@test.com`, "brand");
  const smallDash = await req("GET", "/referrals/me", null, smallRef.token);
  const smallUser = await signupLogin(`m5smallref${ts}@test.com`, "creator", {
    referralCode: smallDash.data.code,
  });
  const proPlans = await req("GET", "/subscriptions/plans?role=creator", null, smallUser.token);
  const proPlan = proPlans.data.find((p) => p.code === "creator-pro");
  await req("POST", "/subscriptions/checkout", { planId: proPlan.id }, smallUser.token);
  const belowMin = await req(
    "POST",
    "/referrals/payouts",
    { amountCents: 580 },
    smallRef.token
  );
  check("Below $25 minimum withdrawal -> 400", belowMin.status === 400);
  const preq = await req(
    "POST",
    "/referrals/payouts",
    { amountCents: 1000 },
    referrer.token
  );
  check("Payout requested", preq.status === 201 && !!preq.data.id);
  const payoutId = preq.data.id;
  const myp = await req("GET", "/referrals/payouts/me", null, referrer.token);
  check("My payouts lists it", myp.data.length >= 1);

  // ---- Admin payout decision ----
  const nonAdmin = await req("GET", "/referrals/admin/payouts", null, referrer.token);
  check("Non-admin blocked from payouts (403)", nonAdmin.status === 403);
  const apl = await req("GET", "/referrals/admin/payouts?status=requested", null, adminToken);
  check(
    "Admin sees requested payout",
    apl.status === 200 && apl.data.some((p) => p.id === payoutId)
  );
  const decide = await req(
    "POST",
    `/referrals/admin/payouts/${payoutId}/decide`,
    { approved: true, notes: "test" },
    adminToken
  );
  check("Admin approves payout", decide.data.status === "paid");
  const decide2 = await req(
    "POST",
    `/referrals/admin/payouts/${payoutId}/decide`,
    { approved: true },
    adminToken
  );
  check("Double decision blocked (400)", decide2.status === 400);

  // ---- Milestones admin ----
  const ms = await req("GET", "/referrals/admin/milestones", null, adminToken);
  check("Milestones listed (4 demo)", ms.status === 200 && ms.data.length === 4);

  // ---- Disputes ----
  const dealRes = await req(
    "POST",
    "/deals",
    { title: `M5 Dispute Deal ${ts}`, creatorId: stranger.id, agreedBudget: "$100" },
    referrer.token
  );
  const dealId = dealRes.data.id;
  check("Setup: deal for dispute", !!dealId);

  const file = await req(
    "POST",
    "/disputes",
    { dealId, reason: "late_delivery", description: "Work arrived two weeks late, missed launch." },
    stranger.token
  );
  check("File dispute (201)", file.status === 201 && !!file.data.id);
  const disputeId = file.data.id;

  const file2 = await req(
    "POST",
    "/disputes",
    { dealId, reason: "quality", description: "Second complaint on same deal here." },
    stranger.token
  );
  check("Second open dispute blocked (400)", file2.status === 400);

  const short = await req(
    "POST",
    "/disputes",
    { dealId, reason: "other", description: "short" },
    referrer.token
  );
  check("Short description blocked (400)", short.status === 400);

  const mine = await req("GET", "/disputes/me", null, stranger.token);
  check("My disputes lists it", mine.data.some((d) => d.id === disputeId));

  // Counterparty (non-filer) must also see the dispute in their list:
  // the list is per-deal-party, not filed-by-me only.
  const counterparty = await req("GET", "/disputes/me", null, referrer.token);
  check("Counterparty lists it", counterparty.data.some((d) => d.id === disputeId));

  const asParty = await req("GET", `/disputes/${disputeId}`, null, referrer.token);
  check("Other party can view", asParty.status === 200);

  const outsider = await signupLogin(`m5outsider${ts}@test.com`, "brand");
  const asOutsider = await req("GET", `/disputes/${disputeId}`, null, outsider.token);
  check("Outsider blocked (403)", asOutsider.status === 403);

  const outsiderList = await req("GET", "/disputes/me", null, outsider.token);
  check(
    "Outsider list hides it",
    outsiderList.status === 200 &&
      Array.isArray(outsiderList.data) &&
      !outsiderList.data.some((d) => d.id === disputeId)
  );

  const adl = await req("GET", "/disputes/admin/all", null, adminToken);
  check("Admin lists disputes", adl.status === 200 && adl.data.some((d) => d.id === disputeId));

  const res1 = await req(
    "POST",
    `/disputes/admin/${disputeId}/resolve`,
    { outcome: "resolved", resolution: "Creator to redeliver within 3 days." },
    adminToken
  );
  check("Admin resolves dispute", res1.data.status === "resolved");

  const res2 = await req(
    "POST",
    `/disputes/admin/${disputeId}/resolve`,
    { outcome: "rejected", resolution: "Trying again here." },
    adminToken
  );
  check("Re-resolve blocked (400)", res2.status === 400);

  // ---- Admin: users + stats ----
  const blocked = await req("GET", "/admin/stats", null, referrer.token);
  check("Non-admin blocked from /admin (403)", blocked.status === 403);

  const stats = await req("GET", "/admin/stats", null, adminToken);
  check("Admin stats", stats.status === 200 && stats.data.users >= 3);

  const users = await req("GET", "/admin/users?search=m5ref", null, adminToken);
  check("Admin user search", users.data.users.length >= 1);
  check("No password hash leaked", !("passwordHash" in (users.data.users[0] || {})));

  const target = users.data.users[0];
  const susp = await req(
    "PATCH",
    `/admin/users/${target.id}/status`,
    { status: "suspended" },
    adminToken
  );
  check("Suspend user", susp.data.status === "suspended");
  const react = await req(
    "PATCH",
    `/admin/users/${target.id}/status`,
    { status: "active" },
    adminToken
  );
  check("Reactivate user", react.data.status === "active");

  console.log(`\nM5: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
})().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
