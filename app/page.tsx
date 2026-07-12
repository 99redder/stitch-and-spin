"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Item = { name: string; icon: string };

const animalsA: Item[] = [
  { name: "Red Panda", icon: "🐼" }, { name: "Axolotl", icon: "🦎" },
  { name: "Elephant", icon: "🐘" }, { name: "Bumblebee", icon: "🐝" },
  { name: "Penguin", icon: "🐧" }, { name: "Bunny", icon: "🐰" },
  { name: "Octopus", icon: "🐙" }, { name: "Frog", icon: "🐸" },
  { name: "Koala", icon: "🐨" }, { name: "Giraffe", icon: "🦒" },
];

const animalsB: Item[] = [
  { name: "Capybara", icon: "🦫" }, { name: "Fox", icon: "🦊" },
  { name: "Sea Turtle", icon: "🐢" }, { name: "Sloth", icon: "🦥" },
  { name: "Tiger", icon: "🐯" }, { name: "Duck", icon: "🦆" },
  { name: "Hedgehog", icon: "🦔" }, { name: "Dinosaur", icon: "🦕" },
  { name: "Llama", icon: "🦙" }, { name: "Otter", icon: "🦦" },
];

const accessoriesA: Item[] = [
  { name: "Tiny Crown", icon: "👑" }, { name: "Bow Tie", icon: "🎀" },
  { name: "Rain Boots", icon: "🥾" }, { name: "Round Glasses", icon: "👓" },
  { name: "Flower Hat", icon: "🌼" }, { name: "Backpack", icon: "🎒" },
  { name: "Magic Wand", icon: "🪄" }, { name: "Scarf", icon: "🧣" },
  { name: "Tiny Cape", icon: "🦸" }, { name: "Headphones", icon: "🎧" },
];

const accessoriesB: Item[] = [
  { name: "Teacup", icon: "☕" }, { name: "Mushroom", icon: "🍄" },
  { name: "Heart Purse", icon: "💖" }, { name: "Party Hat", icon: "🥳" },
  { name: "Overalls", icon: "👖" }, { name: "Tote Bag", icon: "👜" },
  { name: "Leaf Umbrella", icon: "☂️" }, { name: "Roller Skates", icon: "🛼" },
  { name: "Star Pillow", icon: "⭐" }, { name: "Mini Guitar", icon: "🎸" },
];

const palettes = ["#ff6b6b", "#ffc857", "#43c6ac", "#6c63ff", "#ff8fc7", "#78a8ff", "#fa8b55", "#a8d96f", "#b784e6", "#46b9d3"];

