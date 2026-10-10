import React, { useState } from 'react';
import { Fund, UserHolding } from '../types/fund';
import {
  X,
  Wallet,
  Coins,
  ArrowUpRight,
  Check,
  Sparkles,
  PlusCircle,
  Share2,
  Download,
  Copy,
  Flame,
  Trophy,
  Zap
} from 'lucide-react';

interface WalletDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: { bnb: number; usdt: number };
  userHoldings: UserHolding[];
  funds: Fund[];
  onFaucet: () => void;
  onClaimDividends: (fundId: string) => void;
  onSelectFund: (fund: Fund) => void;
}

interface FlexTarget {
  fund: Fund;
  holding: UserHolding;
  pnlPct: number;
  unrealizedPnlUsd: number;
  holdingValueUsd: number;
}

export const WalletDrawer: React.FC<WalletDrawerProps> = ({
  isOpen,
  onClose,
  walletBalance,
  userHoldings,
  funds,
  onFaucet,
  onClaimDividends,
  onSelectFund
}) => {
  if (!isOpen) return null;

  const [claimToast, setClaimToast] = useState<string | null>(null);
  const [flexTarget, setFlexTarget] = useState<FlexTarget | null>(null);
  const [shareStatus, setShareStatus] = useState<'idle' | 'posting' | 'posted'>('idle');
  const [copiedTweet, setCopiedTweet] = useState<boolean>(false);

  const activeHoldings = userHoldings.filter((h) => h.shares > 0);

  const totalPortfolioValueUsd = activeHoldings.reduce((sum, h) => {
    const f = funds.find((item) => item.id === h.fundId);
    return sum + (f ? f.nav * h.shares : 0);
  }, 0);

  const handleClaim = (fundId: string, symbol: string, amount: number) => {
    onClaimDividends(fundId);
    setClaimToast(`成功领取 $${amount.toFixed(2)} USD 二级交易税分红！`);
    setTimeout(() => setClaimToast(null), 3000);
  };

  const handleOpenFlexModal = (
    fund: Fund,
    holding: UserHolding,
    pnlPct: number,
    unrealizedPnlUsd: number,
    holdingValueUsd: number
  ) => {
    setFlexTarget({ fund, holding, pnlPct, unrealizedPnlUsd, holdingValueUsd });
    setShareStatus('idle');
    setCopiedTweet(false);
  };

  const getTweetCopyText = (target: FlexTarget) => {
    const multiple = (target.fund.nav / target.holding.avgBuyNav).toFixed(2);
    return `Stop chasing frogs. Start buying the pond! 🐸🔥\n\n我在 @FourFund_BNB 申购的 $${target.fund.symbol} 基金浮盈已飙升至 +${target.pnlPct.toFixed(
      1
    )}% (${multiple}x)，净赚 +$${target.unrealizedPnlUsd.toFixed(
      2
    )} USD！⚡\n\n0区块毕业狙击 + 5x无爆仓杠杆，买基金一样百倍暴富 👇\nhttps://fourfund.meme/ref/0x718AB308 #FourMeme #BNBChain #MemeETF`;
  };

  const handleSimulateTwitterShare = () => {
    if (!flexTarget || shareStatus === 'posting') return;
    setShareStatus('posting');
    setTimeout(() => {
      setShareStatus('posted');
    }, 900);
  };

  const handleCopyTweetText = () => {
    if (!flexTarget) return;
    navigator.clipboard.writeText(getTweetCopyText(flexTarget));
    setCopiedTweet(true);
    setTimeout(() => setCopiedTweet(false), 2500);
  };

  const handleDownloadFlexCardPng = () => {
    if (!flexTarget) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 620;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 620);
    bgGrad.addColorStop(0, '#09090b');
    bgGrad.addColorStop(0.55, '#1c1917');
    bgGrad.addColorStop(1, '#3b0714');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 620);

    // Border
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 18, 1044, 584);

    // Brand Header
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 28px monospace';
    ctx.fillText('FOURFUND · OPENFOUR MEME ETF ON BNB CHAIN', 56, 78);

    ctx.fillStyle = '#a3a3a3';
    ctx.font = '20px sans-serif';
    ctx.fillText('Stop chasing frogs. Start buying the pond.', 56, 112);

    // Fund Symbol & Multiple
    const multiple = (flexTarget.fund.nav / flexTarget.holding.avgBuyNav).toFixed(2);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px monospace';
    ctx.fillText(`$${flexTarget.fund.symbol}  (${multiple}x RETURN)`, 56, 200);

    // Giant PnL Percentage
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 112px monospace';
    ctx.fillText(`+${flexTarget.pnlPct.toFixed(1)}%`, 56, 335);

    // Profit USD badge
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 38px monospace';
    ctx.fillText(`UNREALIZED PNL: +$${flexTarget.unrealizedPnlUsd.toFixed(2)} USD`, 56, 400);

    // Entry NAV vs Current NAV
    ctx.fillStyle = '#e5e5e5';
    ctx.font = '26px monospace';
    ctx.fillText(
      `Entry NAV: $${flexTarget.holding.avgBuyNav.toFixed(3)}   →   Current NAV: $${flexTarget.fund.nav.toFixed(
        3
      )}   |   Shares: ${flexTarget.holding.shares.toFixed(1)}`,
      56,
      475
    );

    // Footer Referral
    ctx.fillStyle = '#a3a3a3';
    ctx.font = '22px monospace';
    ctx.fillText('Verified On-Chain Position: 0x718A...B308  ·  Referral Code: FOUR-100X', 56, 555);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `FourFund_${flexTarget.fund.symbol}_Flex_${flexTarget.pnlPct.toFixed(0)}pct.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs no-print">
      <div className="w-full max-w-md h-full bg-neutral-900 border-l border-neutral-800 p-6 flex flex-col justify-between overflow-y-auto text-neutral-100 shadow-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-amber-400" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">Privy 嵌入式智能账户</h3>
                  <span className="text-[10px] font-mono text-emerald-400">ERC-4337 AA</span>
                </div>
                <div className="text-[11px] font-mono text-neutral-400">
                  0x718A...B308 · Passkey 免签已激活 · Pimlico $0 Gas
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* FOMO Abstraction Stack Status */}
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 rounded-lg bg-neutral-900/70 border border-neutral-800/80">
              <div className="text-neutral-500">法币入金 (Crossmint)</div>
              <div className="text-white font-semibold mt-0.5">Apple Pay / Visa 秒到</div>
            </div>
            <div className="p-2 rounded-lg bg-neutral-900/70 border border-neutral-800/80">
              <div className="text-neutral-500">全链路由 (Relay + Pimlico)</div>
              <div className="text-emerald-400 font-semibold mt-0.5">多链直付 · 矿工费 $0.00</div>
            </div>
          </div>

          {/* Balance overview */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="text-xs text-neutral-500">智能账户多链聚合余额</div>
            <div className="grid grid-cols-2 gap-3 font-mono">
              <div>
                <div className="text-lg font-bold text-white tabular-nums">
                  {walletBalance.bnb.toFixed(3)} BNB
                </div>
                <div className="text-[11px] text-neutral-400 tabular-nums">
                  ≈ ${(walletBalance.bnb * 620.5).toFixed(0)} USD
                </div>
              </div>

              <div>
                <div className="text-lg font-bold text-emerald-400 tabular-nums">
                  ${walletBalance.usdt.toFixed(0)} USDC/USDT
                </div>
                <div className="text-[11px] text-neutral-400 tabular-nums">Solana / Base / BNB 通用</div>
              </div>
            </div>

            <button
              onClick={onFaucet}
              className="w-full mt-2 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-600/40 rounded-lg transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Crossmint 模拟充值 (+5 BNB / +$1,000 USDC)</span>
            </button>
          </div>

          {/* ETF Holdings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-semibold uppercase">持有的 Meme ETF 份额</span>
              <span className="font-mono text-amber-400 font-bold tabular-nums">
                总资产: ${totalPortfolioValueUsd.toFixed(2)}
              </span>
            </div>

            {activeHoldings.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-neutral-800 rounded-xl text-neutral-500 text-xs">
                暂未持有任何基金份额，可前往基金超市一键申购。
              </div>
            ) : (
              <div className="space-y-3.5">
                {activeHoldings.map((h) => {
                  const fund = funds.find((f) => f.id === h.fundId);
                  if (!fund) return null;
                  const holdingValueUsd = h.shares * fund.nav;
                  const costBasisUsd = h.shares * h.avgBuyNav;
                  const unrealizedPnlUsd = holdingValueUsd - costBasisUsd;
                  const pnlPct = ((fund.nav - h.avgBuyNav) / h.avgBuyNav) * 100;
                  const isHighProfit = pnlPct > 50;
                  const isOver100Pct = pnlPct > 100;
                  const pnlBarWidth = Math.min(100, Math.max(6, Math.abs(pnlPct)));

                  return (
                    <div
                      key={h.fundId}
                      className={`relative p-3.5 rounded-xl bg-neutral-950 border space-y-2.5 transition-all ${
                        isHighProfit
                          ? 'pnl-golden-halo bg-gradient-to-br from-amber-950/30 via-neutral-950 to-amber-950/20'
                          : 'border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-sm text-white">
                              ${fund.symbol}
                            </span>
                            <span className="text-xs text-neutral-400 font-mono">
                              {h.shares.toFixed(2)} 份
                            </span>
                            {isHighProfit && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                                </span>
                                <span>{isOver100Pct ? '翻倍暴利 >100%' : '暴利 >50%'}</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-neutral-500 mt-0.5">
                            均价 ${h.avgBuyNav.toFixed(3)} → 现价 ${fund.nav.toFixed(3)}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono font-bold text-xs text-white tabular-nums">
                            ${holdingValueUsd.toFixed(2)}
                          </div>
                          <div
                            className={`text-[11px] font-mono font-bold tabular-nums ${
                              isHighProfit
                                ? 'text-amber-300'
                                : pnlPct >= 0
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {unrealizedPnlUsd >= 0 ? '+' : '-'}${Math.abs(unrealizedPnlUsd).toFixed(2)} ({pnlPct >= 0 ? '+' : ''}
                            {pnlPct.toFixed(1)}%)
                          </div>
                        </div>
                      </div>

                      {/* Real-time Calculated PnL Visual Bar */}
                      <div className="space-y-1 pt-0.5">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-neutral-400">
                            实时浮盈进度条 (Unrealized PnL)
                          </span>
                          <span
                            className={
                              isHighProfit
                                ? 'text-amber-300 font-bold'
                                : pnlPct >= 0
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }
                          >
                            {isHighProfit
                              ? `🔥 已突破 +50% 暴利线 (+${pnlPct.toFixed(1)}%)`
                              : `${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(1)}% / +50% 暴利线`}
                          </span>
                        </div>

                        <div
                          className={`relative w-full h-2 rounded-full bg-neutral-900 overflow-hidden border ${
                            isHighProfit ? 'border-amber-400/60' : 'border-neutral-800'
                          }`}
                        >
                          {/* 50% threshold marker */}
                          <div
                            className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-amber-400/50 z-10"
                            title="+50% 暴利光圈触发线"
                          />
                          <div
                            style={{ width: `${pnlBarWidth}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${
                              isHighProfit
                                ? 'bg-gradient-to-r from-emerald-400 via-amber-400 to-yellow-300 fomo-flowing-bg shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                                : pnlPct >= 0
                                ? 'bg-emerald-400'
                                : 'bg-rose-500'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Dividend claim line */}
                      {h.accumulatedDividends > 0 && (
                        <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-[11px]">
                          <span className="text-neutral-400 font-mono">
                            待领税费分红: ${h.accumulatedDividends.toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleClaim(h.fundId, fund.symbol, h.accumulatedDividends)}
                            className="px-2 py-0.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded font-mono transition-colors cursor-pointer"
                          >
                            一键领取
                          </button>
                        </div>
                      )}

                      {/* Action Footer: Details / Redeem + 'Flex' Button when PnL > 100% */}
                      <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            onClose();
                            onSelectFund(fund);
                          }}
                          className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                        >
                          前往基金详情 / 止盈赎回 →
                        </button>

                        {isOver100Pct && (
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenFlexModal(fund, h, pnlPct, unrealizedPnlUsd, holdingValueUsd)
                            }
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-300 to-rose-400 hover:from-amber-300 hover:to-rose-300 text-neutral-950 font-mono font-black text-xs shadow-[0_0_15px_rgba(251,191,36,0.5)] transition-all cursor-pointer"
                            title="生成高倍暴利战绩海报并分享至 X (Twitter)"
                          >
                            <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
                            <span>Flex 炫耀 (+{pnlPct.toFixed(0)}%)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {claimToast && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-800 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{claimToast}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-neutral-800 text-center text-xs text-neutral-500 font-mono">
          Powered by OpenFour Core Engine · BNB Chain
        </div>
      </div>

      {/* FLEX PNL SCREENSHOT PREVIEW & TWITTER SHARE MODAL */}
      {flexTarget && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setFlexTarget(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl bg-neutral-900 border border-amber-400/50 p-5 sm:p-6 shadow-[0_0_60px_rgba(251,191,36,0.25)] space-y-5 text-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm sm:text-base font-bold text-white font-mono">
                  Flex Your Moonbag · 高倍收益战绩炫耀卡
                </h4>
              </div>
              <button
                onClick={() => setFlexTarget(null)}
                className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Generated High-Multiplier Screenshot Preview Card */}
            <div className="p-[2px] rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-emerald-400 fomo-flowing-bg shadow-2xl">
              <div className="fomo-shimmer-card relative rounded-[14px] bg-gradient-to-br from-neutral-950 via-neutral-900 to-rose-950/60 p-5 sm:p-6 overflow-hidden space-y-4">
                {/* Ambient glow */}
                <div className="absolute -right-10 -top-10 w-44 h-44 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

                {/* Top Brand Bar */}
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span>FOURFUND · OPENFOUR ETF</span>
                  </div>
                  <span className="text-neutral-400">BNB CHAIN VERIFIED</span>
                </div>

                {/* Fund Title & Multiple Badge */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-black font-mono text-white tracking-tight">
                      ${flexTarget.fund.symbol}
                    </div>
                    <div className="text-xs text-neutral-400">{flexTarget.fund.name}</div>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-amber-400 text-neutral-950 font-mono font-black text-sm shadow-[0_0_15px_rgba(251,191,36,0.6)]">
                    {(flexTarget.fund.nav / flexTarget.holding.avgBuyNav).toFixed(2)}x 暴富倍数
                  </div>
                </div>

                {/* Centerpiece Giant PnL Readout */}
                <div className="py-3 border-y border-neutral-800/90 space-y-1">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                    Unrealized ROI · 持仓实盘浮盈率
                  </div>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tabular-nums drop-shadow-[0_0_18px_rgba(52,211,153,0.45)]">
                      +{flexTarget.pnlPct.toFixed(1)}%
                    </span>
                    <span className="text-lg sm:text-xl font-bold font-mono text-amber-300 tabular-nums">
                      (+${flexTarget.unrealizedPnlUsd.toFixed(2)} USD)
                    </span>
                  </div>
                </div>

                {/* Position Breakdown */}
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800">
                    <div className="text-[10px] text-neutral-500">建仓均价 (Entry)</div>
                    <div className="text-white font-bold mt-0.5">
                      ${flexTarget.holding.avgBuyNav.toFixed(3)}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800">
                    <div className="text-[10px] text-neutral-500">当前净值 (Now)</div>
                    <div className="text-emerald-400 font-bold mt-0.5">
                      ${flexTarget.fund.nav.toFixed(3)}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800">
                    <div className="text-[10px] text-neutral-500">持仓总市值</div>
                    <div className="text-amber-300 font-bold mt-0.5">
                      ${flexTarget.holdingValueUsd.toFixed(0)}
                    </div>
                  </div>
                </div>

                {/* Bottom Slogan & Referral Stamp */}
                <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-neutral-400">
                  <span>"Stop chasing frogs. Start buying the pond."</span>
                  <span className="text-amber-400 font-bold">Ref: FOUR-100X</span>
                </div>
              </div>
            </div>

            {/* Simulated Twitter / X Post Preview Box */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span>🐦 X (Twitter) 推文文案预览 (附带返佣邀请码)</span>
                <button
                  type="button"
                  onClick={handleCopyTweetText}
                  className="flex items-center gap-1 text-amber-400 hover:underline cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedTweet ? '已复制推文!' : '复制文案'}</span>
                </button>
              </div>
              <p className="text-xs text-neutral-300 font-mono whitespace-pre-line leading-relaxed">
                {getTweetCopyText(flexTarget)}
              </p>
            </div>

            {/* Interactive Twitter Share Feedback */}
            {shareStatus === 'posted' && (
              <div className="p-3.5 rounded-xl bg-sky-950/50 border border-sky-500/60 flex items-start gap-2.5 text-xs text-sky-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-white">
                    🎉 已成功模拟发布至 X (Twitter) 时间线！
                  </div>
                  <div className="text-[11px] text-sky-300 font-mono">
                    您的战绩海报已生成专属 FOMO 追踪链接，好友通过您的海报「一键丝滑买」申购该基金，您将自动获得 Trade 模块分流的 25% 交易税返佣！
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDownloadFlexCardPng}
                className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-neutral-700"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>下载高清收益海报 (.PNG)</span>
              </button>

              <button
                type="button"
                disabled={shareStatus === 'posting'}
                onClick={handleSimulateTwitterShare}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(14,165,233,0.4)]"
              >
                <Share2 className="w-4 h-4" />
                <span>
                  {shareStatus === 'posting'
                    ? '正在生成推文与战绩图...'
                    : shareStatus === 'posted'
                    ? '已分享至 X (Twitter) · 再次转发'
                    : '一键分享战绩到 X (Twitter)'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

