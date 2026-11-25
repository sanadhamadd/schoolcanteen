import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const U = 'https://sanadhamadd.github.io/schoolcanteen/';
await p.goto(U, { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1500));
await p.reload({ waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 1500)); // second load must NOT count again
await p.click('.s-thumb'); await new Promise(r => setTimeout(r, 2500));
await p.setViewport({ width: 1000, height: 600 }); await p.goto(U + 'count.html', { waitUntil: 'networkidle0' }); await new Promise(r => setTimeout(r, 2500));
console.log('count page shows: opens=' + await p.$eval('#opens', e => e.textContent) + ' starts=' + await p.$eval('#starts', e => e.textContent) + ' | ' + await p.$eval('#st', e => e.textContent));
await p.screenshot({ path: '../screenshots/15-count-page.png' }); await b.close();
