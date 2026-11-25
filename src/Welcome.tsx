import { useRef, useState, type PointerEvent } from 'react';
import { Logo, TrayArt } from './art';
import { TRAYS } from './data';

const tray = TRAYS.find(t => t.id === 'tue')!;

export default function Welcome({ onStart }: { onStart: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x0: number; max: number; moved: boolean } | null>(null);
  const [x, setX] = useState(0);
  const [state, setState] = useState<'idle' | 'drag' | 'done'>('idle');

  const max = () => (trackRef.current ? trackRef.current.clientWidth - 64 : 260);
  const finish = () => {
    if (state === 'done') return;
    setState('done'); setX(max());
    try { navigator.vibrate?.([15, 40, 25]); } catch { /* no-op */ }
    window.setTimeout(onStart, 1150);
  };
  const down = (e: PointerEvent) => {
    if (state === 'done') return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x0: e.clientX - x, max: max(), moved: false }; setState('drag');
  };
  const move = (e: PointerEvent) => {
    const d = drag.current; if (!d) return;
    const nx = Math.max(0, Math.min(d.max, e.clientX - d.x0));
    if (Math.abs(nx - x) > 3) d.moved = true;
    setX(nx);
    if (nx >= d.max * 0.9) { drag.current = null; finish(); }
  };
  const up = () => {
    const d = drag.current; drag.current = null; if (!d || state === 'done') return;
    if (!d.moved) { finish(); return; } // a simple tap also starts the demo
    setState('idle'); setX(0);
  };
  const p = state === 'done' ? 1 : x / max();

  return (
    <div className={'welcome' + (state === 'done' ? ' launching' : '')}>
      <div className="w-top"><div className="brand"><Logo /> SchoolCanteen</div><span className="w-tag">Live demo</span></div>

      <div className="w-hero">
        <div className="w-vf" style={{ transform: `scale(${1 + p * 0.04})` }}>
          <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
          <TrayArt items={tray.items} />
          <div className="w-scan" />
        </div>
        <span className="float f1">🍲 20% eaten</span>
        <span className="float f2">−11.7 g protein</span>
        <span className="float f3">😖 “too mushy”</span>
        <span className="float f4">✦ AI</span>
      </div>

      <h1 className="w-title">Served <span className="neq">≠</span> Eaten</h1>
      <p className="w-sub"><b>146,100</b> Madrid pupils get a free school lunch. Nobody measures what they actually eat. <b>We do.</b></p>

      <div className="w-steps">
        <span><i>🎥</i>Scan trays</span><span className="dash" />
        <span><i>🧒</i>Ask why</span><span className="dash" />
        <span><i>✦</i>AI fixes it</span>
      </div>

      <div className={'slider ' + state} ref={trackRef}>
        <div className="s-fill" style={{ width: x + 64 }} />
        <span className="s-label" style={{ opacity: 1 - p * 1.6 }}>Slide to scan your first tray</span>
        <span className="s-done" style={{ opacity: state === 'done' ? 1 : 0 }}>Scanning… let's go!</span>
        <button className="s-thumb" style={{ transform: `translateX(${x}px)` }} aria-label="Start the demo"
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {state === 'done' ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><rect x="8.5" y="8.5" width="7" height="7" rx="1.5" /></>}
          </svg>
        </button>
      </div>
      <p className="w-foot">2-minute interactive demo · illustrative data · no sign-up</p>
      <div className="w-flash" />
    </div>
  );
}
