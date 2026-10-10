export const FULL_WHITEPAPER_MARKDOWN = `# FourFund：基于 OpenFour 的链上 Meme ETF 与基金超市
> **Slogan**: Stop chasing frogs. Start buying the pond.  
> **Base Layer**: OpenFour Modular Launch Engine (Four.Meme)  
> **Chain**: BNB Chain  
> **文档版本**: v1.0 (2026-09-28)  

---

## 第一部分：背景与愿景

### 1.1 从发射器到基础设施
Four.Meme 正从「Meme 发射器」转型为「Meme 发射基础设施」。其核心升级 **OpenFour** 不是一个新的 Launchpad，而是一个模块化 Launch Engine：
* 将 Token Launch 拆解为 **Token / Vault / Curve / Trade / Migrate / Custom Data** 六个独立模块
* 由 **OpenFourCore** 统一协调执行
* 第三方开发者可基于 SDK/API 创造自定义玩法

### 1.2 为什么 Meme 需要基金层？
* **90% 的 Meme 归零**，但头部 Meme 仍有巨大财富效应
* 散户研究门槛高、FOMO 接盘、无法分散风险
* 传统 Launchpad 只支持单币 vs BNB，无法表达“一篮子资产”的复杂性
* OpenFour 的模块化让“基金型发射”首次成为可能

### 1.3 产品定义
**FourFund** 是基于 OpenFour 的链上 Meme 基金协议：将多个币作为底层资产装入 Vault，新发 Token 作为“基金份额”，价格由多资产 NAV 决定，交易税回流金库，再平衡和赎回全部模块化。

---

## 第二部分：核心机制 —— 多资产篮子配对（Basket-Backed Token）

### 2.1 模型定义
新发 Token \`$FUND\` 与 N 个底层币组成配对关系：
\`\`\`text
Basket = [BNB, USDT, CAKE, MemeA, MemeB, AITokenC, ...]
权重   = [w1,   w2,   w3,   w4,    w5,    w6,    ...]

NAV = Σ (amount_i × price_i) / totalSupply(FUND)
用户申购 = 向 Vault 注入资产篮 → Mint $FUND
用户赎回 = Burn $FUND → 按权重从 Vault 取回资产
\`\`\`

### 2.2 OpenFour 模块映射
| 模块 | 基金玩法中的用途 |
| :--- | :--- |
| **Token** | 发行 fund / basket-backed / redeemable 类型份额代币 |
| **Vault** | 多资产托管：ERC-20、LP Token、稳定币混合存放 |
| **Curve** | NAV-Curve：价格围绕 NAV 波动，告别纯情绪 Pump |
| **Trade** | 拆分“申赎通道”与“二级市场交易”，限购/锁仓/税费分流 |
| **Migrate** | 生命周期：募资期 → 建仓期 → 运作期 → 清算/再平衡 |
| **Custom Data** | 链上存储 NAV、持仓权重、经理地址、业绩费、快照 |

### 2.3 费用与激励循环
以典型配置为例（可自定义）：
* **申购费**：0 - 1%
* **赎回费**：0.5 - 1%
* **二级买卖税**：1 - 2%
  * 0.5% → Vault 再投资（增厚 NAV）
  * 0.5% → 持有人分红
  * 0.5% → 基金经理 / 策略开发者
  * 0.5% → OpenFour 模块创作者激励

---

## 第三部分：FourFund 白皮书提纲

### 0. 摘要
基于 OpenFour 模块化引擎，将“多资产篮子”封装为新 Token 的链上 Meme 基金协议。把“发 Meme”变成“发基金”，把“买 Meme”变成“买 ETF 份额”。

### 1. 引言：为什么 Meme 需要 ETF？
（详见第一部分 1.2，解决单币归零率高、FOMO 接盘与缺乏组合管理问题）

### 2. 技术底座：OpenFour 如何支撑链上基金
（详见第二部分 2.2，六大模块解耦组合）

### 3. 核心机制：Basket-Backed Token (BBT)
多资产金库质押、动态 NAV 折算及按权申赎机制。

### 4. 产品矩阵：Meme 基金超市
提供涵盖被动指数、混合平衡、AI叙事、KOL主动管理及稳健结构化产品。

### 5. 关键机制详解
* **NAV Oracle**：Indexer + 预言机喂价，每日更新净值快照
* **再平衡**：每周/每月自动调整权重，偏差 >5% 触发
* **防作恶**：多签 Vault（3/5）、单币权重上限 ≤15%、大额赎回队列 T+1、极端行情熔断（回撤 >25% 暂停申购）
* **透明披露**：所有持仓、交易记录、经理历史业绩上链可查

### 6. 开发者生态：基金超市协议
* **Fund Preset Store**：开发者发布自定义基金模板
* **Royalty 机制**：别人复用你的 Preset 创建基金，你获得持续分成
* **前端集成**：钱包、DEX 聚合器、行情网站可接入 FourFund 协议
* **Launchpad as a Service**：其他平台可基于 OpenFour 搭建自己的基金发射器

### 7. 代币经济学（可选）
* **平台币 $FOUR**：费用折扣、治理投票、质押获得高级基金认购资格
* **基金币 $FUND**：代表基金份额，可交易、可赎回、可质押生息

### 8. 路线图
* **Phase 1**：基础指数基金上线（$MEME-10），验证 NAV 机制
* **Phase 2**：开放主动管理型基金创建（KOL 入驻）
* **Phase 3**：引入期权/保险模块，支持对冲基金
* **Phase 4**：跨链资产篮子，成为多链 Meme 资产管理标准

### 9. 风险警告
Meme 市场极端波动，基金净值可能大幅回撤；智能合约风险；非保本产品；部分区域可能受限。

---

## 第四部分：产品矩阵 —— 五款基金说明书

### 基金一：$MEME-10 —— Four.Meme 毕业币 Top 10 指数基金
* **基金类型**：被动指数 / 市值加权
* **投资目标**：追踪 Four.Meme 毕业且流动性最好的前 10 名 Meme 币整体表现
* **底层资产**：动态 Top 10，单币 ≤15%，示例：FROG 14%、PEPEBNB 13%、TST 12% 等
* **申购/赎回**：注入/取回等值 BNB（Vault 自动兑换）
* **费用**：申购 0% / 赎回 0.5% / 二级税 1%（全进 Vault）
* **再平衡**：每周一 UTC 00:00，偏差 >5% 触发
* **风险**：高
* **OpenFour 配置**：\`type=fund, basket-backed | nav-anchor curve | buy/sellTax=1% | weekly rebalance\`

### 基金二：$BNB-MEME —— 50/50 混合配置基金
* **基金类型**：混合配置 / 半被动
* **投资目标**：50% BNB + 50% 精选 Meme，降低波动同时保留上行空间
* **底层资产**：BNB 50% + 5 个精选 Meme 各 10%（季度社区投票更新）
* **申购/赎回**：注入 BNB，50% 自动保留，50% 买入 Meme
* **费用**：申购 0.3% / 赎回 0.3% / 二级税 1.5%
* **再平衡**：每月一次，BNB 占比偏离 ±10% 触发
* **风险**：中高
* **OpenFour 配置**：\`type=hybrid | nav-band curve (0.97~1.3) | minHoldTime=1h\`

### 基金三：$AI-PUNK —— AI × Meme × DeSci 主题基金
* **基金类型**：主题型主动配置
* **投资目标**：捕捉 AI Agent + Meme 文化 + DeSci 交叉叙事红利
* **底层资产**：AI 40% + Meme 40% + DeSci 20%，共 8-12 个币
* **费用**：申购 0.5% / 赎回 0.5% / 二级税 2%
* **再平衡**：月度 + 单币涨超 25% 自动部分止盈
* **风险**：高
* **OpenFour 配置**：\`type=theme-managed | nav-premium (max 2x) | maxRedeemPerDay=2%\`

### 基金四：$KOL-ALPHA —— KOL 主动管理基金
* **基金类型**：主动管理 / 基金经理制
* **投资目标**：由知名 KOL 管理，捕捉早期 Alpha，收业绩费
* **底层资产**：5-8 个币，经理决定，单币 ≤20%，稳定币 ≥10%
* **申购**：白名单 + 公开轮
* **赎回**：锁仓 7 天，赎回费按持有时间递减（1%-3%）
* **费用**：申购 1% / 业绩费 20%（High Water Mark）
* **风险**：中高（依赖经理能力）
* **OpenFour 配置**：\`type=active, manager-controlled | whitelist=true | lockup=7d | hwm\`

### 基金五：$STABLE-MEME —— 稳健型结构化产品
* **基金类型**：结构化 / 保本型（相对）
* **投资目标**：80% 稳定币 + 20% Meme，几乎不亏本金前提下捕捉上行
* **底层资产**：稳定币 80% + 2-3 个 Top Meme 各 5-10%
* **费用**：申购 0% / 赎回 0.1% / 二级税 0.5%
* **再平衡**：季度，Meme 超 25% 自动止盈回稳定币
* **风险**：中低
* **OpenFour 配置**：\`type=structured, stable-heavy | nav-flat (0.95~1.2) | noLockup\`

### 基金六：$MOON-100X —— 0区块毕业狙击与 5x 分级狂暴基金
* **基金类型**：分级杠杆 / 内盘毕业狙击 / 动量滚仓
* **投资目标**：打破传统 ETF 收益被平摊的痛点，让基金申购人同样享受单币百倍的一夜暴富效应
* **五大暴富机制**：
  1. **A/B 分级软杠杆（Tranche Leverage）**：A 级稳健份额拿 18% APR 固定收益，B 级狂暴份额（Turbo-B）以 20% 资金撬动整池 100% 仓位，自带 **5x 无插针爆仓软杠杆**。
  2. **0 区块毕业狙击（Sniper Vault）**：利用 OpenFour Migrate 钩子，在内盘币打满毕业同一区块（市值 ~$45K）自动抢先建仓，吃到散户买不到的 10x~100x 第一波主升浪。
  3. **反传统「动量滚仓」（Momentum Roll）**：传统 ETF 卖掉暴涨币补仓下跌币（削峰填谷）；本基金反向操作——跌破 -30% 自动止损清仓，把资金全部加仓给领涨金狗（单币权重最高允许膨胀至 65%）。
  4. **头等舱折价 + 二级溢价双击（Bonding + Premium）**：创设募资期支持 0.5x NAV 折价认购，二级市场允许最高 5.0x NAV 情绪溢价交易（底层涨 10 倍 × 溢价 3 倍 = 30 倍回报）。
  5. **纸手税与钻石手暴富彩池（Diamond Hand Jackpot）**：提前赎回或恐慌抛售收取最高 15% 纸手罚金注入彩池，当基金净值每突破整数倍（2x / 5x / 10x）时，向锁仓钻石手空投巨额 BNB 彩池。

---

## 第五部分：开发者实现路径

### 5.1 合约模块草图
1. **FundVault.sol**：多资产托管、申购/赎回执行、再平衡
2. **LeveragedTrancheVault.sol**：A/B 分级杠杆、0 区块毕业狙击、动量滚仓与钻石手彩池
3. **NavOracle.sol**：读取 Vault 资产价值，计算 NAV
4. **FundToken.sol**：份额 Token，支持分红/赎回/Burn
5. **RedeemQueue.sol**：大额赎回排队与 T+1 结算
6. **FundPreset.sol**：OpenFour Preset 注册与参数校验

### 5.2 前端需求
* **基金超市主页**：展示所有基金 NAV、收益率、回撤、持仓
* **百倍暴富引擎实验室**：模拟普通等权 ETF vs 动量滚仓 + 5x B级杠杆 + 0区块狙击的收益倍数对比
* **详情页**：净值曲线、持仓饼图、经理简介、A/B 份额申购/赎回面板
* **管理后台**：经理调仓界面、多签审批、Custom Data 上链

### 5.3 接入方
* **钱包**（显示基金持仓和 NAV）
* **DEX 聚合器**（支持 FUND 交易对）
* **行情网站**（基金净值 API）
* **其他 Launchpad**（基于 OpenFour 搭建自己的基金发射器）

---

## 第六部分：专题设计 —— 如何让申购基金的人也能像买 Meme 一样一夜暴富？

> **核心痛点**：传统 ETF 的本质是「分散风险、均值回归」。如果篮子里有 10 个币，1 个涨了 100 倍，另外 9 个归零，传统等权基金只会涨 10 倍——甚至因为每周强制再平衡（卖掉暴涨币去补仓归零币），最终收益只有 2~3 倍。这无法满足 Meme 玩家追求「一夜暴富」的多巴胺需求。

基于 OpenFour 的六大模块，FourFund 独创 **「五维非对称暴富引擎（Moon Mode Mechanics）」**：

| 机制维度 | 传统 ETF 做法（平庸收益） | FourFund 暴富引擎做法（百倍爆发） | OpenFour 支撑模块 |
| :--- | :--- | :--- | :--- |
| **1. 调仓逻辑** | **均值回归**：卖掉翻倍金狗，补仓装死归零币 | **动量滚仓（Winner-Takes-All）**：跌超 30% 自动斩仓，资金全仓追入领涨龙头（单币上限放宽至 65%） | \`Vault\` + \`Custom Data\` |
| **2. 资金结构** | **平权份额**：所有持有人平摊收益 | **A/B 分级杠杆（Tranche）**：A 份额拿稳健 18% APR；B 份额（Turbo）出 20% 钱独享全池超额涨幅（**5x 无爆仓杠杆**） | \`Token\` + \`Vault\` |
| **3. 建仓时机** | **二级接盘**：等币上了 DEX 站稳高市值才买 | **0 区块内盘狙击（Sniper）**：绑定 \`Migrate\` 模块，新币从 Four.Meme 毕业瞬间（$45K 市值）同区块买入 | \`Migrate\` |
| **4. 定价曲线** | **严格锚定 1.0x NAV**：无情绪溢价空间 | **头等舱折价 + 溢价双击**：募资期 0.5x 认购，二级市场允许 3x~5x FOMO 溢价，实现戴维斯双击 | \`Curve\` |
| **5. 博弈分配** | **固定低赎回费**：随时进出无博弈 | **纸手税 & 钻石手彩池**：提前下车罚没 5%~15% 归入 Jackpot，基金净值翻倍时全额奖励给锁仓者 | \`Trade\` |

---

## 第七部分：FOMO 级「一键买基金」架构 —— 链抽象与 Web2 级零门槛支付

> **工程哲学**：如同 FOMO 的「一键买币」，FourFund 的「一键买基金」并非依赖单一黑科技，也不是重复造轮子自研所有底层，而是通过精密编排 **Privy、Crossmint、Relay、Pimlico** 四大行业顶尖中间件，把「创建钱包、法币入金、跨链桥接、授权签名、兑换 10 个底层 Meme 币、准备 BNB 矿工费」等繁琐步骤彻底封装，向用户交付 **1.6 秒丝滑成交、零助记词、零 Gas 费、任意法币/多链资产直付** 的 Web2 级体验。

### 7.1 四大核心中间件协同架构
| 环节 | 集成组件 | 解决的 Web3 痛点 | 在 FourFund 中的具体职责 |
| :--- | :--- | :--- | :--- |
| **1. 账户与会话层** | **Privy** | 助记词繁琐、每次交易反复弹窗签名 | 支持 Apple / Google / X 社交账号秒级登录，后台自动派生 MPC 嵌入式钱包与 ERC-4337 智能账户，并通过 **Session Keys（会话密钥）** 实现免弹窗静默签名。 |
| **2. 法币入金层** | **Crossmint** | 散户没有加密货币、CEX 买币提币需 T+1 等待 | 提供 **Apple Pay / Google Pay / Visa 信用卡** 一键直购通道，完成合规清结算并在链上直接向 OpenFour 金库交付等值稳定币/BNB。 |
| **3. 跨链意图层** | **Relay Protocol** | 用户钱在 Solana / Base / Arbitrum，跨链桥慢且贵 | 基于 **Intent Solver（意图求解器）** 架构，用户在 Solana 扣除 USDC 的同一秒，Relay 节点在 BNB Chain 直接垫付 BNB 进入基金金库，实现 ~1.2 秒无感跨链。 |
| **4. 账户抽象与免 Gas 层** | **Pimlico** | 买币前必须先去买 BNB 当 Gas 费、多币兑换需签 10 次名 | **Pimlico Verifying Paymaster** 全额代付 BNB Gas 费（用户端显示 \`$0.00 Gas\`），并通过 **ERC-4337 Bundler** 将「入金 + 多币种按权重建仓 + 铸造 $FUND 份额」打包为单笔原子交易（Single Atomic UserOperation）。 |

### 7.2 用户端「一键买基金」全链路时序（总耗时 ~1.6 秒）
1. **点击金额（0ms）**：用户在基金卡片点击「⚡ 一键丝滑买 \`$250\`」，选择 **Apple Pay** 或 **Solana USDC**。
2. **Privy 静默鉴权（180ms）**：通过设备 FaceID / Passkey 唤醒 Session Key，无需浏览器插件钱包确认。
3. **Crossmint / Relay 瞬时垫付（650ms）**：法币或跨链资金由 Solver 节点在 BNB Chain 即刻垫付为原生 BNB。
4. **Pimlico 原子打包与免 Gas 执行（420ms）**：Paymaster 替用户支付矿工费，Bundler 调用 \`OpenFourCore.batchSubscribe()\`。
5. **OpenFour 份额到账（350ms）**：金库自动按权重购入底层一篮子 Meme 币，\`$FUND\` 份额直接存入用户 Privy 账户，全程仅需 **1 次点击**。

---

## 结语
Four.Meme 不再只是发射 Meme 的地方，而是 Meme 资本配置的操作系统。
通过 OpenFour，我们不仅把“怎么发币”变成了“怎么发基金”，更通过分级杠杆与 FOMO 级链抽象一键支付，让散户像刷短视频购物一样丝滑买进百倍 Meme 基金。
欢迎来到 **Meme 2.0：从炒作到配置，从发射到管理**。
`;

