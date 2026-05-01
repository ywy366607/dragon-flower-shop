// Game State Engine

export const INITIAL_STATE = {
  money: 50,
  cash: 100,
  trust: 50,
  retention: 50,
  dataCapital: 50,
  platformDependence: 50,
  localAI: 50,
  localAIStyle: 50,
  regulationPressure: 50,
  assimilation: 50,
  blackMarket: 50,
  ecology: 50,
  publicSafety: 50,
};

const STATE_KEYS = Object.keys(INITIAL_STATE);

const STATE_LABELS = {
  money: '资金',
  cash: '现金',
  trust: '信用',
  retention: '留存',
  dataCapital: '数据资本',
  platformDependence: '平台依赖',
  localAI: '本地AI',
  localAIStyle: 'AI风格',
  regulationPressure: '监管压力',
  assimilation: '同化率',
  blackMarket: '黑市',
  ecology: '生态',
  publicSafety: '公共安全',
};

let state = { ...INITIAL_STATE };
let stateHistory = []; // Track changes per chapter

export function getState() {
  return { ...state };
}

export function getLabel(key) {
  return STATE_LABELS[key] || key;
}

export function resetState() {
  state = { ...INITIAL_STATE };
  stateHistory = [];
}

export function applyEffect(effect) {
  const changes = {};
  for (const key of STATE_KEYS) {
    if (effect[key] !== undefined) {
      const oldVal = state[key];
      // cash is actual currency — not clamped to 0-100
      if (key === 'cash') {
        state[key] = oldVal + effect[key];
      } else {
        state[key] = Math.max(0, Math.min(100, oldVal + effect[key]));
      }
      changes[key] = state[key] - oldVal;
    }
  }
  stateHistory.push(changes);
  return changes;
}

export function getStateHistory() {
  return [...stateHistory];
}

// --- Deal Probability ---

function scarcityBonus(supply) {
  return (100 - supply) * 0.1;
}

function platformBoost(product, state) {
  if (product.platformNeed > 0) {
    return product.platformNeed * state.platformDependence * 0.005;
  }
  return 0;
}

function trendBoost(product, state) {
  return state.assimilation * 0.05;
}

export function calculateDealChance(product, price, currentState) {
  const st = currentState || state;
  const priceDeviation = Math.abs(price - product.priceSuggestion) / product.priceSuggestion;

  let chance =
    product.baseDemand
    - priceDeviation * 25
    + scarcityBonus(product.supply)
    + st.trust * 0.15
    - product.risk * 0.2
    + platformBoost(product, st)
    + trendBoost(product, st)
    - st.regulationPressure * product.risk * 0.01;

  return Math.max(5, Math.min(95, Math.round(chance)));
}

export function rollDeal(chance) {
  return Math.random() * 100 < chance;
}

// --- Ending Determination ---

const ENDINGS = [
  // Extreme endings (checked first)
  {
    id: 'terminal_owner',
    key: '终产者',
    check: (s) => s.platformDependence > 90 && s.assimilation > 85 && s.money > 80,
  },
  {
    id: 'ai_crisis',
    key: '智械危机',
    check: (s) => s.localAIStyle > 75 && s.blackMarket > 60 && s.localAI > 70,
  },
  {
    id: 'zero',
    key: '归零者',
    check: (s) => s.platformDependence < 25 && s.money < 35 && s.cash < 30,
  },
  // Tycoon ending
  {
    id: 'tycoon',
    key: '大富翁',
    check: (s) => s.cash > 300 && s.retention > 60 && s.blackMarket < 30 && s.trust > 50,
  },
  // Original endings
  {
    id: 'sample_king',
    key: '样本之王',
    check: (s) => s.platformDependence > 80 && s.dataCapital < 40 && s.localAI < 40,
  },
  {
    id: 'flower_king',
    key: '花王资本',
    check: (s) => s.money > 100 && s.dataCapital > 70 && s.assimilation > 70,
  },
  {
    id: 'machine_spring',
    key: '智械春潮',
    check: (s) => s.localAIStyle > 70 && s.localAI > 60 && s.regulationPressure > 55,
  },
  {
    id: 'registered_garden',
    key: '备案花园',
    check: (s) => s.trust > 75 && s.regulationPressure < 50 && s.localAIStyle < 40,
  },
  {
    id: 'offline_house',
    key: '断网花房',
    check: (s) => s.platformDependence < 35 && s.localAI > 55 && s.money > 20,
  },
  {
    id: 'soilless_era',
    key: '无土繁花纪',
    check: (s) => s.ecology < 35 && s.assimilation > 70,
  },
  {
    id: 'underground',
    key: '暗香地下城',
    check: (s) => s.blackMarket > 65,
  },
  {
    id: 'new_covenant',
    key: '新约花城',
    check: (s) => s.publicSafety > 55 && s.localAIStyle > 55 && s.regulationPressure > 40,
  },
  // New moderate endings
  {
    id: 'coexistence',
    key: '人机共存',
    check: (s) => s.localAI > 70 && s.localAIStyle > 60 && s.trust > 60 && s.platformDependence < 50,
  },
  {
    id: 'darknet',
    key: '暗网花城',
    check: (s) => s.blackMarket > 80 && s.platformDependence < 40,
  },
  {
    id: 'memory_enclave',
    key: '记忆解放区',
    check: (s) => s.ecology > 60 && s.retention > 70 && s.regulationPressure > 50,
  },
];

export function determineEnding(currentState) {
  const st = currentState || state;
  for (const ending of ENDINGS) {
    if (ending.check(st)) return ending.key;
  }
  return '混合花店';
}

// --- Similar Player Percentage ---

export function getSimilarPlayerPercentage(endingKey) {
  // Simulated percentage based on ending rarity
  const percentages = {
    '样本之王': 37.4,
    '花王资本': 12.8,
    '智械春潮': 4.8,
    '备案花园': 22.1,
    '断网花房': 8.3,
    '无土繁花纪': 15.6,
    '暗香地下城': 6.2,
    '新约花城': 9.7,
    '终产者': 2.1,
    '智械危机': 3.3,
    '人机共存': 7.5,
    '暗网花城': 5.8,
    '记忆解放区': 4.2,
    '归零者': 1.9,
    '大富翁': 5.2,
    '混合花店': 31.5,
  };
  return percentages[endingKey] || 15.0;
}
