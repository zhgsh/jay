import React, { useState, useEffect } from 'react';
import { ArrowRight, Download, Sliders, ShieldCheck, Zap, Layers, Flame, TrendingUp, Trophy, Radio, Plus, Globe } from 'lucide-react';
import { downloadMarkdownFile } from '../data/whitepaperData';
import { Fund } from '../types/fund';

interface HeroProps {
  funds: Fund[];
  onSelectFund: (fund: Fund) => void;
  onExplore: () => void;
  onOpenSimulator: () => void;
  onOpenWhitepaper: () => void;
  onOpenDomainDeploy?: () => void;
}

interface WhaleAlertItem {
  id: string;
  wallet: string;
  bnbAmount: number;
  usdValue: number;
  fundId: string;
  fundSymbol: string;
  isTurbo: boolean;
  timestampLabel: string;
}

const INITIAL_WHALE_ALERTS: WhaleAlertItem[] = [
  {
    id: 'whale-1',
    wallet: '0x8F2...91B',
    bnbAmount: 500,
    usdValue: 310000,
    fundId: 'fund-moon-100x',
    fundSymbol: 'MOON-100X',
    isTurbo: true,
    timestampLabel: '2s ago'
  },
  {
    id: 'whale-2',
    wallet: '0x4E9...C04',
    bnbAmount: 850,
    usdValue: 527000,
    fundId: 'fund-ai-punk',
    fundSymbol: 'AI-PUNK',
    isTurbo: true,
    timestampLabel: '9s ago'
  },
  {
    id: 'whale-3',
    wallet: '0x31A...77D',
    bnbAmount: 320,
    usdValue: 198400,
    fundId: 'fund-meme-10',
    fundSymbol: 'MEME-10',
    isTurbo: false,
    timestampLabel: '18s ago'
  },
  {
    id: 'whale-4',
    wallet: '0x9C1...E82',
    bnbAmount: 1200,
    usdValue: 744000,
    fundId: 'fund-moon-100x',
    fundSymbol: 'MOON-100X',
    isTurbo: true,
    timestampLabel: '27s ago'
  },
  {
    id: 'whale-5',
    wallet: '0x7B5...19F',
    bnbAmount: 420,
    usdValue: 260400,
    fundId: 'fund-kol-alpha',
    fundSymbol: 'KOL-ALPHA',
    isTurbo: true,
    timestampLabel: '41s ago'
  },
  {
    id: 'whale-6',
    wallet: '0x1D8...4A3',
    bnbAmount: 680,
    usdValue: 421600,
    fundId: 'fund-bnb-meme',
    fundSymbol: 'BNB-MEME',
    isTurbo: false,
    timestampLabel: '54s ago'
  }
];

const WHALE_WALLETS = [
  '0x9A4...E72',
  '0x6D1...88A',
  '0xF3B...21C',
  '0x2E7...509',
  '0xC80...14E',
  '0x5B2...99F'
];