export interface WhitepaperSection {
  id: string;
  title: string;
  subtitle: string;
  partNumber: string;
  highlights: string[];
}

export const WHITEPAPER_SECTIONS: WhitepaperSection[] = [
  {
    id: 'part-1',
    partNumber: '第一部分',
    title: '背景与愿景',
    subtitle: '从单币发射到基金级基础设施升级',
    highlights: [
      'OpenFour 模块化 Launch Engine：Token, Vault, Curve, Trade, Migrate, Custom Data',
      '解决 90% Meme 归零与散户高门槛痛点',
      '产品定位：基于 OpenFour 的链上 Meme 基金协议'
    ]
  },
  {
    id: 'part-2',
    partNumber: '第二部分',
    title: '核心机制 —— 多资产篮子配对',
    subtitle: 'Basket-Backed Token 与 NAV 定价模型',
    highlights: [
      'NAV = Σ (amount_i × price_i) / totalSupply(FUND)',
      'OpenFour 6 大模块功能映射与解耦',
      '全生命周期激励与税费闭环：再投资 / 分红 / 经理 / 模块激励'
    ]
  },
  {
    id: 'part-3',
    partNumber: '第三部分',
    title: 'FourFund 白皮书全景提纲',
    subtitle: '治理、预言机、风控与四阶段路线图',
    highlights: [
      'NAV Oracle 与偏差 >5% 自动再平衡机制',
      '风控四重屏障：3/5 多签、≤15% 单币上限、T+1 大额队列、回撤熔断',
      '开发者生态：Fund Preset Store 与持续分成机制'
    ]
  },
  {
    id: 'part-4',
    partNumber: '第四部分',
    title: '产品矩阵 —— 六款基金说明书',
    subtitle: '$MEME-10, $BNB-MEME, $AI-PUNK, $KOL-ALPHA, $STABLE-MEME, $MOON-100X',
    highlights: [
      '$MEME-10：毕业币 Top 10 市值加权被动指数',
      '$MOON-100X：0区块毕业狙击 + A/B 分级 5x 软杠杆 + 动量滚仓暴富基金',
      '$AI-PUNK / $KOL-ALPHA / $STABLE-MEME 满足全风险谱系'
    ]
  },
  {
    id: 'part-5',
    partNumber: '第五部分',
    title: '开发者实现路径与生态集成',
    subtitle: '核心智能合约矩阵与多方接入标准',
    highlights: [
      '6 大合约草图：含 LeveragedTrancheVault 分级杠杆与毕业狙击合约',
      '前端四大面板：基金超市、百倍暴富引擎模拟器、详情深度图、发行工坊',
      '钱包、DEX 聚合器、行情终端一键接入 API'
    ]
  },
  {
    id: 'part-6',
    partNumber: '第六部分',
    title: '专题：如何让申购基金也能一夜暴富？',
    subtitle: '五维非对称暴富引擎（Moon Mode Mechanics）',
    highlights: [
      '动量滚仓（Winner-Takes-All）：砍掉归零币，全仓追入百倍龙头，拒绝卖强补弱',
      'A/B 分级软杠杆：A 份额收固定利息，B 份额享 5x~10x 无插针爆仓净值放大',
      '0 区块内盘毕业狙击 + 头等舱折价与二级溢价戴维斯双击 + 钻石手 Jackpot'
    ]
  },
  {
    id: 'part-7',
    partNumber: '第七部分',
    title: 'FOMO 级「一键买基金」链抽象架构',
    subtitle: 'Privy + Crossmint + Relay + Pimlico 无缝编排',
    highlights: [
      'Privy 嵌入式 MPC 账户与 Passkey 会话密钥：告别助记词与反复弹窗签名',
      'Crossmint 法币直通车 + Relay 意图跨链：Apple Pay / Solana USDC 1.2 秒直买 BNB 基金',
      'Pimlico ERC-4337 Paymaster：0 Gas 费代付 + 单笔原子打包配齐 10 个底层 Meme 币'
    ]
  }
];

export function downloadMarkdownFile(filename = 'FourFund_Whitepaper.md', content = FULL_WHITEPAPER_MARKDOWN) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

