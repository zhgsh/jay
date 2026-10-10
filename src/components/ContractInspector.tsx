import React, { useState } from 'react';
import { SMART_CONTRACT_BLUEPRINTS } from '../data/fundsData';
import { Code2, Copy, Check, FileCode, ShieldCheck, Terminal } from 'lucide-react';

export const ContractInspector: React.FC = () => {
  const contractNames = Object.keys(SMART_CONTRACT_BLUEPRINTS) as Array<keyof typeof SMART_CONTRACT_BLUEPRINTS>;
  const [selectedContract, setSelectedContract] = useState<keyof typeof SMART_CONTRACT_BLUEPRINTS>('FundVault');
  const [copied, setCopied] = useState(false);

  const activeCode = SMART_CONTRACT_BLUEPRINTS[selectedContract];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const descriptions: Record<string, string> = {
    FundVault: '多资产托管核心，执行申购兑换分发、按权赎回销毁与偏差 >5% 自动化再平衡。',
    LeveragedTrancheVault: '百倍暴富引擎核心合约：实现 A/B 分级 5x 无爆仓软杠杆、OpenFour 毕业 0 区块自动狙击与动量滚仓。',
    NavOracle: 'OpenFour Custom Data 预言机，聚合金库资产价值，按 NAV = Σ (amount_i × price_i) / totalSupply 实时上链。',
    FundToken: 'BEP-20 基金份额代币，原生集成 1%~2% 二级交易税，4-Way 自动分流至金库、分红池、经理与生态。',
    RedeemQueue: '大额赎回排队机制，针对单日 >2% AUM 的巨额赎回执行 T+1 结算，防止抽干流动性引发挤兑。',
    FundPreset: 'OpenFour 模块化预设注册表，允许开发者向平台发布基金模板并终身享有衍生基金的持续 Royalty 分成。'
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 no-print">
      <div className="mb-8">
        <div className="text-xs font-mono text-amber-400 mb-1 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5" />
          <span>Solidity Smart Contract Blueprints (v0.8.24)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          核心智能合约架构草图
        </h2>
        <p className="text-neutral-400 text-sm mt-1 max-w-2xl">
          对应白皮书第五与第六部分。基于 OpenFour 模块化标准编写的 6 款核心智能合约实现草图（含分级杠杆与 0 区块狙击金库）。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Contract Selector Tabs (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono text-neutral-400 font-semibold uppercase">
            选择合约模块 (6 Contracts)
          </div>

          <div className="space-y-2">
            {contractNames.map((name) => (
              <button
                key={name}
                onClick={() => setSelectedContract(name)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedContract === name
                    ? 'bg-neutral-900 border-amber-400/80 shadow-sm'
                    : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-white">{name}.sol</span>
                  {selectedContract === name && (
                    <span className="text-[11px] font-mono text-amber-400">Viewing</span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed font-sans line-clamp-2">
                  {descriptions[name]}
                </p>
              </button>
            ))}
          </div>

          <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>安全与审计规范</span>
            </div>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              严格遵循 OpenZeppelin ReentrancyGuard 防重入、AccessControl 3/5 多签治理及极限回撤熔断。
            </p>
          </div>
        </div>

        {/* Right: Code Viewport (8 cols) */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl bg-neutral-950 border border-neutral-800 overflow-hidden shadow-xl">
          {/* Code Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-900/80">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-xs font-bold text-white">{selectedContract}.sol</span>
              <span className="text-xs text-neutral-500 font-mono">· Solidity 0.8.24</span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制代码' : '复制合约'}</span>
            </button>
          </div>

          {/* Code Body */}
          <div className="p-5 overflow-x-auto text-xs font-mono text-neutral-300 max-h-[580px] overflow-y-auto leading-relaxed selection:bg-amber-400 selection:text-neutral-950">
            <pre className="whitespace-pre">{activeCode}</pre>
          </div>
        </div>
      </div>
    </section>
  );
};
