import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  CLASS_WEEK_BASE, DEFAULT_FOCUS, DISHES, EMOJI, FIXABLE, PUPILS, QUOTES, REASONS, REASON_BASE, REASON_ORDER, RECIPES, TRAYS, TREND, VERIFY_RAMP, WEEK,
  eatenColor, fmt, leftColor, lossKg, trayLeft, type ReasonId,
} from './data';
import Welcome from './Welcome';
import { DishArt, IconArrow, IconBack, IconCheck, IconFeedback, IconInsights, IconRecipes, IconScan, Logo, TrayArt } from './art';

/* ---------------- state ---------------- */
type Tab = 'scan' | 'feedback' | 'insights' | 'recipes';
type Phase = 'idle' | 'scanning' | 'results';
type Mood = 'loved' | 'ok' | 'disliked';
interface Fb { dish: string | null; stage: 'dish' | 'mood' | 'reason' | 'thanks'; mood?: Mood; reason?: ReasonId }
interface Saved { loves: number; votes: { dish: string; reason: ReasonId }[]; focus: Record<string, ReasonId>; sent: Record<string, ReasonId>; steps: Record<string, boolean> }
const KEY = 'schoolcanteen-demo-v1';
const empty = (): Saved => ({ loves: 0, votes: [], focus: {}, sent: {}, steps: {} });
const load = (): Saved => { try { return { ...empty(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return empty(); } };
// Anonymous visit counter: one +1 per device, no personal data. Failures are ignored so the demo never depends on it.
const COUNT = 'https://countapi.mileshilliard.com/api/v1/hit/scdemo_k7q2m9_';
const countOnce = (what: 'opens' | 'starts') => {
  try {
    if (location.search.includes('nocount') || location.hostname === 'localhost' || localStorage.getItem('sc-counted-' + what)) return;
    localStorage.setItem('sc-counted-' + what, '1');
    fetch(COUNT + what, { keepalive: true }).catch(() => {});
  } catch { /* no-op */ }
};
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
  const [fb, setFb] = useState<Fb>({ dish: null, stage: 'dish' });
  const [welcome, setWelcome] = useState(true);
  const start = () => { countOnce('starts'); setWelcome(false); setTab('scan'); };
  useEffect(() => { countOnce('opens'); }, []);
  const [toast, setToast] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(saved)); }, [saved]);
  const update = (f: (s: Saved) => Saved) => setSaved(s => f({ ...s }));
  const step = (k: string) => update(s => ({ ...s, steps: { ...s.steps, [k]: true } }));
  const scrollTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  useLayoutEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [tab, detail]);

  const go = (t: Tab) => { buzz(8); setTab(t); if (t === 'insights') step('report'); if (t === 'recipes') step('recipe'); if (t === 'feedback' && fb.stage === 'thanks') setFb({ dish: null, stage: 'dish' }); };
  const showToast = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 3200); };
  const focusFor = (dish: string): ReasonId => saved.focus[dish] ?? [...saved.votes].reverse().find(v => v.dish === dish)?.reason ?? DEFAULT_FOCUS[dish] ?? 'taste';

  const ctx: Ctx = { fb, setFb, saved, update, step, phase, setPhase, trayId, setTrayId, go, setDetail, detail, recipeDish, setRecipeDish, showToast, setConfetti, focusFor, scrollTop, scrollRef };
  const head = { scan: ['Canteen camera · Class 4A', 'Tray return'], feedback: ['Pupil · anonymous', 'How was lunch?'], insights: ['Catering nutritionist', 'Insights'], recipes: ['Catering nutritionist', 'AI recipe fix'] }[tab];

  const app = (
    <div className="app">
      <div className="statusbar"><span>12:41</span><span className="island" /><span className="sb-r"><i className="sig" />5G<i className="bat" /></span></div>
      <header className="hdr">
        <div><div className="kicker">{head[0]}</div><h1 className="title">{head[1]}</h1></div>
        <button className="avatar" onClick={() => { buzz(); setSheet(true); }} aria-label="About this demo">SC</button>
      </header>
      <Stepper tab={tab} saved={saved} sent={!!saved.sent[recipeDish]} go={go} />
      <main className="scroll" ref={scrollRef}>
        <div className="screen" key={tab + (detail ?? '')} data-anim={detail ? 'push' : 'fade'}>
          {tab === 'scan' && <ScanScreen c={ctx} />}
          {tab === 'feedback' && <FeedbackScreen c={ctx} />}
          {tab === 'insights' && (detail ? <DishDetail c={ctx} dish={detail} /> : <InsightsScreen c={ctx} />)}
          {tab === 'recipes' && <RecipesScreen c={ctx} />}
        </div>
      </main>
      <nav className="tabbar">
        {([['scan', 'Scan', <IconScan />], ['feedback', 'Feedback', <IconFeedback />], ['insights', 'Insights', <IconInsights />], ['recipes', 'AI Recipes', <IconRecipes />]] as [Tab, string, ReactNode][]).map(([t, l, ic]) => (
          <button key={t} className={'tab' + (tab === t ? ' on' : '')} onClick={() => { if (t === 'insights' && tab === 'insights') setDetail(null); go(t); }}>{ic}<span>{l}</span></button>
        ))}
      </nav>
      {toast && <div className="toast" role="status">{toast}</div>}
      {confetti > 0 && <Confetti key={confetti} />}
      {welcome && <Welcome onStart={start} />}
      {sheet && <Sheet c={ctx} close={() => setSheet(false)} reset={() => { localStorage.removeItem(KEY); setSaved(empty()); setPhase('idle'); setFb({ dish: null, stage: 'dish' }); setTrayId('tue'); setDetail(null); setRecipeDish('lentil'); setTab('scan'); setSheet(false); setWelcome(true); }} />}
    </div>
  );
  return <Stage caption={caption(tab, phase, detail, saved, recipeDish, focusFor, fb)}>{app}</Stage>;
}

