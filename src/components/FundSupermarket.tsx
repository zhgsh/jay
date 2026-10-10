import React, { useState } from 'react';
import { Fund } from '../types/fund';
import { TrendingUp, Shield, Zap, Search, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface FundSupermarketProps {
  funds: Fund[];
  onSelectFund: (fund: Fund) => void;
  onQuickSubscribe: (fund: Fund) => void;
}

export const FundSupermarket: React.FC<FundSupermarketProps> = ({
  funds,
  onSelectFund,
  onQuickSubscribe
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'aum' | 'change24h' | 'change30d' | 'nav'>('aum');

  const filteredFunds = funds
    .filter((fund) => {
      if (activeCategory !== 'all' && fund.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = fund.name.toLowerCase().includes(query);
        const matchesSymbol = fund.symbol.toLowerCase().includes(query);
        const matchesBasket = fund.basket.some((b) => b.symbol.toLowerCase().includes(query));
        return matchesName || matchesSymbol || matchesBasket;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'aum') return b.aumUsd - a.aumUsd;
      if (sortBy === 'change24h') return b.change24h - a.change24h;
      if (sortBy === 'change30d') return b.change30d - a.change30d;
      if (sortBy === 'nav') return b.nav - a.nav;
      return 0;
    });

  const categories = [
    { id: 'all', label: '全部基金 All (6)' },
    { id: 'degen', label: '百倍暴富引擎 100x' },
    { id: 'index', label: '被动指数 Passive' },
    { id: 'hybrid', label: '混合配置 50/50' },
    { id: 'thematic', label: '主题主动 AI/DeSci' },
    { id: 'active', label: 'KOL 主动管理' },
    { id: 'structured', label: '结构化保本' }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 no-print">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-mono text-amber-400 mb-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>OpenFour Fund Supermarket</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Meme 基金超市
          </h2>
          <p className="text-neutral-400 text-sm mt-1 max-w-xl">
            涵盖稳健保本、被动指数到 <strong className="text-amber-400">5x 分级杠杆 + 0区块毕业狙击的百倍暴富基金 ($MOON-100X)</strong>。
          </p>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索基金名称、代码或底层币 (如 FROG)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 sm:w-72 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="aum">按锁仓规模 (AUM)</option>
            <option value="change24h">按24小时涨幅</option>
            <option value="change30d">按30天累计涨幅</option>
            <option value="nav">按基金份额净值 (NAV)</option>
          </select>
        </div>
      </div>

      {/* Interactive filter tabs (Buttons, compliant with Zero-Pill rule) */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-900/90 border border-neutral-800 rounded-xl mb-6 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-neutral-800 text-amber-400 shadow-sm font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Funds Grid */}
      {filteredFunds.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-800 rounded-xl">
          <p className="text-neutral-400 text-sm">未找到符合搜索条件的基金产品</p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="mt-3 text-xs text-amber-400 hover:underline cursor-pointer"
          >
            重置筛选条件
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFunds.map((fund) => {
            const isPositive24h = fund.change24h >= 0;
            return (
              <div
                key={fund.id}
                className="group flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900/80 hover:border-neutral-700 transition-all p-5 shadow-sm"
              >
                <div>
                  {/* Top: Symbol & Metadata */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold font-mono text-white group-hover:text-amber-400 transition-colors">
                          ${fund.symbol}
                        </span>
                        {fund.creator.verified && (
                          <span title="认证发行方">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5">{fund.name}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-neutral-400">{fund.categoryLabel}</div>
                      <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        风险等级: <span className={fund.riskLevel === '极高' ? 'text-rose-400' : fund.riskLevel === '高' ? 'text-amber-400' : 'text-emerald-400'}>{fund.riskLevel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Slogan */}
                  <p className="text-xs text-neutral-300 italic mb-4 line-clamp-1 border-l-2 border-amber-400/60 pl-2">
                    "{fund.slogan}"
                  </p>

                  {/* Primary Performance Figures */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-neutral-800/80 my-3">
                    <div>
                      <div className="text-xs text-neutral-500">份额净值 (NAV)</div>
                      <div className="text-lg font-bold font-mono text-white tabular-nums">
                        ${fund.nav.toFixed(3)}
                      </div>
                      <div className="text-[11px] font-mono text-neutral-400 tabular-nums">
                        ≈ {fund.navBnb.toFixed(5)} BNB
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-neutral-500">24H / 30D 收益</div>
                      <div className={`text-lg font-bold font-mono tabular-nums ${isPositive24h ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive24h ? '+' : ''}{fund.change24h.toFixed(2)}%
                      </div>
                      <div className="text-[11px] font-mono text-emerald-400/80 tabular-nums">
                        +{fund.change30d.toFixed(1)}% 30D
                      </div>
                    </div>
                  </div>

                  {/* Asset Composition Visualizer */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
                      <span>底层资产篮 ({fund.basket.length} 币种)</span>
                      <span className="font-mono tabular-nums text-neutral-500">
                        Top: {fund.basket[0].symbol} ({(fund.basket[0].currentWeight * 100).toFixed(0)}%)
                      </span>
                    </div>

                    {/* Proportional asset bar */}
                    <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden flex">
                      {fund.basket.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: `${item.currentWeight * 100}%`,
                            backgroundColor: item.color
                          }}
                          title={`${item.symbol}: ${(item.currentWeight * 100).toFixed(1)}%`}
                          className="h-full transition-all"
                        />
                      ))}
                    </div>

                    {/* Top 3 asset text badges (unboxed text) */}
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-neutral-400 overflow-hidden">
                      {fund.basket.slice(0, 3).map((item, idx) => (
                        <span key={idx} className="flex items-center gap-1 shrink-0 font-mono">
                          <span
                            className="w-1.5 h-1.5 rounded-full inline-block"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.symbol} {(item.currentWeight * 100).toFixed(0)}%
                        </span>
                      ))}
                      {fund.basket.length > 3 && (
                        <span className="text-neutral-500 font-mono">+{fund.basket.length - 3}</span>
                      )}
                    </div>
                  </div>

                  {/* OpenFour Module Specs */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-400 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/60 font-mono mb-4">
                    <div>
                      <span className="text-neutral-500">Curve:</span> {fund.openFourConfig.curveModule.type}
                    </div>
                    <div>
                      <span className="text-neutral-500">再平衡:</span> {fund.openFourConfig.vaultModule.rebalanceCadence}
                    </div>
                    <div>
                      <span className="text-neutral-500">申赎税:</span> {(fund.openFourConfig.tradeModule.subscriptionFee * 100).toFixed(1)}% / {(fund.openFourConfig.tradeModule.redemptionFee * 100).toFixed(1)}%
                    </div>
                    <div>
                      <span className="text-neutral-500">二级税:</span> {(fund.openFourConfig.tradeModule.secondaryTax * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800/80">
                  <button
                    onClick={() => onSelectFund(fund)}
                    className="flex items-center justify-center gap-1 py-2 px-3 text-xs font-medium text-neutral-300 bg-neutral-800/70 hover:bg-neutral-800 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <span>深度分析</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>

                  <button
                    onClick={() => onQuickSubscribe(fund)}
                    className="flex items-center justify-center gap-1 py-2 px-3 text-xs font-bold text-neutral-950 bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 rounded-lg transition-all cursor-pointer shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5 fill-neutral-950" />
                    <span>⚡ 一键丝滑买 (0 Gas)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
