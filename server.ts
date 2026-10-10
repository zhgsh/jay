import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const VAULT_TREASURY_ADDRESS =
  process.env.VITE_VAULT_TREASURY_ADDRESS || '0x718A903284F92D32a840192b1234567890EfB308';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // 1. Real Live BNB Price + Payment Config Status Endpoint
  app.get('/api/payment/status', async (_req, res) => {
    let liveBnbPriceUsd = 620.5;
    try {
      const tickerRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT');
      if (tickerRes.ok) {
        const data = (await tickerRes.json()) as { price?: string };
        if (data.price) {
          liveBnbPriceUsd = parseFloat(data.price);
        }
      }
    } catch {
      // Fallback to 620.5 if Binance public endpoint is unreachable in region
    }

    res.json({
      vaultAddress: VAULT_TREASURY_ADDRESS,
      liveBnbPriceUsd,
      chains: {
        bscMainnet: {
          chainIdHex: '0x38',
          chainIdDec: 56,
          name: 'BNB Smart Chain Mainnet',
          rpcUrl: 'https://bsc-dataseed.binance.org/',
          explorerUrl: 'https://bscscan.com'
        },
        bscTestnet: {
          chainIdHex: '0x61',
          chainIdDec: 97,
          name: 'BNB Smart Chain Testnet',
          rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
          explorerUrl: 'https://testnet.bscscan.com'
        }
      },
      integrations: {
        evmWalletDirect: true,
        relayCrossChainQuote: true,
        w3cPaymentRequest: true,
        stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
        crossmintConfigured: Boolean(process.env.CROSSMINT_API_KEY),
        pimlicoConfigured: Boolean(process.env.PIMLICO_API_KEY)
      }
    });
  });

  // 2. Real Relay Protocol Cross-Chain Quote Proxy (Base / Arbitrum / Optimism -> BNB Chain)
  app.post('/api/payment/relay-quote', async (req, res) => {
    const {
      originChainId = 8453, // Base Mainnet default
      destinationChainId = 56, // BNB Chain Mainnet
      userAddress = VAULT_TREASURY_ADDRESS,
      recipientAddress = VAULT_TREASURY_ADDRESS,
      usdAmount = 50
    } = req.body;

    try {
      // Calculate wei amount based on approximate ETH price (~$2,650) for native currency quote
      const ethPriceUsd = 2650;
      const ethAmount = Math.max(0.0005, usdAmount / ethPriceUsd);
      const amountWei = BigInt(Math.floor(ethAmount * 1e18)).toString();

      const relayResponse = await fetch('https://api.relay.link/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: userAddress,
          originChainId: Number(originChainId),
          destinationChainId: Number(destinationChainId),
          originCurrency: '0x0000000000000000000000000000000000000000',
          destinationCurrency: '0x0000000000000000000000000000000000000000',
          recipient: recipientAddress,
          tradeType: 'EXACT_INPUT',
          amount: amountWei
        })
      });

      const quoteData = await relayResponse.json();
      if (!relayResponse.ok) {
        res.status(relayResponse.status).json({
          ok: false,
          error: quoteData?.message || 'Relay quote request failed',
          raw: quoteData
        });
        return;
      }

      res.json({
        ok: true,
        originChainId,
        destinationChainId,
        amountWei,
        quote: quoteData
      });
    } catch (err: any) {
      res.status(500).json({
        ok: false,
        error: err?.message || 'Unable to reach Relay Protocol API'
      });
    }
  });

  // 3. Real Stripe / Crossmint Fiat Checkout Session Creation (when secret keys are configured)
  app.post('/api/payment/create-fiat-session', async (req, res) => {
    const { fundSymbol, fundName, usdAmount, sharesEstimated, recipientAddress } = req.body;

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      try {
        const params = new URLSearchParams();
        params.append('mode', 'payment');
        params.append('success_url', `${process.env.APP_URL || 'http://localhost:3000'}?payment=success&fund=${fundSymbol}`);
        params.append('cancel_url', `${process.env.APP_URL || 'http://localhost:3000'}?payment=cancelled`);
        params.append('line_items[0][price_data][currency]', 'usd');
        params.append('line_items[0][price_data][product_data][name]', `FourFund $${fundSymbol} (${fundName})`);
        params.append(
          'line_items[0][price_data][product_data][description]',
          `Mint ~${Number(sharesEstimated).toFixed(2)} $${fundSymbol} shares to ${recipientAddress || VAULT_TREASURY_ADDRESS}`
        );
        params.append('line_items[0][price_data][unit_amount]', Math.round(Number(usdAmount) * 100).toString());
        params.append('line_items[0][quantity]', '1');

        const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${stripeKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });

        const session = (await stripeRes.json()) as { url?: string; id?: string; error?: { message?: string } };
        if (stripeRes.ok && session.url) {
          res.json({
            ok: true,
            provider: 'stripe',
            checkoutUrl: session.url,
            sessionId: session.id
          });
          return;
        }
        res.status(400).json({
          ok: false,
          error: session.error?.message || 'Failed to create Stripe Checkout session'
        });
        return;
      } catch (e: any) {
        res.status(500).json({ ok: false, error: e?.message || 'Stripe API request error' });
        return;
      }
    }

    res.json({
      ok: false,
      useW3CPaymentRequest: true,
      message: 'Use browser native W3C PaymentRequest API (Apple Pay / Google Pay / Card) or direct Web3 wallet transfer'
    });
  });

  // 4. Real-Time DNS-over-HTTPS (DoH) Checker for Custom Domain (default: ai42.top)
  app.get('/api/domain/check', async (req, res) => {
    const rawDomain = String(req.query.domain || 'ai42.top')
      .trim()
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '');

    const queryDnsType = async (type: 'A' | 'CNAME' | 'NS') => {
      try {
        const dohUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(rawDomain)}&type=${type}`;
        const dohRes = await fetch(dohUrl, {
          headers: { Accept: 'application/dns-json' }
        });
        if (!dohRes.ok) return [];
        const data = (await dohRes.json()) as {
          Status?: number;
          Answer?: Array<{ name: string; type: number; TTL: number; data: string }>;
        };
        return data.Answer || [];
      } catch {
        return [];
      }
    };

    try {
      const [aRecords, cnameRecords, nsRecords] = await Promise.all([
        queryDnsType('A'),
        queryDnsType('CNAME'),
        queryDnsType('NS')
      ]);

      const usesCloudflareNs = nsRecords.some((r) => r.data.toLowerCase().includes('cloudflare.com'));
      const hasVercelRecord =
        aRecords.some((r) => r.data === '76.76.21.21') ||
        cnameRecords.some((r) => r.data.toLowerCase().includes('vercel-dns.com'));
      const hasPagesRecord = cnameRecords.some((r) => r.data.toLowerCase().includes('pages.dev'));
      const hasCloudRunRecord = cnameRecords.some((r) =>
        r.data.toLowerCase().includes('ghs.googlehosted.com')
      );

      res.json({
        ok: true,
        domain: rawDomain,
        checkedAt: new Date().toISOString(),
        targetOrigin: 'https://ais-pre-bruriaivcepnlmxymkb2n4-585964218279.asia-east1.run.app',
        records: {
          A: aRecords,
          CNAME: cnameRecords,
          NS: nsRecords
        },
        diagnostics: {
          isResolving: aRecords.length > 0 || cnameRecords.length > 0,
          usesCloudflareNs,
          hasVercelRecord,
          hasPagesRecord,
          hasCloudRunRecord
        }
      });
    } catch (err: any) {
      res.status(500).json({
        ok: false,
        domain: rawDomain,
        error: err?.message || 'DNS query failed'
      });
    }
  });

  // Vite middleware for development; static dist serving when dist/index.html exists in production
  const distPath = path.join(process.cwd(), 'dist');
  const hasBuiltDist = fs.existsSync(path.join(distPath, 'index.html'));

  if (process.env.NODE_ENV !== 'production' || !hasBuiltDist) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FourFund Full-Stack Payment & OpenFour Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
