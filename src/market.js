// Market Data — Price trends, supply/demand, transaction history

// ============================================================
// FLOWER PRICING — Based on real flower market patterns
// ============================================================

export const FLOWER_PRICES = {
  synthetic: {
    name: '合成花',
    basePrice: 18,
    volatility: 0.15,  // Low volatility — mass produced
    demand: 75,
    supply: 85,
    trend: 'stable',   // stable, rising, falling
  },
  natural: {
    name: '自然花',
    basePrice: 12,
    volatility: 0.35,  // High volatility — seasonal, rare
    demand: 30,
    supply: 20,
    trend: 'falling',  // Supply declining
  },
  memory: {
    name: '索引花',
    basePrice: 25,
    volatility: 0.25,
    demand: 35,
    supply: 25,
    trend: 'rising',   // Demand rising, supply limited
  },
  emotion: {
    name: '情绪花',
    basePrice: 30,
    volatility: 0.30,
    demand: 60,
    supply: 50,
    trend: 'volatile', // Regulatory uncertainty
  },
  personality: {
    name: '人格花',
    basePrice: 35,
    volatility: 0.40,  // Very volatile — high risk
    demand: 20,
    supply: 10,
    trend: 'rising',
  },
  data: {
    name: '含数花',
    basePrice: 30,
    volatility: 0.20,
    demand: 45,
    supply: 35,
    trend: 'stable',
  },
};

// ============================================================
// MARKET STATE — Tracks price history and transactions
// ============================================================

let priceHistory = {};    // { category: [price1, price2, ...] }
let transactions = [];    // [{ chapter, category, price, success, dealRate }]
let marketEvents = [];    // [{ chapter, event, effect }]

export function initMarket() {
  priceHistory = {};
  transactions = [];
  marketEvents = [];

  // Initialize price history with base prices
  for (const [cat, info] of Object.entries(FLOWER_PRICES)) {
    priceHistory[cat] = [info.basePrice];
  }
}

// --- Price Simulation ---

export function simulatePriceChange(chapter, state) {
  const changes = {};

  for (const [cat, info] of Object.entries(FLOWER_PRICES)) {
    const history = priceHistory[cat];
    const lastPrice = history[history.length - 1];

    // Base fluctuation
    const fluctuation = (Math.random() - 0.5) * info.volatility * lastPrice;

    // Trend influence
    let trendEffect = 0;
    switch (info.trend) {
      case 'rising': trendEffect = lastPrice * 0.05; break;
      case 'falling': trendEffect = -lastPrice * 0.08; break;
      case 'volatile': trendEffect = (Math.random() - 0.5) * lastPrice * 0.15; break;
      default: trendEffect = 0;
    }

    // State influence
    let stateEffect = 0;
    if (cat === 'synthetic') {
      stateEffect += state.platformDependence * 0.02;  // More platform = cheaper synthetic
      stateEffect -= state.ecology * 0.01;              // Less ecology = more synthetic demand
    }
    if (cat === 'natural') {
      stateEffect += (100 - state.ecology) * 0.05;     // Less ecology = natural more expensive
      stateEffect -= state.assimilation * 0.02;         // More assimilation = less natural demand
    }
    if (cat === 'memory') {
      stateEffect += state.regulationPressure * 0.03;  // More regulation = memory more expensive
      stateEffect += state.dataCapital * 0.01;         // More data = more memory flower demand
    }
    if (cat === 'emotion') {
      stateEffect += state.assimilation * 0.02;        // More assimilation = more emotion demand
      stateEffect += state.blackMarket * 0.01;         // Black market = emotion flower premium
    }

    const newPrice = Math.max(5, Math.round(lastPrice + fluctuation + trendEffect + stateEffect));
    history.push(newPrice);
    changes[cat] = newPrice;
  }

  return changes;
}

// --- Supply/Demand Update ---

