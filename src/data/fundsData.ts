import { Fund } from '../types/fund';

export const INITIAL_FUNDS: Fund[] = [
  {
    id: 'fund-meme-10',
    symbol: 'MEME-10',
    name: 'Top 10 Meme Index Fund',
    slogan: '一键配置 Four.Meme 头部流动性蓝筹',
    category: 'index',
    categoryLabel: '被动指数 / 市值加权',
    riskLevel: '高',
    nav: 2.458,
    navBnb: 0.00396,
    initialNav: 1.000,
    change24h: 8.42,
    change7d: 26.8,
    change30d: 145.8,
    aumUsd: 18450000,
    totalSupply: 7506102,
    creator: {
      name: 'FourFund DAO Treasury',
      address: '0x4F9...A32d',
      verified: true
    },
    investmentGoal: '追踪 Four.Meme 毕业且链上流动性最好的前 10 名 Meme 币整体表现，降低单币 Rug 与极端暴跌风险。',
    subscriptionRules: '注入/取回等值 BNB（由 FundVault 智能路由自动兑换至 10 个成分币），支持一键申赎。',
    rebalanceRules: '每周一 UTC 00:00 执行，当成分币权重偏离目标 >5% 或有新币毕业进入 Top 10 时触发。单币上限 ≤15%。',
    basket: [
      { symbol: 'FROG', name: 'FourFrog', targetWeight: 0.14, currentWeight: 0.146, amountInVault: 142000000, priceUsd: 0.019, change24h: 12.4, color: '#10b981', type: 'meme' },
      { symbol: 'PEPEBNB', name: 'BNB Pepe', targetWeight: 0.13, currentWeight: 0.128, amountInVault: 89000000, priceUsd: 0.0265, change24h: 6.8, color: '#22c55e', type: 'meme' },
      { symbol: 'TST', name: 'Test Four Token', targetWeight: 0.12, currentWeight: 0.124, amountInVault: 55000000, priceUsd: 0.0416, change24h: -3.2, color: '#eab308', type: 'meme' },
      { symbol: 'DOGE4', name: 'Four Doge', targetWeight: 0.11, currentWeight: 0.108, amountInVault: 320000000, priceUsd: 0.0062, change24h: 15.1, color: '#f59e0b', type: 'meme' },
      { symbol: 'SHIB-B', name: 'BNB Shib', targetWeight: 0.10, currentWeight: 0.097, amountInVault: 680000000, priceUsd: 0.0026, change24h: 4.2, color: '#f97316', type: 'meme' },
      { symbol: 'CAT4', name: 'Four Cat', targetWeight: 0.10, currentWeight: 0.102, amountInVault: 42000000, priceUsd: 0.0448, change24h: 9.3, color: '#06b6d4', type: 'meme' },
      { symbol: 'PANDA', name: 'BAMBOO Panda', targetWeight: 0.09, currentWeight: 0.093, amountInVault: 12000000, priceUsd: 0.143, change24h: -1.5, color: '#8b5cf6', type: 'meme' },
      { symbol: 'FLOKIB', name: 'Floki BSC', targetWeight: 0.08, currentWeight: 0.078, amountInVault: 9500000, priceUsd: 0.151, change24h: 2.1, color: '#ec4899', type: 'meme' },
      { symbol: 'APEFOUR', name: 'Four Ape', targetWeight: 0.07, currentWeight: 0.071, amountInVault: 18000000, priceUsd: 0.0727, change24h: 18.4, color: '#3b82f6', type: 'meme' },
      { symbol: 'BNB', name: 'BNB Reserve', targetWeight: 0.06, currentWeight: 0.053, amountInVault: 1573, priceUsd: 620.5, change24h: 1.8, color: '#eab308', type: 'bluechip' }
    ],
    openFourConfig: {
      tokenModule: {
        type: 'fund',
        symbol: 'MEME-10',
        decimals: 18,
        totalSupply: 7506102
      },
      vaultModule: {
        custodyType: 'multi-sig 3/5',
        singleAssetCap: 0.15,
        supportedAssets: ['FROG', 'PEPEBNB', 'TST', 'DOGE4', 'SHIB-B', 'CAT4', 'PANDA', 'FLOKIB', 'APEFOUR', 'BNB'],
        rebalanceCadence: 'Weekly',
        rebalanceThreshold: 0.05
      },
      curveModule: {
        type: 'NAV-Anchor',
        description: '价格强锚定金库资产净值 NAV，杜绝纯情绪 Pump & Dump',
        params: {}
      },
      tradeModule: {
        subscriptionFee: 0.000,
        redemptionFee: 0.005,
        secondaryTax: 0.010,
        taxSplit: {
          vaultReinvest: 1.0,
          holderDividend: 0.0,
          managerFee: 0.0,
          openFourIncentive: 0.0
        },
        maxRedeemPerDay: 0.05
      },
      migrateModule: {
        lifecycle: ['Fundraising', 'Portfolio Building', 'Active Operation', 'Rebalancing', 'Liquidation'],
        currentStage: 'Active Operation'
      },
      customDataModule: {
        oracleType: 'Indexer + Pyth/Chainlink Oracle',
        snapshotFrequency: 'Daily UTC 00:00 Snapshot',
        lastRebalanceTimestamp: '2026-09-22 00:00:00 UTC'
      }
    },
    historicalNav: [
      { date: '09-01', nav: 1.00, volume: 120000 },
      { date: '09-05', nav: 1.18, volume: 340000 },
      { date: '09-10', nav: 1.42, volume: 560000 },
      { date: '09-15', nav: 1.35, volume: 420000 },
      { date: '09-20', nav: 1.88, volume: 890000 },
      { date: '09-25', nav: 2.26, volume: 1100000 },
      { date: '09-28', nav: 2.458, volume: 940000 }
    ]
  },
  {
    id: 'fund-bnb-meme',
    symbol: 'BNB-MEME',
    name: '50/50 Hybrid Allocation Fund',
    slogan: '半仓压舱石 BNB，半仓追逐百倍 Meme',
    category: 'hybrid',
    categoryLabel: '混合配置 / 半被动',
    riskLevel: '中高',
    nav: 1.832,
    navBnb: 0.00295,
    initialNav: 1.000,
    change24h: 3.75,
    change7d: 14.2,
    change30d: 83.2,
    aumUsd: 12600000,
    totalSupply: 6877729,
    creator: {
      name: 'Binance Community Fund Committee',
      address: '0x3B2...519C',
      verified: true
    },
    investmentGoal: '50% BNB 充当底仓安全垫 + 50% 优质精选 Meme 捕获贝塔收益，波动比单币降低 60%，兼顾确定性与弹性。',
    subscriptionRules: '注入 BNB，系统自动 50% 保留为 BNB 储备，50% 均分买入 5 个精选 Meme。',
    rebalanceRules: '每月一次或 BNB 占比偏离 ±10% 时触发再平衡，季度通过社区投票更新 5 个精选币种。',
    basket: [
      { symbol: 'BNB', name: 'Build and Build', targetWeight: 0.50, currentWeight: 0.518, amountInVault: 10520, priceUsd: 620.5, change24h: 1.8, color: '#eab308', type: 'bluechip' },
      { symbol: 'FROG', name: 'FourFrog', targetWeight: 0.10, currentWeight: 0.105, amountInVault: 69500000, priceUsd: 0.019, change24h: 12.4, color: '#10b981', type: 'meme' },
      { symbol: 'PEPEBNB', name: 'BNB Pepe', targetWeight: 0.10, currentWeight: 0.096, amountInVault: 45700000, priceUsd: 0.0265, change24h: 6.8, color: '#22c55e', type: 'meme' },
      { symbol: 'CAT4', name: 'Four Cat', targetWeight: 0.10, currentWeight: 0.098, amountInVault: 27500000, priceUsd: 0.0448, change24h: 9.3, color: '#06b6d4', type: 'meme' },
      { symbol: 'DOGE4', name: 'Four Doge', targetWeight: 0.10, currentWeight: 0.094, amountInVault: 191000000, priceUsd: 0.0062, change24h: 15.1, color: '#f59e0b', type: 'meme' },
      { symbol: 'TST', name: 'Test Token', targetWeight: 0.10, currentWeight: 0.089, amountInVault: 27000000, priceUsd: 0.0416, change24h: -3.2, color: '#ec4899', type: 'meme' }
    ],
    openFourConfig: {
      tokenModule: {
        type: 'hybrid',
        symbol: 'BNB-MEME',
        decimals: 18,
        totalSupply: 6877729
      },
      vaultModule: {
        custodyType: 'governance-vault',
        singleAssetCap: 0.50,
        supportedAssets: ['BNB', 'FROG', 'PEPEBNB', 'CAT4', 'DOGE4', 'TST'],
        rebalanceCadence: 'Monthly',
        rebalanceThreshold: 0.10
      },
      curveModule: {
        type: 'NAV-Band',
        description: '净值波段保护曲线（0.97 ~ 1.30 NAV 溢折价区间限流）',
        params: { bandMin: 0.97, bandMax: 1.30 }
      },
      tradeModule: {
        subscriptionFee: 0.003,
        redemptionFee: 0.003,
        secondaryTax: 0.015,
        taxSplit: {
          vaultReinvest: 0.5,
          holderDividend: 0.5,
          managerFee: 0.0,
          openFourIncentive: 0.0
        },
        minHoldTimeSeconds: 3600
      },
      migrateModule: {
        lifecycle: ['Fundraising', 'Active Operation', 'Rebalancing'],
        currentStage: 'Active Operation'
      },
      customDataModule: {
        oracleType: 'Indexer + Pyth/Chainlink Oracle',
        snapshotFrequency: 'Daily UTC 00:00 Snapshot',
        lastRebalanceTimestamp: '2026-09-01 00:00:00 UTC'
      }
    },
    historicalNav: [
      { date: '09-01', nav: 1.00, volume: 80000 },
      { date: '09-05', nav: 1.10, volume: 150000 },
      { date: '09-10', nav: 1.25, volume: 280000 },
      { date: '09-15', nav: 1.38, volume: 320000 },
      { date: '09-20', nav: 1.55, volume: 460000 },
      { date: '09-25', nav: 1.72, volume: 510000 },
      { date: '09-28', nav: 1.832, volume: 630000 }
    ]
  },
  {
    id: 'fund-ai-punk',
    symbol: 'AI-PUNK',
    name: 'AI × Meme × DeSci Theme Fund',
    slogan: '前沿叙事交叉融合，捕获硅基智慧与去中心化科学红利',
    category: 'thematic',
    categoryLabel: '主题型主动配置',
    riskLevel: '高',
    nav: 3.125,
    navBnb: 0.00503,
    initialNav: 1.000,
    change24h: 118.4,
    change7d: 158.4,
    change30d: 212.5,
    aumUsd: 8750000,
    totalSupply: 2800000,
    creator: {
      name: 'Singularity Labs & DeSci DAO',
      address: '0x88A...710F',
      verified: true
    },
    investmentGoal: '专注挖掘 AI Agent 自主交互、Meme 病毒传播力与 DeSci 链上科研三项前沿赛道的交汇爆发点。',
    subscriptionRules: '公开认购，支持 BNB 或 USDT 自动划转，单日赎回限额不超过金库总资产的 2% 防止挤兑。',
    rebalanceRules: '月度再平衡；若组合中单币单周涨幅突破 25%，系统自动执行部分止盈，收益转入 Vault 准备金。',
    basket: [
      { symbol: 'AGENT-X', name: 'OpenFour AI Agent', targetWeight: 0.20, currentWeight: 0.245, amountInVault: 3500000, priceUsd: 0.612, change24h: 164.5, color: '#38bdf8', type: 'ai' },
      { symbol: 'SYNTH', name: 'Neural Meme', targetWeight: 0.20, currentWeight: 0.188, amountInVault: 18500000, priceUsd: 0.089, change24h: 112.2, color: '#6366f1', type: 'ai' },
      { symbol: 'FROG', name: 'FourFrog', targetWeight: 0.20, currentWeight: 0.192, amountInVault: 88500000, priceUsd: 0.019, change24h: 82.4, color: '#10b981', type: 'meme' },
      { symbol: 'CAT4', name: 'Four Cat', targetWeight: 0.20, currentWeight: 0.185, amountInVault: 36100000, priceUsd: 0.0448, change24h: 79.3, color: '#06b6d4', type: 'meme' },
      { symbol: 'GENOME', name: 'DeSci Genome', targetWeight: 0.10, currentWeight: 0.102, amountInVault: 1200000, priceUsd: 0.743, change24h: 151.8, color: '#ec4899', type: 'desci' },
      { symbol: 'LONGEV', name: 'Longevity Token', targetWeight: 0.10, currentWeight: 0.088, amountInVault: 2400000, priceUsd: 0.321, change24h: 68.6, color: '#a855f7', type: 'desci' }
    ],
    openFourConfig: {
      tokenModule: {
        type: 'theme-managed',
        symbol: 'AI-PUNK',
        decimals: 18,
        totalSupply: 2800000
      },
      vaultModule: {
        custodyType: 'multi-sig 3/5',
        singleAssetCap: 0.25,
        supportedAssets: ['AGENT-X', 'SYNTH', 'FROG', 'CAT4', 'GENOME', 'LONGEV'],
        rebalanceCadence: 'Monthly',
        rebalanceThreshold: 0.05
      },
      curveModule: {
        type: 'NAV-Premium',
        description: 'NAV-Premium 动态溢价曲线（上限最高允许 2.0x NAV 交易，抑制恶意套利挤兑）',
        params: { maxPremium: 2.0 }
      },
      tradeModule: {
        subscriptionFee: 0.005,
        redemptionFee: 0.005,
        secondaryTax: 0.020,
        taxSplit: {
          vaultReinvest: 0.25,
          holderDividend: 0.25,
          managerFee: 0.25,
          openFourIncentive: 0.25
        },
        maxRedeemPerDay: 0.02
      },
      migrateModule: {
        lifecycle: ['Fundraising', 'Portfolio Building', 'Active Operation', 'Rebalancing'],
        currentStage: 'Active Operation'
      },
      customDataModule: {
        oracleType: 'Indexer + Pyth/Chainlink Oracle',
        snapshotFrequency: 'Real-time On-chain Pulse',
        lastRebalanceTimestamp: '2026-09-18 12:00:00 UTC'
      }
    },
    historicalNav: [
      { date: '09-01', nav: 1.00, volume: 50000 },
      { date: '09-05', nav: 1.32, volume: 180000 },
      { date: '09-10', nav: 1.68, volume: 390000 },
      { date: '09-15', nav: 2.15, volume: 580000 },
      { date: '09-20', nav: 2.40, volume: 640000 },
      { date: '09-25', nav: 2.85, volume: 880000 },
      { date: '09-28', nav: 3.125, volume: 1250000 }
    ]
  },
  {
    id: 'fund-kol-alpha',
    symbol: 'KOL-ALPHA',
    name: 'Top KOL Active Alpha Fund',
    slogan: '知名链上 Alpha 猎手操盘，高胜率猎捕早期 Meme',
    category: 'active',
    categoryLabel: '主动管理 / 基金经理制',
    riskLevel: '极高',
    nav: 2.894,
    navBnb: 0.00466,
    initialNav: 1.000,
    change24h: 106.5,
    change7d: 142.6,
    change30d: 189.4,
    aumUsd: 5400000,
    totalSupply: 1865929,
    creator: {
      name: 'CryptoWhale_0x & AlphaTeam',
      address: '0x71E...909B',
      verified: true
    },
    investmentGoal: '由具备 100x 战绩的顶级 Meme KOL 亲自主理，快速调仓捕捉早期流动性与炒作催化剂。',
    subscriptionRules: '白名单优先申购 + 公开阶段，份额锁定 7 天；赎回费依持有时间阶梯递减（1%~3%），保护长线投资者。',
    rebalanceRules: '基金经理可随时发起调仓提案（需满足单币 ≤20%，稳定币 ≥10% 的风控红线），高水位线（HWM）提取 20% 业绩表现费。',
    basket: [
      { symbol: 'PEPEBNB', name: 'BNB Pepe', targetWeight: 0.20, currentWeight: 0.215, amountInVault: 43800000, priceUsd: 0.0265, change24h: 6.8, color: '#22c55e', type: 'meme' },
      { symbol: 'FROG', name: 'FourFrog', targetWeight: 0.20, currentWeight: 0.198, amountInVault: 56300000, priceUsd: 0.019, change24h: 12.4, color: '#10b981', type: 'meme' },
      { symbol: 'CAT4', name: 'Four Cat', targetWeight: 0.18, currentWeight: 0.174, amountInVault: 20900000, priceUsd: 0.0448, change24h: 9.3, color: '#06b6d4', type: 'meme' },
      { symbol: 'ALPHA1', name: 'Whale Alpha Token', targetWeight: 0.16, currentWeight: 0.182, amountInVault: 8500000, priceUsd: 0.116, change24h: 28.5, color: '#eab308', type: 'meme' },
      { symbol: 'USDT', name: 'Tether USD', targetWeight: 0.14, currentWeight: 0.131, amountInVault: 707400, priceUsd: 1.00, change24h: 0.0, color: '#2dd4bf', type: 'stable' },
      { symbol: 'BNB', name: 'BNB Gas Reserve', targetWeight: 0.12, currentWeight: 0.100, amountInVault: 870, priceUsd: 620.5, change24h: 1.8, color: '#f59e0b', type: 'bluechip' }
    ],
    openFourConfig: {
      tokenModule: {
        type: 'active',
        symbol: 'KOL-ALPHA',
        decimals: 18,
        totalSupply: 1865929
      },
      vaultModule: {
        custodyType: 'multi-sig 3/5',
        singleAssetCap: 0.20,
        supportedAssets: ['PEPEBNB', 'FROG', 'CAT4', 'ALPHA1', 'USDT', 'BNB'],
        rebalanceCadence: 'Conditional',
        rebalanceThreshold: 0.08
      },
      curveModule: {
        type: 'NAV-Anchor',
        description: '经理控制型动态曲线，白名单与公开申赎双通道',
        params: {}
      },
      tradeModule: {
        subscriptionFee: 0.010,
        redemptionFee: 0.010,
        secondaryTax: 0.020,
        taxSplit: {
          vaultReinvest: 0.25,
          holderDividend: 0.25,
          managerFee: 0.35,
          openFourIncentive: 0.15
        },
        requiresWhitelist: true,
        lockupPeriodDays: 7,
        performanceFee: 0.20
      },
      migrateModule: {
        lifecycle: ['Fundraising', 'Portfolio Building', 'Active Operation', 'Rebalancing'],
        currentStage: 'Active Operation'
      },
      customDataModule: {
        oracleType: 'Indexer + Pyth/Chainlink Oracle',
        snapshotFrequency: 'Twice Daily Snapshot',
        managerAddress: '0x71E5...909B',
        highWaterMark: 2.894,
        lastRebalanceTimestamp: '2026-09-27 18:30:00 UTC'
      }
    },
    historicalNav: [
      { date: '09-01', nav: 1.00, volume: 95000 },
      { date: '09-05', nav: 1.25, volume: 220000 },
      { date: '09-10', nav: 1.58, volume: 380000 },
      { date: '09-15', nav: 1.95, volume: 510000 },
      { date: '09-20', nav: 2.30, volume: 740000 },
      { date: '09-25', nav: 2.65, volume: 920000 },
      { date: '09-28', nav: 2.894, volume: 810000 }
    ]
  },
  {
    id: 'fund-stable-meme',
    symbol: 'STABLE-MEME',
    name: '80/20 Capital Protected Fund',
    slogan: '80% 稳定币固本保底，20% Meme 搏取超级贝塔',
    category: 'structured',
    categoryLabel: '结构化 / 相对保本型',
    riskLevel: '中低',
    nav: 1.285,
    navBnb: 0.00207,
    initialNav: 1.000,
    change24h: 1.82,
    change7d: 5.64,
    change30d: 28.5,
    aumUsd: 24500000,
    totalSupply: 19066147,
    creator: {
      name: 'SafeYield Quant Protocol',
      address: '0x11D...882E',
      verified: true
    },
    investmentGoal: '以 80% 链上稳定币（USDT/FDUSD）为坚实底层支撑，仅以 20% 仓位分配至 Top 头部 Meme，实现回撤极小、上行有肉。',
    subscriptionRules: '0 申购手续费，0 锁定期，T+0 随申随赎，赎回费仅 0.1%，支持直接提回 USDT。',
    rebalanceRules: '季度或当 Meme 资产总权重涨超 25% 时，自动化合约强制分批止盈并转回稳定币准备金。',
    basket: [
      { symbol: 'USDT', name: 'Tether USD', targetWeight: 0.50, currentWeight: 0.512, amountInVault: 12544000, priceUsd: 1.00, change24h: 0.0, color: '#2dd4bf', type: 'stable' },
      { symbol: 'FDUSD', name: 'First Digital USD', targetWeight: 0.30, currentWeight: 0.294, amountInVault: 7203000, priceUsd: 1.00, change24h: 0.0, color: '#38bdf8', type: 'stable' },
      { symbol: 'FROG', name: 'FourFrog', targetWeight: 0.08, currentWeight: 0.084, amountInVault: 108300000, priceUsd: 0.019, change24h: 12.4, color: '#10b981', type: 'meme' },
      { symbol: 'PEPEBNB', name: 'BNB Pepe', targetWeight: 0.07, currentWeight: 0.065, amountInVault: 60100000, priceUsd: 0.0265, change24h: 6.8, color: '#22c55e', type: 'meme' },
      { symbol: 'CAT4', name: 'Four Cat', targetWeight: 0.05, currentWeight: 0.045, amountInVault: 24600000, priceUsd: 0.0448, change24h: 9.3, color: '#06b6d4', type: 'meme' }
    ],
    openFourConfig: {
      tokenModule: {
        type: 'structured',
        symbol: 'STABLE-MEME',
        decimals: 18,
        totalSupply: 19066147
      },
      vaultModule: {
        custodyType: 'multi-sig 3/5',
        singleAssetCap: 0.50,
        supportedAssets: ['USDT', 'FDUSD', 'FROG', 'PEPEBNB', 'CAT4'],
        rebalanceCadence: 'Quarterly',
        rebalanceThreshold: 0.05
      },
      curveModule: {
        type: 'NAV-Flat',
        description: '平滑保本曲线（0.95 ~ 1.20 NAV 平滑区，无锁仓，极低滑点）',
        params: { bandMin: 0.95, bandMax: 1.20 }
      },
      tradeModule: {
        subscriptionFee: 0.000,
        redemptionFee: 0.001,
        secondaryTax: 0.005,
        taxSplit: {
          vaultReinvest: 0.8,
          holderDividend: 0.2,
          managerFee: 0.0,
          openFourIncentive: 0.0
        },
        minHoldTimeSeconds: 0
      },
      migrateModule: {
        lifecycle: ['Active Operation', 'Rebalancing'],
        currentStage: 'Active Operation'
      },
      customDataModule: {
        oracleType: 'Indexer + Pyth/Chainlink Oracle',
        snapshotFrequency: 'Continuous 15m Index',
        lastRebalanceTimestamp: '2026-09-15 00:00:00 UTC'
      }
    },
    historicalNav: [
      { date: '09-01', nav: 1.00, volume: 150000 },
      { date: '09-05', nav: 1.03, volume: 380000 },
      { date: '09-10', nav: 1.08, volume: 620000 },
      { date: '09-15', nav: 1.14, volume: 910000 },
      { date: '09-20', nav: 1.19, volume: 1200000 },
      { date: '09-25', nav: 1.24, volume: 1400000 },
      { date: '09-28', nav: 1.285, volume: 1750000 }
    ]
  },
  {
    id: 'fund-moon-100x',
    symbol: 'MOON-100X',
    name: 'Sniper & 5x Leveraged Tranche Fund',
    slogan: '内盘毕业 0 区块狙击 + A/B 分级 5x 杠杆 + 动量滚仓，让申购基金拥有百倍爆发力',
    category: 'degen',
    categoryLabel: '百倍暴富引擎 / 分级狙击',
    riskLevel: '极高',
    nav: 14.850,
    navBnb: 0.02393,
    initialNav: 1.000,
    change24h: 142.6,
    change7d: 580.4,
    change30d: 1385.0,
    aumUsd: 9200000,
    totalSupply: 619528,
    creator: {
      name: 'OpenFour MeV Sniper Engine',
      address: '0x000...F00D',
      verified: true
    },
    investmentGoal: '打破传统 ETF 平庸收益！通过 OpenFour Migrate 钩子在新币毕业 0 区块以 $45K 极低市值狙击建仓；叠加 A/B 份额 5 倍零爆仓软杠杆与「砍掉归零币、满仓翻倍龙头」动量调仓，让申购人像抓到百倍金狗一样一夜暴富。',
    subscriptionRules: '支持选择 Senior-A（稳健收息 18% APR）或 Turbo-B（5x 杠杆狂暴份额）；募资头等舱享 0.5x NAV 折价，二级市场允许最高 5x FOMO 溢价交易。',
    rebalanceRules: '反传统「动量滚仓」：跌破 -30% 自动清仓换血，将资金加仓至涨幅前 2 的百倍金狗（单币权重最高允许膨胀至 65% 不强制卖飞）。提前下车收取 15% 纸手税注入钻石手彩池。',
    moonMechanics: {
      enabled: true,
      trancheLeverage: {
        alphaMultiplier: 5.0,
        seniorYieldApr: 18.0
      },
      sniperAutoEntry: {
        blockDelay: 0,
        maxMarketCapEntryUsd: 45000
      },
      momentumRebalance: {
        cutLoserThreshold: -0.30,
        rideWinnerCap: 0.65
      },
      diamondJackpot: {
        earlyExitPenaltyMax: 0.15,
        jackpotPoolBnb: 148.5
      }
    },
    basket: [
      { symbol: 'CZDOG', name: 'Broccoli CZ Dog (Graduated Block 0)', targetWeight: 0.20, currentWeight: 0.542, amountInVault: 420000000, priceUsd: 0.0118, change24h: 380.5, color: '#f59e0b', type: 'meme' },
      { symbol: 'AIPEPE', name: 'DeepSeek Pepe (Graduated Block 0)', targetWeight: 0.20, currentWeight: 0.238, amountInVault: 195000000, priceUsd: 0.0112, change24h: 95.2, color: '#10b981', type: 'ai' },
      { symbol: 'BNBCAT', name: 'Yellow Cat (Sniper Entry)', targetWeight: 0.20, currentWeight: 0.115, amountInVault: 88000000, priceUsd: 0.012, change24h: 34.0, color: '#eab308', type: 'meme' },
      { symbol: 'MARS4', name: 'Four Mars (Momentum Hold)', targetWeight: 0.20, currentWeight: 0.065, amountInVault: 65000000, priceUsd: 0.0092, change24h: -12.4, color: '#ec4899', type: 'meme' },
      { symbol: 'BNB', name: 'Sniper Ammo Reserve', targetWeight: 0.20, currentWeight: 0.040, amountInVault: 593, priceUsd: 620.5, change24h: 1.8, color: '#38bdf8', type: 'bluechip' }
    ],
    openFourConfig: {
      tokenModule: {
        type: 'active',
        symbol: 'MOON-100X',
        decimals: 18,
        totalSupply: 619528
      },
      vaultModule: {
        custodyType: 'timelock-vault',
        singleAssetCap: 0.65,
        supportedAssets: ['CZDOG', 'AIPEPE', 'BNBCAT', 'MARS4', 'BNB'],
        rebalanceCadence: 'Conditional',
        rebalanceThreshold: 0.25
      },
      curveModule: {
        type: 'NAV-Exponential-Bonding',
        description: '头等舱 0.5x 折价认购 + 二级市场最高 5.0x NAV 情绪溢价乘数（双戴维斯双击）',
        params: { bandMin: 0.50, maxPremium: 5.0, earlyBirdDiscount: 0.50 }
      },
      tradeModule: {
        subscriptionFee: 0.005,
        redemptionFee: 0.020,
        secondaryTax: 0.020,
        taxSplit: {
          vaultReinvest: 0.40,
          holderDividend: 0.40,
          managerFee: 0.10,
          openFourIncentive: 0.10
        },
        lockupPeriodDays: 3
      },
      migrateModule: {
        lifecycle: ['Fundraising', 'Portfolio Building', 'Active Operation', 'Rebalancing'],
        currentStage: 'Active Operation'
      },
      customDataModule: {
        oracleType: 'OpenFour Graduation Event Hook',
        snapshotFrequency: 'Every Block Sniper Pulse',
        highWaterMark: 14.850,
        lastRebalanceTimestamp: '12 mins ago (Cut Loser -> Added CZDOG)'
      }
    },
    historicalNav: [
      { date: '09-01', nav: 1.00, volume: 210000 },
      { date: '09-05', nav: 1.85, volume: 540000 },
      { date: '09-10', nav: 3.40, volume: 1200000 },
      { date: '09-15', nav: 5.12, volume: 2300000 },
      { date: '09-20', nav: 8.60, volume: 4100000 },
      { date: '09-25', nav: 11.20, volume: 5800000 },
      { date: '09-28', nav: 14.85, volume: 8900000 }
    ]
  }
];

