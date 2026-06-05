import { WalletMetrics, ScoreResult, MonthlyData, ActivityBreakdown } from './types';

export function calculateBaseActivityScore(
  metrics: WalletMetrics,
  monthlyData: MonthlyData[],
  activityBreakdown?: ActivityBreakdown
): ScoreResult {
  const { totalTxs, activeDays, uniqueContracts, accountAgeDays = 0 } = metrics;

  const txScore = Math.min(Math.log10(Math.max(totalTxs, 1) + 1) * 21, 42);
  const daysScore = Math.min(activeDays * 1.65, 28);
  const diversityScore = Math.min(uniqueContracts / 3.2, 22);

  let recencyBonus = 0;
  if (accountAgeDays > 30) recencyBonus += 3;
  if (accountAgeDays > 90) recencyBonus += 3;
  if (accountAgeDays > 180) recencyBonus += 2;

  const hasRecentActivity = monthlyData.length > 0 && monthlyData[monthlyData.length - 1].txs > 0;
  if (hasRecentActivity) recencyBonus += 3;
  recencyBonus = Math.min(recencyBonus, 8);

  let score = Math.floor(txScore + daysScore + diversityScore + recencyBonus);
  score = Math.max(1, Math.min(100, score));
  const tier = getTier(score);

  const defaultBreakdown: ActivityBreakdown = { 
    bridge: 0, nft: 0, swap: 0, lending: 0, liquidityProviding: 0, staking: 0, borrow: 0 
  };

  return {
    score,
    tier,
    breakdown: {
      txScore: Math.round(txScore),
      daysScore: Math.round(daysScore),
      diversityScore: Math.round(diversityScore),
      recencyBonus: Math.round(recencyBonus),
      totalTxs,
      activeDays,
      uniqueContracts,
    },
    metrics,
    monthlyData,
    activityBreakdown: activityBreakdown || defaultBreakdown,
  };
}

function getTier(score: number): string {
  if (score >= 81) return "True Base native";
  if (score >= 61) return "Base power user";
  if (score >= 41) return "Active user";
  if (score >= 21) return "Exploring the chain";
  return "Just getting started";
}

export function getTierColor(tier: string): string {
  if (tier.includes("True Base") || tier.includes("power user")) return "text-emerald-400";
  if (tier.includes("Active")) return "text-blue-400";
  if (tier.includes("Exploring")) return "text-amber-400";
  return "text-zinc-400";
}