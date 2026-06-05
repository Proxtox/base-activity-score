'use client';

import React, { useState } from 'react';
import { Search, Copy, Twitter, RefreshCw, AlertCircle, CheckCircle, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { isAddress } from 'viem';
import { ScoreResult, AnalyzeResponse } from '@/lib/types';
import { getTierColor } from '@/lib/calculateScore';
import ActivityChart from '@/components/ActivityChart';
import ScoreGauge from '@/components/ScoreGauge';
import MethodologyModal from '@/components/MethodologyModal';
import ShareImageCard from '@/components/ShareImageCard';

export default function BaseActivityScore() {
  const [address, setAddress] = useState('');
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cached, setCached] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) return;
    if (!isAddress(trimmed)) {
      setError('Please enter a valid Ethereum address (0x...)');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    setCached(false);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: trimmed }),
      });
      const data: AnalyzeResponse = await res.json();
      if (!data.success || !data.data) throw new Error(data.error || 'Failed to analyze wallet');
      setResult(data.data);
      setCached(!!data.cached);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => { if (result) navigator.clipboard.writeText(address); };
  const shareOnTwitter = () => {
    if (!result) return;
    const text = `My Base Activity Score is ${result.score}/100 — ${result.tier} 🔥\n\nCheck yours: https://base-activity-score.vercel.app/?address=${address}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };
  const reset = () => { setResult(null); setAddress(''); setError(''); setCached(false); };

  const downloadImage = async () => {
    if (!result) return;
    const card = document.getElementById('share-card');
    if (!card) return;
    try {
      const canvas = await html2canvas(card, { scale: 2, backgroundColor: '#09090b', logging: false });
      const link = document.createElement('a');
      link.download = `base-activity-score-${address.slice(0, 8)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) { alert('Failed to generate image.'); }
  };

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlAddress = params.get('address');
    if (urlAddress && isAddress(urlAddress)) {
      setAddress(urlAddress);
      setTimeout(() => { handleAnalyze(); }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0052FF] flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <div>
              <div className="font-semibold tracking-tighter text-xl">Base Activity Score</div>
              <div className="text-[10px] text-zinc-500 -mt-1">Unofficial • On-chain analysis</div>
            </div>
          </div>
          <button onClick={() => setShowMethodology(true)} className="text-sm px-4 py-1.5 rounded-full border border-zinc-800 hover:bg-zinc-900 transition-colors flex items-center gap-2">
            Methodology
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 pt-16 pb-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-sm mb-4">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live on Base mainnet
          </div>
          <h1 className="text-6xl font-semibold tracking-tighter mb-4">How active are you<br />on Base?</h1>
          <p className="text-xl text-zinc-400 max-w-md mx-auto">Get your personalized 0–100 on-chain activity score.<br />No wallet connection needed.</p>
        </div>

        <form onSubmit={handleAnalyze} className="max-w-2xl mx-auto mb-16">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input type="text" value={address} onChange={(e) => { setAddress(e.target.value); setError(''); }} placeholder="0x... or paste your Base wallet address" className="address-input w-full bg-zinc-900 border border-zinc-800 focus:border-[#0052FF] rounded-2xl px-6 py-4 text-lg placeholder:text-zinc-500 outline-none transition-all" disabled={loading} />
            </div>
            <button type="submit" disabled={loading || !address.trim()} className="px-8 rounded-2xl bg-[#0052FF] hover:bg-[#0041CC] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-all active:scale-[0.985]">
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <>Analyze <Search className="w-4 h-4" /></>}
            </button>
          </div>
          {error && <div className="mt-3 flex items-center gap-2 text-red-400 text-sm px-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
        </form>

        {result && (
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center mb-10">
              <div className="text-sm uppercase tracking-[3px] text-zinc-500 mb-2">YOUR BASE ACTIVITY SCORE</div>
              <ScoreGauge score={result.score} tier={result.tier} />
              <div className="mt-6">
                <div className={`text-4xl font-semibold tracking-tighter ${getTierColor(result.tier)}`}>{result.tier}</div>
                <div className="text-zinc-400 mt-1 text-lg">{result.score} / 100</div>
                {result.breakdown.recencyBonus > 0 && <div className="text-emerald-400 text-xs mt-1">+{result.breakdown.recencyBonus} recency bonus</div>}
              </div>
              {cached && <div className="mt-3 inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-900"><CheckCircle className="w-3.5 h-3.5" /> Cached result (refreshes every 6 hours)</div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="metric-card bg-zinc-900 border border-zinc-800 rounded-3xl p-6"><div className="text-sm text-zinc-500 mb-1">Total Transactions</div><div className="text-5xl font-semibold tracking-tighter tabular-nums">{result.breakdown.totalTxs.toLocaleString()}</div><div className="text-xs text-zinc-500 mt-3">Successful on-chain actions</div></div>
              <div className="metric-card bg-zinc-900 border border-zinc-800 rounded-3xl p-6"><div className="text-sm text-zinc-500 mb-1">Active Days</div><div className="text-5xl font-semibold tracking-tighter tabular-nums">{result.breakdown.activeDays}</div><div className="text-xs text-zinc-500 mt-3">Unique days with at least one transaction</div></div>
              <div className="metric-card bg-zinc-900 border border-zinc-800 rounded-3xl p-6"><div className="text-sm text-zinc-500 mb-1">Unique Contracts</div><div className="text-5xl font-semibold tracking-tighter tabular-nums">{result.breakdown.uniqueContracts}</div><div className="text-xs text-zinc-500 mt-3">Distinct addresses interacted with</div></div>
            </div>

            {result.activityBreakdown && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-8">
                <div className="font-semibold text-lg mb-4">On-Chain Activity Breakdown</div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {Object.entries(result.activityBreakdown).filter(([_, count]) => count > 0).map(([key, count]) => (
                    <div key={key} className="bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3">
                      <div className="text-xs text-zinc-400 capitalize tracking-wide">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <div className="text-3xl font-semibold tabular-nums tracking-tighter mt-1">{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={shareOnTwitter} className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-zinc-800 hover:bg-zinc-900 transition-colors"><Twitter className="w-4 h-4" /> Share on X</button>
              <button onClick={copyAddress} className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-zinc-800 hover:bg-zinc-900 transition-colors"><Copy className="w-4 h-4" /> Copy Address</button>
              <button onClick={reset} className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-zinc-800 hover:bg-zinc-900 transition-colors"><RefreshCw className="w-4 h-4" /> Analyze Another Wallet</button>
              <button onClick={downloadImage} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-black hover:bg-zinc-200 transition-colors font-medium"><Download className="w-4 h-4" /> Download Beautiful Image</button>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="max-w-xl mx-auto text-center mt-8">
            <div className="text-sm text-zinc-400 mb-4">How it works</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {[{num:'01', title:'Paste address', desc:'Any EVM wallet on Base mainnet'},{num:'02', title:'We analyze', desc:'Transactions, active days & diversity'},{num:'03', title:'Get your score', desc:'0–100 with clear tier explanation'}].map((step, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"><div className="font-mono text-xs text-[#0052FF] mb-2">{step.num}</div><div className="font-semibold mb-1">{step.title}</div><div className="text-sm text-zinc-400">{step.desc}</div></div>
              ))}
            </div>
          </div>
        )}
      </div>
      <MethodologyModal open={showMethodology} onClose={() => setShowMethodology(false)} />
    </div>
  );
}
