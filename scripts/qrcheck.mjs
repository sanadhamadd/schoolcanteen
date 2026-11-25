import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = await b.newPage(); await p.goto('https://sanadhamadd.github.io/schoolcanteen/');
const data = 'data:image/png;base64,' + readFileSync(process.argv[2]).toString('base64');
console.log(await p.evaluate(async (src) => { if (!('BarcodeDetector' in window)) return 'no BarcodeDetector'; const img = new Image(); img.src = src; await img.decode(); const r = await new BarcodeDetector({ formats: ['qr_code'] }).detect(img); return r.map(x => x.rawValue).join(','); }, data));
await b.close();
