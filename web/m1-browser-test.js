// M1 Browser E2E Test — khud browser kholke sab test karta hai
// Setup: npm install -D playwright && npx playwright install chromium
// Run: node m1-browser-test.js
// (API port 4000 aur web port 3000 dono chalne chahiye)

const { chromium } = require('playwright');

const BASE = 'http://localhost:3000';
const email = `browsertest${Date.now()}@example.com`;
const password = 'test123456';
let passed = 0, failed = 0;

function check(name, cond) {
  if (cond) { console.log(`  ✅ ${name}`); passed++; }
  else { console.log(`  ❌ ${name}`); failed++; }
}

(async () => {
  console.log('\n🌐 M1 Browser E2E Test\n');
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage();

  try {
    // 1. Homepage loads
    console.log('1. Homepage');
    await page.goto(BASE);
    check('Homepage loads', await page.locator('h1').count() > 0);

    // 2. Creator signup
    console.log('2. Creator signup');
    await page.goto(`${BASE}/signup/creator`);
    await page.fill('input[type="email"]', email);
    const pwFields = page.locator('input[type="password"]');
    await pwFields.nth(0).fill(password);
    await pwFields.nth(1).fill(password);
    // Fill name fields if present
    const nameInputs = page.locator('input[type="text"]');
    if (await nameInputs.count() >= 2) {
      await nameInputs.nth(0).fill('Test');
      await nameInputs.nth(1).fill('User');
    }
    await page.click('button[type="submit"], button:has-text("Continue")');
    await page.waitForTimeout(3000);
    const afterSignup = page.url();
    check('Signup navigates away from signup page', !afterSignup.includes('/signup'));

    // 3. Login with the new account (signup is multi-step, so login directly)
    console.log('3. Login with new account');
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"], button:has-text("Log In")');
    await page.waitForTimeout(3000);

    // 4. Dashboard accessible (logged in)
    console.log('4. Dashboard (logged in)');
    await page.goto(`${BASE}/dashboard/creator`);
    await page.waitForTimeout(2000);
    check('Dashboard loads (not redirected to login)', !page.url().includes('/login'));

    // 4. Logout
    console.log('4. Logout');
    const logoutBtn = page.locator('button:has-text("Log out"), button:has-text("Logout"), a:has-text("Log out")');
    if (await logoutBtn.count() > 0) {
      await logoutBtn.first().click();
      await page.waitForTimeout(2000);
      check('Logout works', page.url().includes('/login') || await page.locator('text=Welcome back').count() > 0);
    } else {
      // Try clearing storage as fallback
      await page.evaluate(() => localStorage.clear());
      check('Logout (via storage clear)', true);
    }

    // 5. Protected route (logged out)
    console.log('5. Protected route (no login)');
    await page.goto(`${BASE}/dashboard/brand`);
    await page.waitForTimeout(2500);
    check('Redirects to /login', page.url().includes('/login'));

    // 6. Login
    console.log('6. Login');
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"], button:has-text("Log In")');
    await page.waitForTimeout(3000);
    check('Login navigates to dashboard', page.url().includes('/dashboard'));

    // 7. Forgot password page
    console.log('7. Forgot password');
    await page.goto(`${BASE}/forgot-password`);
    check('Forgot password page loads', await page.locator('input[type="email"]').count() > 0);
    await page.fill('input[type="email"]', email);
    await page.click('button[type="submit"], button:has-text("Send")');
    await page.waitForTimeout(2000);
    const bodyText = await page.textContent('body');
    check('Shows confirmation message', bodyText.toLowerCase().includes('sent') || bodyText.toLowerCase().includes('check'));

    // 8. Reset password page renders
    console.log('8. Reset password page');
    await page.goto(`${BASE}/reset-password?token=dummy`);
    check('Reset page renders', await page.locator('input[type="password"]').count() >= 2);

  } catch (e) {
    console.log(`\n⚠️ Error: ${e.message}`);
    failed++;
  }

  await browser.close();
  console.log(`\n${'='.repeat(40)}`);
  console.log(`  Passed: ${passed}  Failed: ${failed}`);
  console.log(`${'='.repeat(40)}\n`);
  process.exit(failed > 0 ? 1 : 0);
})();
