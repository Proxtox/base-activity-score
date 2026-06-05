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

function isLikelySpam(tx: any): boolean {
  const value = BigInt(tx.value || '0');
  const isSelfTransfer = tx.from?.toLowerCase() === tx.to?.toLowerCase();
  const isVerySmall = value < BigInt('1000000000000000');
  return isSelfTransfer && isVerySmall;
}

export async function fetchBaseTransactions(address: string, apiKey: string): Promise<any[]> {
  const allTxs: any[] = [];
  let page = 1;
  const offset = 10000;
  while (allTxs.length < MAX_TXS) {
    const params = new URLSearchParams({
      module: 'account',
      action: 'txlist',
      address,
      startblock: '0',
      endblock: '99999999',
      page: page.toString(),
      offset: offset.toString(),
      sort: 'asc',
      apikey: apiKey,
    });
    const res = await fetch(`${BASESCAN_API}?${params.toString()}`);
    if (!res.ok) throw new Error(`BaseScan API error: ${res.status}`);
    const data = await res.json();
    if (data.status !== '1' || !data.result) break;
    allTxs.push(...data.result);
    if (data.result.length < offset) break;
    page++;
    await new Promise(r => setTimeout(r, 100));
  }
  return allTxs;
}

export function extractMetrics(txs: any[]): { metrics: WalletMetrics; monthlyData: any[]; activityBreakdown: ActivityBreakdown } {
  if (!txs || txs.length === 0) {
    return {
      metrics: { totalTxs: 0, activeDays: 0, uniqueContracts: 0, failedTxs: 0, spamTxs: 0 },
      monthlyData: [],
      activityBreakdown: { bridge: 0, nft: 0, swap: 0, lending: 0, liquidityProviding: 0, staking: 0, borrow: 0 }
    };
  }
  const successfulTxs = txs.filter((tx: any) => tx.isError === '0');
  const failedTxs = txs.length - successfulTxs.length;
  const totalTxs = successfulTxs.length;
  const daySet = new Set<string>();
  let firstTs = Infinity;
  let lastTs = 0;
  const contractSet = new Set<string>();
  let spamCount = 0;
  const activityBreakdown: ActivityBreakdown = { bridge: 0, nft: 0, swap: 0, lending: 0, liquidityProviding: 0, staking: 0, borrow: 0 };
  const monthMap = new Map<string, number>();
  for (const tx of successfulTxs) {
    const ts = parseInt(tx.timeStamp, 10) * 1000;
    const date = new Date(ts);
    const dateStr = date.toISOString().split('T')[0];
    daySet.add(dateStr);
    if (ts < firstTs) firstTs = ts;
    if (ts > lastTs) lastTs = ts;
    if (tx.to && tx.to !== '0x0000000000000000000000000000000000000000') {
      contractSet.add(tx.to.toLowerCase());
    }
    const toLower = (tx.to || '').toLowerCase();
    const activityType = KNOWN_CONTRACTS[toLower];
    if (activityType && activityType !== 'spam') {
      activityBreakdown[activityType as keyof ActivityBreakdown]++;
    }
    if (isLikelySpam(tx)) spamCount++;
    const monthKey = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
  }
  const monthlyData = Array.from(monthMap.entries()).map(([month, txs]) => ({ month, txs })).sort((a, b) => {
    const [aM, aY] = a.month.split(' ');
    const [bM, bY] = b.month.split(' ');
    if (aY !== bY) return parseInt(aY) - parseInt(bY);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months.indexOf(aM) - months.indexOf(bM);
  });
  const accountAgeDays = firstTs !== Infinity ? Math.floor((Date.now() - firstTs) / (1000 * 60 * 60 * 24)) : 0;
  return {
    metrics: {
      totalTxs,
      activeDays: daySet.size,
      uniqueContracts: contractSet.size,
      firstTxDate: firstTs !== Infinity ? new Date(firstTs).toISOString().split('T')[0] : undefined,
      lastTxDate: lastTs ? new Date(lastTs).toISOString().split('T')[0] : undefined,
      accountAgeDays,
      failedTxs,
      spamTxs: spamCount,
    },
    monthlyData,
    activityBreakdown,
  };
}