export function updateSupplyDemand(chapter, state) {
  for (const [cat, info] of Object.entries(FLOWER_PRICES)) {
    // Demand changes based on state
    if (cat === 'synthetic') {
      info.demand = Math.max(10, Math.min(95, 75 + (state.platformDependence - 50) * 0.3));
      info.supply = Math.max(10, Math.min(95, 85 + (state.assimilation - 50) * 0.2));
    }
    if (cat === 'natural') {
      info.demand = Math.max(5, Math.min(80, 30 + (100 - state.ecology) * 0.3));
      info.supply = Math.max(5, Math.min(60, 20 - (state.assimilation - 50) * 0.3));
    }
    if (cat === 'memory') {
      info.demand = Math.max(10, Math.min(80, 35 + state.dataCapital * 0.2));
      info.supply = Math.max(5, Math.min(50, 25 - state.regulationPressure * 0.1));
    }
    if (cat === 'emotion') {
      info.demand = Math.max(15, Math.min(85, 60 + state.assimilation * 0.2));
      info.supply = Math.max(20, Math.min(70, 50 + state.blackMarket * 0.1));
    }
  }
}

// --- Record Transaction ---

export function recordTransaction(chapter, category, price, success, dealRate) {
  transactions.push({ chapter, category, price, success, dealRate });
}

// --- Get Market Data ---

export function getPriceHistory() {
  return { ...priceHistory };
}

export function getTransactions() {
  return [...transactions];
}

export function getMarketSummary() {
  const summary = {};
  for (const [cat, info] of Object.entries(FLOWER_PRICES)) {
    const history = priceHistory[cat];
    const currentPrice = history[history.length - 1];
    const prevPrice = history.length > 1 ? history[history.length - 2] : currentPrice;
    const change = currentPrice - prevPrice;
    const changePct = prevPrice > 0 ? ((change / prevPrice) * 100).toFixed(1) : '0.0';

    summary[cat] = {
      name: info.name,
      currentPrice,
      change,
      changePct,
      demand: Math.round(info.demand),
      supply: Math.round(info.supply),
      trend: info.trend,
      history: [...history],
    };
  }
  return summary;
}

// ============================================================
// TRADING PRICES — Buy/sell with margins
// ============================================================

const MARGIN_MULTIPLIER = {
  synthetic: 1.3,
  natural: 1.8,
  memory: 2.0,
  emotion: 1.6,
  personality: 2.5,
  data: 1.5,
};

export function getBuyPrice(category, state) {
  const info = FLOWER_PRICES[category];
  if (!info) return 10;
  const history = priceHistory[category];
  const base = history ? history[history.length - 1] : info.basePrice;

  // Platform subsidies reduce synthetic cost
  let platformDiscount = 0;
  if (category === 'synthetic' && state) {
    platformDiscount = state.platformDependence * 0.1;
  }
  // Regulation increases memory flower cost
  let regPremium = 0;
  if (category === 'memory' && state) {
    regPremium = state.regulationPressure * 0.15;
  }
  // Black market increases emotion flower cost
  let bmPremium = 0;
  if (category === 'emotion' && state) {
    bmPremium = state.blackMarket * 0.1;
  }

  return Math.max(5, Math.round(base - platformDiscount + regPremium + bmPremium));
}

export function getSellPrice(category, state) {
  const buyPrice = getBuyPrice(category, state);
  const margin = MARGIN_MULTIPLIER[category] || 1.5;
  return Math.round(buyPrice * margin);
}

export function getMarginMultiplier(category) {
  return MARGIN_MULTIPLIER[category] || 1.5;
}

// ============================================================
// MARKET VISUALIZATION — Canvas sparklines and bars
// ============================================================

