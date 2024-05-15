const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrollToEndAndCollectURLs() {
  const browser = await puppeteer.launch({ headless: false }); // Run with the browser visible -- YOU can change this, just for debugging reasons it's visible
  const page = await browser.newPage();
  await page.goto('https://www.launchcaster.xyz/discover', { waitUntil: 'networkidle0' });

  let urls = new Set();

  try {
    let previousHeight = 0, currentHeight = await page.evaluate('document.body.scrollHeight');
    while (previousHeight !== currentHeight) {
      previousHeight = currentHeight;
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await new Promise(function(resolve) { setTimeout(resolve, 5000); });
      currentHeight = await page.evaluate('document.body.scrollHeight');
      const newUrls = await page.evaluate(() =>
        Array.from(document.querySelectorAll('main section a'), a => a.href)
      );
      newUrls.forEach(url => urls.add(url));
      console.log(`Current URL count: ${urls.size}`);
    }
  } catch (e) {
    console.error('Error during scrolling or URL collection:', e);
  }

  await browser.close();
  const urlArray = Array.from(urls);
  fs.writeFileSync(path.join(__dirname, 'urls.json'), JSON.stringify(urlArray, null, 2), 'utf-8');
  console.log('Collected URLs:', urlArray);
  return urlArray;
}

scrollToEndAndCollectURLs();
