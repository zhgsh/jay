import React, { useState } from 'react';
import {
  Download,
  Copy,
  Printer,
  Check,
  BookOpen,
  FileText,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import {
  FULL_WHITEPAPER_MARKDOWN,
  WHITEPAPER_SECTIONS,
  downloadMarkdownFile
} from '../data/whitepaperData';
import { Fund } from '../types/fund';

interface WhitepaperReaderProps {
  funds: Fund[];
  onSelectFundFromDoc: (fundId: string) => void;
}

export const WhitepaperReader: React.FC<WhitepaperReaderProps> = ({
  funds,
  onSelectFundFromDoc
}) => {
  const [copied, setCopied] = useState(false);
  const [activePart, setActivePart] = useState<string>('all');

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(FULL_WHITEPAPER_MARKDOWN);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Top Action Bar (Download & Export focus) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-neutral-900 border border-neutral-800 mb-8 no-print shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <BookOpen className="w-3.5 h-3.5" />
            <span>FourFund Official Whitepaper & Specification v1.0</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            白皮书全景文档与产品说明书
          </h2>
          <p className="text-xs text-neutral-400">
            已整合文章分析、开发者视角、多资产配对机制、白皮书提纲及 5 份基金说明书。
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => downloadMarkdownFile('FourFund_Whitepaper.md', FULL_WHITEPAPER_MARKDOWN)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shadow"
          >
            <Download className="w-4 h-4" />
            <span>下载 FourFund_Whitepaper.md</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '已复制 Markdown 全文' : '一键复制全文'}</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors cursor-pointer"
            title="浏览器快捷打印并保存为 PDF"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>导出 / 打印 PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Table of Contents (3 cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4 no-print">
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <div className="text-xs font-mono text-neutral-400 font-semibold uppercase tracking-wider">
              文档目录导航 (Table of Contents)
            </div>

            <div className="space-y-1 text-xs">
              <a
                href="#part-0"
                className="flex items-center justify-between p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
              >
                <span>基本信息与产品定位</span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
              </a>

              <a
                href="#part-1"
                className="flex items-center justify-between p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
              >
                <span>第一部分：背景与愿景</span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
              </a>

              <a
                href="#part-2"
                className="flex items-center justify-between p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
              >
                <span>第二部分：核心多资产篮子机制</span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
              </a>

              <a
                href="#part-3"
                className="flex items-center justify-between p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
              >
                <span>第三部分：白皮书全景提纲</span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
              </a>

              <a
                href="#part-4"
                className="flex items-center justify-between p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
              >
                <span>第四部分：五款基金说明书</span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
              </a>

              <a
                href="#part-5"
                className="flex items-center justify-between p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
              >
                <span>第五部分：开发者实现与接入</span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
              </a>
            </div>
          </div>

          {/* Quick Fund Prospectuses List */}
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <div className="text-xs font-mono text-neutral-400 font-semibold uppercase tracking-wider">
              5 份基金独立说明书下载
            </div>
            <div className="space-y-2">
              {funds.map((f) => (
                <div key={f.id} className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-neutral-800/40">
                  <span className="font-mono font-bold text-white">${f.symbol}</span>
                  <button
                    onClick={() => onSelectFundFromDoc(f.id)}
                    className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>查看 / 申赎</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Rendered Document Viewport (8 cols) */}
        <div className="lg:col-span-8 bg-neutral-900/30 border border-neutral-800 rounded-2xl p-6 sm:p-10 space-y-12 text-neutral-200 leading-relaxed font-sans shadow-sm">
          {/* Header Block */}
          <section id="part-0" className="border-b border-neutral-800 pb-8 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <span>FourFund Protocol</span>
              <span aria-hidden="true">·</span>
              <span>BNB Chain</span>
              <span aria-hidden="true">·</span>
              <span>v1.0 (2026-09-28)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              FourFund：基于 OpenFour 的链上 Meme ETF 与基金超市
            </h1>
            <p className="text-base text-neutral-400 font-mono">
              —— 产品、机制与技术全景文档
            </p>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2 text-xs font-mono">
              <div className="text-amber-400 font-bold text-sm">
                Slogan: Stop chasing frogs. Start buying the pond.
              </div>
              <div className="text-neutral-400">
                Base Layer: OpenFour Modular Launch Engine (Four.Meme)
              </div>
              <div className="text-neutral-400">
                Settlement Chain: BNB Chain (BEP-20)
              </div>
            </div>
          </section>

          {/* Section 1 */}
          <section id="part-1" className="space-y-4 pt-4">
            <div className="text-xs font-mono text-amber-400 font-semibold uppercase">
              第一部分
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              背景与愿景
            </h2>

            <div className="space-y-3 text-sm text-neutral-300">
              <h3 className="text-base font-semibold text-white">1.1 从发射器到基础设施</h3>
              <p>
                Four.Meme 正从「Meme 发射器」转型为「Meme 发射基础设施」。其核心升级 <strong>OpenFour</strong> 不是一个新的 Launchpad，而是一个模块化 Launch Engine：
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-neutral-300">
                <li>将 Token Launch 拆解为 <strong>Token / Vault / Curve / Trade / Migrate / Custom Data</strong> 六个独立模块</li>
                <li>由 <strong>OpenFourCore</strong> 统一协调执行</li>
                <li>第三方开发者可基于 SDK/API 创造自定义玩法</li>
              </ul>

              <h3 className="text-base font-semibold text-white pt-2">1.2 为什么 Meme 需要基金层？</h3>
              <ul className="list-disc list-inside space-y-1 pl-2 text-neutral-300">
                <li><strong>90% 的 Meme 归零</strong>，但头部 Meme 仍有巨大财富效应</li>
                <li>散户研究门槛高、FOMO 接盘、无法分散风险</li>
                <li>传统 Launchpad 只支持单币 vs BNB，无法表达“一篮子资产”的复杂性</li>
                <li>OpenFour 的模块化让“基金型发射”首次成为可能</li>
              </ul>

              <h3 className="text-base font-semibold text-white pt-2">1.3 产品定义</h3>
              <p className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-neutral-200">
                <strong>FourFund</strong> 是基于 OpenFour 的链上 Meme 基金协议：将多个币作为底层资产装入 Vault，新发 Token 作为“基金份额”，价格由多资产 NAV 决定，交易税回流金库，再平衡和赎回全部模块化。
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="part-2" className="space-y-4 pt-6 border-t border-neutral-800/80">
            <div className="text-xs font-mono text-amber-400 font-semibold uppercase">
              第二部分
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              核心机制 —— 多资产篮子配对 (Basket-Backed Token)
            </h2>

            <div className="space-y-4 text-sm text-neutral-300">
              <h3 className="text-base font-semibold text-white">2.1 模型定义</h3>
              <p>新发 Token $FUND 与 N 个底层币组成配对关系：</p>
              
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 overflow-x-auto">
                <pre>{`Basket = [BNB, USDT, CAKE, MemeA, MemeB, AITokenC, ...]
权重   = [w1,   w2,   w3,   w4,    w5,    w6,    ...]

NAV = Σ (amount_i × price_i) / totalSupply(FUND)
用户申购 = 向 Vault 注入资产篮 → Mint $FUND
用户赎回 = Burn $FUND → 按权重从 Vault 取回资产`}</pre>
              </div>

              <h3 className="text-base font-semibold text-white pt-2">2.2 OpenFour 模块映射</h3>
              <div className="overflow-x-auto border border-neutral-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-950 font-mono text-neutral-400 border-b border-neutral-800">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">模块</th>
                      <th className="py-2.5 px-4 font-semibold">基金玩法中的用途</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300 font-sans">
                    <tr>
                      <td className="py-2.5 px-4 font-bold font-mono text-amber-400">Token</td>
                      <td className="py-2.5 px-4">发行 fund / basket-backed / redeemable 类型份额代币</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold font-mono text-amber-400">Vault</td>
                      <td className="py-2.5 px-4">多资产托管：ERC-20、LP Token、稳定币混合存放</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold font-mono text-amber-400">Curve</td>
                      <td className="py-2.5 px-4">NAV-Curve：价格围绕 NAV 波动，告别纯情绪 Pump</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold font-mono text-amber-400">Trade</td>
                      <td className="py-2.5 px-4">拆分“申赎通道”与“二级市场交易”，限购/锁仓/税费分流</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold font-mono text-amber-400">Migrate</td>
                      <td className="py-2.5 px-4">生命周期：募资期 → 建仓期 → 运作期 → 清算/再平衡</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold font-mono text-amber-400">Custom Data</td>
                      <td className="py-2.5 px-4">链上存储 NAV、持仓权重、经理地址、业绩费、快照</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-base font-semibold text-white pt-2">2.3 费用与激励循环</h3>
              <p>以典型配置为例（可自定义）：</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                  <div className="text-neutral-500">一级市场申赎</div>
                  <div className="text-white mt-1">申购费：0 - 1%</div>
                  <div className="text-white">赎回费：0.5 - 1%</div>
                </div>
                <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                  <div className="text-neutral-500">二级市场买卖税 (1 - 2%)</div>
                  <div className="text-neutral-300 mt-1">· 0.5% → Vault 再投资（增厚 NAV）</div>
                  <div className="text-neutral-300">· 0.5% → 持有人分红</div>
                  <div className="text-neutral-300">· 0.5% → 基金经理/策略开发者</div>
                  <div className="text-neutral-300">· 0.5% → OpenFour 模块创作者激励</div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="part-3" className="space-y-4 pt-6 border-t border-neutral-800/80">
            <div className="text-xs font-mono text-amber-400 font-semibold uppercase">
              第三部分
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              FourFund 白皮书全景提纲
            </h2>

            <div className="space-y-3 text-sm text-neutral-300">
              <div>
                <h4 className="font-semibold text-white">0. 摘要</h4>
                <p className="text-xs text-neutral-400">基于 OpenFour 模块化引擎，将“多资产篮子”封装为新 Token 的链上 Meme 基金协议。把“发 Meme”变成“发基金”，把“买 Meme”变成“买 ETF 份额”。</p>
              </div>

              <div>
                <h4 className="font-semibold text-white">1. 引言：为什么 Meme 需要 ETF？</h4>
                <p className="text-xs text-neutral-400">分散单币归零风险、降低用户投研门槛，避免 FOMO 追高。</p>
              </div>

              <div>
                <h4 className="font-semibold text-white">2. 技术底座：OpenFour 如何支撑链上基金</h4>
                <p className="text-xs text-neutral-400">解耦 Token、Vault、Curve、Trade、Migrate、Custom Data 六大模块。</p>
              </div>

              <div>
                <h4 className="font-semibold text-white">3. 核心机制：Basket-Backed Token (BBT)</h4>
                <p className="text-xs text-neutral-400">动态 NAV Oracle 折算与按权申赎销毁。</p>
              </div>

              <div>
                <h4 className="font-semibold text-white">4. 产品矩阵：Meme 基金超市</h4>
                <p className="text-xs text-neutral-400">指数型、攻守平衡型、叙事主题型、KOL主动型、保本结构化型。</p>
              </div>

              <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <h4 className="font-semibold text-amber-400">5. 关键机制详解 (风控与安全)</h4>
                <ul className="list-disc list-inside text-xs space-y-1 text-neutral-300">
                  <li><strong>NAV Oracle</strong>：Indexer + 预言机喂价，每日更新净值快照</li>
                  <li><strong>再平衡</strong>：每周/每月自动调整权重，偏差 &gt;5% 触发</li>
                  <li><strong>防作恶</strong>：多签 Vault（3/5）、单币权重上限 &le;15%、大额赎回队列 T+1、极端行情熔断（回撤 &gt;25% 暂停申购）</li>
                  <li><strong>透明披露</strong>：所有持仓、交易记录、经理历史业绩上链可查</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white">6. 开发者生态：基金超市协议</h4>
                <p className="text-xs text-neutral-400">Fund Preset Store、Royalty 分成、钱包与 DEX 聚合器 API、Launchpad as a Service。</p>
              </div>

              <div>
                <h4 className="font-semibold text-white">7. 代币经济学（可选）</h4>
                <p className="text-xs text-neutral-400">平台币 $FOUR（治理/折扣/质押）与 基金份额币 $FUND（份额证明/分红/赎回）。</p>
              </div>

              <div>
                <h4 className="font-semibold text-white">8. 四阶段发展路线图</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="p-2 bg-neutral-950 rounded border border-neutral-800">Phase 1: 基础指数基金上线 ($MEME-10)</div>
                  <div className="p-2 bg-neutral-950 rounded border border-neutral-800">Phase 2: 开放 KOL 主动管理型基金</div>
                  <div className="p-2 bg-neutral-950 rounded border border-neutral-800">Phase 3: 引入期权/对冲对冲基金</div>
                  <div className="p-2 bg-neutral-950 rounded border border-neutral-800">Phase 4: 多链跨链 Meme 资产管理标准</div>
                </div>
              </div>

              <div className="p-3 bg-rose-950/20 border border-rose-900/50 rounded-lg text-xs text-rose-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>9. 风险警告</strong>：Meme 市场极端波动，基金净值可能大幅回撤；智能合约可能存在未知漏洞；非保本产品；部分受限司法管辖区用户请遵守当地法规。
                </span>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section id="part-4" className="space-y-6 pt-6 border-t border-neutral-800/80">
            <div className="text-xs font-mono text-amber-400 font-semibold uppercase">
              第四部分
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              产品矩阵 —— 五款基金说明书
            </h2>

            <div className="space-y-6">
              {funds.map((f, i) => (
                <div key={f.id} className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-amber-400 font-bold">基金 {i + 1}</span>
                      <span className="text-base font-bold text-white">${f.symbol}</span>
                      <span className="text-xs text-neutral-400">—— {f.name}</span>
                    </div>
                    <button
                      onClick={() => onSelectFundFromDoc(f.id)}
                      className="px-2.5 py-1 text-xs bg-amber-400 text-neutral-950 font-semibold rounded hover:bg-amber-300 transition-colors cursor-pointer"
                    >
                      去申购
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-neutral-300">
                    <div><strong>基金类型</strong>: {f.categoryLabel}</div>
                    <div><strong>风险等级</strong>: {f.riskLevel}</div>
                    <div className="sm:col-span-2"><strong>投资目标</strong>: {f.investmentGoal}</div>
                    <div className="sm:col-span-2"><strong>底层资产</strong>: {f.basket.map(b => `${b.symbol} ${(b.targetWeight * 100).toFixed(0)}%`).join(' + ')}</div>
                    <div><strong>申赎费用</strong>: 申购 {(f.openFourConfig.tradeModule.subscriptionFee * 100)}% / 赎回 {(f.openFourConfig.tradeModule.redemptionFee * 100)}%</div>
                    <div><strong>二级买卖税</strong>: {(f.openFourConfig.tradeModule.secondaryTax * 100)}%</div>
                    <div className="sm:col-span-2"><strong>再平衡规则</strong>: {f.rebalanceRules}</div>
                  </div>

                  <div className="p-2.5 bg-neutral-900 rounded font-mono text-[11px] text-amber-400/90 border border-neutral-800">
                    OpenFour 配置: type={f.openFourConfig.tokenModule.type} | {f.openFourConfig.curveModule.type.toLowerCase()} curve | buy/sellTax={(f.openFourConfig.tradeModule.secondaryTax * 100)}% | {f.openFourConfig.vaultModule.rebalanceCadence.toLowerCase()} rebalance
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5 */}
          <section id="part-5" className="space-y-4 pt-6 border-t border-neutral-800/80">
            <div className="text-xs font-mono text-amber-400 font-semibold uppercase">
              第五部分
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              开发者实现路径
            </h2>

            <div className="space-y-4 text-sm text-neutral-300">
              <h3 className="text-base font-semibold text-white">5.1 核心合约模块草图</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                  <span className="text-amber-400 font-bold">1. FundVault.sol</span>
                  <div className="text-neutral-400 mt-1">多资产托管、申购/赎回执行、再平衡</div>
                </div>
                <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                  <span className="text-amber-400 font-bold">2. NavOracle.sol</span>
                  <div className="text-neutral-400 mt-1">读取 Vault 资产价值，计算实时 NAV</div>
                </div>
                <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                  <span className="text-amber-400 font-bold">3. FundToken.sol</span>
                  <div className="text-neutral-400 mt-1">份额代币，支持二级交易税与金库销毁</div>
                </div>
                <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                  <span className="text-amber-400 font-bold">4. RedeemQueue.sol</span>
                  <div className="text-neutral-400 mt-1">大额赎回排队与 T+1 防挤兑结算</div>
                </div>
                <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 sm:col-span-2">
                  <span className="text-amber-400 font-bold">5. FundPreset.sol</span>
                  <div className="text-neutral-400 mt-1">OpenFour Preset 注册、参数校验与持续分成</div>
                </div>
              </div>

              <h3 className="text-base font-semibold text-white pt-2">5.2 前端需求与生态接入方</h3>
              <p className="text-xs text-neutral-400">
                支持钱包展示 NAV、DEX 聚合器接入 FUND 交易对、行情网站接入 API 以及其他 Launchpad 基于 OpenFour 搭建自己的 Meme 基金发射器。
              </p>
            </div>
          </section>

          {/* Conclusion */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-neutral-800 space-y-3">
            <h3 className="text-lg font-bold text-white">结语</h3>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Four.Meme 不再只是发射 Meme 的地方，而是 Meme 资本配置的操作系统。
              通过 OpenFour，我们把“怎么发币”变成了“怎么发基金”。
            </p>
            <div className="text-amber-400 font-bold font-mono text-sm">
              欢迎来到 Meme 2.0：从炒作到配置，从发射到管理。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
