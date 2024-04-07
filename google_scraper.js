const puppeteer = require("puppeteer");
const selectRandom = () => {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)  AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
  ];
  var randomNumber = Math.floor(Math.random() * userAgents.length);
  return userAgents[randomNumber];
};

async function scrapGoogle() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const customUA = selectRandom();

  // Set custom user agent
  await page.setUserAgent(customUA);
  // Navigate the page to a URL
  await page.goto("https://www.google.com/search?q=javascript&gl=us&hl=en");

  let titles = [];
  let links = [];
  let snippets = [];
  let displayedLinks = [];

  const data = await page.evaluate(() => {
    titles = Array.from(document.querySelectorAll(".g .yuRUbf h3")).map(
      (title) => title.innerHTML
    );
    links = Array.from(document.querySelectorAll(".yuRUbf a")).map(
      (title) => title.innerHTML
    );
    snippets = Array.from(document.querySelectorAll(".g .VwiC3b")).map(
      (title) => title.innerHTML
    );
    displayedLinks = Array.from(
      document.querySelectorAll(".g .yuRUbf .NJjxre .tjvcx")
    ).map((title) => title.innerHTML);
    return [titles, links, snippets, displayedLinks]
  });

  console.log(data);
  await browser.close();
}
scrapGoogle();
