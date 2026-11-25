import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
const qr = readFileSync('../schoolcanteen-qr.svg', 'utf8');
const font = readFileSync('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2').toString('base64');
const html = `<html><head><style>
@font-face{font-family:Inter;src:url(data:font/woff2;base64,${font});font-weight:100 900}
*{margin:0;box-sizing:border-box}body{width:1920px;height:1080px;background:#F1EDE6;font-family:Inter;color:#4F5F50;position:relative;overflow:hidden}
.brand{position:absolute;top:92px;right:110px;font:400 26px Arial;color:#3d3d3d}
h1{position:absolute;top:130px;left:120px;font-size:118px;font-weight:800;letter-spacing:-2px;line-height:1;text-transform:uppercase}
.sub{position:absolute;top:268px;left:124px;font:italic 400 40px Arial;color:#C1693F}
.steps{position:absolute;top:400px;left:120px;display:flex;flex-direction:column;gap:44px;width:960px}
.st{display:flex;align-items:center;gap:36px}
.n{flex:none;width:104px;height:104px;border-radius:50%;background:#E9A57E;color:#4F5F50;display:grid;place-items:center;font-size:48px;font-weight:500}
.st b{display:block;font-size:44px;font-weight:700;color:#3F4D40}.st span{font:400 32px Arial;color:#4a4a4a}
.wifi{color:#C1693F}
.card{position:absolute;top:200px;right:120px;width:560px;background:#4F5F50;border-radius:48px;padding:44px 44px 36px;text-align:center}
.qr{background:#fff;border-radius:28px;padding:18px}.qr svg{display:block;width:100%;height:auto}
.url{margin-top:24px;color:#F1EDE6;font-size:24px;font-weight:600}
.band{position:absolute;left:0;right:0;bottom:0;height:150px;background:#C1693F;color:#fff;display:flex;align-items:center;justify-content:center;gap:24px;font-size:44px;font-weight:700}
.band svg{width:64px;height:64px}
</style></head><body>
<div class="brand">SchoolCanteen</div>
<h1>Try it yourself</h1>
<div class="sub">a 2-minute interactive demo, live on your phone</div>
<div class="steps">
 <div class="st"><div class="n">1</div><div><b>Connect to <span class="wifi" style="font:inherit">IE Students</span> Wi-Fi</b><span>The demo needs you on the IE Students network.</span></div></div>
 <div class="st"><div class="n">2</div><div><b>Scan the QR code</b><span>Open your phone camera and point it at the code.</span></div></div>
 <div class="st"><div class="n">3</div><div><b>Slide to scan your first tray</b><span>No app to install, no sign-up.</span></div></div>
</div>
<div class="card"><div class="qr">${qr}</div><div class="url">sanadhamadd.github.io/schoolcanteen</div></div>
<div class="band"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M2.5 9a14 14 0 0 1 19 0M6 12.5a9 9 0 0 1 12 0M9.2 16a4.5 4.5 0 0 1 5.6 0"/><circle cx="12" cy="19.3" r="1" fill="#fff"/></svg>Please connect to the IE Students Wi-Fi before scanning</div>
</body></html>`;
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = await b.newPage(); await p.setViewport({ width: 1920, height: 1080 }); await p.setContent(html, { waitUntil: 'networkidle0' });
await p.screenshot({ path: '../schoolcanteen-qr-slide.png' }); await b.close(); console.log('ok');
