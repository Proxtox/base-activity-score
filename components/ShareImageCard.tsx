'use client';
import React from 'react';
import { ScoreResult } from '@/lib/types';
interface Props { result: ScoreResult; address: string; }
export default function ShareImageCard({ result, address }: Props) {
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  return (
    <div id="share-card" className="w-[800px] h-[520px] bg-zinc-950 text-white p-10 relative overflow-hidden" style={{ backgroundImage: `radial-gradient(circle at 20% 30%, rgba(0,82,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(16,185,129,0.06) 0%, transparent 50%)` }}>
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none"><div className="text-[135px] font-black tracking-[-12px] rotate-[-18deg]">STAY BASED</div></div>
      <div className="absolute top-6 right-8 opacity-[0.055] text-[18px] font-mono tracking-[6px] rotate-[6deg] pointer-events-none select-none">BASED • BASED • BASED</div>
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0052FF] flex items-center justify-center"><span className="text-white font-bold text-3xl">B</span></div>
            <div><div className="font-semibold text-2xl tracking-tight">Base Activity Score</div><div className="text-xs text-zinc-400 -mt-0.5">Unofficial • On-chain analysis</div></div>
          </div>
          <div className="text-right"><div className="text-xs text-zinc-400">WALLET</div><div className="font-mono text-sm">{shortAddress}</div></div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center -mt-6">
          <div className="text-[140px] font-bold tabular-nums tracking-[-10px] leading-none text-white">{result.score}</div>
          <div className="text-4xl font-semibold tracking-tight text-emerald-400 -mt-4">{result.tier}</div>
        </div>
        <div className="grid grid-cols-4 gap-4 text-center">
          {[{label:'TXs',value:result.breakdown.totalTxs.toLocaleString()},{label:'Active Days',value:result.breakdown.activeDays},{label:'Contracts',value:result.breakdown.uniqueContracts},{label:'Age (days)',value:result.metrics.accountAgeDays||0}].map((stat,i)=>(<div key={i} className="bg-zinc-900/60 border border-white/10 rounded-2xl py-3"><div className="text-xs text-zinc-400">{stat.label}</div><div className="text-3xl font-semibold tabular-nums tracking-tighter mt-1">{stat.value}</div></div>))}
        </div>
        <div className="mt-6 flex justify-between items-end text-xs text-zinc-400"><div>base-activity-score.vercel.app</div><div className="font-mono">STAY BASED • BUILD ON BASE</div></div>
      </div>
    </div>
  );
}