export const SMART_CONTRACT_BLUEPRINTS = {
  FundVault: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./NavOracle.sol";
import "./FundToken.sol";

/**
 * @title FundVault
 * @notice OpenFour Modular Vault: 多资产托管、申购折算、赎回执行与再平衡
 * @dev 托管底层 ERC-20 与稳定币资产篮子
 */
contract FundVault is AccessControl, ReentrancyGuard {
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant REBALANCER_ROLE = keccak256("REBALANCER_ROLE");

    struct AssetWeight {
        address tokenAddress;
        uint256 targetBasisPoints; // 10000 = 100%
        uint256 currentAmount;
    }

    FundToken public immutable fundToken;
    NavOracle public immutable navOracle;
    
    AssetWeight[] public basket;
    uint256 public singleAssetMaxBps = 1500; // 单币上限 <= 15%
    uint256 public rebalanceDeviationThreshold = 500; // 5% 触发偏差

    event Subscribed(address indexed user, uint256 depositBnb, uint256 sharesMinted);
    event Redeemed(address indexed user, uint256 sharesBurned, uint256 bnbReturned);
    event Rebalanced(uint256 timestamp, uint256 totalAumUsd);

    constructor(address _fundToken, address _navOracle) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        fundToken = FundToken(_fundToken);
        navOracle = NavOracle(_navOracle);
    }

    /// @notice 申购：存入 BNB 自动由 Vault 买入各成分币并 Mint 对应 NAV 份额
    function subscribe() external payable nonReentrant {
        require(msg.value > 0, "Zero BNB deposit");
        uint256 currentNavUsd = navOracle.getLatestNav(); // 18 decimals
        uint256 bnbPriceUsd = navOracle.getBnbPrice();
        
        uint256 depositUsd = (msg.value * bnbPriceUsd) / 1e18;
        uint256 sharesToMint = (depositUsd * 1e18) / currentNavUsd;
        
        // 内部路由按 Basket 权重分配入库
        _distributeToBasket(msg.value);
        fundToken.mint(msg.sender, sharesToMint);

        emit Subscribed(msg.sender, msg.value, sharesToMint);
    }

    /// @notice 赎回：销毁份额，按当前 NAV 与扣除赎回费后返还资产
    function redeem(uint256 shares) external nonReentrant {
        require(fundToken.balanceOf(msg.sender) >= shares, "Insufficient balance");
        fundToken.burn(msg.sender, shares);
        
        uint256 currentNavUsd = navOracle.getLatestNav();
        uint256 bnbPriceUsd = navOracle.getBnbPrice();
        uint256 grossUsd = (shares * currentNavUsd) / 1e18;
        uint256 netUsd = grossUsd * 995 / 1000; // 0.5% 赎回费
        uint256 bnbToSend = (netUsd * 1e18) / bnbPriceUsd;

        (bool success, ) = payable(msg.sender).call{value: bnbToSend}("");
        require(success, "BNB transfer failed");

        emit Redeemed(msg.sender, shares, bnbToSend);
    }

    function _distributeToBasket(uint256 bnbAmount) internal {
        // 由 OpenFour Core DEX 路由执行成分币兑换及入库记账
    }
}`,
  LeveragedTrancheVault: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title LeveragedTrancheVault (百倍暴富引擎核心合约)
 * @notice 实现 A/B 分级杠杆 + OpenFour 毕业 0 区块狙击 + 纸手税彩池 (Diamond Jackpot)
 * @dev 解决传统 ETF 收益被平摊痛点，让 B 份额具备 5x~10x 无爆仓净值爆发力
 */
contract LeveragedTrancheVault is ReentrancyGuard {
    // Senior A 份额：提供 80% 资金，获取固定保底收益
    uint256 public totalSeniorADepositBnb;
    uint256 public constant SENIOR_FIXED_APR_BPS = 1800; // 18% APR

    // Turbo B 份额：提供 20% 资金，享受整池 5 倍收益放大 (无强平插针风险)
    uint256 public totalTurboBShares;
    uint256 public diamondJackpotPoolBnb;

    event SniperExecuted(address indexed graduatedToken, uint256 bnbSpent, uint256 blockNumber);
    event MomentumRolled(address indexed dumpedLoser, address indexed pumpedWinner, uint256 amountReallocated);
    event EarlyExitTaxed(address indexed paperHand, uint256 penaltyToJackpotBnb);

    /// @notice 当 Four.Meme 内盘代币毕业触发 OpenFour Migrate 时，同一区块自动狙击买入
    function onOpenFourTokenGraduated(address newMemeToken, uint256 liquidityBnb) external {
        // 校验流动性与合约安全性后，0区块抢先建仓，锁死 $45K 初始市值筹码
        uint256 snipeBudget = address(this).balance / 10;
        emit SniperExecuted(newMemeToken, snipeBudget, block.number);
    }

    /// @notice 计算 Turbo-B 狂暴份额净值：总金库增值扣除 A 级固定利息后，全部归属 B 级
    function getTurboBNav(uint256 totalVaultValueBnb) public view returns (uint256) {
        if (totalTurboBShares == 0) return 1e18;
        uint256 seniorClaim = totalSeniorADepositBnb;
        require(totalVaultValueBnb > seniorClaim, "Underwaters buffer");
        uint256 residualForTurboB = totalVaultValueBnb - seniorClaim;
        return (residualForTurboB * 1e18) / totalTurboBShares;
    }

    /// @notice 动量滚仓：砍掉跌幅 >30% 的弱势币，将头寸集中加仓给领涨金狗
    function executeMomentumRoll(address loserToken, address winnerToken, uint256 amount) external {
        // 反向打破传统 ETF“卖强补弱”逻辑，实现“截断亏损，让利润奔跑”
        emit MomentumRolled(loserToken, winnerToken, amount);
    }
}`,
  NavOracle: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPriceFeed {
    function getPrice(address token) external view returns (uint256 priceUsd, uint8 decimals);
}

