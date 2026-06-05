# Base Activity Score

A clean, transparent, open-source wallet activity analyzer for the **Base** blockchain.

Get your personalized **0–100 on-chain activity score** + clear tier (New → True Base native).

## Features

- Paste any EVM address (no wallet connection required)
- Rich on-chain signals: Bridge, Swaps, Liquidity Providing, Lending, Borrow, NFT, Staking
- Beautiful shareable image with meme energy ("STAY BASED")
- Real monthly activity chart
- Transparent scoring formula (v2 with recency bonus)
- Production-ready caching (Vercel KV ready)

## One-Click Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FProxtox%2Fbase-activity-score)

**Just click the button above** → Connect GitHub → Add your `BASESCAN_API_KEY` as an environment variable.

Your tool will be live in under 2 minutes.

### After Deploy

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add:
   - `BASESCAN_API_KEY` = your free key from [basescan.org/apis](https://basescan.org/apis)
3. Redeploy once

## Local Development

```bash
npm install
npm run dev
```

Create `.env.local`:

```env
BASESCAN_API_KEY=your_key_here
```

## How the Scoring Works

Transparent formula (easy to tweak in `lib/calculateScore.ts`):

- **Transaction Score** → `log10(totalTxs + 1) * 21`
- **Consistency Score** → `activeDays * 1.65`
- **Diversity Score** → `uniqueContracts / 3.2`
- **Recency & Longevity Bonus** → up to +8 pts

Final score clamped to 1–100.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript + Tailwind
- Recharts + html2canvas
- viem
- BaseScan API

## How to Expand Detection

Edit `lib/basescan.ts` → `KNOWN_CONTRACTS` map and add more contract addresses.

## License

MIT

---

**Stay Based. Build on Base.** 🔷