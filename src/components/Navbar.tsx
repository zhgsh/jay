import React from 'react';
import { Download, Wallet, BookOpen, Layers, Sliders, ShoppingBag, Code2, Flame } from 'lucide-react';
import { downloadMarkdownFile } from '../data/whitepaperData';

interface NavbarProps {
  activeTab: 'supermarket' | 'moonlab' | 'simulator' | 'builder' | 'contracts' | 'whitepaper';
  setActiveTab: (tab: 'supermarket' | 'moonlab' | 'simulator' | 'builder' | 'contracts' | 'whitepaper') => void;
  walletBalance: { bnb: number; usdt: number };
  onOpenWallet: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  walletBalance,
  onOpenWallet
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('supermarket')}
          className="flex items-center gap-2 group text-left cursor-pointer"
        >
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
            FourFund
          </span>
          <span className="text-xs text-neutral-500 font-mono hidden sm:inline">
            · OpenFour ETF
          </span>
        </button>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
          <button
            onClick={() => setActiveTab('supermarket')}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1 ${
              activeTab === 'supermarket'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>基金超市</span>
          </button>

          <button
            onClick={() => setActiveTab('moonlab')}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1 ${
              activeTab === 'moonlab'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>百倍暴富引擎</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1 ${
              activeTab === 'simulator'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>NAV 预言机模拟</span>
          </button>

          <button
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1 ${
              activeTab === 'builder'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>OpenFour 发行工坊</span>
          </button>

          <button
            onClick={() => setActiveTab('contracts')}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1 ${
              activeTab === 'contracts'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>合约蓝图</span>
          </button>

          <button
            onClick={() => setActiveTab('whitepaper')}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1 ${
              activeTab === 'whitepaper'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>白皮书全文</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => downloadMarkdownFile()}
            title="一键下载 FourFund_Whitepaper.md"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">下载白皮书 (.md)</span>
            <span className="sm:hidden">.md</span>
          </button>

          <button
            onClick={onOpenWallet}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-amber-400 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-600/40 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">{walletBalance.bnb.toFixed(2)} BNB</span>
          </button>
        </div>
      </div>
      
      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-around border-t border-neutral-800/80 px-2 py-2 bg-neutral-950 text-xs">
        <button
          onClick={() => setActiveTab('supermarket')}
          className={`px-2 py-1 ${activeTab === 'supermarket' ? 'text-amber-400 font-semibold' : 'text-neutral-400'}`}
        >
          超市
        </button>
        <button
          onClick={() => setActiveTab('moonlab')}
          className={`px-2 py-1 ${activeTab === 'moonlab' ? 'text-amber-400 font-semibold' : 'text-amber-400/80'}`}
        >
          百倍引擎
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-2 py-1 ${activeTab === 'simulator' ? 'text-amber-400 font-semibold' : 'text-neutral-400'}`}
        >
          预言机
        </button>
        <button
          onClick={() => setActiveTab('builder')}
          className={`px-2 py-1 ${activeTab === 'builder' ? 'text-amber-400 font-semibold' : 'text-neutral-400'}`}
        >
          工坊
        </button>
        <button
          onClick={() => setActiveTab('contracts')}
          className={`px-2 py-1 ${activeTab === 'contracts' ? 'text-amber-400 font-semibold' : 'text-neutral-400'}`}
        >
          合约
        </button>
        <button
          onClick={() => setActiveTab('whitepaper')}
          className={`px-2 py-1 ${activeTab === 'whitepaper' ? 'text-amber-400 font-semibold' : 'text-neutral-400'}`}
        >
          白皮书
        </button>
      </div>
    </header>
  );
};

