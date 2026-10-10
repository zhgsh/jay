import React, { useState } from 'react';
import { INITIAL_FUNDS } from './data/fundsData';
import { Fund, UserHolding } from './types/fund';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FundSupermarket } from './components/FundSupermarket';
import { FundDetailModal } from './components/FundDetailModal';
import { NavSimulator } from './components/NavSimulator';
import { FundBuilder } from './components/FundBuilder';
import { WhitepaperReader } from './components/WhitepaperReader';
import { ContractInspector } from './components/ContractInspector';
import { WalletDrawer } from './components/WalletDrawer';
import { MoonEngineLab } from './components/MoonEngineLab';
import { OneClickBuyModal } from './components/OneClickBuyModal';
import { DomainDeployModal } from './components/DomainDeployModal';
import { downloadMarkdownFile } from './data/whitepaperData';
import { Download, FileText, ArrowRight, Flame, Globe } from 'lucide-react';

export default function App() {
  const [funds, setFunds] = useState<Fund[]>(INITIAL_FUNDS);
  const [activeTab, setActiveTab] = useState<'supermarket' | 'moonlab' | 'simulator' | 'builder' | 'contracts' | 'whitepaper'>('supermarket');
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [quickBuyFund, setQuickBuyFund] = useState<Fund | null>(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isDomainDeployOpen, setIsDomainDeployOpen] = useState(false);

  // User simulated BNB wallet state
  const [walletBalance, setWalletBalance] = useState({
    bnb: 28.5,
    usdt: 4200.0
  });

  const [userHoldings, setUserHoldings] = useState<UserHolding[]>([
    {
      fundId: 'fund-moon-100x',
      shares: 120.0,
      avgBuyNav: 6.40,
      accumulatedDividends: 46.8
    },
    {
      fundId: 'fund-meme-10',
      shares: 450.0,
      avgBuyNav: 1.52,
      accumulatedDividends: 32.4
    },
    {
      fundId: 'fund-bnb-meme',
      shares: 300.0,
      avgBuyNav: 1.50,
      accumulatedDividends: 18.2
    }
  ]);

  // Execute trade (subscribe or redeem) with optional yieldMultiplier (e.g. 3x in Turbo Mode)
  const handleExecuteTrade = (
    fundId: string,
    type: 'subscribe' | 'redeem',
    bnbAmount: number,
    sharesAmount: number,
    yieldMultiplier: number = 1
  ): boolean => {
    const targetFund = funds.find((f) => f.id === fundId);
    if (!targetFund) return false;

    // Simulate NAV movement impact scaled by yieldMultiplier (e.g. 3x when Turbo Mode is enabled)
    const baseNavReturnRatio = (targetFund.nav - targetFund.initialNav) / targetFund.initialNav;
    const effectiveNav =
      yieldMultiplier > 1
        ? targetFund.initialNav * (1 + baseNavReturnRatio * yieldMultiplier)
        : targetFund.nav;

    if (type === 'subscribe') {
      if (walletBalance.bnb < bnbAmount) return false;
      setWalletBalance((prev) => ({ ...prev, bnb: prev.bnb - bnbAmount }));

      // Update holdings
      setUserHoldings((prev) => {
        const existing = prev.find((h) => h.fundId === fundId);
        if (existing) {
          const totalShares = existing.shares + sharesAmount;
          const weightedNav = (existing.shares * existing.avgBuyNav + sharesAmount * effectiveNav) / totalShares;
          return prev.map((h) => (h.fundId === fundId ? { ...h, shares: totalShares, avgBuyNav: weightedNav } : h));
        } else {
          return [
            ...prev,
            {
              fundId,
              shares: sharesAmount,
              avgBuyNav: effectiveNav,
              accumulatedDividends: 0
            }
          ];
        }
      });

      // Update fund total supply, AUM, and simulated NAV movement amplified by yieldMultiplier
      setFunds((prev) =>
        prev.map((f) => {
          if (f.id === fundId) {
            const addedUsd = bnbAmount * 620.5;
            const navMomentumBump = (addedUsd / Math.max(100000, f.aumUsd)) * 0.05 * yieldMultiplier;
            const updatedNav = Number((f.nav * (1 + navMomentumBump)).toFixed(4));
            const updatedNavBnb = Number((updatedNav / 620.5).toFixed(5));
            const updatedChange24h = Number((f.change24h + navMomentumBump * 100 * yieldMultiplier).toFixed(2));
            const updatedFund: Fund = {
              ...f,
              nav: updatedNav,
              navBnb: updatedNavBnb,
              change24h: updatedChange24h,
              totalSupply: f.totalSupply + sharesAmount,
              aumUsd: f.aumUsd + addedUsd
            };
            if (selectedFund?.id === fundId) {
              setSelectedFund(updatedFund);
            }
            return updatedFund;
          }
          return f;
        })
      );
      return true;
    } else {
      // Redeem
      setWalletBalance((prev) => ({ ...prev, bnb: prev.bnb + bnbAmount }));

      setUserHoldings((prev) =>
        prev.map((h) => {
          if (h.fundId === fundId) {
            return { ...h, shares: Math.max(0, h.shares - sharesAmount) };
          }
          return h;
        })
      );

      setFunds((prev) =>
        prev.map((f) => {
          if (f.id === fundId) {
            const deductedUsd = sharesAmount * effectiveNav;
            const navRedeemImpact = (deductedUsd / Math.max(100000, f.aumUsd)) * 0.02 * yieldMultiplier;
            const updatedNav = Number(Math.max(0.1, f.nav * (1 - navRedeemImpact)).toFixed(4));
            const updatedNavBnb = Number((updatedNav / 620.5).toFixed(5));
            const updatedFund: Fund = {
              ...f,
              nav: updatedNav,
              navBnb: updatedNavBnb,
              totalSupply: Math.max(1, f.totalSupply - sharesAmount),
              aumUsd: Math.max(1000, f.aumUsd - deductedUsd)
            };
            if (selectedFund?.id === fundId) {
              setSelectedFund(updatedFund);
            }
            return updatedFund;
          }
          return f;
        })
      );
      return true;
    }
  };

  // FOMO-style One-Click Purchase Handler (Crossmint / Relay / Pimlico / Privy)
  const handleCompleteOneClickPurchase = (
    fundId: string,
    usdAmount: number,
    sharesMinted: number,
    paymentSource: 'apple_pay' | 'card' | 'solana_usdc' | 'base_eth' | 'bnb_wallet',
    enableTurbo: boolean
  ) => {
    const bnbEquivalent = usdAmount / 620.5;
    if (paymentSource === 'bnb_wallet') {
      setWalletBalance((prev) => ({ ...prev, bnb: Math.max(0, prev.bnb - bnbEquivalent) }));
    } else if (paymentSource === 'solana_usdc') {
      setWalletBalance((prev) => ({ ...prev, usdt: Math.max(0, prev.usdt - usdAmount) }));
    }

    const targetFund = funds.find((f) => f.id === fundId);
    if (!targetFund) return;

    const multiplier = enableTurbo ? 3 : 1;
    const baseReturnRatio = (targetFund.nav - targetFund.initialNav) / targetFund.initialNav;
    const effectiveNav =
      multiplier > 1
        ? targetFund.initialNav * (1 + baseReturnRatio * multiplier)
        : targetFund.nav;

    setUserHoldings((prev) => {
      const existing = prev.find((h) => h.fundId === fundId);
      if (existing) {
        const totalShares = existing.shares + sharesMinted;
        const weightedNav =
          (existing.shares * existing.avgBuyNav + sharesMinted * effectiveNav) / totalShares;
        return prev.map((h) =>
          h.fundId === fundId ? { ...h, shares: totalShares, avgBuyNav: weightedNav } : h
        );
      } else {
        return [
          ...prev,
          {
            fundId,
            shares: sharesMinted,
            avgBuyNav: effectiveNav,
            accumulatedDividends: 0
          }
        ];
      }
    });

    setFunds((prev) =>
      prev.map((f) => {
        if (f.id === fundId) {
          const navMomentumBump = (usdAmount / Math.max(100000, f.aumUsd)) * 0.05 * multiplier;
          const updatedNav = Number((f.nav * (1 + navMomentumBump)).toFixed(4));
          const updatedNavBnb = Number((updatedNav / 620.5).toFixed(5));
          const updatedChange24h = Number(
            (f.change24h + navMomentumBump * 100 * multiplier).toFixed(2)
          );
          const updatedFund: Fund = {
            ...f,
            nav: updatedNav,
            navBnb: updatedNavBnb,
            change24h: updatedChange24h,
            totalSupply: f.totalSupply + sharesMinted,
            aumUsd: f.aumUsd + usdAmount
          };
          if (quickBuyFund?.id === fundId) {
            setQuickBuyFund(updatedFund);
          }
          return updatedFund;
        }
        return f;
      })
    );
  };

  const handleFaucet = () => {
    setWalletBalance((prev) => ({
      bnb: prev.bnb + 5.0,
      usdt: prev.usdt + 1000.0
    }));
  };

  const handleClaimDividends = (fundId: string) => {
    const holding = userHoldings.find((h) => h.fundId === fundId);
    if (!holding || holding.accumulatedDividends <= 0) return;
    const div = holding.accumulatedDividends;
    setWalletBalance((prev) => ({ ...prev, usdt: prev.usdt + div }));
    setUserHoldings((prev) =>
      prev.map((h) => (h.fundId === fundId ? { ...h, accumulatedDividends: 0 } : h))
    );
  };

  const handleFundCreated = (newFund: Fund) => {
    setFunds([newFund, ...funds]);
    setActiveTab('supermarket');
    setSelectedFund(newFund);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-400 selection:text-neutral-950">
      {/* Universal 3-Zone Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletBalance={walletBalance}
        onOpenWallet={() => setIsWalletOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'supermarket' && (
          <>
            <Hero
              funds={funds}
              onSelectFund={(f) => setQuickBuyFund(f)}
              onExplore={() => {
                const el = document.getElementById('supermarket-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenSimulator={() => setActiveTab('moonlab')}
              onOpenWhitepaper={() => setActiveTab('whitepaper')}
              onOpenDomainDeploy={() => setIsDomainDeployOpen(true)}
            />
            <div id="supermarket-section">
              <FundSupermarket
                funds={funds}
                onSelectFund={(f) => setSelectedFund(f)}
                onQuickSubscribe={(f) => {
                  setQuickBuyFund(f);
                }}
              />
            </div>
          </>
        )}

        {activeTab === 'moonlab' && (
          <MoonEngineLab
            onOpenMoonFund={() => {
              const moonFund = funds.find((f) => f.id === 'fund-moon-100x') || funds[0];
              setQuickBuyFund(moonFund);
            }}
            onNavigateBuilder={() => setActiveTab('builder')}
          />
        )}

        {activeTab === 'simulator' && <NavSimulator initialFunds={funds} />}

        {activeTab === 'builder' && <FundBuilder onFundCreated={handleFundCreated} />}

        {activeTab === 'contracts' && <ContractInspector />}

        {activeTab === 'whitepaper' && (
          <WhitepaperReader
            funds={funds}
            onSelectFundFromDoc={(id) => {
              const matched = funds.find((f) => f.id === id);
              if (matched) setSelectedFund(matched);
            }}
          />
        )}
      </main>

      {/* Fund Detail / Prospectus / Trade Modal */}
      {selectedFund && (
        <FundDetailModal
          fund={selectedFund}
          onClose={() => setSelectedFund(null)}
          walletBalance={walletBalance}
          userHoldings={userHoldings}
          onExecuteTrade={handleExecuteTrade}
        />
      )}

      {/* FOMO-Style One-Click Express Buy Modal (Crossmint + Privy + Relay + Pimlico) */}
      {quickBuyFund && (
        <OneClickBuyModal
          fund={quickBuyFund}
          onClose={() => setQuickBuyFund(null)}
          walletBalance={walletBalance}
          onCompletePurchase={handleCompleteOneClickPurchase}
        />
      )}

      {/* Custom Domain Zero-Server Deployment Center (ai42.top) */}
      <DomainDeployModal
        isOpen={isDomainDeployOpen}
        onClose={() => setIsDomainDeployOpen(false)}
        defaultDomain="ai42.top"
      />

      {/* User Simulated BNB Chain Wallet Drawer */}
      <WalletDrawer
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        walletBalance={walletBalance}
        userHoldings={userHoldings}
        funds={funds}
        onFaucet={handleFaucet}
        onClaimDividends={handleClaimDividends}
        onSelectFund={(f) => setSelectedFund(f)}
      />

      {/* Print Document View (Hidden on screen, visible only when user clicks print / export PDF) */}
      <div className="hidden print-only p-8 text-black bg-white">
        <h1 className="text-2xl font-bold mb-2">FourFund：基于 OpenFour 的链上 Meme ETF 与基金超市</h1>
        <div className="text-xs mb-4">Slogan: Stop chasing frogs. Start buying the pond. · Base: OpenFour Modular Launch Engine · Chain: BNB Chain</div>
        <p className="text-sm leading-relaxed mb-4">
          文档版本: v1.0 (2026-09-28)
        </p>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-8 px-4 sm:px-6 text-xs text-neutral-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-300">FourFund Protocol</span>
            <span aria-hidden="true">·</span>
            <span>Stop chasing frogs. Start buying the pond.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setIsDomainDeployOpen(true)}
              className="text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>绑定域名 ai42.top (免服务器)</span>
            </button>
            <button
              onClick={() => downloadMarkdownFile()}
              className="text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载 FourFund_Whitepaper.md</span>
            </button>
            <button
              onClick={() => setActiveTab('whitepaper')}
              className="hover:text-neutral-300 transition-colors cursor-pointer"
            >
              在线白皮书
            </button>
            <button
              onClick={() => setActiveTab('contracts')}
              className="hover:text-neutral-300 transition-colors cursor-pointer"
            >
              合约代码
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
