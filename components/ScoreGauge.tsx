'use client';
import React from 'react';
interface ScoreGaugeProps { score: number; tier: string; }
export default function ScoreGauge({ score, tier }: ScoreGaugeProps) {
  const percentage = Math.max(0, Math.min(100, score));
  const getRingColor = () => {
    if (tier.includes('True Base') || tier.includes('power user')) return '#10b981';
    if (tier.includes('Active')) return '#3b82f6';
    if (tier.includes('Exploring')) return '#f59e0b';
    return '#71717a';
  };
  const ringColor = getRingColor();
  return (
    <div className="relative flex flex-col items-center">
      <div className="score-gauge" style={{ '--score': percentage, background: `conic-gradient(${ringColor} 0deg, ${ringColor} calc(${percentage} * 3.6deg), #27272a calc(${percentage} * 3.6deg), #27272a 360deg)` } as React.CSSProperties}>
        <div className="relative z-10 text-center">
          <div className="text-[72px] font-semibold tabular-nums tracking-[-4.5px] leading-none text-white">{score}</div>
          <div className="text-sm text-zinc-400 -mt-1">/ 100</div>
        </div>
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[220px] h-[220px] rounded-full border border-white/10" />
    </div>
  );
}