'use client';

import React from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MethodologyModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6" onClick={onClose}>
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full p-8 relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-semibold tracking-tight mb-6">How the score is calculated</h2>

        <div className="space-y-6 text-sm leading-relaxed text-zinc-300">
          <div>
            <div className="font-medium text-white mb-1">Transparent &amp; Simple</div>
            <p>We analyze your public transaction history on Base mainnet using BaseScan data.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
              <div className="font-mono text-xs text-[#0052FF] mb-1">TRANSACTION SCORE</div>
              <div className="text-lg font-semibold">Up to 42 pts</div>
              <p className="text-xs mt-2 text-zinc-400">Log-scaled total successful transactions.</p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
              <div className="font-mono text-xs text-[#0052FF] mb-1">CONSISTENCY SCORE</div>
              <div className="text-lg font-semibold">Up to 28 pts</div>
              <p className="text-xs mt-2 text-zinc-400">Number of unique days you were active on Base.</p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
              <div className="font-mono text-xs text-[#0052FF] mb-1">DIVERSITY SCORE</div>
              <div className="text-lg font-semibold">Up to 22 pts</div>
              <p className="text-xs mt-2 text-zinc-400">How many unique contracts you’ve interacted with.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 text-xs text-zinc-400">
            The final score is clamped between 1–100 and mapped to clear tiers. 
            This is an estimate for fun and community use. It is <span className="text-white">not</span> an official Base metric.
          </div>
        </div>

        <div className="mt-8 text-xs text-center text-zinc-500">
          Made as an open-source starter • Improve the formula and deploy your own version.
        </div>
      </div>
    </div>
  );
}
