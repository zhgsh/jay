import React, { useState } from 'react';
import { Layers, Plus, Trash2, CheckCircle2, Copy, Check, ShieldAlert, Sparkles, Send } from 'lucide-react';
import { Fund } from '../types/fund';

interface FundBuilderProps {
  onFundCreated: (newFund: Fund) => void;
}

export const FundBuilder: React.FC<FundBuilderProps> = ({ onFundCreated }) => {
  // Step 1: Token
  const [symbol, setSymbol] = useState('ALPHA-TOP5');
  const [name, setName] = useState('Alpha Top 5 Meme Fund');
  const [slogan, setSlogan] = useState('聚焦最新毕业的优质 Meme 赛道');
  
  // Step 2: Basket
  const availableTokens = [
    { symbol: 'FROG', name: 'FourFrog', defaultPrice: 0.019, type: 'meme' as const, color: '#10b981' },
    { symbol: 'PEPEBNB', name: 'BNB Pepe', defaultPrice: 0.0265, type: 'meme' as const, color: '#22c55e' },
    { symbol: 'CAT4', name: 'Four Cat', defaultPrice: 0.0448, type: 'meme' as const, color: '#06b6d4' },
    { symbol: 'DOGE4', name: 'Four Doge', defaultPrice: 0.0062, type: 'meme' as const, color: '#f59e0b' },
    { symbol: 'TST', name: 'Test Token', defaultPrice: 0.0416, type: 'meme' as const, color: '#eab308' },
    { symbol: 'BNB', name: 'BNB Reserve', defaultPrice: 620.5, type: 'bluechip' as const, color: '#eab308' },
    { symbol: 'USDT', name: 'Tether USD', defaultPrice: 1.0, type: 'stable' as const, color: '#2dd4bf' }
  ];

  const [selectedTokens, setSelectedTokens] = useState<Array<{ symbol: string; weight: number }>>([
    { symbol: 'FROG', weight: 20 },
    { symbol: 'PEPEBNB', weight: 20 },
    { symbol: 'CAT4', weight: 20 },
    { symbol: 'DOGE4', weight: 20 },
    { symbol: 'BNB', weight: 20 }
  ]);

  // Step 3: Curve
  const [curveType, setCurveType] = useState<'NAV-Anchor' | 'NAV-Band' | 'NAV-Premium' | 'NAV-Flat'>('NAV-Anchor');

  // Step 4: Trade Taxes
  const [subFee, setSubFee] = useState(0.2); // 0.2%
  const [redFee, setRedFee] = useState(0.5); // 0.5%
  const [secondaryTax, setSecondaryTax] = useState(1.5); // 1.5%

  // Deploy status
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedSuccess, setDeployedSuccess] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const totalWeight = selectedTokens.reduce((a, b) => a + b.weight, 0);
  const hasOverCap = selectedTokens.some(t => t.weight > 25);

  const handleAddToken = (sym: string) => {
    if (selectedTokens.some(t => t.symbol === sym)) return;
    setSelectedTokens([...selectedTokens, { symbol: sym, weight: 10 }]);
  };

  const handleRemoveToken = (sym: string) => {
    if (selectedTokens.length <= 2) return;
    setSelectedTokens(selectedTokens.filter(t => t.symbol !== sym));
  };

  const handleWeightChange = (sym: string, val: number) => {
    setSelectedTokens(selectedTokens.map(t => t.symbol === sym ? { ...t, weight: val } : t));
  };

  const generatedManifest = {
    protocol: 'OpenFour',
    standard: 'BasketBackedToken-v1',
    timestamp: new Date().toISOString(),
    tokenModule: {
      type: 'fund',
      symbol: symbol.toUpperCase(),
      name,
      decimals: 18,
      initialSupply: 1000000
    },
    vaultModule: {
      custody: 'multi-sig-3/5',
      rebalanceCadence: 'Weekly',
      rebalanceThresholdBps: 500,
      basket: selectedTokens.map(t => ({
        token: t.symbol,
        targetWeightBps: t.weight * 100
      }))
    },
    curveModule: {
      type: curveType,
      pricingOracle: 'PythTWAP'
    },
    tradeModule: {
      subscriptionFeeBps: subFee * 100,
      redemptionFeeBps: redFee * 100,
      secondaryTaxBps: secondaryTax * 100,
      taxDistribution: {
        vaultReinvestment: '40%',
        holderDividendPool: '30%',
        managerReward: '20%',
        openFourPresetRoyalty: '10%'
      }
    },
    customDataModule: {
      onChainSnapshotFrequency: 'Daily',
      metadataURI: `ipfs://bafy...fourfund/${symbol.toLowerCase()}`
    }
  };

  const handleDeploy = () => {
    if (totalWeight !== 100) return;
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      setDeployedSuccess(true);

      // Create new fund object
      const newFundObj: Fund = {
        id: `fund-${symbol.toLowerCase()}-${Date.now()}`,
        symbol: symbol.toUpperCase(),
        name,
        slogan,
        category: 'thematic',
        categoryLabel: '开发者自定义 / 主题',
        riskLevel: '高',
        nav: 1.000,
        navBnb: 0.00161,
        initialNav: 1.000,
        change24h: 0.0,
        change7d: 0.0,
        change30d: 0.0,
        aumUsd: 1000000,
        totalSupply: 1000000,
        creator: {
          name: 'Community Fund Manager',
          address: '0x999...C1B2',
          verified: true
        },
        investmentGoal: slogan,
        subscriptionRules: '注入 BNB 由 OpenFourCore 智能路由折算，即刻 mint 基金份额代币。',
        rebalanceRules: '每周一 UTC 00:00 自动检查，偏离目标权重 >5% 执行再平衡。',
        basket: selectedTokens.map(t => {
          const matched = availableTokens.find(tok => tok.symbol === t.symbol)!;
          return {
            symbol: t.symbol,
            name: matched.name,
            targetWeight: t.weight / 100,
            currentWeight: t.weight / 100,
            amountInVault: Math.floor((1000000 * (t.weight / 100)) / matched.defaultPrice),
            priceUsd: matched.defaultPrice,
            change24h: 0.0,
            color: matched.color,
            type: matched.type
          };
        }),
        openFourConfig: {
          tokenModule: {
            type: 'fund',
            symbol: symbol.toUpperCase(),
            decimals: 18,
            totalSupply: 1000000
          },
          vaultModule: {
            custodyType: 'multi-sig 3/5',
            singleAssetCap: 0.25,
            supportedAssets: selectedTokens.map(t => t.symbol),
            rebalanceCadence: 'Weekly',
            rebalanceThreshold: 0.05
          },
          curveModule: {
            type: curveType,
            description: `${curveType} 曲线，保障价格与多币净值强绑定`,
            params: {}
          },
          tradeModule: {
            subscriptionFee: subFee / 100,
            redemptionFee: redFee / 100,
            secondaryTax: secondaryTax / 100,
            taxSplit: {
              vaultReinvest: 0.4,
              holderDividend: 0.3,
              managerFee: 0.2,
              openFourIncentive: 0.1
            }
          },
          migrateModule: {
            lifecycle: ['Fundraising', 'Portfolio Building', 'Active Operation'],
            currentStage: 'Active Operation'
          },
          customDataModule: {
            oracleType: 'Indexer + Pyth/Chainlink Oracle',
            snapshotFrequency: 'Daily UTC 00:00 Snapshot',
            lastRebalanceTimestamp: 'Just Now'
          }
        },
        historicalNav: [
          { date: '创设', nav: 1.000, volume: 100000 }
        ]
      };

      onFundCreated(newFundObj);
    }, 1200);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(generatedManifest, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 no-print">
      {/* Title */}
      <div className="mb-8">
        <div className="text-xs font-mono text-amber-400 mb-1 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          <span>OpenFour Modular Launch Engine (Fund Preset Studio)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          OpenFour 基金发行工坊
        </h2>
        <p className="text-neutral-400 text-sm mt-1 max-w-2xl">
          把「发单币」变成「发基金」。通过六大模块自由组合底层资产、定价曲线与税费流转逻辑，一键生成符合 OpenFour 标准的 ETF Preset。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: 6-Module Configuration Panels (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Module 1: Token */}
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="text-xs font-mono text-amber-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>01. Token Module (份额代币参数)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">基金代码 (Symbol)</label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono uppercase focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">基金全称 (Name)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-neutral-400 block mb-1">投资理念 / Slogan</label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Module 2: Vault & Basket Selection */}
          <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono text-amber-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>02. Vault Module (多资产篮子与权重配置)</span>
              </div>
              <span className={`text-xs font-mono font-bold ${totalWeight === 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
                当前总权重: {totalWeight}% / 100%
              </span>
            </div>

            {/* Selected tokens list */}
            <div className="space-y-3">
              {selectedTokens.map((item) => (
                <div key={item.symbol} className="flex items-center gap-3 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                  <span className="font-bold font-mono text-sm text-white w-20">${item.symbol}</span>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={item.weight}
                    onChange={(e) => handleWeightChange(item.symbol, parseInt(e.target.value))}
                    className="flex-1 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <span className="font-mono text-xs w-12 text-right text-amber-400 tabular-nums font-semibold">
                    {item.weight}%
                  </span>
                  <button
                    onClick={() => handleRemoveToken(item.symbol)}
                    className="p-1 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Available to add */}
            <div className="pt-2">
              <span className="text-[11px] text-neutral-500 block mb-2 font-mono">从 Four.Meme 毕业币中添加成分币:</span>
              <div className="flex flex-wrap gap-2">
                {availableTokens.map((tok) => {
                  const alreadySelected = selectedTokens.some(t => t.symbol === tok.symbol);
                  return (
                    <button
                      key={tok.symbol}
                      disabled={alreadySelected}
                      onClick={() => handleAddToken(tok.symbol)}
                      className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                        alreadySelected
                          ? 'opacity-40 border-neutral-800 text-neutral-600 cursor-not-allowed'
                          : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                      }`}
                    >
                      <Plus className="w-3 h-3 text-amber-400" />
                      <span>${tok.symbol}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Module 3 & 4: Curve & Trade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="text-xs font-mono text-amber-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>03. Curve Module (定价曲线)</span>
              </div>
              <div className="space-y-2 text-xs">
                {(['NAV-Anchor', 'NAV-Band', 'NAV-Premium', 'NAV-Flat'] as const).map((c) => (
                  <label key={c} className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                    <input
                      type="radio"
                      name="curveType"
                      checked={curveType === c}
                      onChange={() => setCurveType(c)}
                      className="accent-amber-400"
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="text-xs font-mono text-amber-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>04. Trade Module (税费流转)</span>
              </div>
              <div className="space-y-2 text-xs text-neutral-300">
                <div className="flex items-center justify-between">
                  <span>申购费:</span>
                  <span className="font-mono text-white">{subFee}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>赎回费:</span>
                  <span className="font-mono text-white">{redFee}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>二级买卖税:</span>
                  <span className="font-mono text-amber-400 font-bold">{secondaryTax}%</span>
                </div>
                <div className="text-[11px] text-neutral-500 pt-1 border-t border-neutral-800">
                  回流：Vault 40% / 分红 30% / 经理 20% / OpenFour 10%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Deployment Manifest & Action (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">OpenFour Preset 部署清单 (JSON)</h3>
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedJson ? '已复制' : '复制 JSON'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-neutral-300 overflow-x-auto max-h-96">
            <pre className="whitespace-pre">{JSON.stringify(generatedManifest, null, 2)}</pre>
          </div>

          {/* Validation Check */}
          {totalWeight !== 100 && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>底层篮子成分币目标权重合计必须为 100% (当前为 {totalWeight}%)</span>
            </div>
          )}

          {deployedSuccess && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>新基金 ${symbol} 已成功部署至 OpenFourCore 引擎，并同步上线基金超市！</span>
            </div>
          )}

          <button
            onClick={handleDeploy}
            disabled={totalWeight !== 100 || isDeploying}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 ${
              totalWeight === 100 && !isDeploying
                ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-lg cursor-pointer'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            {isDeploying ? (
              <span>正在向 OpenFourCore 注册 Preset...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>部署并创设 ${symbol} 基金 (Deploy to OpenFour)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
