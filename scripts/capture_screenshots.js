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

  } catch (error) {
    console.error('Error executing script:', error);
  } finally {
    await browser.close();
  }
})();
