import type { ReactNode } from 'react';
import { DISHES } from './data';

const rnd = (i: number) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
type Box = { x: number; y: number; w: number; h: number };
export const SLOTS: Record<string, Box> = {
  main: { x: 22, y: 22, w: 140, h: 92 }, side: { x: 172, y: 22, w: 106, h: 62 },
  bread: { x: 172, y: 94, w: 48, h: 74 }, fruit: { x: 230, y: 94, w: 48, h: 74 },
};

function scatter(n: number, cx: number, cy: number, rx: number, ry: number, seed: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = rnd(seed + i) * Math.PI * 2, d = Math.sqrt(rnd(seed + i * 7 + 3)) * 0.82;
    return { x: cx + Math.cos(a) * rx * d, y: cy + Math.sin(a) * ry * d, r: rnd(seed + i * 3) };
  });
}

function Food({ id, left }: { id: string; left: number }) {
  const s = SLOTS[DISHES[id].slot];
  const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
  if (left <= 0.001) return null;
  const k = 0.35 + 0.65 * left;
  switch (id) {
    case 'lentil': case 'chickpea': {
      const base = id === 'lentil' ? '#6E4A33' : '#D69A3F';
      const rx = 56 * k, ry = 35 * k;
      return <g>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={base} />
        <ellipse cx={cx - rx * 0.2} cy={cy - ry * 0.25} rx={rx * 0.55} ry={ry * 0.4} fill="#fff" opacity=".08" />
        {id === 'lentil' && scatter(Math.round(46 * left), cx, cy, rx, ry, 1).map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={1.5} fill="#3B271B" />)}
        {id === 'lentil' && scatter(Math.round(11 * left), cx, cy, rx, ry, 50).map((p, i) => <rect key={'c' + i} x={p.x - 3} y={p.y - 3} width={6} height={6} rx={1} fill={['#F4DBA5', '#E9893C', '#D9534F'][i % 3]} transform={`rotate(${p.r * 60} ${p.x} ${p.y})`} />)}
        {id === 'chickpea' && scatter(Math.round(20 * left), cx, cy, rx, ry, 9).map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3.4} fill="#F0DAA6" stroke="#B5843F" strokeWidth=".8" />)}
        {id === 'chickpea' && scatter(Math.round(9 * left), cx, cy, rx, ry, 90).map((p, i) => <ellipse key={'s' + i} cx={p.x} cy={p.y} rx={5} ry={2.6} fill="#4C7A35" transform={`rotate(${p.r * 180} ${p.x} ${p.y})`} />)}
      </g>;
    }
    case 'hake': {
      const sc = Math.sqrt(left) * 0.95 + 0.1;
      return <g transform={`translate(${cx} ${cy}) scale(${sc})`}>
        <path d="M-52 -6 C-30 -30 30 -28 50 -8 C56 2 44 22 20 24 C-10 28 -48 18 -52 -6Z" fill="#F7F1E6" stroke="#D8CBB4" strokeWidth="2" />
        {[-28, -10, 8, 26].map(x => <path key={x} d={`M${x} -18 q6 16 0 34`} stroke="#E4D8C2" strokeWidth="2" fill="none" />)}
        {left > 0.3 && <path d="M30 -30 a14 14 0 0 1 22 18 z" fill="#F7D64A" stroke="#D9B52C" strokeWidth="1.5" />}
      </g>;
    }
    case 'chicken': {
      const sc = 0.4 + 0.6 * Math.sqrt(left);
      return <g transform={`translate(${cx} ${cy}) scale(${sc})`}>
        <ellipse cx={-10} cy={4} rx={40} ry={26} fill="#FBF8F0" stroke="#E5DCCB" strokeWidth="2" />
        {scatter(16, -10, 4, 36, 22, 4).map((p, i) => <rect key={i} x={p.x} y={p.y} width={5} height={2} rx={1} fill="#E8DFCC" />)}
        <rect x={14} y={-20} width={30} height={18} rx={7} fill="#D9A066" stroke="#B57D45" strokeWidth="1.5" />
        <rect x={18} y={2} width={26} height={16} rx={7} fill="#D19356" stroke="#B57D45" strokeWidth="1.5" />
      </g>;
    }
    case 'salad': return <g>
      {scatter(Math.round(8 * left) || 1, cx, cy, 40, 20, 5).map((p, i) => <ellipse key={i} cx={p.x} cy={p.y} rx={9} ry={5} fill={['#6FA845', '#9BC75A', '#4E8A3A'][i % 3]} transform={`rotate(${p.r * 180} ${p.x} ${p.y})`} />)}
      {scatter(Math.round(3 * left) || 1, cx, cy, 30, 14, 77).map((p, i) => <g key={'t' + i}><circle cx={p.x} cy={p.y} r={4.6} fill="#E0463A" /><circle cx={p.x - 1.4} cy={p.y - 1.4} r={1.2} fill="#fff" opacity=".6" /></g>)}
    </g>;
    case 'tomato': return <g>{scatter(Math.max(1, Math.round(5 * left)), cx, cy, 34, 16, 3).map((p, i) => <g key={i}><circle cx={p.x} cy={p.y} r={8} fill="#E4513F" /><circle cx={p.x} cy={p.y} r={5} fill="#F07A62" />{[0, 1, 2].map(j => <circle key={j} cx={p.x + Math.cos(j * 2.1) * 2.6} cy={p.y + Math.sin(j * 2.1) * 2.6} r={0.9} fill="#F8E3A0" />)}</g>)}</g>;
    case 'beans': return <g>{scatter(Math.max(1, Math.round(10 * left)), cx, cy, 34, 16, 8).map((p, i) => <rect key={i} x={p.x - 11} y={p.y - 2} width={22} height={4.5} rx={2.2} fill={i % 2 ? '#5E9B3E' : '#73AE4C'} transform={`rotate(${p.r * 140 - 70} ${p.x} ${p.y})`} />)}</g>;
    case 'bread': { const q = Math.sqrt(left); return <g><rect x={cx - 15 * q} y={cy - 22 * q} width={30 * q} height={44 * q} rx={7 * q} fill="#C98B4E" /><rect x={cx - 11 * q} y={cy - 18 * q} width={22 * q} height={36 * q} rx={5 * q} fill="#EBC995" /></g>; }
    case 'orange': return left > 0.5 ? <g><circle cx={cx} cy={cy} r={15} fill="#F29A2E" /><circle cx={cx - 4} cy={cy - 5} r={3} fill="#fff" opacity=".35" /></g>
      : <g>{scatter(Math.max(1, Math.round(5 * left)), cx, cy, 10, 18, 21).map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3.6} fill="#F29A2E" />)}</g>;
    case 'apple': return left > 0.6 ? <g><circle cx={cx} cy={cy} r={15} fill="#9CC84B" /><rect x={cx - 1} y={cy - 21} width={2.5} height={7} fill="#6B4A2E" /></g>
      : <g><path d={`M${cx - 5} ${cy - 16} q-6 16 0 32 h10 q6 -16 0 -32z`} fill="#F4EBC8" stroke="#9CC84B" strokeWidth="3" /><circle cx={cx} cy={cy - 2} r={1.4} fill="#4A3020" /><circle cx={cx} cy={cy + 4} r={1.4} fill="#4A3020" /></g>;
    case 'yogurt': return <g><circle cx={cx} cy={cy} r={16} fill="#fff" stroke="#D8D2C6" strokeWidth="2" /><circle cx={cx} cy={cy} r={11} fill={left > 0 ? '#FFFDF7' : '#EEE9DF'} /></g>;
  }
  return null;
}

