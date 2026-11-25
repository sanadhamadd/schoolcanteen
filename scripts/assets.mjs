// Generates the QR codes (for the deck and the desktop view) and the app icons.
import QRCode from 'qrcode';
import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'node:fs';
const URL = process.argv[2];
const opts = { errorCorrectionLevel: 'M', margin: 2, color: { dark: '#1F2A24', light: '#FFFFFF' } };
writeFileSync('public/qr.svg', await QRCode.toString(URL, { ...opts, type: 'svg' }));
await QRCode.toFile('../schoolcanteen-qr.png', URL, { ...opts, width: 2048 });
writeFileSync('../schoolcanteen-qr.svg', await QRCode.toString(URL, { ...opts, type: 'svg' }));
const icon = (s) => `<html><body style="margin:0"><div style="width:${s}px;height:${s}px;background:#EF7B51;display:grid;place-items:center">
<div style="width:${s * .62}px;height:${s * .62}px;border-radius:50%;background:#F5C443;border:${s * .03}px solid #1F2A24;display:grid;place-items:center;font:800 ${s * .26}px Helvetica,Arial;color:#1F2A24;letter-spacing:-${s * .01}px">SC</div></div></body></html>`;
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = await b.newPage();
for (const [s, f] of [[192, 'icon-192.png'], [512, 'icon-512.png'], [180, 'apple-touch-icon.png']]) {
  await p.setViewport({ width: s, height: s }); await p.setContent(icon(s)); await p.screenshot({ path: `public/${f}` });
}
await b.close();
console.log('assets ok');
