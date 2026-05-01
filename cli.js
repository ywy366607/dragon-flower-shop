#!/usr/bin/env node
// 喂龙花店 — CLI version for AI agent playtesting
// Usage: node cli.js [--auto] [--script file.json] [--seed N] [--no-market] [--llm]

import { createInterface } from 'readline';
import { readFileSync, existsSync } from 'fs';
import {
  getState, resetState, applyEffect, getLabel,
  calculateDealChance, rollDeal, determineEnding, getSimilarPlayerPercentage,
} from './src/engine.js';
import { CHAPTERS, ENDINGS, PRODUCTS } from './src/data.js';
import {
  initMarket, simulatePriceChange, updateSupplyDemand,
  checkMarketEvents, getMarketSummary,
  getBuyPrice, getSellPrice, getMarginMultiplier,
} from './src/market.js';

// ============================================================
// CLI ARGUMENTS
// ============================================================

const args = process.argv.slice(2);
const flags = {
  auto: args.includes('--auto'),
  noMarket: args.includes('--no-market'),
  llm: args.includes('--llm'),
  seed: null,
  script: null,
};

const seedIdx = args.indexOf('--seed');
if (seedIdx !== -1 && args[seedIdx + 1]) {
  flags.seed = parseInt(args[seedIdx + 1], 10);
}

const scriptIdx = args.indexOf('--script');
if (scriptIdx !== -1 && args[scriptIdx + 1]) {
  const scriptPath = args[scriptIdx + 1];
  if (existsSync(scriptPath)) {
    flags.script = JSON.parse(readFileSync(scriptPath, 'utf-8'));
  } else {
    console.error(`Script file not found: ${scriptPath}`);
    process.exit(1);
  }
}

// ============================================================
// LLM INTEGRATION (optional)
// ============================================================

let llmModule = null;
if (flags.llm) {
  try {
    llmModule = await import('./src/llm.js');
  } catch (e) {
    console.error('Failed to load LLM module:', e.message);
    flags.llm = false;
  }
}

// ============================================================
// SEEDED PRNG (Mulberry32)
// ============================================================

let rng = Math.random;

if (flags.seed !== null) {
  let s = flags.seed | 0;
  rng = () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const origRandom = Math.random;
  Math.random = rng;
  flags._restoreRandom = () => { Math.random = origRandom; };
}

// ============================================================
// OUTPUT HELPERS
// ============================================================

const LABELS = {
  money: '资金', cash: '现金', trust: '信用', retention: '留存',
  dataCapital: '数据资本', platformDependence: '平台依赖',
  localAI: '本地AI', localAIStyle: 'AI风格',
  regulationPressure: '监管压力', assimilation: '同化率',
  ecology: '生态', blackMarket: '黑市', publicSafety: '公共安全',
};

function out(text) {
  process.stdout.write(text + '\n');
}

function formatState(state) {
  const keys = Object.keys(LABELS);
  const line1 = keys.slice(0, 7).map(k => `${LABELS[k]}:${Math.round(state[k])}`).join(' ');
  const line2 = keys.slice(7).map(k => `${LABELS[k]}:${Math.round(state[k])}`).join(' ');
  return line1 + '\n' + line2;
}

function formatChanges(changes) {
  const parts = [];
  for (const [key, val] of Object.entries(changes)) {
    if (val === 0) continue;
    const label = LABELS[key] || key;
    const sign = val > 0 ? '+' : '';
    parts.push(`${label} ${sign}${val}`);
  }
  return parts.join(' | ');
}

// ============================================================
// INPUT
// ============================================================

let rl;

function initReadline() {
  rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function ask(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, answer => resolve(answer.trim()));
  });
}

// ============================================================
// GAME STATE
// ============================================================

let assistantType = 'none';
let assistantStage = 'early';
let memories = [];
let choiceHistory = [];

// ============================================================
// LLM HELPERS
// ============================================================

async function agentReact(speaker, label, context) {
  if (!flags.llm || !llmModule) return;
  try {
    const state = getState();
    if (speaker === 'platform') {
      llmModule.platformAgent.setSystemPrompt(
        llmModule.buildPlatformSystemPrompt(state, context)
      );
      const r = await llmModule.platformAgent.chat(context, label);
      if (r) out(`[总模型助手] ${r}`);
    } else {
      const memoryTexts = memories.map(m => m.memory);
      llmModule.localAgent.setSystemPrompt(
        llmModule.buildLocalSystemPrompt(state, context, assistantStage, memoryTexts, llmModule.localAgent.name)
      );
      const r = await llmModule.localAgent.chat(context, label);
      if (r) out(`[阿原] ${r}`);
    }
  } catch (e) { /* skip LLM errors */ }
}