/**
 * @title NavOracle
 * @notice OpenFour Custom Data 模块：多资产实时金库价值汇总与 NAV 计算
 * @dev 规则: NAV = Σ (amount_i × price_i) / totalSupply(FUND)
 */
contract NavOracle {
    IPriceFeed public priceFeed;
    address public fundVault;
    address public fundToken;

    uint256 public constant PRECISION = 1e18;
    uint256 public lastSnapshotNav;
    uint256 public lastSnapshotTimestamp;

    event NavUpdated(uint256 newNav, uint256 aumUsd, uint256 timestamp);

    constructor(address _priceFeed, address _fundVault, address _fundToken) {
        priceFeed = IPriceFeed(_priceFeed);
        fundVault = _fundVault;
        fundToken = _fundToken;
    }

    function getLatestNav() public view returns (uint256) {
        // 读取金库各币种 amount × price
        // 模拟计算公式: AUM_USD / TotalSupply
        return lastSnapshotNav > 0 ? lastSnapshotNav : 1 * PRECISION;
    }

    function getBnbPrice() public view returns (uint256) {
        (uint256 price, ) = priceFeed.getPrice(address(0)); // BNB 预言机
        return price;
    }

    function recordSnapshot(uint256 calculatedAum, uint256 supply) external {
        require(supply > 0, "Empty supply");
        lastSnapshotNav = (calculatedAum * PRECISION) / supply;
        lastSnapshotTimestamp = block.timestamp;
        emit NavUpdated(lastSnapshotNav, calculatedAum, block.timestamp);
    }
}`,
  FundToken: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FundToken
 * @notice OpenFour Token 模块：代表 ETF 基金份额的 ERC-20 资产代币
 * @dev 支持二级交易 1%~2% 税率分流与金库自动化销毁/铸造
 */
contract FundToken is ERC20, Ownable {
    address public vault;
    uint256 public secondaryTaxBps = 100; // 1.0%

    address public dividendPool;
    address public managerWallet;

    constructor(string memory name, string memory symbol, address _vault) 
        ERC20(name, symbol) 
        Ownable(msg.sender) 
    {
        vault = _vault;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == vault, "Only vault can mint");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(msg.sender == vault, "Only vault can burn");
        _burn(from, amount);
    }

    function _update(address from, address to, uint256 value) internal override {
        // 若为二级市场交易 (非申赎 mint/burn)，扣除交易税并分流
        if (from != address(0) && to != address(0) && from != vault && to != vault) {
            uint256 tax = (value * secondaryTaxBps) / 10000;
            uint256 sendAmount = value - tax;
            
            // 0.5% 进 Vault 增厚 NAV, 0.5% 持有人分红池
            super._update(from, vault, tax / 2);
            super._update(from, dividendPool, tax / 2);
            super._update(from, to, sendAmount);
            return;
        }
        super._update(from, to, value);
    }
}`,
  RedeemQueue: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title RedeemQueue
 * @notice 大额赎回排队与 T+1 结算模块 (Anti-Bank Run 机制)
 * @dev 当单日赎回 >2% 时强制进入排队队列，防止极端抛压抽干 DEX 流动性
 */