export function renderMarketPanel(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const summary = getMarketSummary();

  let html = `
    <div style="font-size: 11px; color: #5a6577; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.1em;">
      行情面板
    </div>
  `;

  for (const [cat, data] of Object.entries(summary)) {
    const changeColor = data.change > 0 ? '#4ade80' : data.change < 0 ? '#f87171' : '#5a6577';
    const changeSign = data.change > 0 ? '+' : '';
    const trendIcon = {
      'rising': '↑',
      'falling': '↓',
      'volatile': '↕',
      'stable': '→',
    }[data.trend] || '→';

    html += `
      <div style="margin-bottom: 12px; padding: 8px; background: #111822; border: 1px solid #1a2332;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-size: 12px; font-weight: 500;">${data.name}</span>
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: ${changeColor};">
            ${changeSign}${data.change} (${changeSign}${data.changePct}%)
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 500;">
            ¥${data.currentPrice}
          </span>
          <span style="font-size: 11px; color: #5a6577;">${trendIcon} ${data.trend}</span>
        </div>
        <canvas id="spark-${cat}" width="200" height="30" style="width: 100%; height: 30px;"></canvas>
        <div style="display: flex; justify-content: space-between; margin-top: 4px;">
          <div style="flex: 1; margin-right: 8px;">
            <div style="font-size: 10px; color: #5a6577; margin-bottom: 2px;">需求</div>
            <div style="background: #0a0e14; height: 4px; border-radius: 2px;">
              <div style="background: #5b9bd5; height: 100%; width: ${data.demand}%; border-radius: 2px;"></div>
            </div>
          </div>
          <div style="flex: 1;">
            <div style="font-size: 10px; color: #5a6577; margin-bottom: 2px;">供给</div>
            <div style="background: #0a0e14; height: 4px; border-radius: 2px;">
              <div style="background: #f0a050; height: 100%; width: ${data.supply}%; border-radius: 2px;"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Transaction history
  const txns = getTransactions();
  if (txns.length > 0) {
    html += `
      <div style="font-size: 11px; color: #5a6577; margin: 12px 0 8px; text-transform: uppercase; letter-spacing: 0.1em;">
        交易记录
      </div>
    `;
    for (const tx of txns.slice(-5).reverse()) {
      const catName = FLOWER_PRICES[tx.category]?.name || tx.category;
      const statusIcon = tx.success ? '✓' : '✗';
      const statusColor = tx.success ? '#4ade80' : '#f87171';
      html += `
        <div style="font-size: 11px; padding: 4px 0; border-bottom: 1px solid #1a2332; display: flex; justify-content: space-between;">
          <span><span style="color: ${statusColor}">${statusIcon}</span> ${catName}</span>
          <span style="font-family: 'JetBrains Mono', monospace; color: #5a6577;">¥${tx.price} (${tx.dealRate}%)</span>
        </div>
      `;
    }
  }

  container.innerHTML = html;

  // Draw sparklines
  for (const [cat, data] of Object.entries(summary)) {
    drawSparkline(`spark-${cat}`, data.history, data.change >= 0 ? '#4ade80' : '#f87171');
  }
}

function drawSparkline(canvasId, data, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || data.length < 2) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = 2;

  ctx.clearRect(0, 0, width, height);

  const min = Math.min(...data) * 0.9;
  const max = Math.max(...data) * 1.1;
  const range = max - min || 1;

  const stepX = (width - padding * 2) / (data.length - 1);

  // Draw line
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;

  for (let i = 0; i < data.length; i++) {
    const x = padding + i * stepX;
    const y = height - padding - ((data[i] - min) / range) * (height - padding * 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Draw current point
  const lastX = padding + (data.length - 1) * stepX;
  const lastY = height - padding - ((data[data.length - 1] - min) / range) * (height - padding * 2);
  ctx.beginPath();
  ctx.arc(lastX, lastY, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

// ============================================================
// MARKET EVENTS — Triggered by state changes
// ============================================================

export function checkMarketEvents(chapter, state) {
  const events = [];

  if (state.platformDependence > 70 && chapter >= 2) {
    events.push({
      text: '平台补贴生效。合成花进价下降——但你离不开了。',
      effect: { synthetic: -3 },
    });
  }

  if (state.ecology < 30 && chapter >= 2) {
    events.push({
      text: '生态值下降。自然花供应紧张，价格上涨。',
      effect: { natural: 5 },
    });
  }

  if (state.regulationPressure > 60 && chapter >= 3) {
    events.push({
      text: '监管压力上升。索引花和情绪花交易受限。',
      effect: { memory: 3, emotion: 2 },
    });
  }

  if (state.blackMarket > 50 && chapter >= 3) {
    events.push({
      text: '黑市活跃。地下情绪花交易推高市场价格。',
      effect: { emotion: 4 },
    });
  }

  return events;
}
