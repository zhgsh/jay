import React, { useState, useEffect } from 'react';
import { Fund, UserHolding } from '../types/fund';
import { X, TrendingUp, Shield, Layers, RefreshCw, Download, Check, AlertCircle, ArrowRightLeft, Flame, Zap, AlertTriangle } from 'lucide-react';
import { downloadMarkdownFile } from '../data/whitepaperData';

interface FundDetailModalProps {
  fund: Fund | null;
  onClose: () => void;
  walletBalance: { bnb: number; usdt: number };
  userHoldings: UserHolding[];
  onExecuteTrade: (
    fundId: string,
    type: 'subscribe' | 'redeem',
    bnbAmount: number,
    sharesAmount: number,
    yieldMultiplier?: number
  ) => boolean;
}

export const FundDetailModal: React.FC<FundDetailModalProps> = ({
  fund,
  onClose,
  walletBalance,
  userHoldings,
  onExecuteTrade
}) => {
  if (!fund) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'basket' | 'openfour' | 'trade'>('overview');
  const [tradeType, setTradeType] = useState<'subscribe' | 'redeem'>('subscribe');
  const [selectedTranche, setSelectedTranche] = useState<'Standard' | 'Senior-A' | 'Turbo-B (5x)'>(
    fund.moonMechanics?.enabled ? 'Turbo-B (5x)' : 'Standard'
  );
  const [tradeInputAmount, setTradeInputAmount] = useState<string>('1.0');
  const [tradeSuccessMsg, setTradeSuccessMsg] = useState<string | null>(null);
  const [tradeErrorMsg, setTradeErrorMsg] = useState<string | null>(null);

  // Turbo Mode state & 3x yield multiplier state variable (only available when fund's 24h performance > 50%)
  const [isTurboMode, setIsTurboMode] = useState<boolean>(false);
  const [yieldMultiplier, setYieldMultiplier] = useState<number>(1);

  // Reset Turbo Mode and multiplier when switching funds
  useEffect(() => {
    setIsTurboMode(false);
    setYieldMultiplier(1);
  }, [fund.id]);

  const isTurboEligible = fund.change24h > 50;

  const handleToggleTurboMode = () => {
    if (!isTurboEligible) return;
    const nextTurboState = !isTurboMode;
    setIsTurboMode(nextTurboState);
    setYieldMultiplier(nextTurboState ? 3 : 1);
  };

  // Displayed metrics & simulated 3x yield multiplier on the fund's NAV movement
  const displayed24hChange = fund.change24h * yieldMultiplier;
  const displayed30dChange = fund.change30d * (isTurboMode && isTurboEligible ? 2.4 : 1);
  const navMovementDelta = fund.nav - fund.initialNav;
  const displayedNav =
    isTurboMode && isTurboEligible
      ? Math.max(0.01, fund.initialNav + navMovementDelta * yieldMultiplier)
      : fund.nav;
  const displayedNavBnb = fund.navBnb * (displayedNav / fund.nav);

  const userHolding = userHoldings.find((h) => h.fundId === fund.id);
  const userShares = userHolding ? userHolding.shares : 0;

  // Conversion calculations in trade execution logic using the 3x multiplied NAV movement
  const bnbPrice = 620.5; // BNB in USD
  const bnbDeposit = parseFloat(tradeInputAmount) || 0;
  const navUsd = displayedNav;

  // Subscription calculation: when Turbo Mode (X3) is enabled, user's effective share yield exposure is amplified 3x
  const subFeeRate = fund.openFourConfig.tradeModule.subscriptionFee;
  const grossUsdSub = bnbDeposit * bnbPrice;
  const netUsdSub = grossUsdSub * (1 - subFeeRate);
  const baseSharesSub = netUsdSub / fund.nav;
  const estimatedSharesSub = isTurboMode && isTurboEligible ? baseSharesSub * yieldMultiplier : netUsdSub / navUsd;

  // Redemption calculation: applies the 3x yield multiplier on the fund's NAV movement when redeeming shares
  const sharesRedeem = parseFloat(tradeInputAmount) || 0;
  const redFeeRate = fund.openFourConfig.tradeModule.redemptionFee;
  const grossUsdRed = sharesRedeem * navUsd;
  const netUsdRed = grossUsdRed * (1 - redFeeRate);
  const estimatedBnbRed = netUsdRed / bnbPrice;

  const handleTrade = () => {
    setTradeErrorMsg(null);
    setTradeSuccessMsg(null);

    const activeMultiplier = isTurboMode && isTurboEligible ? yieldMultiplier : 1;

    if (tradeType === 'subscribe') {
      if (bnbDeposit <= 0) {
        setTradeErrorMsg('请输入有效的申购 BNB 金额');
        return;
      }
      if (bnbDeposit > walletBalance.bnb) {
        setTradeErrorMsg(`钱包 BNB 余额不足 (当前: ${walletBalance.bnb.toFixed(2)} BNB)`);
        return;
      }
      const success = onExecuteTrade(fund.id, 'subscribe', bnbDeposit, estimatedSharesSub, activeMultiplier);
      if (success) {
        const trancheNote = fund.moonMechanics?.enabled ? ` [${selectedTranche} 份额]` : '';
        const turboNote =
          activeMultiplier > 1
            ? ` [⚡ X${activeMultiplier} Turbo Mode 生效：NAV 收益变动已按 ${activeMultiplier}x 乘数放大结算]`
            : '';
        setTradeSuccessMsg(`成功申购 ${estimatedSharesSub.toFixed(2)} $${fund.symbol}${trancheNote}${turboNote}！金库已按策略配置底层代币。`);
      }
    } else {
      if (sharesRedeem <= 0) {
        setTradeErrorMsg('请输入有效的赎回份额');
        return;
      }
      if (sharesRedeem > userShares) {
        setTradeErrorMsg(`持仓份额不足 (当前持有: ${userShares.toFixed(2)} 份)`);
        return;
      }
      const success = onExecuteTrade(fund.id, 'redeem', estimatedBnbRed, sharesRedeem, activeMultiplier);
      if (success) {
        const turboNote =
          activeMultiplier > 1
            ? ` (已应用 X${activeMultiplier} Turbo 净值涨幅乘数，结算 NAV $${navUsd.toFixed(4)})`
            : '';
        setTradeSuccessMsg(`成功赎回 ${sharesRedeem.toFixed(2)} 份，返还 ${estimatedBnbRed.toFixed(4)} BNB 至您的钱包${turboNote}！`);
      }
    }
  };

  const handleDownloadProspectus = () => {
    const markdownContent = `# 基金说明书：$${fund.symbol} —— ${fund.name}
> **发行协议**: FourFund (Based on OpenFour Modular Launch Engine)  
> **底层链**: BNB Chain  
> **当前 NAV**: $${fund.nav.toFixed(4)} (${fund.navBnb.toFixed(5)} BNB)  
> **AUM**: $${(fund.aumUsd / 1e6).toFixed(2)}M USD  
> **风险等级**: ${fund.riskLevel}  

---

## 1. 投资目标与定位
* **投资目标**: ${fund.investmentGoal}
* **基金类型**: ${fund.categoryLabel}
* **申赎机制**: ${fund.subscriptionRules}
* **再平衡机制**: ${fund.rebalanceRules}

---

## 2. 底层资产篮子 (Basket Holdings)
| 资产代码 | 资产名称 | 目标权重 | 当前实测权重 | 价格 (USD) | 24H 涨跌 | 类型 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${fund.basket.map(b => `| **${b.symbol}** | ${b.name} | ${(b.targetWeight * 100).toFixed(1)}% | ${(b.currentWeight * 100).toFixed(1)}% | $${b.priceUsd} | ${b.change24h}% | ${b.type} |`).join('\n')}

---

## 3. OpenFour 六大模块底层配置
* **Token Module**: Type = \`${fund.openFourConfig.tokenModule.type}\`, Symbol = \`${fund.openFourConfig.tokenModule.symbol}\`, Total Supply = \`${fund.openFourConfig.tokenModule.totalSupply}\`
* **Vault Module**: Custody = \`${fund.openFourConfig.vaultModule.custodyType}\`, Single Asset Cap = \`${(fund.openFourConfig.vaultModule.singleAssetCap * 100)}%\`, Rebalance = \`${fund.openFourConfig.vaultModule.rebalanceCadence}\`
* **Curve Module**: Type = \`${fund.openFourConfig.curveModule.type}\` (${fund.openFourConfig.curveModule.description})
* **Trade Module**: 
  - 申购费: ${(fund.openFourConfig.tradeModule.subscriptionFee * 100).toFixed(1)}%
  - 赎回费: ${(fund.openFourConfig.tradeModule.redemptionFee * 100).toFixed(1)}%
  - 二级买卖税: ${(fund.openFourConfig.tradeModule.secondaryTax * 100).toFixed(1)}%
  - 税费分流: 金库再投资 ${(fund.openFourConfig.tradeModule.taxSplit.vaultReinvest * 100)}%, 持有人分红 ${(fund.openFourConfig.tradeModule.taxSplit.holderDividend * 100)}%, 经理 ${(fund.openFourConfig.tradeModule.taxSplit.managerFee * 100)}%, OpenFour生态 ${(fund.openFourConfig.tradeModule.taxSplit.openFourIncentive * 100)}%
* **Migrate Module**: Current Stage = \`${fund.openFourConfig.migrateModule.currentStage}\`
* **Custom Data Module**: Oracle = \`${fund.openFourConfig.customDataModule.oracleType}\`, Snapshot = \`${fund.openFourConfig.customDataModule.snapshotFrequency}\`
`;
    downloadMarkdownFile(`${fund.symbol}_Prospectus.md`, markdownContent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm no-print">
      <div
        className={`relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-neutral-900 rounded-2xl shadow-2xl flex flex-col text-neutral-100 transition-all duration-300 ${
          isTurboMode && isTurboEligible
            ? 'border-2 border-rose-500 shadow-[0_0_45px_rgba(244,63,94,0.28)]'
            : 'border border-neutral-800'
        }`}
      >
        {/* Top Header */}
        <div
          className={`sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md transition-colors ${
            isTurboMode && isTurboEligible
              ? 'border-rose-500/40 bg-rose-950/40'
              : 'border-neutral-800 bg-neutral-900/95'
          }`}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xl font-bold font-mono text-white">${fund.symbol}</span>
            <span className="text-xs text-neutral-400">· {fund.name}</span>
            <span className="text-xs text-amber-400/90 font-mono hidden sm:inline">
              ({fund.categoryLabel})
            </span>
            {isTurboMode && isTurboEligible && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-rose-500 text-white font-mono font-extrabold text-xs tracking-wider shadow-[0_0_12px_rgba(244,63,94,0.7)] animate-pulse">
                  <Zap className="w-3 h-3 mr-0.5 fill-current" />
                  X3
                </span>
                <span className="flex items-center gap-1 text-xs font-mono font-bold text-rose-400">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  TURBO OVERDRIVE
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadProspectus}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
              title="下载本基金说明书 Markdown"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">说明书 (.md)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TURBO MODE TOGGLE BANNER — Strictly appears ONLY when fund's 24h performance > 50% */}
        {isTurboEligible && (
          <div
            className={`mx-6 mt-5 p-4 rounded-xl border transition-all duration-300 ${
              isTurboMode
                ? 'bg-gradient-to-r from-rose-950/70 via-amber-950/50 to-rose-950/70 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.2)]'
                : 'bg-neutral-950/90 border-amber-500/40'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Flame
                    className={`w-4 h-4 ${
                      isTurboMode ? 'text-rose-400 animate-bounce' : 'text-amber-400'
                    }`}
                  />
                  <span className="text-xs font-mono font-bold tracking-wider uppercase text-white">
                    {isTurboMode
                      ? 'TURBO MODE ACTIVE · 份额净值 (NAV) 变动收益率 3 倍放大中'
                      : `⚡ 24H 涨幅突破 50% 阈值 (+${fund.change24h.toFixed(1)}%) · 已解锁 Turbo Mode`}
                  </span>
                  {isTurboMode && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gradient-to-r from-rose-500 to-amber-500 text-neutral-950 font-mono font-black text-xs shadow-[0_0_15px_rgba(244,63,94,0.6)]">
                      <Zap className="w-3.5 h-3.5 fill-neutral-950" />
                      <span>X3 MULTIPLIER</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {isTurboMode
                    ? '当前已激活 X3 收益乘数：基金 NAV 净值变动与申赎结算份额均按 3.0x 乘数实时放大！注意：回撤波动同步放大 3 倍，回撤达 -25% 将触发链上熔断保护。'
                    : '该基金 24 小时表现已超过 +50% 狂暴线，允许一键开启 Turbo Mode，将该基金的 NAV 份额收益率放大 3 倍。'}
                </p>
              </div>

              {/* Toggle Switch + Visual X3 Multiplier Icon */}
              <div className="flex items-center gap-3 shrink-0">
                {isTurboMode && (
                  <div
                    className="flex items-center justify-center w-11 h-11 rounded-xl bg-rose-500/20 border-2 border-rose-400 text-rose-300 font-mono font-black text-base shadow-[0_0_20px_rgba(244,63,94,0.45)] select-none"
                    title="3x Yield Multiplier Active"
                  >
                    X3
                  </div>
                )}

                <button
                  type="button"
                  role="switch"
                  aria-checked={isTurboMode}
                  onClick={handleToggleTurboMode}
                  className={`relative inline-flex items-center gap-3 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer border ${
                    isTurboMode
                      ? 'bg-rose-500 hover:bg-rose-400 text-white border-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-amber-400 border-amber-500/50'
                  }`}
                >
                  {/* Visual Switch Track */}
                  <span
                    className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                      isTurboMode ? 'bg-neutral-950/60 justify-end' : 'bg-neutral-700 justify-start'
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full transition-transform ${
                        isTurboMode ? 'bg-amber-300' : 'bg-neutral-300'
                      }`}
                    />
                  </span>
                  <span>{isTurboMode ? 'Turbo Mode: ON (X3)' : '开启 Turbo Mode'}</span>
                </button>
              </div>
            </div>

            {/* Visual Risk & Multiplier Impact Bar */}
            <div className="mt-4 pt-3 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-400">收益乘数状态:</span>
                <span className={isTurboMode ? 'text-rose-400 font-bold text-sm flex items-center gap-1.5' : 'text-amber-400 font-semibold'}>
                  {isTurboMode && (
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-rose-500 text-white font-black">
                      X3
                    </span>
                  )}
                  <span>{isTurboMode ? `${yieldMultiplier}.0x 狂暴加速` : '1.0x 基础净值'}</span>
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-400">NAV 净值变动放大:</span>
                <span className="text-emerald-400 font-bold">
                  ${fund.nav.toFixed(3)} → ${displayedNav.toFixed(3)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-400">回撤风险敞口 (Risk):</span>
                <span className={isTurboMode ? 'text-rose-400 font-bold flex items-center gap-1' : 'text-neutral-300'}>
                  {isTurboMode && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                  {isTurboMode ? '极高 (3x 波动 / -25% 熔断)' : '标准篮子波动'}
                </span>
              </div>
            </div>

            {/* Risk Meter Progress Bar */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-neutral-400">
                  实时风险与杠杆热力指数 (Volatility & Drawdown Exposure)
                </span>
                <span className={isTurboMode ? 'text-rose-400 font-bold' : 'text-amber-400'}>
                  {isTurboMode ? '94 / 100 (OVERDRIVE DANGER ZONE)' : '52 / 100 (HIGH MOMENTUM)'}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    isTurboMode
                      ? 'w-[94%] bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500'
                      : 'w-[52%] bg-amber-400'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab switch buttons (Functional buttons, compliant with Zero-Pill) */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-neutral-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            概览与净值走势
          </button>
          <button
            onClick={() => setActiveTab('basket')}
            className={`pb-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'basket'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            成分资产篮 ({fund.basket.length})
          </button>
          <button
            onClick={() => setActiveTab('openfour')}
            className={`pb-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'openfour'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            OpenFour 六大模块配置
          </button>
          <button
            onClick={() => setActiveTab('trade')}
            className={`pb-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'trade'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            链上申购 / 赎回终端
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Macro metrics grid */}
              <div
                className={`grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border transition-colors ${
                  isTurboMode && isTurboEligible
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : 'bg-neutral-950/60 border-neutral-800'
                }`}
              >
                <div>
                  <div className="text-xs text-neutral-500">
                    {isTurboMode && isTurboEligible ? '3x Turbo 份额净值' : '份额净值 (NAV)'}
                  </div>
                  <div
                    className={`text-xl font-bold font-mono tabular-nums ${
                      isTurboMode && isTurboEligible ? 'text-rose-400' : 'text-white'
                    }`}
                  >
                    ${displayedNav.toFixed(4)}
                  </div>
                  <div className="text-xs text-neutral-400 font-mono tabular-nums">
                    {isTurboMode && isTurboEligible ? (
                      <span>基础 NAV: ${fund.nav.toFixed(4)}</span>
                    ) : (
                      <span>{displayedNavBnb.toFixed(5)} BNB</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-neutral-500">
                    {isTurboMode && isTurboEligible ? '24H / 30D (3x 放大)' : '24H / 30D 表现'}
                  </div>
                  <div
                    className={`text-xl font-bold font-mono tabular-nums ${
                      isTurboMode && isTurboEligible ? 'text-amber-300' : 'text-emerald-400'
                    }`}
                  >
                    +{displayed24hChange.toFixed(2)}%
                  </div>
                  <div className="text-xs text-neutral-400 font-mono tabular-nums">
                    +{displayed30dChange.toFixed(1)}% 累计
                  </div>
                </div>

                <div>
                  <div className="text-xs text-neutral-500">金库总资产 (AUM)</div>
                  <div className="text-xl font-bold font-mono text-white tabular-nums">
                    ${(fund.aumUsd / 1e6).toFixed(2)}M
                  </div>
                  <div className="text-xs text-neutral-400 font-mono tabular-nums">
                    {fund.totalSupply.toLocaleString()} 份额
                  </div>
                </div>

                <div>
                  <div className="text-xs text-neutral-500">风控 / 滚仓上限</div>
                  <div
                    className={`text-sm font-semibold mt-1 ${
                      isTurboMode && isTurboEligible ? 'text-rose-400' : 'text-amber-400'
                    }`}
                  >
                    {isTurboMode && isTurboEligible
                      ? '⚡ 3x 动态杠杆池已介入'
                      : fund.openFourConfig.vaultModule.custodyType}
                  </div>
                  <div className="text-xs text-neutral-400">
                    {isTurboMode && isTurboEligible
                      ? '触发 -25% 自动降杠杆保护'
                      : `单币上限 ≤ ${(fund.openFourConfig.vaultModule.singleAssetCap * 100).toFixed(0)}%`}
                  </div>
                </div>
              </div>

              {/* Moon Mode Mechanics Highlight if enabled */}
              {fund.moonMechanics?.enabled && (
                <div className="p-4 rounded-xl bg-amber-950/25 border border-amber-500/40 space-y-2">
                  <div className="text-xs font-mono font-bold text-amber-400">
                    ⚡ 五维非对称暴富引擎已激活 (Moon Mode Active)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-1">
                    <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                      <div className="text-neutral-500 text-[11px]">B级无爆仓杠杆</div>
                      <div className="text-emerald-400 font-bold">{fund.moonMechanics.trancheLeverage?.alphaMultiplier}x 净值放大</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                      <div className="text-neutral-500 text-[11px]">内盘毕业狙击</div>
                      <div className="text-amber-400 font-bold">{fund.moonMechanics.sniperAutoEntry?.blockDelay} 区块 ($45K MC)</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                      <div className="text-neutral-500 text-[11px]">动量去弱留强</div>
                      <div className="text-white font-bold">-30% 斩仓追龙头</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                      <div className="text-neutral-500 text-[11px]">钻石手彩池</div>
                      <div className="text-amber-400 font-bold">{fund.moonMechanics.diamondJackpot?.jackpotPoolBnb} BNB 待瓜分</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Investment Goal & Strategy */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">投资目标与定位</h4>
                <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/40 p-3.5 rounded-lg border border-neutral-800/60">
                  {fund.investmentGoal}
                </p>
              </div>

              {/* Historical NAV SVG Chart */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white">
                    {isTurboMode && isTurboEligible
                      ? '基金历史 NAV 净值曲线 (含 3x Turbo 狂暴投影对比)'
                      : '基金历史 NAV 净值曲线'}
                  </h4>
                  <span className="text-xs text-neutral-400 font-mono">
                    从发行 $1.000 至当前 ${displayedNav.toFixed(3)}
                  </span>
                </div>
                
                <div className="h-44 w-full bg-neutral-950/80 rounded-xl border border-neutral-800 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                    <span>
                      MAX $
                      {(isTurboMode && isTurboEligible
                        ? Math.max(...fund.historicalNav.map(h => 1 + (h.nav - 1) * 3))
                        : Math.max(...fund.historicalNav.map(h => h.nav))
                      ).toFixed(2)}
                    </span>
                    <span
                      className={
                        isTurboMode && isTurboEligible
                          ? 'text-rose-400 font-bold'
                          : 'text-emerald-400 font-semibold'
                      }
                    >
                      ↑ +{(((displayedNav - fund.initialNav) / fund.initialNav) * 100).toFixed(1)}% 自创设
                      {isTurboMode && isTurboEligible ? ' (3x Turbo 放大)' : ''}
                    </span>
                    <span>BASE $1.00</span>
                  </div>

                  {/* SVG Chart Polyline */}
                  <div className="relative h-28 w-full flex items-end">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 100">
                      <defs>
                        <linearGradient id={`navGradient-${fund.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor={isTurboMode && isTurboEligible ? '#f43f5e' : '#f59e0b'}
                            stopOpacity="0.4"
                          />
                          <stop
                            offset="100%"
                            stopColor={isTurboMode && isTurboEligible ? '#f43f5e' : '#f59e0b'}
                            stopOpacity="0.0"
                          />
                        </linearGradient>
                      </defs>
                      
                      {/* Area */}
                      <polygon
                        fill={`url(#navGradient-${fund.id})`}
                        points={`
                          0,100
                          ${fund.historicalNav.map((pt, i) => {
                            const x = (i / Math.max(1, fund.historicalNav.length - 1)) * 700;
                            const min = 1.0;
                            const maxBase = Math.max(3.5, ...fund.historicalNav.map(h => h.nav));
                            const max = isTurboMode && isTurboEligible ? Math.max(3.5, 1 + (maxBase - 1) * 3) : maxBase;
                            const val = isTurboMode && isTurboEligible ? 1 + (pt.nav - 1) * 3 : pt.nav;
                            const y = 100 - ((val - min) / (max - min)) * 90;
                            return `${x},${y}`;
                          }).join(' ')}
                          700,100
                        `}
                      />

                      {/* Baseline 1x dashed reference line when Turbo Mode is active */}
                      {isTurboMode && isTurboEligible && (
                        <polyline
                          fill="none"
                          stroke="#737373"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                          points={fund.historicalNav.map((pt, i) => {
                            const x = (i / Math.max(1, fund.historicalNav.length - 1)) * 700;
                            const min = 1.0;
                            const maxBase = Math.max(3.5, ...fund.historicalNav.map(h => h.nav));
                            const max = Math.max(3.5, 1 + (maxBase - 1) * 3);
                            const y = 100 - ((pt.nav - min) / (max - min)) * 90;
                            return `${x},${y}`;
                          }).join(' ')}
                        />
                      )}

                      {/* Active Stroke Line */}
                      <polyline
                        fill="none"
                        stroke={isTurboMode && isTurboEligible ? '#f43f5e' : '#f59e0b'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={fund.historicalNav.map((pt, i) => {
                          const x = (i / Math.max(1, fund.historicalNav.length - 1)) * 700;
                          const min = 1.0;
                          const maxBase = Math.max(3.5, ...fund.historicalNav.map(h => h.nav));
                          const max = isTurboMode && isTurboEligible ? Math.max(3.5, 1 + (maxBase - 1) * 3) : maxBase;
                          const val = isTurboMode && isTurboEligible ? 1 + (pt.nav - 1) * 3 : pt.nav;
                          const y = 100 - ((val - min) / (max - min)) * 90;
                          return `${x},${y}`;
                        }).join(' ')}
                      />

                      {/* Data dots */}
                      {fund.historicalNav.map((pt, i) => {
                        const x = (i / Math.max(1, fund.historicalNav.length - 1)) * 700;
                        const min = 1.0;
                        const maxBase = Math.max(3.5, ...fund.historicalNav.map(h => h.nav));
                        const max = isTurboMode && isTurboEligible ? Math.max(3.5, 1 + (maxBase - 1) * 3) : maxBase;
                        const val = isTurboMode && isTurboEligible ? 1 + (pt.nav - 1) * 3 : pt.nav;
                        const y = 100 - ((val - min) / (max - min)) * 90;
                        return (
                          <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="3.5"
                            className={`${
                              isTurboMode && isTurboEligible ? 'fill-rose-500' : 'fill-amber-400'
                            } stroke-neutral-950 stroke-2`}
                          />
                        );
                      })}
                    </svg>
                  </div>

                  {/* Dates bottom */}
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono pt-1 border-t border-neutral-800">
                    {fund.historicalNav.map((pt, i) => (
                      <span key={i}>{pt.date}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Call to Action */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-amber-950/20 border border-amber-600/30">
                <div>
                  <div className="text-xs font-semibold text-amber-400">准备好配置 ${fund.symbol} 组合了吗？</div>
                  <div className="text-xs text-neutral-400 mt-0.5">支持 BNB 一键申购，无需逐个买入 {fund.basket.length} 个币</div>
                </div>
                <button
                  onClick={() => setActiveTab('trade')}
                  className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  前往申赎终端
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: BASKET BREAKDOWN */}
          {activeTab === 'basket' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>底层资产按 NAV 贡献权重实时跟踪</span>
                <span className="font-mono">再平衡阈值: ±{(fund.openFourConfig.vaultModule.rebalanceThreshold * 100).toFixed(0)}%</span>
              </div>

              <div className="overflow-x-auto border border-neutral-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-950/80 text-neutral-400 border-b border-neutral-800 font-mono">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">代币 / 名称</th>
                      <th className="py-2.5 px-3 font-medium">类别</th>
                      <th className="py-2.5 px-3 font-medium text-right">初始权重</th>
                      <th className="py-2.5 px-3 font-medium text-right">当前实测权重</th>
                      <th className="py-2.5 px-3 font-medium text-right">金库持仓量</th>
                      <th className="py-2.5 px-3 font-medium text-right">当前单价</th>
                      <th className="py-2.5 px-4 font-medium text-right">24H 涨跌</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-mono">
                    {fund.basket.map((item, idx) => {
                      const deviation = Math.abs(item.currentWeight - item.targetWeight);
                      const isDrift = deviation >= 0.02;
                      return (
                        <tr key={idx} className="hover:bg-neutral-800/30 transition-colors">
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: item.color }}
                              />
                              <div>
                                <span className="font-bold text-white">${item.symbol}</span>
                                <span className="text-[11px] text-neutral-500 ml-1.5 font-sans">
                                  {item.name}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 uppercase text-[11px] text-neutral-400">
                            {item.type}
                          </td>
                          <td className="py-2.5 px-3 text-right text-neutral-300 tabular-nums">
                            {(item.targetWeight * 100).toFixed(1)}%
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums">
                            <span className={isDrift ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>
                              {(item.currentWeight * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-neutral-300 tabular-nums">
                            {item.amountInVault.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right text-white tabular-nums">
                            ${item.priceUsd < 0.01 ? item.priceUsd.toFixed(4) : item.priceUsd.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-4 text-right tabular-nums">
                            <span className={item.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-neutral-950/40 rounded-lg border border-neutral-800 text-xs text-neutral-400 flex items-center justify-between">
                <span>再平衡规则: {fund.rebalanceRules}</span>
                <span className="text-amber-400 font-mono">单币上限 ≤ {(fund.openFourConfig.vaultModule.singleAssetCap * 100).toFixed(0)}%</span>
              </div>
            </div>
          )}

          {/* TAB 3: OPENFOUR 6-MODULE ARCHITECTURE */}
          {activeTab === 'openfour' && (
            <div className="space-y-4">
              <div className="text-xs text-neutral-400">
                OpenFour 模块化引擎配置详情（已部署至 OpenFourCore 协议控制器）：
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Token Module */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="text-xs font-mono text-amber-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>01. Token Module</span>
                  </div>
                  <div className="text-xs space-y-1 font-mono text-neutral-300">
                    <div>Type: <span className="text-white">{fund.openFourConfig.tokenModule.type}</span></div>
                    <div>Symbol: <span className="text-white">${fund.openFourConfig.tokenModule.symbol}</span></div>
                    <div>Decimals: <span className="text-white">{fund.openFourConfig.tokenModule.decimals}</span></div>
                    <div>Total Supply: <span className="text-white">{fund.openFourConfig.tokenModule.totalSupply.toLocaleString()}</span></div>
                  </div>
                </div>

                {/* 2. Vault Module */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="text-xs font-mono text-amber-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>02. Vault Module</span>
                  </div>
                  <div className="text-xs space-y-1 font-mono text-neutral-300">
                    <div>Custody: <span className="text-white">{fund.openFourConfig.vaultModule.custodyType}</span></div>
                    <div>Single Asset Cap: <span className="text-emerald-400">≤ {(fund.openFourConfig.vaultModule.singleAssetCap * 100).toFixed(0)}%</span></div>
                    <div>Cadence: <span className="text-white">{fund.openFourConfig.vaultModule.rebalanceCadence}</span></div>
                    <div>Threshold: <span className="text-white">{(fund.openFourConfig.vaultModule.rebalanceThreshold * 100).toFixed(0)}% deviation</span></div>
                  </div>
                </div>

                {/* 3. Curve Module */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="text-xs font-mono text-amber-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>03. Curve Module</span>
                  </div>
                  <div className="text-xs space-y-1 font-mono text-neutral-300">
                    <div>Type: <span className="text-white">{fund.openFourConfig.curveModule.type}</span></div>
                    <div className="text-neutral-400 font-sans text-[11px] leading-relaxed">
                      {fund.openFourConfig.curveModule.description}
                    </div>
                  </div>
                </div>

                {/* 4. Trade Module */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="text-xs font-mono text-amber-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>04. Trade Module (费率分流)</span>
                  </div>
                  <div className="text-xs space-y-1 font-mono text-neutral-300">
                    <div>申购费: <span className="text-white">{(fund.openFourConfig.tradeModule.subscriptionFee * 100).toFixed(1)}%</span></div>
                    <div>赎回费: <span className="text-white">{(fund.openFourConfig.tradeModule.redemptionFee * 100).toFixed(1)}%</span></div>
                    <div>二级税: <span className="text-white">{(fund.openFourConfig.tradeModule.secondaryTax * 100).toFixed(1)}%</span></div>
                    <div className="text-[11px] text-neutral-400">
                      税费去向: 增厚净值 {(fund.openFourConfig.tradeModule.taxSplit.vaultReinvest * 100).toFixed(0)}% · 
                      分红 {(fund.openFourConfig.tradeModule.taxSplit.holderDividend * 100).toFixed(0)}% · 
                      经理 {(fund.openFourConfig.tradeModule.taxSplit.managerFee * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* 5. Migrate Module */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="text-xs font-mono text-amber-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>05. Migrate Module</span>
                  </div>
                  <div className="text-xs space-y-1 font-mono text-neutral-300">
                    <div>Current Stage: <span className="text-emerald-400 font-semibold">{fund.openFourConfig.migrateModule.currentStage}</span></div>
                    <div>Lifecycle: <span className="text-neutral-400">Fundraising → Building → Active → Rebalancing</span></div>
                  </div>
                </div>

                {/* 6. Custom Data Module */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="text-xs font-mono text-amber-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>06. Custom Data Module</span>
                  </div>
                  <div className="text-xs space-y-1 font-mono text-neutral-300">
                    <div>Oracle: <span className="text-white">{fund.openFourConfig.customDataModule.oracleType}</span></div>
                    <div>Snapshot: <span className="text-white">{fund.openFourConfig.customDataModule.snapshotFrequency}</span></div>
                    <div>Last Rebalance: <span className="text-neutral-400">{fund.openFourConfig.customDataModule.lastRebalanceTimestamp}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MINT / REDEEM TERMINAL */}
          {activeTab === 'trade' && (
            <div className="max-w-xl mx-auto space-y-6">
              {/* FOMO-Style Abstraction Stack Badge Bar */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Zap className="w-3.5 h-3.5" />
                  <span>已启用 FOMO 级链抽象引擎:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-neutral-300">
                  <span>Privy 免助记词</span>
                  <span className="text-neutral-600">·</span>
                  <span>Crossmint ApplePay</span>
                  <span className="text-neutral-600">·</span>
                  <span>Relay 1秒跨链</span>
                  <span className="text-neutral-600">·</span>
                  <span className="text-amber-400 font-semibold">Pimlico $0 Gas 代付</span>
                </div>
              </div>

              {/* Type Switcher */}
              <div className="flex items-center p-1 bg-neutral-950 rounded-xl border border-neutral-800">
                <button
                  onClick={() => {
                    setTradeType('subscribe');
                    setTradeInputAmount('1.0');
                    setTradeErrorMsg(null);
                    setTradeSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    tradeType === 'subscribe'
                      ? 'bg-amber-400 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  申购 (Deposit BNB → Mint ${fund.symbol})
                </button>
                <button
                  onClick={() => {
                    setTradeType('redeem');
                    setTradeInputAmount(userShares > 0 ? (userShares > 100 ? '100' : userShares.toString()) : '10');
                    setTradeErrorMsg(null);
                    setTradeSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    tradeType === 'redeem'
                      ? 'bg-amber-400 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  赎回 (Burn ${fund.symbol} → Get BNB)
                </button>
              </div>

              {/* Tranche Selector for Moon-Mode Funds */}
              {tradeType === 'subscribe' && fund.moonMechanics?.enabled && (
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-amber-500/40 space-y-2">
                  <div className="text-xs font-mono text-amber-400 font-semibold">
                    选择分级认购份额 (Structured Tranche Selection):
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedTranche('Turbo-B (5x)')}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        selectedTranche === 'Turbo-B (5x)'
                          ? 'bg-amber-400/15 border-amber-400 text-white'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <div className="text-xs font-bold font-mono text-amber-400">Turbo-B 狂暴份额 (5x)</div>
                      <div className="text-[11px] text-neutral-300 mt-0.5">5倍无插针软杠杆 · 享百倍金狗弹性</div>
                    </button>
                    <button
                      onClick={() => setSelectedTranche('Senior-A')}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        selectedTranche === 'Senior-A'
                          ? 'bg-emerald-400/15 border-emerald-400 text-white'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <div className="text-xs font-bold font-mono text-emerald-400">Senior-A 优先稳健份额</div>
                      <div className="text-[11px] text-neutral-300 mt-0.5">18% 固定 APR + 纸手税优先分红</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Input Box */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>{tradeType === 'subscribe' ? '存入 BNB 数量' : `赎回 ${fund.symbol} 份额`}</span>
                  <span className="font-mono">
                    {tradeType === 'subscribe'
                      ? `钱包余额: ${walletBalance.bnb.toFixed(3)} BNB`
                      : `持有份额: ${userShares.toFixed(2)} 份`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0.01"
                    value={tradeInputAmount}
                    onChange={(e) => setTradeInputAmount(e.target.value)}
                    className="flex-1 bg-transparent text-2xl font-bold font-mono text-white focus:outline-none tabular-nums"
                    placeholder="0.0"
                  />
                  <span className="text-sm font-bold font-mono text-amber-400 px-3 py-1 bg-neutral-900 rounded-lg border border-neutral-800">
                    {tradeType === 'subscribe' ? 'BNB' : `$${fund.symbol}`}
                  </span>
                </div>

                {tradeType === 'subscribe' ? (
                  <div className="flex items-center gap-2 pt-1">
                    {[0.5, 1.0, 2.5, 5.0].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setTradeInputAmount(amt.toString())}
                        className="px-2.5 py-1 text-[11px] font-mono text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded hover:bg-neutral-800 cursor-pointer"
                      >
                        +{amt} BNB
                      </button>
                    ))}
                    <button
                      onClick={() => setTradeInputAmount(Math.max(0, walletBalance.bnb - 0.05).toFixed(2))}
                      className="px-2.5 py-1 text-[11px] font-mono text-amber-400 bg-neutral-900 border border-neutral-800 rounded hover:bg-neutral-800 cursor-pointer ml-auto"
                    >
                      MAX
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-1">
                    {[0.25, 0.5, 0.75, 1.0].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setTradeInputAmount((userShares * pct).toFixed(2))}
                        className="px-2.5 py-1 text-[11px] font-mono text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded hover:bg-neutral-800 cursor-pointer"
                      >
                        {pct * 100}%
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Conversion Breakdown */}
              <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-neutral-400">
                  <span>{isTurboMode && isTurboEligible ? '3x Turbo 结算净值 (NAV):' : '当前份额净值 (NAV):'}</span>
                  <span className={isTurboMode && isTurboEligible ? 'text-rose-400 font-bold' : 'text-white'}>
                    ${displayedNav.toFixed(4)} ({displayedNavBnb.toFixed(5)} BNB)
                  </span>
                </div>

                {isTurboMode && isTurboEligible && (
                  <div className="flex items-center justify-between text-rose-400">
                    <span>Turbo 收益乘数 (Multiplier):</span>
                    <span className="font-bold">3.0x 收益率放大 (24H +{displayed24hChange.toFixed(1)}%)</span>
                  </div>
                )}

                {tradeType === 'subscribe' ? (
                  <>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>申购手续费 ({(subFeeRate * 100).toFixed(1)}%):</span>
                      <span className="text-neutral-300">${(grossUsdSub * subFeeRate).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>净注入金库价值:</span>
                      <span className="text-white">${netUsdSub.toFixed(2)} USD</span>
                    </div>
                    <div className="flex items-center justify-between text-amber-400 pt-2 border-t border-neutral-800 text-sm font-bold">
                      <span>预计铸造获得份额:</span>
                      <span>{estimatedSharesSub.toFixed(2)} ${fund.symbol}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>赎回手续费 ({(redFeeRate * 100).toFixed(1)}%):</span>
                      <span className="text-neutral-300">${(grossUsdRed * redFeeRate).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-amber-400 pt-2 border-t border-neutral-800 text-sm font-bold">
                      <span>预计取回 BNB:</span>
                      <span>{estimatedBnbRed.toFixed(4)} BNB</span>
                    </div>
                  </>
                )}
              </div>

              {/* Feedback messages */}
              {tradeErrorMsg && (
                <div className="flex items-center gap-2 p-3 bg-rose-950/40 border border-rose-800 rounded-lg text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{tradeErrorMsg}</span>
                </div>
              )}

              {tradeSuccessMsg && (
                <div className="flex items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-800 rounded-lg text-xs text-emerald-300">
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{tradeSuccessMsg}</span>
                </div>
              )}

              {/* Execute Action */}
              <button
                onClick={handleTrade}
                className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm transition-colors cursor-pointer shadow-lg"
              >
                {tradeType === 'subscribe' ? `立即存入并申购 $${fund.symbol}` : `确认销毁份额并赎回`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
