const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Set view port to a reasonable desktop size
  await page.setViewport({ width: 1920, height: 1080 });

  const baseUrl = 'http://localhost:3000';
  const downloadDir = path.join(__dirname, '../download');

  if (!fs.existsSync(downloadDir)){
    fs.mkdirSync(downloadDir);
  }

  try {
    console.log(`Navigating to ${baseUrl}...`);
    await page.goto(baseUrl, { waitUntil: 'networkidle2' });
    
    // Screenshot of the landing page
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(downloadDir, `screenshot-home-${timestamp}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Saved screenshot to ${screenshotPath}`);

    // Try to find a link to login or other pages if possible, for now just home is fine
    // as the user asked for "screen shots from app".
    
    // Let's try to take a mobile view screenshot as well
    await page.setViewport({ width: 390, height: 844 }); // iPhone 12 Pro dimensions
    const screenshotMobilePath = path.join(downloadDir, `screenshot-home-mobile-${timestamp}.png`);
    await page.screenshot({ path: screenshotMobilePath, fullPage: true });
    console.log(`Saved mobile screenshot to ${screenshotMobilePath}`);

    // --- Dark Mode Screenshots ---
    // Reset viewport to desktop
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Force dark mode via localStorage and reload
    await page.evaluate(() => {
        localStorage.setItem('theme', 'dark');
    });
    // We need to reload to ensure the theme provider picks it up if it doesn't listen to storage events instantly (though it usually does, reload is safer for initial state)
    await page.reload({ waitUntil: 'networkidle2' });
    
    // Give it a second for any animations or mounting
    await new Promise(r => setTimeout(r, 1000));

    const screenshotDarkPath = path.join(downloadDir, `screenshot-home-dark-${timestamp}.png`);
    await page.screenshot({ path: screenshotDarkPath, fullPage: true });
    console.log(`Saved dark mode screenshot to ${screenshotDarkPath}`);

  } catch (error) {
    console.error('Error executing script:', error);
  } finally {
    await browser.close();
  }
})();
