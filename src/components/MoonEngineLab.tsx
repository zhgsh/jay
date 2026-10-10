import React, { useState } from 'react';
import { Flame, Zap, TrendingUp, Crosshair, Trophy, Layers, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { Fund } from '../types/fund';

interface MoonEngineLabProps {
  onOpenMoonFund: () => void;
  onNavigateBuilder: () => void;
}

export const MoonEngineLab: React.FC<MoonEngineLabProps> = ({
  onOpenMoonFund,
  onNavigateBuilder
}) => {
  // Interactive simulation parameters
  const [investBnb, setInvestBnb] = useState<number>(2.0); // 2 BNB (~$1,241)
  const [goldenDogMultiplier, setGoldenDogMultiplier] = useState<number>(50); // One coin in the 5-coin basket does 50x
  const [trancheLeverage, setTrancheLeverage] = useState<number>(5); // 1x (No tranche), 3x, 5x (Turbo-B)
  const [enableSniperBlock0, setEnableSniperBlock0] = useState<boolean>(true); // 0-block graduation entry gives 2.5x cheaper cost basis
  const [enableMomentumRoll, setEnableMomentumRoll] = useState<boolean>(true); // Cut losers & double down on winner (1.8x boost vs equal-weight)
  const [fomoPremiumMultiplier, setFomoPremiumMultiplier] = useState<number>(2.0); // Curve module: 1.0x to 5.0x NAV FOMO multiplier
  const [enableDiamondJackpot, setEnableDiamondJackpot] = useState<boolean>(true); // Paper hand tax pool bonus

  const bnbPrice = 620.5;
  const principalUsd = investBnb * bnbPrice;

  // 1. Traditional Equal-Weight ETF Calculation:
  // Suppose 5 coins in basket (20% each). 1 coin does `goldenDogMultiplier` (e.g. 50x), 4 coins drop -60% (0.4x).
  // Even worse, traditional weekly rebalancing sells the winner early, capturing only ~55% of the outlier move.
  const traditionalWinnerContribution = 0.20 * (goldenDogMultiplier * 0.55);
  const traditionalLosersContribution = 0.80 * 0.40;
  const traditionalTotalMultiplier = Math.max(1.0, traditionalWinnerContribution + traditionalLosersContribution);
  const traditionalFinalUsd = principalUsd * traditionalTotalMultiplier;
  const traditionalFinalBnb = investBnb * traditionalTotalMultiplier;

  // 2. FourFund Moon Engine Calculation:
  // Base basket return when cutting losers at -30% and reallocating into the winning golden dog
  const rawBasketWinnerWeight = enableMomentumRoll ? 0.55 : 0.20; // Momentum roll concentrates weight into the runner
  const rawLoserRemains = enableMomentumRoll ? 0.45 * 0.70 : 0.80 * 0.40;
  const sniperCostBasisBoost = enableSniperBlock0 ? 2.4 : 1.0; // Block-0 sniper catches graduation at $45K MC instead of $110K+
  
  const coreNavMultiplier = (rawBasketWinnerWeight * goldenDogMultiplier * sniperCostBasisBoost) + rawLoserRemains;
  
  // Apply Senior-A / Turbo-B Tranche Soft Leverage (deducting 18% APR cost for Senior A)
  const leveragedNavMultiplier = Math.max(1.0, (coreNavMultiplier - 1) * trancheLeverage * 0.92 + 1);
  
  // Apply Curve Module Secondary Market FOMO Premium + Early-bird 0.5x entry
  const totalMoonMultiplier = leveragedNavMultiplier * fomoPremiumMultiplier * (enableDiamondJackpot ? 1.18 : 1.0);
  const moonFinalUsd = principalUsd * totalMoonMultiplier;
  const moonFinalBnb = investBnb * totalMoonMultiplier;

  const outperformanceRatio = totalMoonMultiplier / traditionalTotalMultiplier;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10 no-print">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-neutral-800 pb-8">
        <div>
          <div className="text-xs font-mono text-amber-400 mb-2 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>ASYMMETRICAL WEALTH ENGINE · 破局传统 ETF 收益平庸化</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            如何让「申购基金」的人，也能像买 Meme 一样一夜暴富？
          </h1>
          <p className="text-neutral-400 text-sm mt-2 max-w-3xl leading-relaxed">
            传统 ETF 的致命伤是<strong className="text-neutral-200">「收益被平摊 + 强制卖飞百倍龙头补仓归零币」</strong>。
            依托 OpenFour 六大模块，我们设计了<strong className="text-amber-400">「五维非对称暴富机制」</strong>，在过滤 90% 单币归零风险的同时，将单币百倍涨幅浓缩放大至基金份额。
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenMoonFund}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg"
          >
            <Zap className="w-4 h-4" />
            <span>立即申购 $MOON-100X 示范基金</span>
          </button>
          <button
            onClick={onNavigateBuilder}
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            去工坊配置暴富基金
          </button>
        </div>
      </div>

      {/* Interactive Comparison Simulator: Traditional ETF vs Moon Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Controls (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white">百倍收益放大器 —— 实时沙盘推演</h2>
              <p className="text-xs text-neutral-400 mt-0.5">调节下方 5 大机制开关，对比「传统等权 ETF」与「FourFund 暴富基金」的真实到手收益</p>
            </div>
            <span className="text-xs font-mono text-amber-400">OpenFour v1.0</span>
          </div>

          {/* Slider 1: Principal & Single Golden Dog Multiplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-neutral-400">您的申购本金 (BNB)</span>
                <span className="font-mono font-bold text-white">{investBnb.toFixed(1)} BNB (${principalUsd.toFixed(0)})</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="20"
                step="0.5"
                value={investBnb}
                onChange={(e) => setInvestBnb(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-neutral-400">篮子中跑出 1 只金狗涨幅</span>
                <span className="font-mono font-bold text-emerald-400">{goldenDogMultiplier}x 倍</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={goldenDogMultiplier}
                onChange={(e) => setGoldenDogMultiplier(parseInt(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>
          </div>

          {/* 5 Core Lever Switches */}
          <div className="space-y-3">
            {/* Mechanism 1: Tranche Leverage */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-amber-400 font-bold">机制 01 · Token + Vault</span>
                  <span className="text-sm font-bold text-white">A/B 分级软杠杆份额 (Structured Tranches)</span>
                </div>
                <p className="text-xs text-neutral-400">
                  A 级稳健份额出资 80% 拿固定 18% 年化；您申购 <strong className="text-neutral-200">Turbo-B 狂暴份额</strong> 出资 20%，独享全池超额涨幅，<strong className="text-emerald-400">永不插针爆仓</strong>。
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {[1, 3, 5].map((lev) => (
                  <button
                    key={lev}
                    onClick={() => setTrancheLeverage(lev)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors ${
                      trancheLeverage === lev
                        ? 'bg-amber-400 text-neutral-950'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {lev === 1 ? '1x 平权' : `${lev}x B级杠杆`}
                  </button>
                ))}
              </div>
            </div>

            {/* Mechanism 2: 0-Block Graduation Sniper */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-amber-400 font-bold">机制 02 · Migrate 模块钩子</span>
                  <span className="text-sm font-bold text-white">内盘毕业 0 区块自动狙击 (Block-0 Sniper Vault)</span>
                </div>
                <p className="text-xs text-neutral-400">
                  散户冲土狗往往在 $500K 市值接盘；金库直接监听 <code className="text-amber-300">OpenFour.Migrate</code> 事件，在新币毕业同区块（$45K 市值）抢先建仓，筹码成本便宜 2.4 倍以上。
                </p>
              </div>
              <button
                onClick={() => setEnableSniperBlock0(!enableSniperBlock0)}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold shrink-0 cursor-pointer transition-colors ${
                  enableSniperBlock0
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                }`}
              >
                {enableSniperBlock0 ? '已开启 (2.4x 成本优势)' : '已关闭'}
              </button>
            </div>

            {/* Mechanism 3: Winner-Takes-All Momentum Roll */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-amber-400 font-bold">机制 03 · Vault 动量算法</span>
                  <span className="text-sm font-bold text-white">反传统「动量滚仓」：淘汰归零币，全仓追龙头</span>
                </div>
                <p className="text-xs text-neutral-400">
                  拒绝传统 ETF“卖掉百倍币去补仓归零币”的愚蠢再平衡！跌破 -30% 自动清仓止损，回收 BNB 自动加仓至涨幅第一的龙头币（允许单币膨胀至 65%）。
                </p>
              </div>
              <button
                onClick={() => setEnableMomentumRoll(!enableMomentumRoll)}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold shrink-0 cursor-pointer transition-colors ${
                  enableMomentumRoll
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                }`}
              >
                {enableMomentumRoll ? '已开启 (顺势滚仓)' : '传统等权削峰'}
              </button>
            </div>

            {/* Mechanism 4: Curve FOMO Multiplier */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-amber-400 font-bold">机制 04 · Curve 模块溢价</span>
                  <span className="text-sm font-bold text-white">头等舱折价 + 二级市场情绪溢价 (戴维斯双击)</span>
                </div>
                <p className="text-xs text-neutral-400">
                  早期申购者享受 Bonding Curve 折价，当基金跑出百倍币引發全网 FOMO 时，二级市场份额可产生 1.5x~3.0x 溢价交易。
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {[1.0, 1.5, 2.0, 3.0].map((prem) => (
                  <button
                    key={prem}
                    onClick={() => setFomoPremiumMultiplier(prem)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors ${
                      fomoPremiumMultiplier === prem
                        ? 'bg-amber-400 text-neutral-950'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {prem.toFixed(1)}x 溢价
                  </button>
                ))}
              </div>
            </div>

            {/* Mechanism 5: Diamond Hand Jackpot */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-amber-400 font-bold">机制 05 · Trade 博弈税池</span>
                  <span className="text-sm font-bold text-white">纸手赎回罚没 & 钻石手暴富彩池 (Jackpot)</span>
                </div>
                <p className="text-xs text-neutral-400">
                  中途下车的“纸手”将被征收最高 15% 惩罚税，100% 注入钻石手奖金池；当基金 NAV 突破 5x/10x 里程碑时，由坚定持有人瓜分！
                </p>
              </div>
              <button
                onClick={() => setEnableDiamondJackpot(!enableDiamondJackpot)}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold shrink-0 cursor-pointer transition-colors ${
                  enableDiamondJackpot
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                }`}
              >
                {enableDiamondJackpot ? '+18% 彩池加成' : '已关闭'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Output Panel: Side-by-Side Wealth Comparison (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Traditional ETF Card (Muted) */}
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">方案 A：传统等权再平衡 ETF</span>
              <span className="text-xs font-mono text-neutral-500">平庸收益 (被归零币拖累)</span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <div className="text-2xl font-bold font-mono text-neutral-300 tabular-nums">
                  {traditionalTotalMultiplier.toFixed(1)}x 回报
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  即使抓中 1 只 {goldenDogMultiplier}x 金狗，也被另外 4 只亏损币与每周自动卖飞稀释
                </div>
              </div>
              <div className="text-right font-mono shrink-0">
                <div className="text-lg font-bold text-neutral-200 tabular-nums">
                  ${traditionalFinalUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-neutral-400 tabular-nums">
                  ≈ {traditionalFinalBnb.toFixed(1)} BNB
                </div>
              </div>
            </div>
          </div>

          {/* FourFund Moon Engine Card (Highlighted Gold/Emerald) */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/30 to-neutral-900 border-2 border-amber-400/70 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>方案 B：FourFund 五维暴富引擎 (Turbo-B)</span>
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                跑赢传统 ETF {outperformanceRatio.toFixed(1)} 倍
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/90 border border-amber-500/30 flex items-baseline justify-between">
              <div>
                <div className="text-xs text-neutral-400 mb-1">预计最终暴富总回报</div>
                <div className="text-4xl font-extrabold font-mono text-amber-400 tabular-nums">
                  {totalMoonMultiplier.toFixed(1)}x
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-2xl font-bold text-emerald-400 tabular-nums">
                  ${moonFinalUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-white font-bold tabular-nums mt-0.5">
                  ≈ {moonFinalBnb.toFixed(1)} BNB
                </div>
              </div>
            </div>

            {/* Multiplier Attribution Breakdown */}
            <div className="space-y-2 text-xs font-mono border-t border-neutral-800 pt-4">
              <div className="text-neutral-400 font-sans font-semibold mb-2">暴富收益归因拆解：</div>
              <div className="flex justify-between">
                <span className="text-neutral-400">1. 0区块毕业狙击 + 动量滚仓基础净值:</span>
                <span className="text-white font-bold">{coreNavMultiplier.toFixed(1)}x NAV</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">2. Turbo-B 级份额 ({trancheLeverage}x 无爆仓杠杆):</span>
                <span className="text-emerald-400 font-bold">放大至 {leveragedNavMultiplier.toFixed(1)}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">3. 二级市场 Curve 情绪溢价乘数:</span>
                <span className="text-amber-400 font-bold">× {fomoPremiumMultiplier.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">4. 钻石手纸手税彩池加成:</span>
                <span className="text-emerald-400 font-bold">{enableDiamondJackpot ? '× 1.18 (含彩池空投)' : '× 1.00'}</span>
              </div>
            </div>

            <button
              onClick={onOpenMoonFund}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <span>立即在链上终端体验申购 $MOON-100X</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Architectural Deep-Dive Matrix: How Each OpenFour Module Enables 100x */}
      <div className="pt-6">
        <h3 className="text-lg font-bold text-white mb-4">
          全景架构设计：OpenFour 六大模块如何配合实现「买基金 = 一夜暴富」？
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
            <div className="text-xs font-mono text-amber-400 font-bold">01. Token + Vault 模块：A/B 分级借势</div>
            <div className="text-sm font-bold text-white">稳健大资金借力给散户狂飙</div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              大户与稳健资金怕土狗归零，申购 <strong>Senior-A 份额</strong> 稳拿 18% 年化 + 纸手税分成；渴望暴富的散户申购 <strong>Turbo-B 份额</strong>，用 1 BNB 撬动 5 BNB 的底层金狗仓位，且因为是金库内部收益让渡，<strong>没有合约插针爆仓风险</strong>。
            </p>
          </div>

          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
            <div className="text-xs font-mono text-amber-400 font-bold">02. Migrate 模块：打新 0 区块狙击枪</div>
            <div className="text-sm font-bold text-white">比科学家更快买在 $45K 起点</div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              普通人自己盯盘买 Meme 经常买在山顶。FourFund 的狙击型金库直接挂载在 <code className="text-amber-300">OpenFourCore</code> 的毕业事件上——当新币打满内盘迁移至 PancakeSwap 的<strong>同一笔交易内</strong>，基金自动完成建仓，直接吃满毕业后 10x~50x 涨幅。
            </p>
          </div>

          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
            <div className="text-xs font-mono text-amber-400 font-bold">03. Vault + Trade 模块：赢家通吃滚仓</div>
            <div className="text-sm font-bold text-white">自动去弱留强 + 纸手养钻石手</div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              彻底抛弃传统金融“高抛低吸”的枷锁，采用<strong>「动量突破再平衡」</strong>：篮子里哪只 Meme 讨论度与涨幅爆发，就砍掉阴跌币全仓换入龙头币。同时对恐慌赎回者征收高额纸手税，将罚没的 BNB 奖励给拿到最后的持有人。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
