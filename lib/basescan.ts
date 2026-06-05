import { WalletMetrics, ActivityBreakdown } from './types';

const BASESCAN_API = 'https://api.basescan.org/api';
const MAX_TXS = 50000; // Increased limit

const KNOWN_CONTRACTS: Record<string, keyof ActivityBreakdown> = {
  '0x3154cf16ccdb4c6d922629664174b904d80f2c35': 'bridge',
  '0x4200000000000000000000000000000000000010': 'bridge',
  '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43': 'swap',
  '0x420DD381b31aEf6683dB6B902084cB0FFECe40Da': 'liquidityProviding',
  '0x2626664c2603336E57B271c5C0b26F421741e481': 'swap',
  '0xfBb21d0380beE3312B33c4353c8936a0F13EF26C': 'lending',
};

function isLikelySpam(tx: any): boolean {
  if (!tx.value || !tx.from || !tx.to) return false;
  const value = BigInt(tx.value);
  const isSelf = tx.from.toLowerCase() === tx.to.toLowerCase();
  return isSelf && value < BigInt('1000000000000000');
}

export async function fetchBaseTransactions(address: string, apiKey: string): Promise<any[]> {
  const allTxs: any[] = [];
  let page = 1;
  const offset = 10000;

  while (allTxs.length < MAX_TXS) {
    const params = new URLSearchParams({
      module: 'account',
      action: 'txlist',
      address: address,
      startblock: '0',
      endblock: '99999999',
      page: page.toString(),
      offset: offset.toString(),
      sort: 'asc',
      apikey: apiKey,
    });

    try {
      const response = await fetch(`${BASESCAN_API}?${params.toString()}`);
      
      if (!response.ok) {
        console.error('BaseScan API HTTP error:', response.status);
        break;
      }

      const data = await response.json();

      if (data.status !== '1' || !data.result || data.result.length === 0) {
        break;
      }

      allTxs.push(...data.result);

      if (data.result.length < offset) {
        break;
      }

      page++;
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.error('Error fetching from BaseScan:', error);
      break;
    }
  }

  return allTxs;
}

export function extractMetrics(txs: any[]) {
  if (!txs || txs.length === 0) {
    return {
      metrics: {
        totalTxs: 0, activeDays: 0, uniqueContracts: 0, accountAgeDays: 0,
        failedTxs: 0, spamTxs: 0
      },
      monthlyData: [],
      activityBreakdown: { bridge: 0, nft: 0, swap: 0, lending: 0, liquidityProviding: 0, staking: 0, borrow: 0 }
    };
  }

  const successfulTxs = txs.filter(tx => tx.isError === '0');
  const failedTxs = txs.length - successfulTxs.length;

  const daySet = new Set();
  const contractSet = new Set();
  let firstTs = Infinity;
  let lastTs = 0;
  let spamCount = 0;

  const activityBreakdown = { bridge: 0, nft: 0, swap: 0, lending: 0, liquidityProviding: 0, staking: 0, borrow: 0 };
  const monthMap = new Map();

  for (const tx of successfulTxs) {
    const ts = parseInt(tx.timeStamp) * 1000;
    const date = new Date(ts);
    
    daySet.add(date.toISOString().split('T')[0]);
    
    if (ts < firstTs) firstTs = ts;
    if (ts > lastTs) lastTs = ts;

    if (tx.to && tx.to !== '0x0000000000000000000000000000000000000000') {
      contractSet.add(tx.to.toLowerCase());
    }

    const toLower = (tx.to || '').toLowerCase();
    if (KNOWN_CONTRACTS[toLower]) {
      activityBreakdown[KNOWN_CONTRACTS[toLower]]++;
    }

    if (isLikelySpam(tx)) spamCount++;

    const monthKey = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
  }

  const monthlyData = Array.from(monthMap.entries())
    .map(([month, count]) => ({ month, txs: count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const accountAgeDays = firstTs !== Infinity 
    ? Math.floor((Date.now() - firstTs) / (1000 * 60 * 60 * 24)) 
    : 0;

  return {
    metrics: {
      totalTxs: successfulTxs.length,
      activeDays: daySet.size,
      uniqueContracts: contractSet.size,
      accountAgeDays,
      failedTxs,
      spamTxs: spamCount
    },
    monthlyData,
    activityBreakdown
  };
}