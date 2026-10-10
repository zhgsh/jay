export interface AssetItem {
  symbol: string;
  name: string;
  targetWeight: number; // e.g. 0.14 for 14%
  currentWeight: number; // can fluctuate
  amountInVault: number; // tokens
  priceUsd: number;
  change24h: number;
  color: string;
  icon?: string;
  type: 'meme' | 'bluechip' | 'stable' | 'ai' | 'desci';
}

export interface OpenFourConfig {
  tokenModule: {
    type: 'fund' | 'basket-backed' | 'redeemable' | 'hybrid' | 'theme-managed' | 'active' | 'structured';
    symbol: string;
    decimals: number;
    totalSupply: number;
  };
  vaultModule: {
    custodyType: 'multi-sig 3/5' | 'timelock-vault' | 'governance-vault';
    singleAssetCap: number; // e.g. 0.15 = 15%
    supportedAssets: string[];
    rebalanceCadence: 'Weekly' | 'Monthly' | 'Quarterly' | 'Conditional';
    rebalanceThreshold: number; // e.g. 0.05 = 5%
  };
  curveModule: {
    type: 'NAV-Anchor' | 'NAV-Band' | 'NAV-Premium' | 'NAV-Flat' | 'NAV-Exponential-Bonding';
    description: string;
    params: {
      bandMin?: number;
      bandMax?: number;
      maxPremium?: number;
      earlyBirdDiscount?: number;
    };
  };
  tradeModule: {
    subscriptionFee: number; // 0 - 0.01
    redemptionFee: number; // 0.001 - 0.01
    secondaryTax: number; // 0.005 - 0.02
    taxSplit: {
      vaultReinvest: number;
      holderDividend: number;
      managerFee: number;
      openFourIncentive: number;
    };
    minHoldTimeSeconds?: number;
    maxRedeemPerDay?: number; // e.g. 0.02 = 2% of vault
    requiresWhitelist?: boolean;
    lockupPeriodDays?: number;
    performanceFee?: number; // e.g. 0.20 = 20% HWM
  };
  migrateModule: {
    lifecycle: ('Fundraising' | 'Portfolio Building' | 'Active Operation' | 'Rebalancing' | 'Liquidation')[];
    currentStage: string;
  };
  customDataModule: {
    oracleType: 'Indexer + Pyth/Chainlink Oracle' | 'Internal TWAP + Offchain Indexer' | 'OpenFour Graduation Event Hook';
    snapshotFrequency: string;
    managerAddress?: string;
    highWaterMark?: number;
    lastRebalanceTimestamp: string;
  };
}

export interface MoonModeMechanics {
  enabled: boolean;
  trancheLeverage?: {
    alphaMultiplier: number; // e.g. 5x
    seniorYieldApr: number; // e.g. 18%
  };
  sniperAutoEntry?: {
    blockDelay: number; // 0 = same block upon Four.Meme graduation
    maxMarketCapEntryUsd: number; // e.g. $50,000
  };
  momentumRebalance?: {
    cutLoserThreshold: number; // e.g. -0.30 (-30%)
    rideWinnerCap: number; // e.g. 0.65 (allow single winner up to 65% before trimming)
  };
  diamondJackpot?: {
    earlyExitPenaltyMax: number; // e.g. 0.15 (15% paper hand tax)
    jackpotPoolBnb: number;
  };
}

export interface Fund {
  id: string;
  symbol: string;
  name: string;
  slogan: string;
  category: 'index' | 'hybrid' | 'thematic' | 'active' | 'structured' | 'degen';
  categoryLabel: string;
  riskLevel: '中低' | '中' | '中高' | '高' | '极高';
  nav: number; // Current NAV in USD
  navBnb: number;
  initialNav: number;
  change24h: number;
  change7d: number;
  change30d: number;
  aumUsd: number;
  totalSupply: number;
  creator: {
    name: string;
    address: string;
    verified: boolean;
    avatar?: string;
  };
  basket: AssetItem[];
  openFourConfig: OpenFourConfig;
  moonMechanics?: MoonModeMechanics;
  investmentGoal: string;
  subscriptionRules: string;
  rebalanceRules: string;
  historicalNav: { date: string; nav: number; volume: number }[];
}

export interface UserHolding {
  fundId: string;
  shares: number;
  avgBuyNav: number;
  accumulatedDividends: number;
  trancheType?: 'Standard' | 'Senior-A' | 'Turbo-B (5x)';
}

