import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  CLASS_WEEK_BASE, DEFAULT_FOCUS, DISHES, FIXABLE, PUPILS, QUOTES, REASONS, REASON_BASE, REASON_ORDER, RECIPES, TRAYS, TREND, VERIFY_RAMP, WEEK,
  eatenColor, fmt, leftColor, lossKg, trayLeft, type ReasonId,
} from './data';
import { DishArt, IconArrow, IconBack, IconCheck, IconInsights, IconRecipes, IconScan, Logo, TrayArt } from './art';

/* ---------------- state ---------------- */
type Tab = 'scan' | 'insights' | 'recipes';
type Phase = 'idle' | 'scanning' | 'results' | 'ask' | 'thanks';
interface Saved { votes: { dish: string; reason: ReasonId }[]; focus: Record<string, ReasonId>; sent: Record<string, ReasonId>; steps: Record<string, boolean> }
const KEY = 'schoolcanteen-demo-v1';
const empty = (): Saved => ({ votes: [], focus: {}, sent: {}, steps: {} });
const load = (): Saved => { try { return { ...empty(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return empty(); } };
const buzz = (ms = 12) => { try { navigator.vibrate?.(ms); } catch { /* no-op */ } };

function useCount(target: number, dur = 900, from?: number) {
  const [v, setV] = useState(from ?? 0);
  const prev = useRef(from ?? 0);
  useEffect(() => {
    const start = performance.now(), a = prev.current; let raf = 0;
    const tick = (t: number) => { const p = Math.min(1, (t - start) / dur), e = 1 - Math.pow(1 - p, 3); setV(a + (target - a) * e); if (p < 1) raf = requestAnimationFrame(tick); else prev.current = target; };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}
const Count = ({ value, dec = 0, suffix = '', from }: { value: number; dec?: number; suffix?: string; from?: number }) => <>{fmt(useCount(value, 900, from), dec)}{suffix}</>;

/* ---------------- app ---------------- */
export default function App() {
  const [saved, setSaved] = useState<Saved>(load);
  const [tab, setTab] = useState<Tab>('scan');
  const [phase, setPhase] = useState<Phase>('idle');
  const [trayId, setTrayId] = useState('tue');
  const [detail, setDetail] = useState<string | null>(null);
  const [recipeDish, setRecipeDish] = useState('lentil');
  const [sheet, setSheet] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(saved)); }, [saved]);
  const update = (f: (s: Saved) => Saved) => setSaved(s => f({ ...s }));
  const step = (k: string) => update(s => ({ ...s, steps: { ...s.steps, [k]: true } }));
  const scrollTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  useLayoutEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [tab, detail]);

  const go = (t: Tab) => { buzz(8); setTab(t); if (t === 'insights') step('report'); if (t === 'recipes') step('recipe'); };
  const showToast = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 3200); };
  const focusFor = (dish: string): ReasonId => saved.focus[dish] ?? [...saved.votes].reverse().find(v => v.dish === dish)?.reason ?? DEFAULT_FOCUS[dish] ?? 'taste';

  const ctx: Ctx = { saved, update, step, phase, setPhase, trayId, setTrayId, go, setDetail, detail, recipeDish, setRecipeDish, showToast, setConfetti, focusFor, scrollTop, scrollRef };
  const head = tab === 'scan' ? ['CEIP demo school · Class 4A', 'Tray return'] : tab === 'insights' ? ['Catering nutritionist', 'Insights'] : ['Catering nutritionist', 'Recipe fix'];

  const app = (
    <div className="app">
      <div className="statusbar"><span>12:41</span><span className="island" /><span className="sb-r"><i className="sig" />5G<i className="bat" /></span></div>
      <header className="hdr">
        <div><div className="kicker">{head[0]}</div><h1 className="title">{head[1]}</h1></div>
        <button className="avatar" onClick={() => { buzz(); setSheet(true); }} aria-label="About this demo">SC</button>
      </header>
      <main className="scroll" ref={scrollRef}>
        <div className="screen" key={tab + (detail ?? '')} data-anim={detail ? 'push' : 'fade'}>
          {tab === 'scan' && <ScanScreen c={ctx} />}
          {tab === 'insights' && (detail ? <DishDetail c={ctx} dish={detail} /> : <InsightsScreen c={ctx} />)}
          {tab === 'recipes' && <RecipesScreen c={ctx} />}
        </div>
      </main>
      <nav className="tabbar">
        {([['scan', 'Scan', <IconScan />], ['insights', 'Insights', <IconInsights />], ['recipes', 'Recipes', <IconRecipes />]] as [Tab, string, ReactNode][]).map(([t, l, ic]) => (
          <button key={t} className={'tab' + (tab === t ? ' on' : '')} onClick={() => { if (t === 'insights' && tab === 'insights') setDetail(null); go(t); }}>{ic}<span>{l}</span></button>
        ))}
      </nav>
      {toast && <div className="toast" role="status">{toast}</div>}
      {confetti > 0 && <Confetti key={confetti} />}
      {sheet && <Sheet c={ctx} close={() => setSheet(false)} reset={() => { localStorage.removeItem(KEY); setSaved(empty()); setPhase('idle'); setTrayId('tue'); setDetail(null); setRecipeDish('lentil'); setTab('scan'); setSheet(false); }} />}
    </div>
  );
  return <Stage caption={caption(tab, phase, detail, saved, recipeDish, focusFor)}>{app}</Stage>;
}