export const Hero: React.FC<HeroProps> = ({
  funds,
  onSelectFund,
  onExplore,
  onOpenSimulator,
  onOpenWhitepaper,
  onOpenDomainDeploy
}) => {
  const [whaleAlerts, setWhaleAlerts] = useState<WhaleAlertItem[]>(INITIAL_WHALE_ALERTS);
  const [latestFlashId, setLatestFlashId] = useState<string | null>(null);
  const [buyDanmakus, setBuyDanmakus] = useState<
    Array<{
      id: string;
      buyerTag: string;
      bnbAmount: number;
      usdAmount: number;
      fundId: string;
      fundSymbol: string;
      channelLabel: string;
      isTurbo: boolean;
      leftPercent: number;
    }>
  >([]);

  // Spawn a floating mini buy notification ("买入弹幕")
  const spawnBuyDanmaku = () => {
    if (funds.length === 0) return;
    const targetFund = funds[Math.floor(Math.random() * funds.length)];
    const bnbAmounts = [1.5, 3.2, 5.0, 8.8, 12.5, 25.0, 50.0, 88.0, 150.0];
    const bnbAmount = bnbAmounts[Math.floor(Math.random() * bnbAmounts.length)];
    const usdAmount = Math.round(bnbAmount * 620);
    const channels = ['⚡ 一键闪买', '🍎 Apple Pay', '🌉 Relay 跨链', '🦊 BNB 直付', '🔥 X3 抢筹'];
    const channelLabel = channels[Math.floor(Math.random() * channels.length)];
    const walletSuffix = WHALE_WALLETS[Math.floor(Math.random() * WHALE_WALLETS.length)];
    const leftPositions = [26, 38, 50, 62, 72];
    const leftPercent = leftPositions[Math.floor(Math.random() * leftPositions.length)];
    const id = `danmaku-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const newItem = {
      id,
      buyerTag: walletSuffix,
      bnbAmount,
      usdAmount,
      fundId: targetFund.id,
      fundSymbol: targetFund.symbol,
      channelLabel,
      isTurbo: targetFund.change24h > 50,
      leftPercent
    };

    setBuyDanmakus((prev) => [...prev.slice(-2), newItem]);

    // Auto-clean after 4.4s animation completes
    setTimeout(() => {
      setBuyDanmakus((prev) => prev.filter((item) => item.id !== id));
    }, 4400);
  };

  // Trigger a new simulated whale buy order
  const triggerSimulatedWhaleBuy = () => {
    if (funds.length === 0) return;
    // Favor high-momentum funds like fund-moon-100x
    const priorityPool = funds.filter((f) => f.change24h > 50);
    const pool = priorityPool.length > 0 ? priorityPool : funds;
    const targetFund = pool[Math.floor(Math.random() * pool.length)];
    const bnbChoices = [350, 500, 650, 800, 950, 1250, 1500];
    const bnbAmount = bnbChoices[Math.floor(Math.random() * bnbChoices.length)];
    const wallet = WHALE_WALLETS[Math.floor(Math.random() * WHALE_WALLETS.length)];
    const newId = `whale-${Date.now()}`;

    const newAlert: WhaleAlertItem = {
      id: newId,
      wallet,
      bnbAmount,
      usdValue: bnbAmount * 620,
      fundId: targetFund.id,
      fundSymbol: targetFund.symbol,
      isTurbo: targetFund.change24h > 50,
      timestampLabel: 'Just now'
    };

    setWhaleAlerts((prev) => [newAlert, ...prev.slice(0, 7)]);
    setLatestFlashId(newId);
    spawnBuyDanmaku();
  };

  // Periodically stream fresh simulated whale buy orders every 12 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      triggerSimulatedWhaleBuy();
    }, 12000);
    return () => clearInterval(timer);
  }, [funds]);

  // Spawn a floating "买入弹幕" notification every 5 seconds
  useEffect(() => {
    const initialKickoff = setTimeout(() => {
      spawnBuyDanmaku();
    }, 600);
    const danmakuInterval = setInterval(() => {
      spawnBuyDanmaku();
    }, 5000);
    return () => {
      clearTimeout(initialKickoff);
      clearInterval(danmakuInterval);
    };
  }, [funds]);

  useEffect(() => {
    if (!latestFlashId) return;
    const timeout = setTimeout(() => setLatestFlashId(null), 2200);
    return () => clearTimeout(timeout);
  }, [latestFlashId]);

  // Sort funds by 24h percentage gain descending to find the #1 Top Gainer and >100% Multiplier Leaderboard
  const sortedByGain = [...funds].sort((a, b) => b.change24h - a.change24h);
  const topGainer = sortedByGain[0];
  const runnerUpGainers = sortedByGain.slice(1, 4);

  // Filter funds with >100% gain in the past 24 hours for the "暴富倍数排行榜"
  const over100PctFunds = sortedByGain.filter((f) => f.change24h > 100);

  const totalWhaleBnb = whaleAlerts.reduce((sum, item) => sum + item.bnbAmount, 0);

  const handleWhaleAlertClick = (fundId: string) => {
    const matched = funds.find((f) => f.id === fundId) || funds[0];
    if (matched) {
      onSelectFund(matched);
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-neutral-800 bg-gradient-to-b from-neutral-900/60 via-neutral-950 to-neutral-950 pt-6 pb-10 sm:pt-8 sm:pb-14 no-print">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-radial from-amber-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative space-y-8">
        {/* LIVE WHALE ALERT HORIZONTAL TICKER + FLOATING BUY DANMAKU */}
        <div
          aria-label="Live Whale Alert Ticker"
          className="relative rounded-xl border border-amber-500/30 bg-neutral-950/95 shadow-[0_0_25px_rgba(245,158,11,0.1)]"
        >
          {/* Real-Time Floating Buy Danmaku ("买入弹幕") Popups — Every 5 Seconds */}
          <div
            aria-live="polite"
            className="pointer-events-none absolute inset-x-0 -top-3.5 bottom-0 z-20 overflow-visible"
          >
            {buyDanmakus.map((danmaku) => (
              <button
                key={danmaku.id}
                type="button"
                onClick={() => handleWhaleAlertClick(danmaku.fundId)}
                style={{ left: `${danmaku.leftPercent}%` }}
                className="buy-danmaku-float pointer-events-auto absolute -top-2 sm:-top-2.5 -translate-x-1/2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-950/95 border border-emerald-400/70 shadow-[0_0_18px_rgba(16,185,129,0.45)] text-[11px] font-mono text-white cursor-pointer whitespace-nowrap"
              >
                <span className="text-emerald-400 font-bold">{danmaku.channelLabel}</span>
                <span className="text-neutral-300">{danmaku.buyerTag}</span>
                <span className="text-emerald-300 font-extrabold tabular-nums">
                  +{danmaku.bnbAmount} BNB
                </span>
                <span className="text-neutral-400 tabular-nums">
                  (${danmaku.usdAmount.toLocaleString()})
                </span>
                <span className="text-amber-300 font-bold">→ ${danmaku.fundSymbol}</span>
                {danmaku.isTurbo && <span className="text-rose-400 font-black">X3</span>}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center rounded-xl overflow-hidden">
            {/* Left Fixed Badge & Total Whale Inflow */}
            <div className="flex items-center justify-between sm:justify-start gap-2.5 px-3.5 py-2 bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-neutral-900 border-b sm:border-b-0 sm:border-r border-neutral-800 shrink-0 z-10">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span className="text-xs font-mono font-bold text-amber-400 whitespace-nowrap">
                  LIVE WHALE ALERT
                </span>
                <span className="text-[11px] font-mono text-emerald-400 tabular-nums hidden md:inline whitespace-nowrap">
                  · {totalWhaleBnb.toLocaleString()} BNB Inflow
                </span>
              </div>

              <button
                type="button"
                onClick={triggerSimulatedWhaleBuy}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-[11px] font-mono font-semibold text-amber-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="Trigger a simulated large whale buy order & buy danmaku"
              >
                <Plus className="w-3 h-3" />
                <span>Simulate Whale</span>
              </button>
            </div>

            {/* Horizontally Scrolling Whale Stream */}
            <div className="relative flex-1 overflow-hidden py-2">
              {/* Left & Right Edge Fade Scrims */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-neutral-950 to-transparent z-10" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-neutral-950 to-transparent z-10" />

              <div className="whale-ticker-track items-center gap-4 px-3">
                {[...whaleAlerts, ...whaleAlerts].map((alert, idx) => {
                  const isFresh = alert.id === latestFlashId;
                  return (
                    <button
                      key={`${alert.id}-${idx}`}
                      type="button"
                      onClick={() => handleWhaleAlertClick(alert.fundId)}
                      className={`group inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-mono transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                        isFresh
                          ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                          : 'bg-neutral-900/90 hover:bg-neutral-800/90 border-neutral-800 hover:border-amber-500/50 text-neutral-200'
                      }`}
                    >
                      <span className="text-amber-400 font-bold">🐋 Whale ({alert.wallet})</span>
                      <span className="text-neutral-300">
                        just bought{' '}
                        <strong className="text-emerald-400 font-extrabold tabular-nums">
                          {alert.bnbAmount.toLocaleString()} BNB
                        </strong>{' '}
                        <span className="text-neutral-400 tabular-nums">
                          (${(alert.usdValue / 1000).toFixed(0)}k)
                        </span>{' '}
                        of{' '}
                        <strong className="text-white group-hover:text-amber-300 underline decoration-neutral-700 group-hover:decoration-amber-400 underline-offset-2">
                          {alert.fundId}
                        </strong>!
                      </span>
                      <span className="text-amber-300 font-bold">(${alert.fundSymbol})</span>
                      {alert.isTurbo && (
                        <span className="text-rose-400 font-extrabold">
                          ⚡X3
                        </span>
                      )}
                      <span className="text-neutral-500 text-[11px] tabular-nums">
                        · {alert.timestampLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            {/* Clean unboxed metadata kicker */}
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span className="text-amber-400 font-semibold">FourFund v1.0</span>
              <span aria-hidden="true">·</span>
              <span>Base: OpenFour Modular Engine</span>
              <span aria-hidden="true">·</span>
              <span>Chain: BNB Chain</span>
            </div>

            {/* Slogan & Title */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight text-balance">
                Stop chasing frogs.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400">
                  Start buying the pond.
                </span>
              </h1>
              <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-2xl">
                90% 的 Meme 归零，但头部 Meme 仍有巨大财富效应。FourFund 基于 Four.Meme 的{' '}
                <strong className="text-neutral-200 font-medium">OpenFour 模块化引擎</strong>，将一篮子资产装入智能金库，把「单币炒作」升维为「链上 Meme ETF 组合管理」。
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExplore}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-sm shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                <span>逛基金超市</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenSimulator}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>NAV 预言机测算</span>
              </button>

              <button
                onClick={() => downloadMarkdownFile()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>下载白皮书 (.md)</span>
              </button>

              {onOpenDomainDeploy && (
                <button
                  onClick={onOpenDomainDeploy}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>绑定 ai42.top (免服务器)</span>
                </button>
              )}
            </div>

            {/* Claim-to-Proof Adjacent Quantitative Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-neutral-800/80">
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-white tabular-nums">
                  $69.7M
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">协议总锁仓 (AUM)</div>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                  +{topGainer ? topGainer.change24h.toFixed(1) : '184.5'}%
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">最高 24H 狂暴涨幅</div>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400 tabular-nums">
                  3/5 多签
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">金库隔离风控保障</div>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-neutral-300 tabular-nums">
                  6 模块
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">OpenFour 架构解耦</div>
              </div>
            </div>
          </div>

          {/* Right: Architectural Hero Visual */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/50 shadow-2xl">
              <img
                src="/src/assets/images/fourfund_hero_vault_1790590789630.jpg"
                alt="FourFund OpenFour On-Chain Basket Architecture"
                referrerPolicy="no-referrer"
                className="w-full h-64 sm:h-72 object-cover opacity-90 hover:opacity-100 transition-opacity"
                onError={(e) => {
                  // Fallback container if image cannot be rendered
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent flex flex-col justify-end p-5">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Basket-Backed Token (BBT) 模型</span>
                </div>
                <p className="text-xs text-neutral-300 leading-snug">
                  NAV = Σ (amount_i × price_i) / totalSupply($FUND) · 申购注入资产篮，赎回按权销毁
                </p>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    单币上限 ≤ 15%
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    T+1 赎回队列熔断
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 暴富倍数排行榜 (24H > 100% WEALTH MULTIPLIER LEADERBOARD) with Flowing CSS Animation */}
        {over100PctFunds.length > 0 && (
          <div className="p-[1.5px] rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-400 fomo-flowing-bg shadow-[0_0_40px_rgba(244,63,94,0.22)]">
            <div className="rounded-[15px] bg-neutral-950/95 backdrop-blur-md overflow-hidden">
              {/* Top Flowing FOMO Marquee Stream */}
              <div className="border-b border-neutral-800/90 bg-neutral-900/80 py-2 px-3 overflow-hidden flex items-center">
                <div className="fomo-marquee-track items-center gap-8 text-[11px] font-mono">
                  {[...over100PctFunds, ...over100PctFunds, ...over100PctFunds].map((fund, i) => {
                    const baseMultiple = 1 + fund.change24h / 100;
                    const turboMultiple = 1 + (fund.change24h * 3) / 100;
                    return (
                      <div key={`${fund.id}-${i}`} className="flex items-center gap-2 shrink-0">
                        <span className="text-rose-400 font-bold">🔥 24H 破百倍潜力池</span>
                        <span className="text-white font-bold">${fund.symbol}</span>
                        <span className="text-emerald-400 font-bold">
                          +{fund.change24h.toFixed(1)}% ({baseMultiple.toFixed(2)}x)
                        </span>
                        <span className="text-amber-300">
                          [开启 X3 Turbo 达 {turboMultiple.toFixed(2)}x 暴富倍数]
                        </span>
                        <span className="text-neutral-600">·</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Leaderboard Header & Cards */}
              <div className="p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/20 border border-rose-500/50 text-rose-400 text-xs font-mono font-black uppercase tracking-wider">
                      <Flame className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                      <span>暴富倍数排行榜 · 24H 涨幅 &gt; 100%</span>
                    </span>
                    <span className="text-xs text-neutral-300 font-medium">
                      过去 24 小时净值翻倍基金实盘榜单（全部已解锁 <strong className="text-amber-400 font-mono">X3 Turbo</strong> 狂暴乘数）
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-amber-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 fill-amber-400" />
                    <span>点击榜单卡片即可 0 Gas 一键抢筹</span>
                  </div>
                </div>

                {/* Leaderboard Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {over100PctFunds.map((fund, idx) => {
                    const baseMultiple = 1 + fund.change24h / 100;
                    const turboMultiple = 1 + (fund.change24h * 3) / 100;
                    const historicalMultiple = fund.nav / fund.initialNav;
                    const topToken = [...fund.basket].sort((a, b) => b.change24h - a.change24h)[0];

                    return (
                      <div
                        key={fund.id}
                        onClick={() => onSelectFund(fund)}
                        className="fomo-shimmer-card group relative rounded-xl p-4 bg-gradient-to-br from-neutral-900 via-neutral-950 to-rose-950/25 border border-neutral-800 hover:border-amber-400/70 transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-md"
                      >
                        <div className="space-y-2.5">
                          {/* Rank & Multiples */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-mono font-black text-xs ${
                                  idx === 0
                                    ? 'bg-amber-400 text-neutral-950 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                                    : idx === 1
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-emerald-500 text-neutral-950'
                                }`}
                              >
                                #{idx + 1}
                              </span>
                              <div>
                                <div className="text-sm font-black font-mono text-white group-hover:text-amber-400 transition-colors">
                                  ${fund.symbol}
                                </div>
                                <div className="text-[11px] text-neutral-400 truncate max-w-[150px]">
                                  {fund.name}
                                </div>
                              </div>
                            </div>

                            {/* Wealth Multiple Highlight */}
                            <div className="text-right font-mono">
                              <div className="text-lg font-black text-amber-400 tabular-nums leading-none">
                                {baseMultiple.toFixed(2)}x{' '}
                                <span className="text-xs text-rose-400 font-extrabold">
                                  (X3→{turboMultiple.toFixed(1)}x)
                                </span>
                              </div>
                              <div className="text-[10px] text-emerald-400 font-bold mt-1">
                                24H +{fund.change24h.toFixed(1)}%
                              </div>
                            </div>
                          </div>

                          {/* Flowing Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                              <span>创设至今累计倍数: <strong className="text-white">{historicalMultiple.toFixed(2)}x</strong></span>
                              <span className="text-emerald-400">
                                领涨: ${topToken.symbol} +{topToken.change24h.toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-neutral-900 overflow-hidden">
                              <div
                                style={{ width: `${Math.min(100, (fund.change24h / 180) * 100)}%` }}
                                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-emerald-400 fomo-flowing-bg"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Bottom Quick FOMO Action */}
                        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono">
                          <span className="text-neutral-400">
                            NAV: <strong className="text-white">${fund.nav.toFixed(3)}</strong>
                          </span>
                          <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform font-bold flex items-center gap-1">
                            <span>⚡ 一键跟单抢筹</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOP GAINERS SECTION — Emphasizes Meme-like Volatility & FOMO Potential */}
        {topGainer && (
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-rose-950/35 via-neutral-900/90 to-amber-950/30 p-4 sm:p-5 shadow-[0_0_35px_rgba(245,158,11,0.1)]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              {/* Left: #1 Crown Top Gainer Spotlight */}
              <div className="flex-1 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="inline-flex items-center gap-1 text-rose-400 font-bold uppercase tracking-wider">
                    <Flame className="w-4 h-4 text-rose-400 animate-bounce" />
                    <span>Top Gainers · 24H 狂暴涨幅榜首 (FOMO Alert)</span>
                  </span>
                  <span aria-hidden="true" className="text-neutral-600">·</span>
                  <span className="text-amber-400 font-semibold">
                    {topGainer.change24h > 50 ? '⚡ X3 Turbo Mode 已解锁' : '实时链上净值'}
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                    <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                      ${topGainer.symbol}
                    </span>
                    <span className="text-xs sm:text-sm text-neutral-300 font-medium">
                      {topGainer.name}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 font-mono">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums drop-shadow-[0_0_12px_rgba(52,211,153,0.35)]">
                      +{topGainer.change24h.toFixed(1)}%
                    </span>
                    <span className="text-xs text-neutral-400 uppercase">24H Gain</span>
                    <span className="text-xs text-amber-300 font-semibold ml-1">
                      (30D +{topGainer.change30d.toFixed(1)}% · NAV ${topGainer.nav.toFixed(3)})
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl">
                  {topGainer.investmentGoal} — 底层热币领涨：
                  {topGainer.basket
                    .slice()
                    .sort((a, b) => b.change24h - a.change24h)
                    .slice(0, 3)
                    .map((asset, idx) => (
                      <span key={asset.symbol} className="font-mono text-emerald-400 ml-1.5">
                        ${asset.symbol} (+{asset.change24h.toFixed(0)}%)
                        {idx < 2 ? ' ·' : ''}
                      </span>
                    ))}
                </p>
              </div>

              {/* Right: Runner-Up Gainers + Instant FOMO CTA */}
              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <div className="grid grid-cols-3 gap-2">
                  {runnerUpGainers.map((gainer, idx) => (
                    <button
                      key={gainer.id}
                      onClick={() => onSelectFund(gainer)}
                      className="px-3 py-2 rounded-xl bg-neutral-950/80 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500">
                        <span>#{idx + 2} GAINER</span>
                        <TrendingUp className="w-3 h-3 text-emerald-400 opacity-75 group-hover:opacity-100" />
                      </div>
                      <div className="text-xs font-bold font-mono text-white truncate mt-0.5">
                        ${gainer.symbol}
                      </div>
                      <div className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                        +{gainer.change24h.toFixed(1)}%
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => onSelectFund(topGainer)}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-neutral-950 font-mono font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(244,63,94,0.4)] transition-all cursor-pointer whitespace-nowrap"
                >
                  <Zap className="w-4 h-4 fill-neutral-950" />
                  <span>抢筹榜首 ${topGainer.symbol} (开启 X3 Turbo)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