interface Ctx {
  fb: Fb; setFb: (f: Fb) => void;
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

/* ---------------- guide ---------------- */
const STEPS: [string, string, Tab][] = [['scan', 'Scan', 'scan'], ['why', 'Feedback', 'feedback'], ['report', 'Insights', 'insights'], ['recipe', 'AI fix', 'recipes'], ['verify', 'Verify', 'recipes']];
function Stepper({ tab, saved, sent, go }: { tab: Tab; saved: Saved; sent: boolean; go: (t: Tab) => void }) {
  const cur = tab === 'recipes' ? (sent ? 4 : 3) : STEPS.findIndex(x => x[2] === tab);
  return <div className="stepper">{STEPS.map(([k, l, t], i) => <button key={k} className={(i === cur ? 'cur ' : '') + (saved.steps[k] ? 'ok' : '')} onClick={() => go(t)}>
    <span className="sn">{saved.steps[k] && i !== cur ? <IconCheck /> : i + 1}</span><span className="sl">{l}</span></button>)}</div>;
}
const Hint = ({ who, children }: { who: string; children: ReactNode }) => <div className="hint"><span className="who">{who}</span><p>{children}</p></div>;
const Next = ({ label, onClick }: { label: string; onClick: () => void }) => <button className="btn next" onClick={onClick}><span><small>Next step</small>{label}</span><IconArrow /></button>;
const Ai = ({ children = 'AI' }: { children?: ReactNode }) => <span className="ai-badge">✦ {children}</span>;

/* ---------------- 1 · Scan ---------------- */
function ScanScreen({ c }: { c: Ctx }) {
  const tray = TRAYS.find(t => t.id === c.trayId)!;
  const { phase, setPhase } = c;
  const [sub, setSub] = useState(0);
  const main = tray.items[0], mainDish = DISHES[main.dish];
  const needsWhy = main.eaten < 50;
  const left = trayLeft(tray);

  useEffect(() => {
    if (phase !== 'scanning') return;
    setSub(0);
    const t = [setTimeout(() => setSub(1), 1100), setTimeout(() => setSub(2), 2200), setTimeout(() => { setPhase('results'); c.step('losses'); buzz(20); }, 3400)];
    return () => t.forEach(clearTimeout);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => { buzz(); c.step('scan'); setPhase('scanning'); c.scrollTop(); };
  const status = phase === 'idle' ? ['Waiting for a tray', 'Camera · tray return', 'var(--coral)'] : phase === 'scanning' ? ['AI scanning', 'Demo tray', 'var(--yellow)'] : ['Tray scanned', 'Demo tray', 'var(--green-dot)'];
  const subs = ['AI vision finds each dish', 'Compares what is left with what was served', 'Turns leftovers into protein, fibre and iron lost'];

  return <>
    {phase === 'idle' && <Hint who="🎥 You are the canteen camera">When a pupil returns their tray, the AI looks at it and works out what was really eaten. Pick a tray, then tap <b>Scan</b>.</Hint>}
    <div className={`vf ${phase}`}>
      <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
      <span className="vf-ai">✦ AI vision</span>
      <div className="vf-tray">
        <div className="tray-empty"><TrayArt items={tray.items} empty /></div>
        {phase !== 'idle' && <div className="tray-food"><TrayArt items={tray.items} /></div>}
        {phase === 'scanning' && <>
          <div className="scanline" />
          {tray.items.map((it, i) => { const b = { main: [7, 11, 47, 49], side: [57, 11, 36, 33], bread: [57, 49, 17, 39], fruit: [76, 49, 17, 39] }[DISHES[it.dish].slot]!;
            return <div key={it.dish} className="detect" style={{ left: `${b[0]}%`, top: `${b[1]}%`, width: `${b[2]}%`, height: `${b[3]}%`, animationDelay: `${600 + i * 320}ms` }}><span>{DISHES[it.dish].name} · {88 + ((i * 3) % 10)}%</span></div>; })}
        </>}
      </div>
      <div className="vf-foot"><span><i style={{ background: status[2] }} className={phase === 'scanning' ? 'pulse' : ''} />{status[0]}</span><span>{status[1]}</span></div>
    </div>

    {phase === 'idle' && <div className="enter">
      <div className="label">1. Pick a tray</div>
      <div className="tray-pick">{TRAYS.map(t => <button key={t.id} className={'tp' + (t.id === c.trayId ? ' on' : '')} onClick={() => { buzz(6); c.setTrayId(t.id); }}>
        <DishArt art={DISHES[t.items[0].dish].art} size={44} /><b>{t.short}</b><span>{DISHES[t.items[0].dish].short}</span></button>)}</div>
      <div className="label">2. Scan it</div>
      <button className="btn primary" onClick={start}>✦ Scan this tray with AI</button>
      <p className="tiny center">Food only, never faces.</p>
    </div>}

    {phase === 'scanning' && <div className="enter">
      <h2 className="h-big">AI is analysing…</h2>
      <div className="progress"><i /></div>
      <ul className="substeps">{subs.map((s, i) => <li key={s} className={i < sub ? 'done' : i === sub ? 'now' : ''}><span className="tick">{i < sub ? <IconCheck /> : null}</span>{s}</li>)}</ul>
    </div>}

    {phase === 'results' && <div className="enter">
      <h2 className="h-mid">What was eaten</h2>
      <div className="card results">
        <div className="card-meta"><Ai>AI estimate · {tray.items.length} dishes found</Ai><span>94% confidence</span></div>
        {tray.items.map((it, i) => <div className="dish-row" key={it.dish}>
          <div className="row-top"><span>{EMOJI[it.dish]} {DISHES[it.dish].name}</span><b>{it.eaten}% eaten</b></div>
          <Bar pct={it.eaten} color={eatenColor(it.eaten)} delay={i * 120} />
        </div>)}
      </div>
      <h2 className="h-mid">Nutrients this pupil missed</h2>
      <div className="nutri3">
        <div className="nt" style={{ background: 'var(--pink)' }}><b><Count value={left.protein} dec={1} /> g</b><span>protein</span></div>
        <div className="nt" style={{ background: 'var(--mint)' }}><b><Count value={left.fibre} dec={1} /> g</b><span>fibre</span></div>
        <div className="nt" style={{ background: 'var(--blue-soft)' }}><b><Count value={left.iron} dec={1} /> mg</b><span>iron</span></div>
      </div>
      {needsWhy ? <>
        <div className="ai-note"><Ai /> {100 - main.eaten}% of the <b>{mainDish.short}</b> came back. The AI flags it and asks the pupil why.</div>
        <Next label={`Ask the pupil about the ${mainDish.short}`} onClick={() => { c.setFb({ dish: main.dish, stage: 'mood' }); c.go('feedback'); }} />
      </> : <>
        <div className="clean"><span>🎉</span><div><b>Clean tray!</b><p>Almost everything was eaten. Nothing to flag.</p></div></div>
        <Next label="Hear from the pupils" onClick={() => c.go('feedback')} />
      </>}
      <button className="btn ghost" onClick={() => { setPhase('idle'); c.scrollTop(); }}>Scan another tray</button>
    </div>}
  </>;
}

/* ---------------- 2 · Pupil feedback ---------------- */
const MOODS: [Mood, string, string, string][] = [['loved', '😋', 'Loved it', 'var(--mint)'], ['ok', '😐', 'It was OK', 'var(--yellow-soft)'], ['disliked', '😖', "Didn't like it", 'var(--pink)']];
function FeedbackScreen({ c }: { c: Ctx }) {
  const tray = TRAYS.find(t => t.id === c.trayId)!;
  const { fb, setFb } = c;
  const dish = fb.dish ? DISHES[fb.dish] : null;
  const classCount = CLASS_WEEK_BASE + c.saved.votes.length + c.saved.loves;
  const pickMood = (m: Mood) => {
    buzz(15);
    if (m === 'loved') { c.update(s => ({ ...s, loves: s.loves + 1, steps: { ...s.steps, why: true } })); setFb({ ...fb, mood: m, stage: 'thanks' }); c.setConfetti(n => n + 1); }
    else setFb({ ...fb, mood: m, stage: 'reason' });
    c.scrollTop();
  };
  const pickReason = (r: ReasonId) => {
    if (fb.reason) return;
    buzz(25); setFb({ ...fb, reason: r });
    c.update(s => ({ ...s, votes: [...s.votes, { dish: fb.dish!, reason: r }], steps: { ...s.steps, why: true } }));
    setTimeout(() => { setFb({ ...fb, reason: r, stage: 'thanks' }); c.setConfetti(n => n + 1); c.scrollTop(); }, 520);
  };
  const DishChip = () => dish && <button className="dish-chip" onClick={() => setFb({ dish: null, stage: 'dish' })}><span>{EMOJI[dish.id]}</span>{dish.name}<small>change</small></button>;

  return <>
    {fb.stage !== 'thanks' && <Hint who="🧒 You are a pupil">Three taps, no name. Your answer goes to the kitchen, not to your teacher.</Hint>}
    {fb.stage === 'dish' && <div className="enter">
      <h2 className="h-big">What did you eat today?</h2>
      <p className="muted">{tray.day} lunch · {tray.theme}</p>
      <div className="dish-grid">{tray.items.map(it => <button key={it.dish} className="dish-pick" onClick={() => { buzz(8); setFb({ dish: it.dish, stage: 'mood' }); }}>
        <span className="emoji">{EMOJI[it.dish]}</span><b>{DISHES[it.dish].name}</b></button>)}</div>
    </div>}

    {fb.stage === 'mood' && dish && <div className="enter">
      <DishChip />
      <h2 className="h-big">How was the {dish.short}?</h2>
      <div className="moods">{MOODS.map(([m, e, l, bg]) => <button key={m} className="mood" style={{ background: bg }} onClick={() => pickMood(m)}><span className="emoji">{e}</span><b>{l}</b></button>)}</div>
    </div>}

    {fb.stage === 'reason' && dish && <div className="enter">
      <DishChip />
      <h2 className="h-big">Why didn't you finish it?</h2>
      <p className="muted">Pick the main reason.</p>
      <div className="reasons">{REASON_ORDER.map(k => <button key={k} className={'reason' + (fb.reason === k ? ' picked' : fb.reason ? ' dim' : '')} style={{ background: REASONS[k].tile }} onClick={() => pickReason(k)}>
        <span className="emoji">{REASONS[k].emoji}</span><span>{REASONS[k].label}</span>{fb.reason === k && <span className="chk"><IconCheck /></span>}</button>)}</div>
    </div>}

    {fb.stage === 'thanks' && dish && <div className="enter center">
      <div className="plus1">+1</div>
      <h2 className="h-big center">Thanks! The kitchen<br />will see it.</h2>
      <div className="classcard"><span>Answers from Class 4A this week</span><b><Count value={classCount} from={classCount - 1} /></b></div>
      <p className="muted">You said: <b>{EMOJI[dish.id]} {dish.name}</b> · {fb.mood === 'loved' ? '😋 Loved it' : `${REASONS[fb.reason!].emoji} ${REASONS[fb.reason!].label}`}</p>
      <Next label="See what the kitchen sees" onClick={() => { if (FIXABLE.includes(dish.id) && fb.mood !== 'loved') c.setDetail(dish.id); c.go('insights'); }} />
      <button className="btn ghost" onClick={() => setFb({ dish: null, stage: 'dish' })}>Rate another dish</button>
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

  const worst = ranked[0], wd = DISHES[worst.dish], wc = answers(worst.dish, c.saved.votes);
  const top2 = [...REASON_ORDER].sort((a, b) => wc[b] - wc[a]).slice(0, 2);
  const wt = REASON_ORDER.reduce((a, k) => a + wc[k], 0);
  const summary = `${wd.name} is your biggest problem: ${worst.left}% comes back, losing ${fmt(lossKg(wd.protein, worst.left))} kg of protein every ${worst.day}. Pupils say ${REASONS[top2[0]].label.toLowerCase()} (${Math.round(wc[top2[0]] / wt * 100)}%) and ${REASONS[top2[1]].label.toLowerCase()} (${Math.round(wc[top2[1]] / wt * 100)}%). I suggest reformulating it.`;
  return <>
    <Hint who="👩‍🍳 You are the caterer's nutritionist">Every week you get this report: what pupils ate, what came back, and why.</Hint>
    <div className="card ai-sum"><div className="ai-h"><Ai>AI summary of the week</Ai></div><Typed text={summary} />
      <button className="btn primary small" onClick={() => { c.setRecipeDish(worst.dish); c.go('recipes'); }}>✦ Fix the {wd.short} with AI</button></div>
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
    <Next label={`Let the AI fix the ${wd.short}`} onClick={() => { c.setRecipeDish(worst.dish); c.go('recipes'); }} />
    <p className="tiny center">Illustrative demo data for one Madrid school.</p>
  </>;
}

function Typed({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => { setN(0); const id = setInterval(() => setN(v => { if (v >= text.length) { clearInterval(id); return v; } return v + 2; }), 18); return () => clearInterval(id); }, [text]);
  return <p className="typed">{text.slice(0, n)}{n < text.length && <i className="caret" />}</p>;
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
    <button className="btn primary" onClick={() => { c.setRecipeDish(dish); c.setDetail(null); c.go('recipes'); }}>✦ Fix this recipe with AI</button>
  </>;
}

/* ---------------- 4–5 · Recipes + verify ---------------- */
function RecipesScreen({ c }: { c: Ctx }) {
  const dish = c.recipeDish, x = DISHES[dish], day = WEEK.days.find(w => w.dish === dish)!;
  const focus = c.focusFor(dish), rec = RECIPES[dish][focus];
  const counts = answers(dish, c.saved.votes), total = REASON_ORDER.reduce((a, k) => a + counts[k], 0);
  const sent = c.saved.sent[dish] === focus;
  const [think, setThink] = useState(0);
  const verifyRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (sent) { setThink(3); return; } setThink(0); const t = [1, 2, 3].map(i => setTimeout(() => setThink(i), i * 550)); return () => t.forEach(clearTimeout); }, [dish, focus]); // eslint-disable-line react-hooks/exhaustive-deps
  const base = 100 - day.left;
  const weeks = VERIFY_RAMP.map(f => Math.round(base + (rec.target - base) * f));
  const send = () => {
    buzz(20); c.update(s => ({ ...s, sent: { ...s.sent, [dish]: focus }, steps: { ...s.steps, verify: true } }));
    c.showToast(`Menu updated: ${rec.name} replaces ${x.short} next ${day.day}.`);
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
    ['Food wasted per lunch', `${fmt(wasteOld)} kg`, `${fmt(wasteNew)} kg`],
  ];
  const thinking = ['Reading ' + total + ' pupil answers', `Keeping the same nutrients as the ${x.short}`, 'Checking cost and allergens'];
  return <>
    {!sent ? <Hint who="✦ The AI suggests, you decide">The AI reads why pupils leave a dish and proposes a version they will eat, with the same nutrients. Approve it and it goes on next week's menu.</Hint>
      : <Hint who="✅ Step 5 · Verify">The camera keeps scanning trays to check the new recipe is really eaten.</Hint>}
    <div className="label">Dish to fix</div>
    <div className="seg">{FIXABLE.map(d => <button key={d} className={d === dish ? 'on' : ''} onClick={() => { buzz(6); c.setRecipeDish(d); }}>{EMOJI[d]} {({ lentil: 'Lentils', chickpea: 'Chickpeas', hake: 'Hake' } as Record<string, string>)[d]}</button>)}</div>
    <div className="card dishcard" style={{ background: 'var(--pink)' }}>
      <DishArt art={x.art} /><div><small className="cap">Today</small><b>{x.name}</b><span>{day.left}% comes back · {QUOTES[dish][focus]}</span></div>
    </div>
    <div className="label">Main problem pupils told us <small>(tap to change)</small></div>
    <div className="chips">{REASON_ORDER.map(k => <button key={k} className={'chip' + (k === focus ? ' on' : '')} onClick={() => { buzz(6); c.update(s => ({ ...s, focus: { ...s.focus, [dish]: k } })); }}>
      {REASONS[k].emoji} {REASONS[k].label} <small>{Math.round(counts[k] / total * 100)}%</small></button>)}</div>

    {think < 3 ? <div className="card thinking" key={'t' + dish + focus}>
      <div className="ai-h"><Ai>AI is reformulating…</Ai></div>
      <ul className="substeps">{thinking.map((s, i) => <li key={s} className={i < think ? 'done' : i === think ? 'now' : ''}><span className="tick">{i < think ? <IconCheck /> : null}</span>{s}</li>)}</ul>
      <div className="shimmer" />
    </div> : <>
      <div className="becomes"><span>✦ AI suggests</span></div>
      <div className="card dishcard proposed" key={dish + focus} style={{ background: 'var(--mint)' }}>
        <DishArt art={rec.art} /><div><small className="cap">New recipe</small><b>{rec.name}</b><span>{rec.note}</span></div>
      </div>
      <div className="card ai" key={'ai' + dish + focus}>
        <div className="ai-h"><span className="spark">✦</span> Why the AI chose this</div>
        <p>{rec.why}</p>
        <div className="win">Expected: <b>{base}% → {rec.target}%</b> of each portion eaten</div>
      </div>
      <details className="card table">
        <summary>Nutrition & cost, per portion</summary>
        <div className="tr th"><span>Per portion</span><span>Now</span><span>New</span></div>
        {rows.map(r => <div className="tr" key={r[0]}><span>{r[0]}</span><b>{r[1]}</b><b>{r[2]}</b></div>)}
        <ol className="steps-ol">{rec.steps.map(st => <li key={st}>{st}</li>)}</ol>
        <p className="tiny">Allergens to check: {rec.allergens}. Estimates.</p>
      </details>
      {!sent && <button className="btn primary" onClick={send}>✓ Approve & update the menu</button>}
    </>}

    {sent && <div ref={verifyRef} className="enter">
      <div className="card flow">
        <h3>Where the update goes</h3>
        {[['✦', 'AI suggested the new recipe', true], ['👩‍🍳', 'Nutritionist approved it', true], ['📅', `Added to the menu for next ${day.day}`, true], ['🎥', 'Camera checks if pupils eat it', false]].map(([e, t, ok], i) =>
          <div key={i} className={'fl' + (ok ? ' ok' : ' live')}><span className="fe">{e as string}</span><span>{t as string}</span>{ok ? <IconCheck /> : <i className="pulse-dot" />}</div>)}
      </div>
      <div className="card menu">
        <h3>📅 Kitchen menu · next {day.day}</h3>
        <div className="mrow old"><span>{EMOJI[dish]}</span>{x.name}</div>
        <div className="mrow new"><span>✦</span>{rec.name}<em>NEW</em></div>
      </div>
      <div className="card verify">
        <h3>Verify: share eaten, 4-week pilot</h3>
        <div className="vchart">
          <div className="vaxis"><span>100%</span><span>50%</span><span>0%</span></div>
          <div className="vbars">{weeks.map((v, i) => <div key={i} className="vcol"><div className="vplot"><div className="vbar" style={{ height: `${v}%`, background: i === 0 ? 'var(--coral)' : 'var(--green)', animationDelay: `${i * 140}ms` }}><b>{v}%</b></div></div><span>Wk {i + 1}<br />{i === 0 ? 'old' : 'new'}</span></div>)}</div>
        </div>
        <p className="tiny">Simulation. Weeks 2–4 are targets, not measurements.</p>
      </div>
      <div className="card compare">
        <h3>Before → after, per lunch ({PUPILS} pupils)</h3>
        {cmp.map(r => <div className="crow" key={r[0]}><span>{r[0]}</span><span className="old">{r[1]}</span><IconArrow /><b>{r[2]}</b></div>)}
        <div className="delta"><b>−{Math.round((1 - wasteNew / wasteOld) * 100)}%</b> food waste · <b>+{Math.round(((rec.protein * rec.target) / (x.protein * base) - 1) * 100)}%</b> protein actually eaten</div>
        <span className="demo-tag">Demonstration data</span>
      </div>
      <div className="done-card"><b>🎉 That's the full loop.</b><span>Scan → Feedback → Insights → AI fix → Verify</span>
        <button className="btn ghost" onClick={() => c.go('scan')}>Start again with another tray</button></div>
    </div>}
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
    ['Pupils say why', 'Anonymous, three taps', !!st.why, () => { c.go('feedback'); close(); }],
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
      <p className="tiny center">Interactive demo for the IE University Challenge · illustrative demo data for one Madrid school. No personal data is collected.</p>
    </div>
  </div>;
}

/* ---------------- desktop stage ---------------- */
function caption(tab: Tab, phase: Phase, detail: string | null, saved: Saved, recipeDish: string, focusFor: (d: string) => ReasonId, fb: Fb): [string, string, string] {
  if (tab === 'scan') {
    if (phase === 'idle') return saved.steps.scan ? ['1 · Measure', 'A camera at the tray return scans every tray.', 'Food only, never faces.'] : ['', 'Every tray tells the kitchen what children actually ate.', 'Interactive demo · illustrative data for one Madrid school'];
    return ['1 · Measure', 'AI sees what was eaten, and the nutrients left behind.', 'Protein, fibre and iron, per tray.'];
  }
  if (tab === 'feedback') return ['2 · Understand why', fb.stage === 'thanks' ? 'Every answer reaches the kitchen.' : 'Pupils say why in three taps.', 'Anonymous. During short “why weeks”.'];
  if (tab === 'insights') {
    if (detail) { const x = DISHES[detail], day = WEEK.days.find(w => w.dish === detail)!; return ['3 · Report', `${x.name}: ${day.left}% comes back.`, `${fmt(lossKg(x.protein, day.left))} kg of protein lost in one lunch, in one school.`]; }
    return ['3 · Report', 'The caterer’s nutritionist sees the whole week.', 'With an AI summary of what to fix first.'];
  }
  if (saved.sent[recipeDish] === focusFor(recipeDish)) { const base = 100 - WEEK.days.find(w => w.dish === recipeDish)!.left; return ['5 · Verify', 'The menu is updated. The camera checks: is it eaten now?', `Pilot target: from ${base}% to ${RECIPES[recipeDish][focusFor(recipeDish)].target}% eaten (simulation).`]; }
  return ['4 · Reformulate', 'AI proposes a recipe children will eat.', 'Same nutrients, almost the same cost.'];
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
