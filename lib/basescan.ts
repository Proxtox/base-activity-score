import { WalletMetrics, ActivityBreakdown } from './types';

const COVALENT_API = 'https://api.covalenthq.com/v1';
const BASE_CHAIN_ID = '8453';

const MAX_PAGES = 5; // Fetch up to 5 pages (adjust as needed)

const KNOWN_CONTRACTS: Record<string, keyof ActivityBreakdown> = {
  '0x3154cf16ccdb4c6d922629664174b904d80f2c35': 'bridge',
  '0x4200000000000000000000000000000000000010': 'bridge',
  '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43': 'swap',
  '0x420DD381b31aEf6683dB6B902084cB0FFECe40Da': 'liquidityProviding',
  '0x2626664c2603336E57B271c5C0b26F421741e481': 'swap',
  '0xfBb21d0380beE3312B33c4353c8936a0F13EF26C': 'lending',
};

function isLikelySpam(tx: any): boolean {
  if (!tx.value || !tx.from_address || !tx.to_address) return false;
  const value = BigInt(tx.value);
  const isSelf = tx.from_address.toLowerCase() === tx.to_address.toLowerCase();
  return isSelf && value < BigInt('1000000000000000');
}

export async function fetchBaseTransactions(address: string, apiKey: string): Promise<any[]> {
  const allTxs: any[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = `${COVALENT_API}/${BASE_CHAIN_ID}/address/${address}/transactions_v3/?key=${apiKey}&page-number=${page}&page-size=1000`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        console.error('Covalent API error:', response.status);
        break;
      }

      const data = await response.json();

      if (!data.data || !data.data.items || data.data.items.length === 0) {
        break;
      }

      allTxs.push(...data.data.items);

      // Stop if we've reached the last page
      if (!data.data.pagination || !data.data.pagination.has_more) {
        break;
      }

    } catch (error) {
      console.error('Error fetching from Covalent:', error);
      break;
    }
  }

  return allTxs;
}

export function extractMetrics(txs: any[]) {
  if (!txs || txs.length === 0) {
    return {
      metrics: { totalTxs: 0, activeDays: 0, uniqueContracts: 0, accountAgeDays: 0, failedTxs: 0, spamTxs: 0 },
      monthlyData: [],
      activityBreakdown: { bridge: 0, nft: 0, swap: 0, lending: 0, liquidityProviding: 0, staking: 0, borrow: 0 }
    };
  }

  // Covalent returns different field names
  const successfulTxs = txs.filter((tx: any) => tx.successful);
  const failedTxs = txs.length - successfulTxs.length;

  const daySet = new Set<string>();
  const contractSet = new Set<string>();
  let firstTs = Infinity;
  let lastTs = 0;
  let spamCount = 0;

  const activityBreakdown = { bridge: 0, nft: 0, swap: 0, lending: 0, liquidityProviding: 0, staking: 0, borrow: 0 };
  const monthMap = new Map<string, number>();

  for (const tx of successfulTxs) {
    const ts = new Date(tx.block_signed_at).getTime();
    const date = new Date(ts);

    daySet.add(date.toISOString().split('T')[0]);
    if (ts < firstTs) firstTs = ts;
    if (ts > lastTs) lastTs = ts;

    if (tx.to_address && tx.to_address !== '0x0000000000000000000000000000000000000000') {
      contractSet.add(tx.to_address.toLowerCase());
    }

    const toLower = (tx.to_address || '').toLowerCase();
    if (KNOWN_CONTRACTS[toLower]) {
      activityBreakdown[KNOWN_CONTRACTS[toLower]]++;
    }

    if (isLikelySpam(tx)) spamCount++;

    const monthKey = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
  }

  const monthlyData = Array.from(monthMap.entries())
    .map(([month, txs]) => ({ month, txs }))
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