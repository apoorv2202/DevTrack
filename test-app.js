const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  await page.goto('http://localhost:3001');
  console.log("Loaded root");
  
  // click get started
  await page.waitForSelector('button');
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Get Started')) {
      await b.click();
      console.log("Clicked Get Started");
      break;
    }
  }

  await page.waitForTimeout(2000);
  console.log("Waited 2s");
  
  const html = await page.content();
  if (html.includes("Create your account")) {
    console.log("Register page loaded successfully");
  } else if (html.includes("Welcome back")) {
    console.log("Login page loaded successfully");
  } else {
    console.log("UNKNOWN PAGE LOADED");
  }

  await browser.close();
})();
