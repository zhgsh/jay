# Live Whale Alert Horizontal Ticker

Add a real-time horizontally scrolling **Live Whale Alert** ticker across the top of the Hero section to broadcast simulated large institutional and whale buy orders (such as `"Whale just bought 500 BNB of fund-moon-100x!"`), amplifying high-stakes on-chain market activity and FOMO momentum.

## User Review & Critical Decisions

> [!IMPORTANT]
> The clarifying questions were skipped, so this plan adopts the recommended high-visibility defaults below. Please review and click **Proceed** to build, or share any adjustments you would like.

- **Placement in Hero**: Positioned as a full-width horizontal live ticker banner at the very top of the Hero component (above the main headline and the 24H Wealth Multiplier Leaderboard) so visitors immediately encounter whale capital flow upon landing.
- **Interactive Click Behavior**: Clicking any whale alert item in the scrolling stream opens that specific fund's trade/detail view so users can immediately inspect or copy-trade the whale's position.
- **Alert Payload Format**: Each ticker item displays the exact whale buy alert phrasing (e.g., `🐋 Whale (0x8F2...91B) just bought 500 BNB ($310,000) of fund-moon-100x ($MOON-100X)!`), alongside the fund's 24h gain badge, X3 Turbo status if applicable, and a relative timestamp (`2s ago`, `14s ago`).

---

## 1. Overview & Core Concept

- **What It Does**: Renders a seamless, infinite horizontally scrolling marquee inside the Hero section that streams large simulated BNB subscription orders across the platform's Meme ETF baskets (`fund-moon-100x`, `fund-meme-10`, `fund-ai-punk`, `fund-kol-alpha`, `fund-bnb-meme`, `fund-four-genesis`), periodically injecting fresh whale buy alerts in real time.
- **Target Audience / Persona**: On-chain Meme ETF traders and degens seeking real-time smart-money signals and high-momentum basket inflows.
- **Key Value**: Reinforces the high-stakes, fast-moving market atmosphere by pairing static fund metrics with a kinetic stream of whale order flow that users can act on with a single click.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Immediate Market Pulse**: Upon loading the Supermarket view, the user sees the **Live Whale Alert** ticker scrolling smoothly across the Hero header with a live radar indicator and total 24h whale inflow counter.
  2. **Hover-to-Inspect**: Hovering anywhere over the ticker pauses the horizontal scroll animation (`animation-play-state: paused`), allowing the user to read a specific whale order without chasing moving text.
  3. **Click-to-Follow Whale**: Clicking any whale buy alert item triggers the fund selection handler for that fund (e.g., `fund-moon-100x`), opening its detail and subscription modal immediately.
  4. **Simulate Fresh Whale Inflow**: A compact **"Simulate Whale Buy"** button on the ticker header lets users trigger an instant new mega-order alert (`300–1,200 BNB`) with a brief highlight flash.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: High-density dark crypto trading terminal with kinetic order-flow telemetry.
  - *Color Palette & Mood*: Deep obsidian canvas (`bg-neutral-950/95`) bordered by subtle amber/emerald hairlines (`border-amber-500/30`), accented with emerald inflow figures (`text-emerald-400`), amber whale badges (`text-amber-400`), and crimson tags (`text-rose-400`) for `X3 Turbo` whale orders.
  - *Typography & Hierarchy*: Monospace tabular numerals (`font-mono tabular-nums`) for all BNB amounts, USD equivalents, wallet hashes, and timestamps to ensure crisp alignment during horizontal motion.
  - *Component Styling & Layout*: Single-row low-profile bar integrated cleanly into the Hero container with subtle left/right edge fade masks (`bg-gradient-to-r from-neutral-950 to-transparent`) so scrolling items enter and exit smoothly.
- **Interactive Feedback & Motion**:
  - GPU-accelerated `translate3d` marquee keyframe loop for 60fps horizontal scrolling.
  - Pause-on-hover micro-interaction and subtle border glow on individual whale order pills when hovered.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Seamless Dual-Track CSS Marquee vs. JavaScript Interval Shifting**
  - *Chosen Approach*: Duplicate the whale alert array inside a flex track animated with CSS `@keyframes` (`translate3d(0, 0, 0)` to `translate3d(-50%, 0, 0)`), combined with periodic state updates for fresh alerts.
  - *Why*: Pure compositor-layer `transform` animation guarantees zero layout thrashing, smooth 60fps scrolling, and native CSS `:hover` pause support.
  - *Alternatives Considered*: `requestAnimationFrame` scrollLeft mutation, which causes repaints and jitter on high-DPI displays.
- **Decision 2: Dynamic Fund-Linked Alert Generation**
  - *Chosen Approach*: Link every whale alert directly to a live `Fund` object from the application state (`fund-moon-100x`, `fund-ai-punk`, `fund-kol-alpha`, etc.) and calculate the USD value from the BNB order size.
  - *Why*: Ensures every alert in the ticker reflects real fund IDs, accurate symbols, current 24h gains, and opens the corresponding fund modal when clicked.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                             Application State                           │
│           (Active Funds List, Selected Fund Modal Controller)           │
└───────────────────┬─────────────────────────────────────▲───────────────┘
                    │ Passes funds[]                      │ onSelectFund(fund)
                    ▼                                     │
┌─────────────────────────────────────────────────────────┴───────────────┐
│                              Hero Component                             │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                   Live Whale Alert Ticker Bar                     │  │
│  │  ┌─────────────────────┐  ┌────────────────────────────────────┐  │  │
│  │  │ Live Radar Header & │  │ Infinite Horizontal CSS Marquee    │  │  │
│  │  │ "+ Simulate Whale"  │  │ • "Whale just bought 500 BNB of    │  │  │
│  │  │ Trigger Control     │  │    fund-moon-100x!" (Click → Open) │  │  │
│  │  └─────────────────────┘  └────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────┐ ┌─────────────────────────────┐  │
│  │ Hero Value Proposition & Actions  │ │ Architectural Vault Visual  │  │
│  └───────────────────────────────────┘ └─────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ 24H > 100% Wealth Multiplier Leaderboard & Top Gainers Spotlight  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - `WhaleAlertItem`:
    - `id`: Unique alert identifier
    - `wallet`: Shortened whale address (e.g., `0x9A4...E72`)
    - `bnbAmount`: Large order size in BNB (e.g., `500`, `850`, `320`, `1200`)
    - `usdValue`: Calculated USD value of the BNB order
    - `fundId`: Target fund identifier (e.g., `'fund-moon-100x'`)
    - `fundSymbol`: Target fund symbol (e.g., `'MOON-100X'`)
    - `isTurbo`: Boolean indicating whether the whale activated X3 Turbo Mode
    - `timestampLabel`: Relative time indicator (`'Just now'`, `'6s ago'`, `'19s ago'`)
- **Interactive Component & State Mapping**:
  - **Initial Seed & Auto-Stream**: Initializes with curated large whale orders led by `"Whale just bought 500 BNB of fund-moon-100x!"` and periodically rotates/injects new simulated whale buys every 12 seconds.
  - **Manual Whale Burst**: Clicking the **"Simulate Whale"** button generates a randomized `350–1,500 BNB` buy order on one of the top-performing funds and prepends it to the live stream.
  - **Direct Fund Inspection**: Clicking any whale alert item looks up the matching `Fund` by `fundId` and invokes `onSelectFund(fund)` to open the fund's detail and trade modal.
