import React, { useState, useEffect } from 'react';
import { Fund } from '../types/fund';
import { Sliders, RefreshCw, AlertTriangle, CheckCircle2, TrendingUp, Sparkles, ArrowRight, Flame, Zap, Timer, Lock } from 'lucide-react';

interface NavSimulatorProps {
  initialFunds: Fund[];
}

export const NavSimulator: React.FC<NavSimulatorProps> = ({ initialFunds }) => {
  const [selectedFundId, setSelectedFundId] = useState<string>(initialFunds[0].id);
  const fund = initialFunds.find((f) => f.id === selectedFundId) || initialFunds[0];

  // Simulator state: price multipliers for each asset in this fund
  const [priceMultipliers, setPriceMultipliers] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    fund.basket.forEach((b) => {
      init[b.symbol] = 1.0;
    });
    return init;
  });

  // Turbo Mode state: 3x short-term yield multiplier when 24h performance > 50%
  const [isTurboActive, setIsTurboActive] = useState<boolean>(false);
  const [turboSecondsLeft, setTurboSecondsLeft] = useState<number>(0);

  const [rebalanceTriggered, setRebalanceTriggered] = useState<boolean>(false);
  const [rebalanceLog, setRebalanceLog] = useState<string | null>(null);

  // Switch fund handler
  const handleSelectFund = (id: string) => {
    setSelectedFundId(id);
    const targetFund = initialFunds.find((f) => f.id === id) || initialFunds[0];
    const newMult: Record<string, number> = {};
    targetFund.basket.forEach((b) => {
      newMult[b.symbol] = 1.0;
    });
    setPriceMultipliers(newMult);
    setIsTurboActive(false);
    setTurboSecondsLeft(0);
    setRebalanceTriggered(false);
    setRebalanceLog(null);
  };

  // Update a single asset price
  const handlePriceChange = (symbol: string, multiplier: number) => {
    setPriceMultipliers((prev) => ({
      ...prev,
      [symbol]: Math.max(0.1, multiplier)
    }));
  };

  // Recalculate dynamic basket values
  const simulatedBasket = fund.basket.map((item) => {
    const mult = priceMultipliers[item.symbol] ?? 1.0;
    const currentPrice = item.priceUsd * mult;
    const totalValue = item.amountInVault * currentPrice;
    return {
      ...item,
      currentPrice,
      totalValue,
      mult
    };
  });

  const totalSimulatedAum = simulatedBasket.reduce((acc, cur) => acc + cur.totalValue, 0);
  const baseSimulatedNav = totalSimulatedAum / fund.totalSupply;
  const rawNavChangePct = ((baseSimulatedNav - fund.nav) / fund.nav) * 100;

  // Simulated 24H total performance combines the fund's baseline 24h change + simulated delta
  // Or if user sliders push rawNavChangePct > 50% directly, both count as 24H performance > 50%
  const simulated24hReturnPct = fund.change24h + rawNavChangePct;
  const isEligibleForTurbo = simulated24hReturnPct > 50 || rawNavChangePct > 50;

  // Auto-disable Turbo if performance drops below 50%
  useEffect(() => {
    if (!isEligibleForTurbo && isTurboActive) {
      setIsTurboActive(false);
      setTurboSecondsLeft(0);
    }
  }, [isEligibleForTurbo, isTurboActive]);

  // Countdown timer for short-term Turbo Mode
  useEffect(() => {
    if (!isTurboActive || turboSecondsLeft <= 0) return;
    const timer = setInterval(() => {
      setTurboSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsTurboActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTurboActive, turboSecondsLeft]);

  // Apply 3x Multiplier when Turbo Mode is active
  const activeMultiplier = isTurboActive ? 3.0 : 1.0;
  const effectiveReturnPct = rawNavChangePct > 0
    ? rawNavChangePct * activeMultiplier
    : rawNavChangePct;
  const effective24hReturnPct = simulated24hReturnPct > 0
    ? simulated24hReturnPct * activeMultiplier
    : simulated24hReturnPct;

  const finalDisplayedNav = isTurboActive
    ? fund.nav * (1 + Math.max(rawNavChangePct, simulated24hReturnPct) * 3 / 100)
    : baseSimulatedNav;
  const finalDisplayedNavBnb = finalDisplayedNav / 620.5;

  // Calculate simulated weights and deviations
  const evaluatedBasket = simulatedBasket.map((item) => {
    const simWeight = totalSimulatedAum > 0 ? item.totalValue / totalSimulatedAum : 0;
    const deviation = Math.abs(simWeight - item.targetWeight);
    const isExceeded = deviation > 0.05; // 5% threshold
    return {
      ...item,
      simWeight,
      deviation,
      isExceeded
    };
  });

  const anyExceeded = evaluatedBasket.some((b) => b.isExceeded);

  // Scenario presets
  const applyPreset = (preset: 'bull' | 'super_pump' | 'crash' | 'bnb_surge' | 'reset') => {
    const newMult: Record<string, number> = {};
    fund.basket.forEach((b) => {
      if (preset === 'reset') {
        newMult[b.symbol] = 1.0;
      } else if (preset === 'bull') {
        newMult[b.symbol] = b.type === 'meme' ? 1.5 : b.type === 'ai' ? 1.4 : 1.05;
      } else if (preset === 'super_pump') {
        newMult[b.symbol] = b.type === 'meme' ? 1.85 : b.type === 'ai' ? 1.75 : 1.35;
      } else if (preset === 'crash') {
        newMult[b.symbol] = b.type === 'meme' ? 0.65 : b.type === 'ai' ? 0.75 : 0.95;
      } else if (preset === 'bnb_surge') {
        newMult[b.symbol] = b.symbol === 'BNB' ? 1.25 : 1.0;
      }
    });
    setPriceMultipliers(newMult);
    if (preset === 'reset' || preset === 'crash') {
      setIsTurboActive(false);
      setTurboSecondsLeft(0);
    }
    setRebalanceTriggered(false);
    setRebalanceLog(null);
  };

  const handleToggleTurbo = () => {
    if (!isEligibleForTurbo) return;
    if (isTurboActive) {
      setIsTurboActive(false);
      setTurboSecondsLeft(0);
    } else {
      setIsTurboActive(true);
      setTurboSecondsLeft(60); // 60 seconds high-adrenaline window
    }
  };

  const handleExecuteRebalance = () => {
    setRebalanceTriggered(true);
    setRebalanceLog(
      `[OpenFour Vault 执行成功] 金库总资产 $${(totalSimulatedAum / 1e6).toFixed(2)}M 已通过 DEX 路由智能对冲，所有成分币权重重新锚定至 Target 目标权重，单币未超 ${(fund.openFourConfig.vaultModule.singleAssetCap * 100).toFixed(0)}% 上限。`
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 no-print">
      {/* Title */}
      <div className="mb-8">
        <div className="text-xs font-mono text-amber-400 mb-1 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" />
          <span>Interactive NAV Oracle, Multiplier & 3x Turbo Engine</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          NAV 预言机测算与 3x Turbo 狂暴模拟器
        </h2>
        <p className="text-neutral-400 text-sm mt-1 max-w-3xl">
          实时验证 OpenFour 核心公式：
          <code className="text-amber-400 font-mono text-xs mx-1 px-1.5 py-0.5 bg-neutral-900 rounded border border-neutral-800">
            NAV = Σ (amount_i × price_i) / totalSupply(FUND)
          </code>
          。当基金在 <strong className="text-emerald-400">24 小时内表现突破 +50%</strong> 时，自动解锁 <strong className="text-amber-400">Turbo Mode (3x Multiplier)</strong>，短时间内将份额收益率放大 3 倍！
        </p>
      </div>

      {/* Fund selector bar */}
      <div className="flex items-center gap-2 p-1.5 bg-neutral-900 border border-neutral-800 rounded-xl mb-6 overflow-x-auto">
        <span className="text-xs text-neutral-500 font-mono px-3 shrink-0">选择测算基金:</span>
        {initialFunds.map((f) => (
          <button
            key={f.id}
            onClick={() => handleSelectFund(f.id)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedFundId === f.id
                ? 'bg-neutral-800 text-amber-400 font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>${f.symbol}</span>
            <span className={`font-mono text-[11px] ${f.change24h > 50 ? 'text-emerald-400 font-bold' : 'text-neutral-500'}`}>
              ({f.change24h >= 0 ? '+' : ''}{f.change24h.toFixed(0)}% 24H)
            </span>
          </button>
        ))}
      </div>

      {/* Main Grid: Control & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Asset Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-white">底层成分币价格浮动控制 (Multiplier Sliders)</h3>
            
            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => applyPreset('super_pump')}
                className="px-2.5 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/60 rounded font-semibold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>+75% 暴涨 (解锁 Turbo)</span>
              </button>
              <button
                onClick={() => applyPreset('bull')}
                className="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 rounded transition-colors cursor-pointer"
              >
                +40% 普涨
              </button>
              <button
                onClick={() => applyPreset('crash')}
                className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded transition-colors cursor-pointer"
              >
                -25% 闪崩
              </button>
              <button
                onClick={() => applyPreset('reset')}
                className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors cursor-pointer"
              >
                重置
              </button>
            </div>
          </div>

          <div className="space-y-3 bg-neutral-900/50 border border-neutral-800 p-4 rounded-xl">
            {evaluatedBasket.map((item) => {
              const currentMultiplier = priceMultipliers[item.symbol] ?? 1.0;
              const pctChange = (currentMultiplier - 1.0) * 100;
              return (
                <div key={item.symbol} className="space-y-1.5 p-2 rounded-lg hover:bg-neutral-800/40 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-bold font-mono text-white">${item.symbol}</span>
                      <span className="text-neutral-500 font-mono">
                        ${item.currentPrice < 0.01 ? item.currentPrice.toFixed(4) : item.currentPrice.toFixed(2)}
                      </span>
                      <span className="text-[11px] font-mono text-amber-400/90">
                        ({currentMultiplier.toFixed(2)}x)
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-neutral-400">
                        权重: {(item.simWeight * 100).toFixed(1)}% (目标 {(item.targetWeight * 100).toFixed(0)}%)
                      </span>
                      <span
                        className={`tabular-nums font-semibold w-16 text-right ${
                          pctChange > 0 ? 'text-emerald-400' : pctChange < 0 ? 'text-rose-400' : 'text-neutral-400'
                        }`}
                      >
                        {pctChange > 0 ? '+' : ''}{pctChange.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.2"
                      max="4.0"
                      step="0.05"
                      value={currentMultiplier}
                      onChange={(e) => handlePriceChange(item.symbol, parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: NAV Real-Time Calculation, Turbo Multiplier & Rebalance Trigger (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">NAV 传导结果与 Turbo Multiplier 引擎</h3>

          {/* TURBO MODE 3X MULTIPLIER PANEL */}
          <div
            className={`p-5 rounded-xl border transition-all space-y-3 ${
              isTurboActive
                ? 'bg-gradient-to-br from-amber-950/60 via-neutral-900 to-emerald-950/40 border-2 border-amber-400 shadow-2xl'
                : isEligibleForTurbo
                ? 'bg-amber-950/20 border-amber-500/60'
                : 'bg-neutral-900/70 border-neutral-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className={`w-4 h-4 ${isTurboActive ? 'text-amber-400 animate-bounce' : isEligibleForTurbo ? 'text-amber-400' : 'text-neutral-500'}`} />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wide">
                  Multiplier · 3x Turbo Mode
                </span>
              </div>

              {isTurboActive ? (
                <span className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400">
                  <Timer className="w-3.5 h-3.5" />
                  <span>狂暴生效中: {turboSecondsLeft}s</span>
                </span>
              ) : (
                <span className={`text-xs font-mono ${isEligibleForTurbo ? 'text-emerald-400 font-semibold' : 'text-neutral-500'}`}>
                  {isEligibleForTurbo ? '已达到 >50% 解锁条件' : '需 24H 涨幅 > 50% 解锁'}
                </span>
              )}
            </div>

            {/* 24H Progress Bar towards 50% threshold */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-neutral-400">当前基金 24H 综合表现:</span>
                <span className={simulated24hReturnPct >= 50 ? 'text-emerald-400 font-bold' : 'text-neutral-200'}>
                  {simulated24hReturnPct >= 0 ? '+' : ''}{simulated24hReturnPct.toFixed(1)}% / 目标 +50.0%
                </span>
              </div>
              <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    isTurboActive
                      ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                      : simulated24hReturnPct >= 50
                      ? 'bg-emerald-400'
                      : 'bg-amber-500/60'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, (simulated24hReturnPct / 50) * 100))}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              {isTurboActive
                ? `🔥 3x Turbo Mode 已开启！金库通过 OpenFour Curve 动量溢价池将当前份额收益率瞬时放大 3 倍（${simulated24hReturnPct.toFixed(1)}% → +${effective24hReturnPct.toFixed(1)}%）。`
                : isEligibleForTurbo
                ? `恭喜！$${fund.symbol} 在 24 小时内表现达 +${simulated24hReturnPct.toFixed(1)}%（超过 50% 阈值），现可一键激活 3 倍份额收益率加速！`
                : `拖动左侧滑块或点击「+75% 暴涨」使基金 24H 涨幅突破 50%，即可解锁一键 3 倍收益放大器。`}
            </p>

            <button
              onClick={handleToggleTurbo}
              disabled={!isEligibleForTurbo}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                isTurboActive
                  ? 'bg-rose-500 hover:bg-rose-400 text-white cursor-pointer shadow-lg'
                  : isEligibleForTurbo
                  ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950 cursor-pointer shadow-lg animate-pulse'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              {isTurboActive ? (
                <>
                  <Zap className="w-4 h-4" />
                  <span>关闭 Turbo Mode (当前 3.0x 倍率生效中 · {turboSecondsLeft}s)</span>
                </>
              ) : isEligibleForTurbo ? (
                <>
                  <Flame className="w-4 h-4" />
                  <span>一键开启 Turbo Mode (份额收益率 3x 放大)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>未达 24H +50% 门槛 (点击左侧「+75% 暴涨」快速体验)</span>
                </>
              )}
            </button>
          </div>

          {/* NAV Card */}
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500 font-mono">
                  {isTurboActive ? '3X TURBO 放大后份额净值' : '最新测算份额净值 (SIMULATED NAV)'}
                </span>
                {isTurboActive && (
                  <span className="text-xs font-mono font-bold text-amber-400">
                    3.0x MULTIPLIER ACTIVE
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-3 mt-1">
                <span className={`text-3xl sm:text-4xl font-bold font-mono tabular-nums ${isTurboActive ? 'text-amber-400' : 'text-white'}`}>
                  ${finalDisplayedNav.toFixed(4)}
                </span>
                <span
                  className={`text-sm font-bold font-mono tabular-nums ${
                    effective24hReturnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isTurboActive
                    ? `🔥 +${effective24hReturnPct.toFixed(2)}% (3x 狂暴收益)`
                    : `${rawNavChangePct >= 0 ? '+' : ''}${rawNavChangePct.toFixed(2)}% (模拟变动)`}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mt-1">
                <span>≈ {finalDisplayedNavBnb.toFixed(5)} BNB / 份</span>
                {isTurboActive && (
                  <span className="text-neutral-500 line-through">
                    基础 NAV: ${baseSimulatedNav.toFixed(4)}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-800/80 text-xs font-mono">
              <div>
                <span className="text-neutral-500">金库总估值 AUM:</span>
                <div className="text-white font-semibold tabular-nums mt-0.5">
                  ${(totalSimulatedAum / 1e6).toFixed(2)}M USD
                </div>
              </div>
              <div>
                <span className="text-neutral-500">当前收益乘数 (Multiplier):</span>
                <div className={`font-bold tabular-nums mt-0.5 ${isTurboActive ? 'text-amber-400' : 'text-white'}`}>
                  {activeMultiplier.toFixed(1)}x {isTurboActive ? '(Turbo Boost)' : '(Standard)'}
                </div>
              </div>
            </div>

            {/* Deviation Alert or Status */}
            <div
              className={`p-3.5 rounded-lg border text-xs ${
                anyExceeded
                  ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                  : 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {anyExceeded ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>检测到成分币权重偏离目标 &gt; 5%！</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>资产组合权重在正常公差范围内 (偏差 &le; 5%)</span>
                  </>
                )}
              </div>
              <p className="mt-1 text-neutral-300 leading-relaxed text-[11px]">
                {anyExceeded
                  ? `根据 OpenFour 协议风控规则，当偏差突破 5% 阈值，Vault 自动触发链上再平衡程序以锁定利润与控制单币敞口风险。`
                  : `当前各成分币持有比例均衡，无需触发高频调仓损耗交易滑点。`}
              </p>
            </div>

            {/* Rebalance Action */}
            <button
              onClick={handleExecuteRebalance}
              className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                anyExceeded
                  ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-md'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>模拟执行金库再平衡 (Execute Vault Rebalance)</span>
            </button>

            {rebalanceLog && (
              <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-[11px] font-mono text-emerald-400 leading-relaxed">
                {rebalanceLog}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