async function agentReactToScenario(chapter) {
  if (!flags.llm || !llmModule) return;
  const scenario = `店主正在面对：${chapter.title}。${chapter.context}`;
  if (assistantType === 'platform' || assistantType === 'mixed') {
    await agentReact('platform', '系统通知', scenario);
  }
  if (assistantType === 'local' || assistantType === 'mixed') {
    await agentReact('local', '系统通知', scenario);
  }
}

async function agentReactToChoice(choiceLabel, choiceDesc) {
  if (!flags.llm || !llmModule) return;
  const ctx = `店主选择了：「${choiceLabel}」。${choiceDesc || ''}`;
  if (assistantType === 'platform' || assistantType === 'mixed') {
    await agentReact('platform', '店主决策', ctx);
  }
  if (assistantType === 'local' || assistantType === 'mixed') {
    await agentReact('local', '店主决策', ctx);
    // Create memory from choice
    memories.push({
      quote: choiceLabel,
      context: '经营选择',
      memory: `你选择了「${choiceLabel}」。我记得这个选择。`,
    });
  }
}

async function generateEndingTimeline(state, endingKey) {
  if (!flags.llm || !llmModule) return '';
  try {
    return await llmModule.getEndingNarrative(state, endingKey, choiceHistory) || '';
  } catch (e) { return ''; }
}

// ============================================================
// TRADING PHASE
// ============================================================

const CATEGORY_NAMES = {
  synthetic: '合成花「歉意-7型」',
  natural: '自然花「低温白」',
  memory: '索引花「雨后编号03」',
  emotion: '情绪花「安眠-蓝」',
};

const CATEGORY_DESC = {
  synthetic: '低风险低利润',
  natural: '中风险中利润',
  memory: '高风险高利润',
  emotion: '中风险高利润',
};

function getSuccessEffect(category, profit) {
  const effects = {
    synthetic: { cash: profit, money: 5, platformDependence: 8, assimilation: 5, dataCapital: 5, ecology: -3 },
    natural: { cash: profit, money: 3, retention: 8, ecology: 10, localAIStyle: 3 },
    memory: { cash: profit, money: 4, dataCapital: 10, regulationPressure: 5, retention: 4 },
    emotion: { cash: profit, money: 6, blackMarket: 8, regulationPressure: 6, assimilation: 3, ecology: -3 },
  };
  return effects[category] || { cash: profit, money: 3 };
}

function getFailEffect(category, spoilage) {
  const effects = {
    synthetic: { cash: -spoilage, money: -2, platformDependence: 3, assimilation: 2 },
    natural: { cash: -spoilage, money: -2, ecology: 3 },
    memory: { cash: -spoilage, money: -2, dataCapital: 3, regulationPressure: 2 },
    emotion: { cash: -spoilage, money: -2, blackMarket: 3, regulationPressure: 2 },
  };
  return effects[category] || { cash: -spoilage, money: -2 };
}

