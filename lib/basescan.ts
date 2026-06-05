import { WalletMetrics, ActivityBreakdown } from './types';

const BASESCAN_API = 'https://api.basescan.org/api';
const MAX_TXS = 20000;

const KNOWN_CONTRACTS: Record<string, keyof ActivityBreakdown | 'spam'> = {
  '0x3154cf16ccdb4c6d922629664174b904d80f2c35': 'bridge',
  '0x4200000000000000000000000000000000000010': 'bridge',
  '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43': 'swap',
  '0x420DD381b31aEf6683dB6B902084cB0FFECe40Da': 'liquidityProviding',
  '0x2626664c2603336E57B271c5C0b26F421741e481': 'swap',
  '0xfBb21d0380beE3312B33c4353c8936a0F13EF26C': 'lending',
};

function isLikelySpam(tx: any, fromAddress: string): boolean {
  const value = BigInt(tx.value || '0');
  const isSelfTransfer = tx.from.toLowerCase() === tx.to.toLowerCase();
  const isVerySmall = value < BigInt('1000000000000000');
  return isSelfTransfer && isVerySmall;
}

export async function fetchBaseTransactions(address: string, apiKey: string): Promise<any[]> {
  // ... (full implementation from sandbox)
  return [];
}
export function extractMetrics(txs: any[]): { metrics: WalletMetrics; monthlyData: any[]; activityBreakdown: ActivityBreakdown } {
  // ... (full implementation)
  return { metrics: { totalTxs: 0, activeDays: 0, uniqueContracts: 0 }, monthlyData: [], activityBreakdown: { bridge: 0, nft: 0, swap: 0, lending: 0, liquidityProviding: 0, staking: 0, borrow: 0 } };
}