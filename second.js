/**
 *
 * This script takes the output from the first script and crawls all of the pages.  It can easily be expanded to try to get more data if you need it.  FYI: It is using scraping so if the html format changes on launchcaster.xyz the script will need to be updated to account for those changes.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
  path: 'output.csv',
  header: [
    {id: 'postName', title: 'Post Name'},
    {id: 'postDate', title: 'Post Date'},
    {id: 'postUrl', title: 'URL'},
    {id: 'description', title: 'Description'} // New field for description
  ],
  append: true
});

async function fetchDataFromUrls(urls) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const results = [];

  for (let url of urls) {
    await page.goto(url, { waitUntil: 'networkidle0' });
    const data = await page.evaluate(() => {
      const postName = document.querySelector('h1')?.innerText; // Name from an h1 tag
      const postDate = document.querySelector('.post-date')?.innerText; // Adjust selectors as necessary
      const postUrl = document.querySelector('a.button_root__IyU03.button_secondary__ZCsjB.button_anchor__Bf9b0')?.href; // URL from a specific a tag
      const description = document.querySelector('.productInfo_description__OOPEp')?.innerText; // Description from a specific class
      return { postName, postDate, postUrl, description };
    });
    results.push(data);
    await csvWriter.writeRecords([data]);
  }

  await browser.close();
  return results;
}

// Read URLs from the file
const urls = JSON.parse(fs.readFileSync(path.join(__dirname, 'urls.json'), 'utf-8'));

fetchDataFromUrls(urls).then(data => {
  console.log('Extracted Data:', data);
  console.log('Data has been written to CSV file.');
});