interface Ctx {
  saved: Saved; update: (f: (s: Saved) => Saved) => void; step: (k: string) => void;
  phase: Phase; setPhase: (p: Phase) => void; trayId: string; setTrayId: (s: string) => void;
  go: (t: Tab) => void; detail: string | null; setDetail: (d: string | null) => void;
  recipeDish: string; setRecipeDish: (d: string) => void; showToast: (m: string) => void; setConfetti: (f: (n: number) => number) => void;
  focusFor: (d: string) => ReasonId; scrollTop: () => void; scrollRef: React.RefObject<HTMLDivElement | null>;
}

/* ---------------- shared bits ---------------- */
const Pill = ({ children, dot = 'var(--green-dot)' }: { children: ReactNode; dot?: string }) => <div className="pill"><i style={{ background: dot }} />{children}</div>;
const Bar = ({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) => {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 60 + delay); return () => clearTimeout(t); }, [pct, delay]);
  return <div className="bar"><i style={{ width: `${w}%`, background: color }} /></div>;
};
const answers = (dish: string, votes: Saved['votes']) => {
  const base = { ...(REASON_BASE[dish] ?? { taste: 0, texture: 0, cold: 0, portion: 0 }) };
  votes.filter(v => v.dish === dish).forEach(v => { base[v.reason] += 1; });
  return base;
};
const Stacked = ({ counts, mine }: { counts: Record<ReasonId, number>; mine?: ReasonId }) => {
  const total = REASON_ORDER.reduce((a, k) => a + counts[k], 0) || 1;
  return <>
    <div className="stack">{REASON_ORDER.map((k, i) => <i key={k} style={{ flexGrow: counts[k], background: REASONS[k].color, animationDelay: `${i * 90}ms` }} />)}</div>
    <div className="legend">{REASON_ORDER.map(k => <span key={k} className={mine === k ? 'mine' : ''}><i style={{ background: REASONS[k].color }} />{REASONS[k].label} {Math.round((counts[k] / total) * 100)}%{mine === k && <b className="you">+1 you</b>}</span>)}</div>
  </>;
};

