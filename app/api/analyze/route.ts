import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { fetchBaseTransactions, extractMetrics } from '@/lib/basescan';
import { calculateBaseActivityScore } from '@/lib/calculateScore';
import { AnalyzeResponse } from '@/lib/types';

const memoryCache = new Map<string, { data: any; timestamp: number }>(); 
const CACHE_TTL = 1000 * 60 * 60 * 6;

let kv: any = null;
try {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    import('@vercel/kv').then((mod) => { kv = mod.kv; }).catch(() => {});
  }
} catch (_) {}

async function getCachedResult(key: string) {
  if (kv) { try { const cached = await kv.get(key); if (cached) return cached; } catch (_) {} }
  const mem = memoryCache.get(key);
  if (mem && Date.now() - mem.timestamp < CACHE_TTL) return mem.data;
  return null;
}

async function setCachedResult(key: string, data: any) {
  if (kv) { try { await kv.set(key, data, { ex: 21600 }); return; } catch (_) {} }
  memoryCache.set(key, { data, timestamp: Date.now() });
}

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();
    if (!address || typeof address !== 'string') {
      return NextResponse.json({ success: false, error: 'Address is required' }, { status: 400 });
    }
    const normalizedAddress = address.trim();
    if (!isAddress(normalizedAddress)) {
      return NextResponse.json({ success: false, error: 'Invalid Ethereum address' }, { status: 400 });
    }
    const cacheKey = `base-score:${normalizedAddress.toLowerCase()}`;
    const cachedResult = await getCachedResult(cacheKey);
    if (cachedResult) {
      return NextResponse.json({ success: true, data: cachedResult, cached: true } satisfies AnalyzeResponse);
    }
    const apiKey = process.env.BASESCAN_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Server is missing BASESCAN_API_KEY' }, { status: 500 });
    }
    const txs = await fetchBaseTransactions(normalizedAddress, apiKey);
    const { metrics, monthlyData, activityBreakdown } = extractMetrics(txs);
    const result = calculateBaseActivityScore(metrics, monthlyData, activityBreakdown);
    await setCachedResult(cacheKey, result);
    return NextResponse.json({ success: true, data: result, cached: false } satisfies AnalyzeResponse);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to analyze wallet' }, { status: 500 });
  }
}