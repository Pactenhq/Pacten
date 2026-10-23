// m2-demo-seed.js — deterministic demo data for the M2 client demo video.
// Run on your PC where the local stack is up (Postgres + API):
//   node m2-demo-seed.js
// API expected at http://localhost:4000/api/v1 (override with API_URL env).
// Re-runnable: wipes the previous demo run first.
//
// What it creates:
//   brand    demo-brand@pacten.demo / DemoPass123  (Nova Cosmetics)
//   creator  demo-creator@pacten.demo / DemoPass123 (Areeba Khan)
//   2 open campaigns, 2 applications (1 accepted, 1 pending)
// Use these creds to log in while recording.

const BASE = process.env.API_URL || 'http://localhost:4000/api/v1';

const BRAND = {
  email: 'demo-brand@pacten.demo',
  password: 'DemoPass123',
  role: 'brand',
  firstName: 'Nova',
  lastName: 'Team',
  companyName: 'Nova Cosmetics',
};

const CREATOR = {
  email: 'demo-creator@pacten.demo',
  password: 'DemoPass123',
  role: 'creator',
  firstName: 'Areeba',
  lastName: 'Khan',
  displayName: 'Areeba Khan',
};

async function api(method, path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* non-JSON */ }
  return { status: res.status, data };
}

async function signupOrLogin(user) {
  let r = await api('POST', '/auth/signup', user);
  if (r.status === 201 && r.data?.verificationToken) {
    await api('GET', `/auth/verify?token=${r.data.verificationToken}`);
  }
  if (r.status === 409) {
    console.log(`(info) ${user.email} already exists — logging in instead`);
  } else if (r.status !== 201 && r.status !== 409) {
    throw new Error(`signup failed for ${user.email}: ${r.status} ${JSON.stringify(r.data)}`);
  }
  r = await api('POST', '/auth/login', { email: user.email, password: user.password });
  if (r.status !== 200 || !r.data?.accessToken) {
    throw new Error(`login failed for ${user.email}: ${r.status} ${JSON.stringify(r.data)}`);
  }
  return r.data.accessToken;
}

// Remove any previous demo run (applications first, then campaigns).
async function wipe() {
  try {
    const ct = await signupOrLogin(CREATOR);
    const apps = await api('GET', '/campaigns/applications/mine', null, ct);
    if (Array.isArray(apps.data)) {
      for (const a of apps.data) {
        await api('DELETE', `/campaigns/applications/${a.id}`, null, ct);
      }
    }
  } catch (e) { console.log(`(warn) creator wipe: ${e.message}`); }
  try {
    const bt = await signupOrLogin(BRAND);
    const mine = await api('GET', '/campaigns/mine', null, bt);
    if (Array.isArray(mine.data)) {
      for (const c of mine.data) {
        await api('DELETE', `/campaigns/${c.id}`, null, bt);
      }
    }
  } catch (e) { console.log(`(warn) brand wipe: ${e.message}`); }
}

async function main() {
  console.log('--- Pacten M2 demo seed ---');
  await wipe();

  const brandToken = await signupOrLogin(BRAND);
  const creatorToken = await signupOrLogin(CREATOR);
  console.log('users ready');

  const camp1 = await api('POST', '/campaigns', {
    title: 'Summer Glow Skincare Launch',
    description:
      'We are launching our new Summer Glow serum line and need creators to produce authentic skincare routine content featuring the products.',
    deliverables: '3 Instagram Reels + 2 TikTok videos',
    budget: '$500 - $1,000',
    deadline: '2026-11-15',
    niches: ['beauty', 'skincare'],
  }, brandToken);
  if (camp1.status !== 201) throw new Error(`campaign 1 failed: ${JSON.stringify(camp1.data)}`);

  const camp2 = await api('POST', '/campaigns', {
    title: 'Tech Gadget Unboxing Series',
    description:
      'Unbox and review our latest wireless earbuds. Looking for tech creators with an engaged audience.',
    deliverables: '1 YouTube video + 2 Shorts',
    budget: '$300 - $600',
    deadline: '2026-11-30',
    niches: ['tech', 'gadgets'],
  }, brandToken);
  if (camp2.status !== 201) throw new Error(`campaign 2 failed: ${JSON.stringify(camp2.data)}`);

  const app1 = await api('POST', `/campaigns/${camp1.data.id}/apply`, {
    coverLetter: 'I create skincare routine content for 120k followers — this launch fits my audience perfectly.',
    proposal: 'Week 1: teaser reel. Week 2: full routine reel + TikTok duo. Week 3: results update.',
    proposedBudget: '$750',
  }, creatorToken);
  if (app1.status !== 201) throw new Error(`apply 1 failed: ${JSON.stringify(app1.data)}`);

  const app2 = await api('POST', `/campaigns/${camp2.data.id}/apply`, {
    coverLetter: 'Tech reviewer with hands-on unboxing experience and studio lighting setup.',
    proposal: 'Cinematic unboxing video with sound test and comparison to two competitors.',
    proposedBudget: '$450',
  }, creatorToken);
  if (app2.status !== 201) throw new Error(`apply 2 failed: ${JSON.stringify(app2.data)}`);

  const acc = await api('PATCH', `/campaigns/applications/${app1.data.id}/status`, { status: 'accepted' }, brandToken);
  if (acc.status !== 200) throw new Error(`accept failed: ${JSON.stringify(acc.data)}`);

  console.log('seed complete ✓');
  console.log('');
  console.log('Record the video with these logins (local API):');
  console.log(`  Brand   ${BRAND.email} / ${BRAND.password}`);
  console.log(`  Creator ${CREATOR.email} / ${CREATOR.password}`);
  console.log('');
  console.log('Video shows: marketplace (2 campaigns) → search "skincare" →');
  console.log('creator applies / checks My Applications (1 accepted, 1 pending) →');
  console.log('brand sees received applications → accepts/rejects → My Campaigns.');
}

main().catch((e) => { console.error('SEED FAILED:', e.message); process.exit(1); });