/* ---------------- 1 · Scan ---------------- */
function ScanScreen({ c }: { c: Ctx }) {
  const tray = TRAYS.find(t => t.id === c.trayId)!;
  const { phase, setPhase } = c;
  const [sub, setSub] = useState(0);
  const [picked, setPicked] = useState<ReasonId | null>(null);
  const main = tray.items[0], mainDish = DISHES[main.dish];
  const needsWhy = main.eaten < 50;
  const left = trayLeft(tray);
  const classCount = CLASS_WEEK_BASE + c.saved.votes.length;

  useEffect(() => {
    if (phase !== 'scanning') return;
    setSub(0);
    const t = [setTimeout(() => setSub(1), 1100), setTimeout(() => setSub(2), 2200), setTimeout(() => { setPhase('results'); c.step('losses'); buzz(20); }, 3400)];
    return () => t.forEach(clearTimeout);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => { buzz(); setPicked(null); c.step('scan'); setPhase('scanning'); c.scrollTop(); };
  const vote = (r: ReasonId) => {
    if (picked) return;
    buzz(25); setPicked(r);
    c.update(s => ({ ...s, votes: [...s.votes, { dish: main.dish, reason: r }], steps: { ...s.steps, why: true } }));
    setTimeout(() => { setPhase('thanks'); c.setConfetti(n => n + 1); c.scrollTop(); }, 520);
  };
  const status = phase === 'idle' ? ['Waiting for a tray', 'Camera · tray return', 'var(--coral)'] : phase === 'scanning' ? ['Scanning', 'Demo tray', 'var(--yellow)'] : ['Tray scanned', 'Demo tray', 'var(--green-dot)'];
  const subs = ['Finding each dish…', 'Estimating what was left…', 'Calculating protein, fibre and iron…'];

  return <>
    <Pill>{tray.day} lunch · {tray.theme}</Pill>
    <div className={`vf ${phase}` + (phase === 'ask' || phase === 'thanks' ? ' compact' : '')}>
      <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
      <div className="vf-tray">
        <div className="tray-empty"><TrayArt items={tray.items} empty /></div>
        {phase !== 'idle' && <div className="tray-food"><TrayArt items={tray.items} /></div>}
        {phase === 'scanning' && <>
          <div className="scanline" />
          {tray.items.map((it, i) => { const b = { main: [7, 11, 47, 49], side: [57, 11, 36, 33], bread: [57, 49, 17, 39], fruit: [76, 49, 17, 39] }[DISHES[it.dish].slot]!;
            return <div key={it.dish} className="detect" style={{ left: `${b[0]}%`, top: `${b[1]}%`, width: `${b[2]}%`, height: `${b[3]}%`, animationDelay: `${600 + i * 320}ms` }}><span>{DISHES[it.dish].name}</span></div>; })}
        </>}
      </div>
      <div className="vf-foot"><span><i style={{ background: status[2] }} className={phase === 'scanning' ? 'pulse' : ''} />{status[0]}</span><span>{status[1]}</span></div>
    </div>

    {phase === 'idle' && <div className="enter">
      <h2 className="h-big">Drop your tray,<br />we scan it.</h2>
      <p className="muted">The camera sees food only, never faces. It estimates how much of each dish was eaten.</p>
      <div className="label">Pick a demo tray</div>
      <div className="tray-pick">{TRAYS.map(t => <button key={t.id} className={'tp' + (t.id === c.trayId ? ' on' : '')} onClick={() => { buzz(6); c.setTrayId(t.id); }}>
        <DishArt art={DISHES[t.items[0].dish].art} size={44} /><b>{t.short}</b><span>{DISHES[t.items[0].dish].short}</span></button>)}</div>
      <button className="btn primary" onClick={start}>Scan a demo tray</button>
    </div>}

    {phase === 'scanning' && <div className="enter">
      <h2 className="h-big">Analysing…</h2>
      <div className="progress"><i /></div>
      <p className="muted">Estimating each dish, then protein, fibre and iron.</p>
      <ul className="substeps">{subs.map((s, i) => <li key={s} className={i < sub ? 'done' : i === sub ? 'now' : ''}><span className="tick">{i < sub ? <IconCheck /> : null}</span>{s}</li>)}</ul>
    </div>}

    {phase === 'results' && <div className="enter">
      <div className="card results">
        <div className="card-meta"><span>AI estimate · {tray.items.length} dishes found</span><span>94% confidence</span></div>
        {tray.items.map((it, i) => <div className="dish-row" key={it.dish}>
          <div className="row-top"><span>{DISHES[it.dish].name}</span><b>{it.eaten}% eaten</b></div>
          <Bar pct={it.eaten} color={eatenColor(it.eaten)} delay={i * 120} />
        </div>)}
      </div>
      <div className="label">Left on this tray</div>
      <div className="nutri3">
        <div className="nt" style={{ background: 'var(--pink)' }}><b><Count value={left.protein} dec={1} /> g</b><span>protein</span></div>
        <div className="nt" style={{ background: 'var(--mint)' }}><b><Count value={left.fibre} dec={1} /> g</b><span>fibre</span></div>
        <div className="nt" style={{ background: 'var(--blue-soft)' }}><b><Count value={left.iron} dec={1} /> mg</b><span>iron</span></div>
      </div>
      {needsWhy ? <>
        <p className="note">Most of the <b>{mainDish.short}</b> came back: {fmt(mainDish.protein * (100 - main.eaten) / 100)} g of protein this pupil didn't get.</p>
        <button className="btn primary" onClick={() => { buzz(); setPhase('ask'); c.scrollTop(); }}>Ask the pupil why <IconArrow /></button>
      </> : <>
        <div className="clean"><span>🎉</span><div><b>Clean tray!</b><p>Almost everything was eaten. No question needed.</p></div></div>
      </>}
      <button className="btn ghost" onClick={() => { setPhase('idle'); c.scrollTop(); }}>Scan another tray</button>
    </div>}

    {phase === 'ask' && <div className="enter">
      <h2 className="h-big">Why did you leave the {mainDish.short}?</h2>
      <p className="muted">One tap. It goes to the kitchen, not to your teacher.</p>
      <div className="reasons">{REASON_ORDER.map(k => <button key={k} className={'reason' + (picked === k ? ' picked' : picked ? ' dim' : '')} style={{ background: REASONS[k].tile }} onClick={() => vote(k)}>
        <span className="emoji">{REASONS[k].emoji}</span><span>{REASONS[k].label}</span>{picked === k && <span className="chk"><IconCheck /></span>}</button>)}</div>
      <p className="tiny center">Anonymous · no name, no photo of the pupil</p>
    </div>}

    {phase === 'thanks' && <div className="enter center">
      <div className="plus1">+1</div>
      <h2 className="h-big center">Thanks! The kitchen<br />will see it.</h2>
      <div className="classcard"><span>Class 4A this week</span><b><Count value={classCount} from={classCount - 1} /></b></div>
      {picked && <p className="muted">You said <b>{REASONS[picked].emoji} {REASONS[picked].label}</b>. It now counts in {answers(main.dish, c.saved.votes)[picked] + REASON_ORDER.filter(k => k !== picked).reduce((a, k) => a + answers(main.dish, c.saved.votes)[k], 0)} answers on {mainDish.short}.</p>}
      <button className="btn primary" onClick={() => { c.setDetail(main.dish); c.go('insights'); }}>See what the kitchen sees <IconArrow /></button>
      <button className="btn ghost" onClick={() => { setPhase('idle'); c.scrollTop(); }}>Scan another tray</button>
    </div>}
  </>;
}

/* ---------------- 3 · Insights ---------------- */
function InsightsScreen({ c }: { c: Ctx }) {
  const [day, setDay] = useState(1);
  const days = WEEK.days;
  const protein = days.reduce((a, x) => a + lossKg(DISHES[x.dish].protein, x.left), 0);
  const iron = days.reduce((a, x) => a + lossKg(DISHES[x.dish].iron, x.left), 0);
  const avgLeft = days.reduce((a, x) => a + x.left, 0) / days.length;
  const waste = days.reduce((a, x) => a + (PUPILS * DISHES[x.dish].portionG * x.left) / 100 / 1000, 0);
  const sel = days[day], sd = DISHES[sel.dish];
  const all = REASON_ORDER.reduce((o, k) => ({ ...o, [k]: Object.keys(REASON_BASE).reduce((a, dsh) => a + answers(dsh, c.saved.votes)[k], 0) }), {} as Record<ReasonId, number>);
  const allTotal = REASON_ORDER.reduce((a, k) => a + all[k], 0);
  const ranked = [...days].sort((a, b) => b.left - a.left);

  return <>
    <Pill dot="var(--sky)">{WEEK.label} · {PUPILS} pupils/day</Pill>
    <div className="tiles">
      <div className="tile" style={{ background: 'var(--blue-soft)' }}><b><Count value={PUPILS * 5} dec={0} /></b><span>meals served</span></div>
      <div className="tile" style={{ background: 'var(--yellow-soft)' }}><b><Count value={avgLeft} dec={0} />%</b><span>of main dishes left</span></div>
      <div className="tile" style={{ background: 'var(--pink)' }}><b><Count value={protein} dec={1} /> kg</b><span>protein thrown away</span></div>
      <div className="tile" style={{ background: 'var(--lilac)' }}><b><Count value={iron} dec={1} /> g</b><span>iron thrown away</span></div>
    </div>
    <div className="card">
      <h3>Share left on the tray, by day</h3>
      <div className="glasses">{days.map((x, i) => <button key={x.d} className={'glass-col' + (i === day ? ' on' : '')} onClick={() => { buzz(6); setDay(i); }}>
        <div className="glass"><i style={{ height: `${x.left}%`, background: leftColor(x.left), animationDelay: `${i * 80}ms` }} /></div><b>{x.left}%</b><span>{x.d}</span></button>)}</div>
    </div>
    <button className="callout" onClick={() => FIXABLE.includes(sel.dish) && c.setDetail(sel.dish)} key={sel.d}>
      <p><b className="y">{sd.name}</b> came back <b className="y">{sel.left}%</b> uneaten on {sel.day}: {fmt(lossKg(sd.protein, sel.left))} kg of protein and {fmt(lossKg(sd.iron, sel.left))} g of iron lost in one lunch.</p>
      {FIXABLE.includes(sel.dish) ? <span className="see">See why <IconArrow /></span> : <span className="see ok">Well accepted ✓</span>}
    </button>

    <h3 className="sec">Most rejected dishes</h3>
    <div className="card list">{ranked.map((x, i) => { const fx = FIXABLE.includes(x.dish); return (
      <button key={x.d} className="lrow" disabled={!fx} onClick={() => c.setDetail(x.dish)}>
        <span className="rank">{i + 1}</span><DishArt art={DISHES[x.dish].art} size={44} />
        <span className="lmain"><b>{DISHES[x.dish].name}</b><Bar pct={x.left} color={leftColor(x.left)} delay={i * 90} /></span>
        <span className="lpct">{x.left}%<small>left</small></span>{fx && <span className="chev">›</span>}
      </button>); })}</div>

    <h3 className="sec">Why pupils leave food</h3>
    <div className="card"><div className="card-meta"><span>{allTotal.toLocaleString('en-GB')} anonymous answers this week</span>{c.saved.votes.length > 0 && <span className="you">+{c.saved.votes.length} yours</span>}</div><Stacked counts={all} /></div>

    <h3 className="sec">Trend · share of main dishes eaten</h3>
    <div className="card"><Trend /><p className="tiny">Protein thrown away: {fmt(TREND[0].protein)} → {fmt(TREND[TREND.length - 1].protein)} kg/week since 13 Oct.</p></div>

    <div className="card waste">
      <div><b>{fmt(waste, 0)} kg</b><span>main-dish food wasted this week</span></div>
      <div><b>{fmt((waste * 1000) / (PUPILS * 5), 0)} g</b><span>per pupil per day</span></div>
      <div><b>100%</b><span>of trays scanned ({(PUPILS * 5).toLocaleString('en-GB')})</span></div>
    </div>
    <p className="tiny center">Illustrative demo data for one Madrid school.</p>
  </>;
}

function Trend() {
  const W = 300, H = 120, px = (i: number) => 18 + i * ((W - 36) / (TREND.length - 1)), py = (v: number) => H - 22 - ((v - 50) / 30) * (H - 40);
  const pts = TREND.map((t, i) => `${px(i)},${py(t.eaten)}`).join(' ');
  return <svg viewBox={`0 0 ${W} ${H}`} className="trend" role="img" aria-label="Share eaten rose from 61% to 67% over six weeks">
    {[50, 65, 80].map(v => <g key={v}><line x1="12" x2={W - 8} y1={py(v)} y2={py(v)} stroke="#E7DFD0" strokeDasharray="3 4" /><text x={W - 8} y={py(v) - 3} textAnchor="end" className="axis">{v}%</text></g>)}
    <polygon points={`${px(0)},${H - 22} ${pts} ${px(TREND.length - 1)},${H - 22}`} fill="var(--green)" opacity=".1" />
    <polyline points={pts} fill="none" stroke="var(--green)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" className="draw" />
    {TREND.map((t, i) => <g key={t.w}><circle cx={px(i)} cy={py(t.eaten)} r={i === TREND.length - 1 ? 5.5 : 4} fill={i === TREND.length - 1 ? 'var(--coral)' : '#fff'} stroke="var(--ink)" strokeWidth="2" />
      <text x={px(i)} y={py(t.eaten) - 10} textAnchor="middle" className="val">{t.eaten}%</text><text x={px(i)} y={H - 6} textAnchor="middle" className="axis">{t.w}</text></g>)}
  </svg>;
}

function DishDetail({ c, dish }: { c: Ctx; dish: string }) {
  const x = DISHES[dish], day = WEEK.days.find(w => w.dish === dish)!;
  const counts = answers(dish, c.saved.votes), total = REASON_ORDER.reduce((a, k) => a + counts[k], 0);
  const mine = [...c.saved.votes].reverse().find(v => v.dish === dish)?.reason;
  return <>
    <button className="back" onClick={() => c.setDetail(null)}><IconBack /> This week</button>
    <h2 className="h-dish">{x.name}</h2>
    <div className="bigstat"><b><Count value={day.left} />%</b><span>of each portion<br />comes back</span></div>
    <div className="card"><h3>Why pupils leave it · {total} answers</h3><Stacked counts={counts} mine={mine} /></div>
    <div className="card"><h3>Lost per lunch</h3>
      <div className="nutri3">
        <div className="nt" style={{ background: 'var(--pink)' }}><b>{fmt(lossKg(x.protein, day.left))} kg</b><span>protein</span></div>
        <div className="nt" style={{ background: 'var(--mint)' }}><b>{fmt(lossKg(x.fibre, day.left))} kg</b><span>fibre</span></div>
        <div className="nt" style={{ background: 'var(--blue-soft)' }}><b>{fmt(lossKg(x.iron, day.left))} g</b><span>iron</span></div>
      </div>
    </div>
    <button className="btn primary" onClick={() => { c.setRecipeDish(dish); c.setDetail(null); c.go('recipes'); }}>Fix this recipe</button>
  </>;
}

/* ---------------- 4–5 · Recipes + verify ---------------- */
function RecipesScreen({ c }: { c: Ctx }) {
  const dish = c.recipeDish, x = DISHES[dish], day = WEEK.days.find(w => w.dish === dish)!;
  const focus = c.focusFor(dish), rec = RECIPES[dish][focus];
  const counts = answers(dish, c.saved.votes), total = REASON_ORDER.reduce((a, k) => a + counts[k], 0);
  const sent = c.saved.sent[dish] === focus;
  const verifyRef = useRef<HTMLDivElement>(null);
  const base = 100 - day.left;
  const weeks = VERIFY_RAMP.map(f => Math.round(base + (rec.target - base) * f));
  const send = () => {
    buzz(20); c.update(s => ({ ...s, sent: { ...s.sent, [dish]: focus }, steps: { ...s.steps, verify: true } }));
    c.showToast('Sent to the kitchen. The camera will check uptake from next week.');
    setTimeout(() => verifyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
  };
  const rows: [string, string, string][] = [
    ['Protein', `${fmt(x.protein, x.protein % 1 ? 1 : 0)} g`, `${fmt(rec.protein, rec.protein % 1 ? 1 : 0)} g`],
    ['Fibre', `${fmt(x.fibre, x.fibre % 1 ? 1 : 0)} g`, `${fmt(rec.fibre, rec.fibre % 1 ? 1 : 0)} g`],
    ['Iron', `${fmt(x.iron)} mg`, `${fmt(rec.iron)} mg`],
    ['Food cost', `€${x.cost.toFixed(2)}`, `€${rec.cost.toFixed(2)}`],
  ];
  const wasteOld = (PUPILS * x.portionG * day.left) / 100 / 1000, wasteNew = (PUPILS * x.portionG * (100 - rec.target)) / 100 / 1000;
  const cmp: [string, string, string][] = [
    ['Share of portion eaten', `${base}%`, `${rec.target}%`],
    ['Protein eaten per pupil', `${fmt(x.protein * base / 100)} g`, `${fmt(rec.protein * rec.target / 100)} g`],
    ['Iron eaten per pupil', `${fmt(x.iron * base / 100)} mg`, `${fmt(rec.iron * rec.target / 100)} mg`],
    ['Protein lost per lunch', `${fmt(lossKg(x.protein, day.left))} kg`, `${fmt(lossKg(rec.protein, 100 - rec.target))} kg`],
    ['Food wasted per lunch', `${fmt(wasteOld)} kg`, `${fmt(wasteNew)} kg`],
  ];
  return <>
    <Pill>Suggested for the nutritionist</Pill>
    <div className="seg">{FIXABLE.map(d => <button key={d} className={d === dish ? 'on' : ''} onClick={() => { buzz(6); c.setRecipeDish(d); }}>{DISHES[d].short.replace(/^\w/, m => m.toUpperCase())}</button>)}</div>
    <div className="card dishcard" style={{ background: 'var(--pink)' }}>
      <DishArt art={x.art} /><div><b>{x.name}</b><span>{day.left}% left · {QUOTES[dish][focus]}</span></div>
    </div>
    <div className="label">Main complaint · tap to change ({total} answers)</div>
    <div className="chips">{REASON_ORDER.map(k => <button key={k} className={'chip' + (k === focus ? ' on' : '')} onClick={() => { buzz(6); c.update(s => ({ ...s, focus: { ...s.focus, [dish]: k } })); }}>
      {REASONS[k].emoji} {REASONS[k].label} <small>{Math.round(counts[k] / total * 100)}%</small></button>)}</div>
    <div className="becomes"><span>becomes</span></div>
    <div className="card dishcard proposed" key={dish + focus} style={{ background: 'var(--mint)' }}>
      <DishArt art={rec.art} /><div><b>{rec.name}</b><span>{rec.note}</span></div>
    </div>
    <div className="card ai" key={'ai' + dish + focus}>
      <div className="ai-h"><span className="spark">✦</span> Why this fix</div>
      <p>{rec.why}</p>
      <ol>{rec.steps.map(s => <li key={s}>{s}</li>)}</ol>
    </div>
    <div className="card table">
      <div className="tr th"><span>Per portion</span><span>Now</span><span>Proposed</span></div>
      {rows.map(r => <div className="tr" key={r[0]}><span>{r[0]}</span><b>{r[1]}</b><b>{r[2]}</b></div>)}
      <p className="tiny">Allergens to check: {rec.allergens}. Estimates.</p>
    </div>
    {sent ? <div className="sentok"><IconCheck /> Sent to the kitchen · verifying uptake</div> : <button className="btn primary" onClick={send}>Send to the kitchen</button>}

    {sent && <div ref={verifyRef} className="enter">
      <div className="card verify">
        <h3>Verify: share eaten, 4-week pilot</h3>
        <div className="vchart">
          <div className="vaxis"><span>100%</span><span>50%</span><span>0%</span></div>
          <div className="vbars">{weeks.map((v, i) => <div key={i} className="vcol"><div className="vplot"><div className="vbar" style={{ height: `${v}%`, background: i === 0 ? 'var(--coral)' : 'var(--green)', animationDelay: `${i * 140}ms` }}><b>{v}%</b></div></div><span>Wk {i + 1}<br />{i === 0 ? x.short.split(' ').slice(-1)[0] : 'new'}</span></div>)}</div>
        </div>
        <p className="tiny">Simulation. Weeks 2–4 are targets, not measurements.</p>
      </div>
      <div className="card compare">
        <h3>Before → after, per lunch ({PUPILS} pupils)</h3>
        {cmp.map(r => <div className="crow" key={r[0]}><span>{r[0]}</span><span className="old">{r[1]}</span><IconArrow /><b>{r[2]}</b></div>)}
        <div className="delta"><b>−{Math.round((1 - wasteNew / wasteOld) * 100)}%</b> food waste · <b>+{Math.round(((rec.protein * rec.target) / (x.protein * base) - 1) * 100)}%</b> protein actually eaten</div>
        <span className="demo-tag">Demonstration data</span>
      </div>
    </div>}
    {!sent && <p className="tiny center">Send it to see the 4-week verification.</p>}
  </>;
}

/* ---------------- overlays ---------------- */
function Confetti() {
  const cols = ['#EF7B51', '#F5C443', '#3E8E5E', '#7DB6E8', '#B9A2EC', '#1F2A24'];
  return <div className="confetti" aria-hidden="true">{Array.from({ length: 42 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, background: cols[i % 6], animationDelay: `${(i % 7) * 60}ms`, '--r': `${(i * 47) % 360}deg`, '--x': `${((i * 29) % 60) - 30}px` } as CSSProperties} />)}</div>;
}

function Sheet({ c, close, reset }: { c: Ctx; close: () => void; reset: () => void }) {
  const st = c.saved.steps;
  const items: [string, string, boolean, () => void][] = [
    ['Scan a returned tray', 'AI camera at the tray return', !!st.scan, () => { c.go('scan'); close(); }],
    ['See the nutrients lost', 'Protein, fibre and iron left behind', !!st.losses, () => { c.go('scan'); close(); }],
    ['Tell the kitchen why', 'Anonymous, one tap', !!st.why, () => { c.go('scan'); close(); }],
    ['Get a recipe fix', 'AI reformulation for the nutritionist', !!st.recipe, () => { c.go('recipes'); close(); }],
    ['Verify it works', 'Before vs after, 4-week pilot', !!st.verify, () => { c.go('recipes'); close(); }],
  ];
  const done = items.filter(i => i[2]).length;
  return <div className="sheet-bg" onClick={close}>
    <div className="sheet" onClick={e => e.stopPropagation()}>
      <div className="grab" />
      <div className="brand"><Logo /> SchoolCanteen</div>
      <h2 className="h-big">Served <span className="neq">≠</span> Eaten</h2>
      <p className="muted">We measure what children actually eat, learn why they leave healthy dishes, and help the kitchen fix them.</p>
      <div className="label">Your demo · {done}/5 done</div>
      <div className="steps">{items.map(([t, s, ok, fn], i) => <button key={t} className={'stp' + (ok ? ' ok' : '')} onClick={fn}><span className="num">{ok ? <IconCheck /> : i + 1}</span><span><b>{t}</b><small>{s}</small></span></button>)}</div>
      <button className="btn ghost" onClick={reset}>Restart the demo</button>
      <p className="tiny center">Prototype for the IE University Challenge · illustrative demo data for one Madrid school. No personal data is collected.</p>
    </div>
  </div>;
}

/* ---------------- desktop stage ---------------- */
function caption(tab: Tab, phase: Phase, detail: string | null, saved: Saved, recipeDish: string, focusFor: (d: string) => ReasonId): [string, string, string] {
  if (tab === 'scan') {
    if (phase === 'idle') return saved.steps.scan ? ['1 · Measure', 'A camera at the tray return scans every tray.', 'Food only, never faces.'] : ['', 'Every tray tells the kitchen what children actually ate.', 'Prototype · illustrative demo data for one Madrid school'];
    if (phase === 'scanning' || phase === 'results') return ['1 · Measure', 'It sees what was eaten, and the nutrients left behind.', 'Protein, fibre and iron, per tray.'];
    return ['2 · Understand why', 'Pupils give the reason in one tap.', 'During short “why weeks”.'];
  }
  if (tab === 'insights') {
    if (detail) { const x = DISHES[detail], day = WEEK.days.find(w => w.dish === detail)!; return ['3 · Report', `${x.name}: ${day.left}% comes back.`, `${fmt(lossKg(x.protein, day.left))} kg of protein lost in one lunch, in one school.`]; }
    return ['3 · Report', 'The caterer’s nutritionist sees the whole week.', 'Which dishes come back, and the nutrition lost.'];
  }
  if (saved.sent[recipeDish] === focusFor(recipeDish)) { const base = 100 - WEEK.days.find(w => w.dish === recipeDish)!.left; return ['5 · Verify', 'The camera checks: is it eaten now?', `Pilot target: from ${base}% to ${RECIPES[recipeDish][focusFor(recipeDish)].target}% eaten (simulation).`]; }
  return ['4 · Reformulate', 'Same nutrients, a form children eat.', 'Same ingredients, almost the same cost.'];
}

function Stage({ children, caption: [tag, head, sub] }: { children: ReactNode; caption: [string, string, string] }) {
  const [scale, setScale] = useState(1);
  useEffect(() => { const f = () => setScale(Math.min(1, (window.innerHeight - 48) / 860)); f(); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
  return <div className="stage">
    <section className="pitch">
      <div className="brand"><Logo /> SchoolCanteen</div>
      <h1 className="pitch-h">Served <span className="neq">≠</span> Eaten</h1>
      <div className="pitch-cap" key={head}>{tag && <span className="tagpill">{tag}</span>}<h2>{head}</h2><p>{sub}</p></div>
      <div className="qr"><img src="qr.svg" alt="QR code to open this demo" /><span>Scan to try it on<br />your phone</span></div>
    </section>
    <div className="phone" style={{ '--s': scale } as CSSProperties}><div className="phone-screen">{children}</div></div>
  </div>;
}