export function TrayArt({ items, empty }: { items: { dish: string; eaten: number }[]; empty?: boolean }) {
  return (
    <svg viewBox="0 0 300 190" className="tray-svg" aria-label="Food tray">
      <rect x="8" y="8" width="284" height="174" rx="20" fill="#E4E0D8" />
      <rect x="8" y="8" width="284" height="174" rx="20" fill="none" stroke="#CFC9BD" strokeWidth="2" />
      {Object.values(SLOTS).map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="14" fill="#F3F1EC" stroke="#D9D4CA" strokeWidth="1.5" />)}
      <rect x="22" y="124" width="140" height="44" rx="12" fill="#F3F1EC" stroke="#D9D4CA" strokeWidth="1.5" />
      <line x1="38" y1="146" x2="128" y2="146" stroke="#B9B3A8" strokeWidth="5" strokeLinecap="round" />
      <circle cx="138" cy="146" r="7.5" fill="#B9B3A8" />
      {!empty && items.map(it => <Food key={it.dish} id={it.dish} left={(100 - it.eaten) / 100} />)}
    </svg>
  );
}

/* ---------- dish illustrations (recipe cards, lists) ---------- */
const INK = '#1F2A24';
const Bowl = ({ fill, children }: { fill: string; children?: ReactNode }) => (
  <g>
    <path d="M22 10 q2 -5 0 -9 M32 10 q2 -5 0 -9 M42 10 q2 -5 0 -9" stroke="#B9B3A8" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    <path d="M6 18 h52 q-2 20 -26 22 q-24 -2 -26 -22z" fill="#fff" stroke={INK} strokeWidth="2" />
    <ellipse cx="32" cy="18" rx="26" ry="5" fill={fill} stroke={INK} strokeWidth="2" />
    {children}
  </g>
);
const Plate = ({ children }: { children?: ReactNode }) => (
  <g><ellipse cx="32" cy="24" rx="29" ry="14" fill="#fff" stroke={INK} strokeWidth="2" /><ellipse cx="32" cy="24" rx="21" ry="9.5" fill="none" stroke="#E2DCCF" strokeWidth="1.5" />{children}</g>
);
const dots = (xs: [number, number, string][]) => xs.map(([x, y, c], i) => <circle key={i} cx={x} cy={y} r={1.6} fill={c} />);
const ART: Record<string, ReactNode> = {
  'bowl-lentil': <Bowl fill="#6E4A33">{dots([[24, 18, '#E9893C'], [34, 17, '#F4DBA5'], [42, 19, '#D9534F']])}</Bowl>,
  'bowl-chickpea': <Bowl fill="#D69A3F">{dots([[22, 18, '#F0DAA6'], [30, 17, '#4C7A35'], [38, 18, '#F0DAA6'], [44, 17, '#F0DAA6']])}</Bowl>,
  cream: <Bowl fill="#E9A23B"><path d="M24 18 q8 -3 16 0" stroke="#fff" strokeWidth="1.5" fill="none" />{dots([[36, 17, '#4C7A35']])}</Bowl>,
  soup: <Bowl fill="#C9A24A">{dots([[26, 18, '#4C7A35'], [36, 17, '#F0DAA6']])}</Bowl>,
  korma: <Bowl fill="#EDC77A">{dots([[24, 18, '#F0DAA6'], [32, 17, '#4C7A35'], [40, 18, '#F0DAA6']])}</Bowl>,
  'plate-hake': <Plate><path d="M16 24 q10 -10 30 -4 q4 4 -2 8 q-16 6 -28 -4z" fill="#F7F1E6" stroke="#CDBFA6" strokeWidth="1.5" /><circle cx="47" cy="20" r="4" fill="#F7D64A" /></Plate>,
  'plate-chicken': <Plate><ellipse cx="26" cy="25" rx="11" ry="6" fill="#FBF8F0" stroke="#E5DCCB" /><rect x="34" y="18" width="13" height="9" rx="4" fill="#D9A066" /></Plate>,
  'plate-pasta': <Plate><ellipse cx="32" cy="23" rx="14" ry="6.5" fill="#E7C27A" /><ellipse cx="32" cy="22" rx="8" ry="3.6" fill="#B8452F" /></Plate>,
  patties: <Plate>{[[20, 24], [31, 21], [30, 28]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="6.5" ry="4" fill="#B7713F" stroke="#7E4A27" strokeWidth="1.2" />)}<ellipse cx="45" cy="24" rx="6" ry="4" fill="#fff" stroke="#CFC8B8" strokeWidth="1.2" />{dots([[45, 23.5, '#7DA35B']])}</Plate>,
  'pasta-lentil': <Plate><ellipse cx="32" cy="23" rx="15" ry="7" fill="#D8B26A" /><ellipse cx="32" cy="22" rx="9" ry="4" fill="#8E3B26" />{dots([[29, 21, '#5A3520'], [35, 22, '#5A3520']])}</Plate>,
  hummus: <Plate><ellipse cx="25" cy="24" rx="9" ry="5" fill="#E8D3A2" stroke="#C7AE76" /><rect x="36" y="18" width="14" height="3" rx="1.5" fill="#EE8C3A" /><rect x="36" y="23" width="14" height="3" rx="1.5" fill="#7DB060" /><rect x="36" y="28" width="12" height="3" rx="1.5" fill="#EE8C3A" /></Plate>,
  'roast-chickpeas': <Plate><ellipse cx="32" cy="24" rx="15" ry="7" fill="#F6F1E4" />{[[24, 22], [29, 25], [34, 21], [39, 25], [31, 20], [36, 27]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.6" fill="#C98A3E" stroke="#8E5A22" strokeWidth=".8" />)}</Plate>,
  falafel: <Plate>{[[20, 24], [28, 20], [28, 28], [36, 24], [36, 18]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.8" fill="#9C6A32" stroke="#6E4520" strokeWidth="1" />)}<ellipse cx="46" cy="25" rx="5.5" ry="3.6" fill="#B9D99A" stroke="#88AE68" /></Plate>,
  fishcakes: <Plate>{[[22, 24], [33, 22]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="7.5" ry="5" fill="#E2B267" stroke="#A87A36" strokeWidth="1.2" />)}<ellipse cx="44" cy="26" rx="5" ry="3.4" fill="#FFF6D6" stroke="#D9C88A" /></Plate>,
  fingers: <Plate>{[18, 26, 34].map((x, i) => <rect key={i} x={x} y={17 + (i % 2) * 2} width="7" height="14" rx="3" fill="#E2A84E" stroke="#A8732A" strokeWidth="1.2" />)}<path d="M44 20 a6 6 0 0 1 4 9 z" fill="#F7D64A" /></Plate>,
  'fish-tomato': <Plate><ellipse cx="32" cy="24" rx="15" ry="7" fill="#D9573E" /><path d="M22 24 q8 -6 18 -2 q2 3 -2 5 q-10 3 -16 -3z" fill="#F7F1E6" /></Plate>,
  tacos: <Plate>{[22, 40].map(x => <g key={x}><path d={`M${x - 9} 27 a9 9 0 0 1 18 0 z`} fill="#F1D08B" stroke="#C59A45" strokeWidth="1.2" /><path d={`M${x - 6} 25 q6 -6 12 0`} stroke="#7DB060" strokeWidth="2.4" fill="none" /></g>)}</Plate>,
};
export const DishArt = ({ art, size = 64 }: { art: string; size?: number }) => (
  <svg viewBox="0 0 64 42" width={size} height={size * 0.66} className="dish-art" aria-hidden="true">{ART[art] ?? <Plate />}</svg>
);

/* ---------- icons ---------- */
const I = ({ children }: { children: ReactNode }) => <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
export const IconScan = () => <I><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><rect x="8.5" y="8.5" width="7" height="7" rx="1.5" /></I>;
export const IconInsights = () => <I><path d="M6 19v-6M12 19V6M18 19v-9" /></I>;
export const IconRecipes = () => <I><path d="M3.5 12h17a8.5 8.5 0 0 1-17 0z" /><path d="M9 4.5q1.5 1.8 0 3.6M13 3.5q1.5 1.8 0 3.6" /></I>;
export const IconArrow = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const IconBack = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>;
export const IconCheck = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
export const Logo = ({ size = 26 }: { size?: number }) => <svg viewBox="0 0 32 24" width={size} height={size * 0.75} aria-hidden="true"><path d="M2 14 L16 3 L30 14" fill="none" stroke="#4E9A92" strokeWidth="3.4" strokeLinejoin="round" /><path d="M7 21 L16 14 L25 21" fill="none" stroke="#7FC1B6" strokeWidth="3.4" strokeLinejoin="round" /></svg>;
