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

function Wheel({ title, items, rotation, spinning, compact = false }: { title: string; items: Item[]; rotation: number; spinning: boolean; compact?: boolean }) {
  const gradient = useMemo(() => `conic-gradient(${items.map((_, i) => `${palettes[i]} ${i * 10}% ${(i + 1) * 10}%`).join(",")})`, [items]);
  return (
    <section className={`wheel-unit ${compact ? "compact" : ""}`} aria-label={`${title} wheel`}>
      <div className="wheel-title"><span>{compact ? "✦" : "♥"}</span>{title}</div>
      <div className="wheel-wrap">
        <div className="pointer" aria-hidden="true" />
        <div className={`wheel ${spinning ? "is-spinning" : ""}`} style={{ background: gradient, transform: `rotate(${rotation}deg)` }}>
          <div className="wheel-rim-dots" />
          {items.map((item, i) => {
            const angle = i * 36 + 18;
            return <span className="wheel-label" key={item.name} style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-38%) rotate(90deg)` }}><b>{item.icon}</b><em>{item.name}</em></span>;
          })}
          <div className="wheel-hub"><span>♥</span></div>
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
  const [spinning, setSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => () => audioRef.current?.close(), []);

  const tick = () => {
    try {
      const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = audioRef.current || new AudioCtx(); audioRef.current = ctx;
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.frequency.value = 330 + Math.random() * 180; osc.type = "triangle";
      gain.gain.setValueAtTime(.055, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .045);
      osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + .05);
    } catch { /* sound is a progressive enhancement */ }
  };

  const spin = () => {
    if (spinning) return;
    setSpinning(true); setHasSpun(false);
    const next = sets.map(() => Math.floor(Math.random() * 10));
    setRotations(prev => prev.map((r, i) => r + 1440 + (10 - next[i]) * 36 - (r % 360)));
    let count = 0;
    const ticker = window.setInterval(() => { tick(); if (++count > 30) window.clearInterval(ticker); }, 95);
    window.setTimeout(() => { setPicks(next); setSpinning(false); setHasSpun(true); tick(); }, 3200);
  };

  return (
    <main>
      <header>
        <div className="brand-mark" aria-hidden="true">🧶</div>
        <div><p className="eyebrow">Florence Mae Gift&apos;s</p><h1>Stitch &amp; Spin</h1><p className="subtitle">The crochet creature challenge</p></div>
        <div className="round-label">MAKE<br/>MAGIC!</div>
      </header>

      <div className="game-grid">
        <aside className="wheel-column animal-column">
          <Wheel title="Animal One" items={animalsA} rotation={rotations[0]} spinning={spinning} />
          <Wheel title="Animal Two" items={animalsB} rotation={rotations[1]} spinning={spinning} />
        </aside>

        <section className="reveal-stage" aria-live="polite">
          <div className="bulbs" aria-hidden="true">{Array.from({length: 13}, (_, i) => <i key={i}/>)}</div>
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

        <aside className="wheel-column accessory-column">
          <Wheel title="Accessory One" items={accessoriesA} rotation={rotations[2]} spinning={spinning} compact />
          <Wheel title="Accessory Two" items={accessoriesB} rotation={rotations[3]} spinning={spinning} compact />
        </aside>
      </div>
      <footer><span>✿</span> Made for curious crocheters &amp; creative creatures <span>✿</span></footer>
    </main>
  );
}