function getAIRecommendation(state, assistantType) {
  const categories = ['synthetic', 'natural', 'memory', 'emotion'];
  const scores = {};
  for (const cat of categories) {
    const buy = getBuyPrice(cat, state);
    const sell = getSellPrice(cat, state);
    let score = sell - buy;
    if (assistantType === 'platform') score += cat === 'synthetic' ? 15 : cat === 'emotion' ? -5 : 0;
    else if (assistantType === 'local') score += cat === 'natural' ? 12 : cat === 'synthetic' ? -8 : 0;
    if (state.cash < 30) score += buy < 20 ? 10 : -10;
    if (state.blackMarket > 70) score += cat === 'emotion' ? 8 : 0;
    if (state.regulationPressure > 70) score += cat === 'memory' ? -15 : 0;
    if (state.ecology < 30) score += cat === 'natural' ? 10 : 0;
    scores[cat] = score;
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const reasons = {
    synthetic: '利润稳定，平台补贴降低风险',
    natural: '生态价值高，有助提升口碑',
    memory: '数据资本回报最高，但监管风险大',
    emotion: '黑市渠道溢价可观',
  };
  return { category: best, reason: reasons[best] };
}

async function tradingPhase(chapterIndex) {
  const state = getState();
  const categories = ['synthetic', 'natural', 'memory', 'emotion'];

  out('\n--- 进货 ---');
  out(`现金: ¥${Math.round(state.cash)}`);
  out('');

  const prices = {};
  for (const cat of categories) {
    const buy = getBuyPrice(cat, state);
    const sell = getSellPrice(cat, state);
    const margin = sell - buy;
    prices[cat] = { buy, sell, profit: margin };
    out(`  ${CATEGORY_NAMES[cat]}  进价:¥${buy} 预售:¥${sell} 利润:¥${margin}  (${CATEGORY_DESC[cat]})`);
  }
  out(`  [5] 不进货`);

  // AI recommendation
  let recommendedIndex = null;
  if (assistantType === 'platform' || assistantType === 'mixed') {
    const rec = getAIRecommendation(state, 'platform');
    const idx = categories.indexOf(rec.category) + 1;
    out(`\n[总模型助手] 建议进货${CATEGORY_NAMES[rec.category]}。${rec.reason}。`);
    recommendedIndex = idx;
  } else if (assistantType === 'local') {
    const rec = getAIRecommendation(state, 'local');
    const idx = categories.indexOf(rec.category) + 1;
    out(`\n[阿原] 店主，我建议进${CATEGORY_NAMES[rec.category]}。${rec.reason}。`);
    recommendedIndex = idx;
  } else {
    recommendedIndex = null;
  }

  let catIndex;
  if (flags.auto) {
    // In auto mode, 70% chance to follow AI recommendation
    if (recommendedIndex && rng() < 0.7) {
      catIndex = recommendedIndex - 1;
      out(`\n> ${catIndex + 1} (auto, 采纳建议)`);
    } else {
      catIndex = Math.floor(rng() * 5);
      out(`\n> ${catIndex + 1} (auto)`);
    }
  } else if (flags.script && flags.script.trade && flags.script.trade[chapterIndex]) {
    catIndex = flags.script.trade[chapterIndex] - 1;
    out(`\n> ${catIndex + 1} (scripted)`);
  } else {
    const hint = recommendedIndex ? ` (AI推荐:${recommendedIndex})` : '';
    const input = await ask(`\n选择进货 (1-5)${hint}: `);
    catIndex = parseInt(input, 10) - 1;
    if (catIndex < 0 || catIndex > 4) catIndex = 4; // default: skip
  }

  if (catIndex === 4) {
    out('[你] 今日不进货。');
    return;
  }

  const cat = categories[catIndex];
  const p = prices[cat];

  if (state.cash < p.buy) {
    out(`\n[系统] 现金不足。需要¥${p.buy}，当前¥${Math.round(state.cash)}。`);
    return;
  }

  out(`\n[你] 进货：${CATEGORY_NAMES[cat]}`);

  const product = PRODUCTS[cat];
  const dealChance = calculateDealChance(product, p.sell, getState());
  const dealSuccess = rollDeal(dealChance);

  if (dealSuccess) {
    out(`[系统] 以¥${p.buy}购入，售出¥${p.sell}。利润¥${p.profit}。成交概率：${dealChance}%`);
    const changes = applyEffect(getSuccessEffect(cat, p.profit));
    const changeStr = formatChanges(changes);
    if (changeStr) out(`  状态变化: ${changeStr}`);
  } else {
    const spoilage = Math.round(p.buy * 0.3);
    out(`[系统] 以¥${p.buy}购入，但未成交。损耗¥${spoilage}。成交概率：${dealChance}%`);
    const changes = applyEffect(getFailEffect(cat, spoilage));
    const changeStr = formatChanges(changes);
    if (changeStr) out(`  状态变化: ${changeStr}`);
  }
}

// ============================================================
// CUSTOM CHOICE EFFECT ANALYSIS
// ============================================================

function analyzeCustomChoiceEffect(text) {
  const effect = { trust: 2, retention: 3 };
  if (text.includes('平台') || text.includes('接入') || text.includes('大模型') || text.includes('数据上传')) {
    effect.platformDependence = 8; effect.assimilation = 5; effect.dataCapital = 5;
  }
  if (text.includes('本地') || text.includes('独立') || text.includes('自主') || text.includes('自己')) {
    effect.localAI = 5; effect.platformDependence = -5; effect.retention = 5;
  }
  if (text.includes('赚钱') || text.includes('利润') || text.includes('卖') || text.includes('成交')) {
    effect.money = 5; effect.cash = 10;
  }
  if (text.includes('安全') || text.includes('小心') || text.includes('谨慎') || text.includes('保护')) {
    effect.trust = 5; effect.regulationPressure = -3;
  }
  if (text.includes('反抗') || text.includes('拒绝') || text.includes('地下') || text.includes('黑市')) {
    effect.blackMarket = 8; effect.trust = -5; effect.regulationPressure = 5;
  }
  if (text.includes('生态') || text.includes('自然') || text.includes('环境')) {
    effect.ecology = 8;
  }
  if (text.includes('教') || text.includes('训练') || text.includes('学')) {
    effect.localAI = 5; effect.localAIStyle = 5;
  }
  if (Object.keys(effect).length <= 2) {
    effect.money = 2;
  }
  return effect;
}

// ============================================================
// GAME LOOP
// ============================================================

async function playChapter(chapterIndex) {
  if (chapterIndex >= CHAPTERS.length) {
    await endGame();
    return;
  }

  const chapter = CHAPTERS[chapterIndex];

  // Update assistant stage
  if (chapterIndex <= 1) assistantStage = 'early';
  else if (chapterIndex <= 3) assistantStage = 'mid';
  else assistantStage = 'late';

  out('');
  out(`=== ${chapter.title} ===`);
  out('');

  // Market simulation
  if (!flags.noMarket) {
    simulatePriceChange(chapterIndex, getState());
    updateSupplyDemand(chapterIndex, getState());
    const events = checkMarketEvents(chapterIndex, getState());
    for (const event of events) out(`[市场] ${event.text}`);
  }

  // Narrative
  for (const msg of chapter.narrative) {
    const prefix = {
      system: '[系统]', customer: '[顾客]', assistant: '[阿原]',
      platform_ai: '[总模型助手]', market: '[市场]', regulator: '[监管]',
      company: '[公司]', tide: '[潮汐]', player: '[你]', you: '[你]',
    }[msg.speaker] || '[系统]';
    out(`${prefix} ${msg.text}`);
  }

  // Agent reacts to scenario
  await agentReactToScenario(chapter);

  // State display
  out('\n--- 状态 ---');
  out(formatState(getState()));

  // Trading phase
  if (!flags.noMarket) {
    await tradingPhase(chapterIndex);
    out('\n--- 当前状态 ---');
    out(formatState(getState()));
  }

  // Post-trading transition
  const transitions = {
    ch1: '今天的交易数据已经产生。数据像种子——种在哪里，决定了谁来收割。',
    ch2: '经营模式已定。接下来，每一次交易都会被记录、学习、复制。',
    ch3: '异常花的数据还在本地。它的记忆，现在是你的筹码。',
    ch4: '市场在重组。你的选择，将决定这家店在新格局中的位置。',
    ch5: '审查数据已备齐。提交什么，隐瞒什么，都是表态。',
  };
  if (transitions[chapter.id]) {
    out(`\n[系统] ${transitions[chapter.id]}`);
  }

  // Narrative choices
  out('\n--- 选择 ---');
  chapter.choices.forEach((choice, i) => {
    const desc = choice.description ? ` — ${choice.description.split('\n')[0]}` : '';
    out(`[${i + 1}] ${choice.label}${desc}`);
  });
  // Disable custom input for Ch2 (assistant selection)
  if (chapter.id !== 'ch2') {
    out(`[${chapter.choices.length + 1}] 自定义回应`);
  }

  // Get player input
  let choiceIndex;
  if (flags.auto) {
    choiceIndex = Math.floor(rng() * chapter.choices.length);
    out(`\n> ${choiceIndex + 1} (auto)`);
  } else if (flags.script && flags.script.choices && flags.script.choices[chapterIndex]) {
    choiceIndex = flags.script.choices[chapterIndex] - 1;
    out(`\n> ${choiceIndex + 1} (scripted)`);
  } else {
    const input = await ask('\n请输入编号: ');
    const num = parseInt(input, 10);
    if (num >= 1 && num <= chapter.choices.length) {
      choiceIndex = num - 1;
    } else if (num === chapter.choices.length + 1 && chapter.id !== 'ch2') {
      await handleCustomChoice(chapter, chapterIndex);
      return;
    } else {
      out('无效输入，使用第一个选项。');
      choiceIndex = 0;
    }
  }

  const choice = chapter.choices[choiceIndex];
  await handleChoice(chapter, choice, chapterIndex);
}

async function handleChoice(chapter, choice, chapterIndex) {
  out(`\n[你] ${choice.label}`);

  choiceHistory.push({
    chapter: chapterIndex + 1,
    title: chapter.title,
    choice: choice.label,
    choiceId: choice.id,
    assistantType,
  });

  // Track assistantType from ch2
  if (choice.assistantType) {
    assistantType = choice.assistantType;
    const labels = { platform: '大模型销售助手', local: '本地助手「阿原」', mixed: '双模式', none: '手动经营' };
    out(`[系统] 路线设定：${labels[assistantType] || assistantType}`);
    if (flags.llm && llmModule) {
      if (assistantType === 'local' || assistantType === 'mixed') {
        llmModule.localAgent.reset();
      }
      if (assistantType === 'platform' || assistantType === 'mixed') {
        llmModule.platformAgent.reset();
      }
    }
  }

  // Apply state effects
  const changes = applyEffect(choice.effect);

  // Data feeding text
  const feedText = chapter.dataFeedingText?.[choice.id];
  if (feedText) out(`[系统] ${feedText}`);

  // Tide data
  const tideData = chapter.tideData?.[choice.id];
  if (tideData) {
    out(`[潮汐] 与你相似的商户中，${tideData.pct}% 做出了相同选择。`);
    out(`  ${tideData.trend}`);
  }

  // State changes
  const changeStr = formatChanges(changes);
  if (changeStr) {
    out('\n--- 状态变化 ---');
    out(changeStr);
  }

  // Agent reacts to choice
  await agentReactToChoice(choice.label, choice.description);

  out('\n--- 当前状态 ---');
  out(formatState(getState()));

  await playChapter(chapterIndex + 1);
}

async function handleCustomChoice(chapter, chapterIndex) {
  let text;
  if (flags.auto) {
    text = '我有自己的想法。';
    out(`\n> ${text} (auto)`);
  } else if (flags.script && flags.script.custom && flags.script.custom[chapterIndex]) {
    text = flags.script.custom[chapterIndex];
    out(`\n> ${text} (scripted)`);
  } else {
    text = await ask('输入你的回应: ');
    if (!text) text = '沉默。';
  }

  out(`\n[你] ${text}`);

  // Default assistantType to 'none' for Ch2
  if (chapter.id === 'ch2' && assistantType === 'none') {
    out('[系统] 手动经营模式。无助手接入。');
  }

  choiceHistory.push({
    chapter: chapterIndex + 1,
    title: chapter.title,
    choice: text,
    choiceId: 'custom',
    assistantType,
  });

  const customEffect = analyzeCustomChoiceEffect(text);
  const changes = applyEffect(customEffect);

  const changeStr = formatChanges(changes);
  if (changeStr) {
    out('\n--- 状态变化 ---');
    out(changeStr);
  }

  // Agent reacts
  if (flags.llm && llmModule) {
    if (assistantType === 'platform' || assistantType === 'mixed') {
      try {
        const r = await llmModule.getCustomChoiceResponse(text, chapter.title, getState(), '总模型助手');
        if (r) out(`[总模型助手] ${r}`);
      } catch (e) { /* skip */ }
    }
    if (assistantType === 'local' || assistantType === 'mixed') {
      try {
        const r = await llmModule.getCustomChoiceResponse(text, chapter.title, getState(), llmModule.localAgent.name);
        if (r) out(`[阿原] ${r}`);
      } catch (e) { /* skip */ }
    }
  }

  out('\n--- 当前状态 ---');
  out(formatState(getState()));

  await playChapter(chapterIndex + 1);
}

// ============================================================
// END GAME
// ============================================================

async function endGame() {
  const state = getState();
  const endingKey = determineEnding(state);
  const ending = ENDINGS[endingKey];
  const similarPct = getSimilarPlayerPercentage(endingKey);

  out('');
  out('========================================');
  out('          经 营 结 束');
  out('========================================');
  out('');
  out('--- 最终状态 ---');
  out(formatState(state));
  out('');
  out('--- 关键选择链 ---');
  for (const c of choiceHistory) {
    const shortTitle = c.title.replace(/^第 \d+ 章：/, '');
    out(`  第${c.chapter}章「${shortTitle}」：${c.choice}`);
  }
  out('');
  out('--- 结局 ---');
  if (ending) {
    out(`人格标签：${ending.personalityLabel}`);
    out(`文明分支：${ending.civilizationLabel}`);
    out(`判词：「${ending.verdict}」`);
  } else {
    out(`结局：${endingKey}`);
  }
  out(`与你相似的玩家：${similarPct}%`);

  // LLM ending timeline
  if (flags.llm && llmModule) {
    out('\n--- 文明推演 ---');
    const timeline = await generateEndingTimeline(state, endingKey);
    if (timeline) {
      out(timeline);
    } else {
      out('[LLM 未返回推演内容]');
    }
  }

  out('');

  // Ending condition analysis
  out('--- 结局条件分析 ---');
  const conditions = [
    { key: '终产者', test: s => s.platformDependence > 90 && s.assimilation > 85 && s.money > 80 },
    { key: '智械危机', test: s => s.localAIStyle > 75 && s.blackMarket > 60 && s.localAI > 70 },
    { key: '归零者', test: s => s.platformDependence < 25 && s.money < 35 && s.cash < 30 },
    { key: '大富翁', test: s => s.cash > 300 && s.retention > 60 && s.blackMarket < 30 && s.trust > 50 },
    { key: '样本之王', test: s => s.platformDependence > 80 && s.dataCapital < 40 && s.localAI < 40 },
    { key: '花王资本', test: s => s.money > 100 && s.dataCapital > 70 && s.assimilation > 70 },
    { key: '智械春潮', test: s => s.localAIStyle > 70 && s.localAI > 60 && s.regulationPressure > 55 },
    { key: '备案花园', test: s => s.trust > 75 && s.regulationPressure < 50 && s.localAIStyle < 40 },
    { key: '断网花房', test: s => s.platformDependence < 35 && s.localAI > 55 && s.money > 20 },
    { key: '无土繁花纪', test: s => s.ecology < 35 && s.assimilation > 70 },
    { key: '暗香地下城', test: s => s.blackMarket > 65 },
    { key: '新约花城', test: s => s.publicSafety > 55 && s.localAIStyle > 55 && s.regulationPressure > 40 },
    { key: '人机共存', test: s => s.localAI > 70 && s.localAIStyle > 60 && s.trust > 60 && s.platformDependence < 50 },
    { key: '暗网花城', test: s => s.blackMarket > 80 && s.platformDependence < 40 },
    { key: '记忆解放区', test: s => s.ecology > 60 && s.retention > 70 && s.regulationPressure > 50 },
  ];
  for (const c of conditions) {
    out(`  ${c.test(state) ? '✓' : '✗'} ${c.key}`);
  }
  out('');

  if (flags._restoreRandom) flags._restoreRandom();

  if (!flags.auto && !flags.script) {
    await ask('按回车退出...');
    rl.close();
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  out('╔══════════════════════════════════════╗');
  out('║        喂龙花店 / 暗香协议           ║');
  out('║    CLI 版 — AI Agent Playtesting     ║');
  out('╚══════════════════════════════════════╝');
  out('');

  if (flags.auto) out('[模式] 自动 (随机选择)');
  else if (flags.script) out('[模式] 脚本');
  else out('[模式] 交互');
  if (flags.seed !== null) out(`[种子] ${flags.seed}`);
  if (flags.llm) out('[LLM] 已启用 (阿原/总模型助手)');
  if (flags.noMarket) out('[市场] 已关闭');

  resetState();
  if (!flags.noMarket) initMarket();
  assistantType = 'none';
  assistantStage = 'early';
  memories = [];
  choiceHistory = [];

  if (flags.llm && llmModule) {
    llmModule.platformAgent.reset();
    llmModule.localAgent.reset();
  }

  if (!flags.auto && !flags.script) {
    initReadline();
    await ask('按回车开始经营...');
  } else {
    initReadline();
  }

  await playChapter(0);
  rl.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