function Wheel({ title, items, rotation, spinning }: { title: string; items: Item[]; rotation: number; spinning: boolean }) {
  const gradient = useMemo(() => `conic-gradient(${items.map((_, i) => `${palettes[i]} ${i * 10}% ${(i + 1) * 10}%`).join(",")})`, [items]);
  return (
    <section className="wheel-unit" aria-label={`${title} wheel`}>
      <div className="wheel-title"><span>♥</span>{title}</div>
      <div className="wheel-wrap">
        <div className="pointer" aria-hidden="true" />
        <div className={`wheel ${spinning ? "is-spinning" : ""}`} style={{ background: gradient, transform: `rotate(${rotation}deg)` }}>
          <div className="wheel-rim-dots" />
          {items.map((item, i) => {
            const angle = i * 36 + 18;
            return <span className="wheel-label" key={item.name} aria-label={item.name} style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-38%) rotate(90deg)` }}><b>{item.icon}</b></span>;
          })}
          <div className="wheel-hub"><span>♥</span></div>
        </div>
      </div>
    </section>
  );
}

function AccessorySelector({ title, items, position, spinning }: { title: string; items: Item[]; position: number; spinning: boolean }) {
  const reelItems = useMemo(() => Array.from({ length: 400 }, (_, i) => items[i % items.length]), [items]);
  const reelSlot = 76;
  return (
    <section className="selector-unit" aria-label={`${title} scrolling selector`}>
      <div className="selector-title"><span>✦</span>{title}</div>
      <div className="selector-window">
        <div className="selector-pointer" aria-hidden="true" />
        <div className={`selector-track ${spinning ? "is-scrolling" : ""}`} style={{ transform: `translateX(calc(50% - ${reelSlot / 2}px - ${position * reelSlot}px))` }}>
          {reelItems.map((item, i) => <div className={`selector-item ${i === position ? "selected" : ""}`} key={`${item.name}-${i}`}><b>{item.icon}</b><em>{item.name}</em></div>)}
        </div>
      </div>
    </section>
  );
}

function PickCard({ item, label, revealed }: { item: Item; label: string; revealed: boolean }) {
  return (
    <div className={`pick-card ${revealed ? "revealed" : ""}`}>
      <div className="pick-image" role="img" aria-label={item.name}><span className="yarn-stitch">⌁</span><span>{item.icon}</span></div>
      <p>{label}</p><strong>{item.name}</strong>
    </div>
  );
}

export default function Home() {
  const sets = [animalsA, animalsB, accessoriesA, accessoriesB];
  const [picks, setPicks] = useState([0, 0, 0, 0]);
  const [rotations, setRotations] = useState([0, 0, 0, 0]);
  const [reelPositions, setReelPositions] = useState([40, 40]);
  const [spinning, setSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => () => { timersRef.current.forEach(window.clearTimeout); audioRef.current?.close(); }, []);

  const getAudio = () => {
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = audioRef.current || new AudioCtx(); audioRef.current = ctx;
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  };

  const ratchetClick = (strength = 1) => {
    try {
      const ctx = getAudio();
      const length = Math.floor(ctx.sampleRate * .025);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 5);
      const source = ctx.createBufferSource(); const filter = ctx.createBiquadFilter(); const gain = ctx.createGain();
      filter.type = "bandpass"; filter.frequency.value = 1900 + Math.random() * 500; filter.Q.value = 1.5;
      gain.gain.value = .11 * strength; source.buffer = buffer;
      source.connect(filter).connect(gain).connect(ctx.destination); source.start();
    } catch { /* sound is a progressive enhancement */ }
  };

  const successSound = () => {
    try {
      const ctx = getAudio();
      [523.25, 659.25, 783.99, 1046.5].forEach((frequency, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain(); const start = ctx.currentTime + i * .085;
        osc.type = "sine"; osc.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(.001, start); gain.gain.linearRampToValueAtTime(.11, start + .02); gain.gain.exponentialRampToValueAtTime(.001, start + .42);
        osc.connect(gain).connect(ctx.destination); osc.start(start); osc.stop(start + .45);
      });
    } catch { /* sound is a progressive enhancement */ }
  };

  const playSpinRatchet = () => {
    const started = performance.now();
    const click = () => {
      const elapsed = performance.now() - started;
      if (elapsed >= 3050) return;
      ratchetClick(Math.max(.55, 1 - elapsed / 6500));
      const progress = elapsed / 3050;
      const delay = 34 + Math.pow(progress, 2.6) * 225;
      timersRef.current.push(window.setTimeout(click, delay));
    };
    click();
  };

  const spin = () => {
    if (spinning) return;
    setSpinning(true); setHasSpun(false);
    const next = sets.map(() => Math.floor(Math.random() * 10));
    setRotations(prev => prev.map((r, i) => r + 1440 + (10 - next[i]) * 36 - (r % 360)));
    setReelPositions(prev => prev.map((position, i) => position + 30 + ((next[i + 2] - (position % 10) + 10) % 10)));
    playSpinRatchet();
    timersRef.current.push(window.setTimeout(() => { setPicks(next); setSpinning(false); setHasSpun(true); successSound(); }, 3200));
  };

  return (
    <main>
      <header className="brand-header">
        <figure className="header-art portrait-art"><img src="./florence-cartoon.png" alt="Cartoon portrait of Florence Mae Gifts’ crochet artist" /></figure>
        <div className="logo-lockup"><p className="brand-owner">Florence Mae Gift&apos;s</p><h1>Stitch <span>&amp;</span> Spin</h1><div className="challenge-ribbon"><i>✦</i> The Crochet Creature Challenge <i>✦</i></div></div>
      </header>

      <div className="game-grid">
        <aside className="wheel-column left-column">
          <Wheel title="Animal #1" items={animalsA} rotation={rotations[0]} spinning={spinning} />
          <AccessorySelector title="Accessory #1" items={accessoriesA} position={reelPositions[0]} spinning={spinning} />
        </aside>

        <section className={`reveal-stage ${hasSpun ? "celebrate" : ""}`} aria-live="polite">
          <div className="confetti" aria-hidden="true">{Array.from({length: 22}, (_, i) => <i key={i} style={{"--i": i, "--x": `${(i - 10.5) * 25}px`, "--y": `${145 + (i % 5) * 24}px`} as React.CSSProperties}/>)}</div>
          <p className="stage-kicker">Today’s crochet challenge</p>
          <h2>{hasSpun ? "Your mashup is..." : "Ready to meet your muse?"}</h2>
          <div className="animal-picks">
            <PickCard item={sets[0][picks[0]]} label="Animal one" revealed={hasSpun} />
            <div className="plus">+</div>
            <PickCard item={sets[1][picks[1]]} label="Animal two" revealed={hasSpun} />
          </div>
          <div className="accessory-strip">
            <span className="styled-label">Styled with</span>
            <div className="accessory-pick"><i>{sets[2][picks[2]].icon}</i><b>{hasSpun ? sets[2][picks[2]].name : "A surprise"}</b></div>
            <em>+</em>
            <div className="accessory-pick"><i>{sets[3][picks[3]].icon}</i><b>{hasSpun ? sets[3][picks[3]].name : "A surprise"}</b></div>
          </div>
          <button onClick={spin} disabled={spinning} className="spin-button">
            <span>{spinning ? "SPINNING..." : "SPIN!"}</span><small>{spinning ? "Hold onto your yarn" : "Create my crochet challenge"}</small>
          </button>
          <p className="hint">Sound on for the full game-show moment!</p>
        </section>

        <aside className="wheel-column right-column">
          <Wheel title="Animal #2" items={animalsB} rotation={rotations[1]} spinning={spinning} />
          <AccessorySelector title="Accessory #2" items={accessoriesB} position={reelPositions[1]} spinning={spinning} />
        </aside>
      </div>
      <footer><span>✿</span> Made for curious crocheters &amp; creative creatures <span>✿</span></footer>
    </main>
  );
}