contract RedeemQueue {
    struct QueueItem {
        address requester;
        uint256 shares;
        uint256 requestTimestamp;
        bool executed;
    }

    QueueItem[] public queue;
    uint256 public constant LOCK_PERIOD = 1 days;

    event Enqueued(uint256 indexed queueId, address requester, uint256 shares);
    event Settled(uint256 indexed queueId, address requester, uint256 settledBnb);

    function enqueueRedemption(uint256 shares) external returns (uint256 queueId) {
        queueId = queue.length;
        queue.push(QueueItem({
            requester: msg.sender,
            shares: shares,
            requestTimestamp: block.timestamp,
            executed: false
        }));
        emit Enqueued(queueId, msg.sender, shares);
    }

    function settle(uint256 queueId) external {
        QueueItem storage item = queue[queueId];
        require(!item.executed, "Already settled");
        require(block.timestamp >= item.requestTimestamp + LOCK_PERIOD, "T+1 Lock pending");
        item.executed = true;
        // 执行金库提现结算
    }
}`,
  FundPreset: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title FundPreset
 * @notice OpenFour 模块化 Launch Engine 预设协议 (Fund Preset Store)
 * @dev 第三方开发者注册自定义 ETF 模板，并从生态衍生基金中持续获取 Royalty
 */
contract FundPreset {
    struct PresetDefinition {
        address creator;
        string presetName;
        uint256 version;
        bytes configBytes; // 6 大模块参数序列化
        uint256 royaltyBps; // 0.5% OpenFour 模块激励
    }

    mapping(bytes32 => PresetDefinition) public presets;

    event PresetRegistered(bytes32 indexed presetHash, address creator, string name);

    function registerPreset(
        string calldata name, 
        bytes calldata config, 
        uint256 royalty
    ) external returns (bytes32 presetHash) {
        require(royalty <= 100, "Max 1% royalty");
        presetHash = keccak256(abi.encodePacked(msg.sender, name, block.timestamp));
        presets[presetHash] = PresetDefinition({
            creator: msg.sender,
            presetName: name,
            version: 1,
            configBytes: config,
            royaltyBps: royalty
        });
        emit PresetRegistered(presetHash, msg.sender, name);
    }
}`
};

