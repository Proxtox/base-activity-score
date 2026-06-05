export interface WalletMetrics {
  totalTxs: number;
  activeDays: number;
  uniqueContracts: number;
  firstTxDate?: string;
  lastTxDate?: string;
  totalGasUsed?: string;
  accountAgeDays?: number;
  totalVolumeWei?: string;
  totalGasFeeWei?: string;
  failedTxs?: number;
  spamTxs?: number;
}

export interface ActivityBreakdown {
  bridge: number;
  nft: number;
  swap: number;
  lending: number;
  liquidityProviding: number;
  staking: number;
  borrow: number;
}

export interface MonthlyData {
  month: string;
  txs: number;
}

export interface ScoreResult {
  score: number;
  tier: string;
  breakdown: {
    txScore: number;
    daysScore: number;
    diversityScore: number;
    recencyBonus: number;
    totalTxs: number;
    activeDays: number;
    uniqueContracts: number;
  };
  metrics: WalletMetrics;
  monthlyData: MonthlyData[];
  activityBreakdown: ActivityBreakdown;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: ScoreResult;
  error?: string;
  cached?: boolean;
}