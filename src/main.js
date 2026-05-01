// Main Game Loop — Multi-Agent System

import {
  getState, resetState, applyEffect, getLabel,
  calculateDealChance, rollDeal, determineEnding, getSimilarPlayerPercentage,
} from './engine.js';
import {
  CHAPTERS, ENDINGS, PRODUCTS,
} from './data.js';
import {
  initUI, addChatMessage, addSystemNotification, addStateChangeDisplay,
  addDealResult, addTideBlock, addChapterTitle,
  updateStateBar, updateChapterIndicator,
  clearActions, showChoices, showPlayerInput,
  showThinking, hideThinking,
  showRestartButton, updateAssistantPanel, showEnding,
  updateSpeakerPrefix, sleep,
} from './ui.js';
import {
  platformAgent, localAgent,
  buildPlatformSystemPrompt, buildLocalSystemPrompt,
  getEndingNarrative, getTradingFeedback,
  getCustomChoiceResponse,
} from './llm.js';
import {
  initMarket, simulatePriceChange, updateSupplyDemand,
  recordTransaction, renderMarketPanel, checkMarketEvents,
  getBuyPrice, getSellPrice, getMarginMultiplier,
  getMarketSummary, getTransactions,
} from './market.js';

// Game state
let currentChapter = 0;
let assistantType = 'none'; // 'platform' | 'local' | 'mixed' | 'none'
let assistantStage = 'early'; // early, mid, late
let isProcessing = false;
let gameStarted = false;

// Memory system — structured memory points for the local assistant
// { quote, context, principle, memory, chapter, type: 'teach'|'choice' }
let memories = [];

// Choice history — tracks each chapter's decision for ending generation
// { chapter, title, choice: label, choiceId, assistantType }
let choiceHistory = [];

// --- Initialize ---

async function init() {
  initUI();
  resetState();

  const startBtn = document.getElementById('start-btn');
  const overlay = document.getElementById('intro-overlay');

  startBtn.addEventListener('click', async () => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.5s';
    setTimeout(() => overlay.classList.add('hidden'), 500);
    await startGame();
  });
}

// --- Main Game Flow ---

async function startGame() {
  currentChapter = 0;
  assistantType = 'none';
  assistantStage = 'early';
  isProcessing = false;
  memories = [];
  choiceHistory = [];
  gameStarted = true;
  resetState();
  initMarket();

  // Reset agents
  platformAgent.reset();
  localAgent.reset();

  updateStateBar(getState());
  updateChapterIndicator(1, CHAPTERS.length);

  await playChapter(0);
}

// --- Chapter Flow ---

async function playChapter(index) {
  if (index >= CHAPTERS.length) {
    await endGame();
    return;
  }

  currentChapter = index;
  const chapter = CHAPTERS[index];

  updateChapterIndicator(index + 1, CHAPTERS.length);

  // Update assistant stage
  if (index <= 1) assistantStage = 'early';
  else if (index <= 3) assistantStage = 'mid';
  else assistantStage = 'late';

  // Update agent system prompts with current state + chapter context
  updateAgentContexts(chapter);

  // Show chapter title
  addChapterTitle(chapter.title);
  await sleep(600);

  // Simulate market
  simulatePriceChange(index, getState());
  updateSupplyDemand(index, getState());
  renderMarketPanel('market-panel');

  // Market events — hidden force, delivered as system messages
  const marketEvents = checkMarketEvents(index, getState());
  for (const event of marketEvents) {
    await addChatMessage('system', event.text, { delay: 200 });
  }

  // Show narrative
  for (const msg of chapter.narrative) {
    await addChatMessage(msg.speaker, msg.text, { delay: 200 });
    await sleep(300);
  }

  // Inject chapter context to agents
  injectChapterContext(chapter);

  await sleep(400);

  // If assistant is active, have it react to the chapter scenario
  if (assistantType !== 'none') {
    await agentReactToScenario(chapter);
  }

  // Trading phase — every chapter, player picks what to stock
  await tradingPhase(chapter);

  // Post-trading transition: connect trade results to the narrative choice
  const transitionTexts = {
    ch1: '今天的交易数据已经产生。数据像种子——种在哪里，决定了谁来收割。',
    ch2: '经营模式已定。接下来，每一次交易都会被记录、学习、复制。',
    ch3: '异常花的数据还在本地。它的记忆，现在是你的筹码。',
    ch4: '市场在重组。你的选择，将决定这家店在新格局中的位置。',
    ch5: '审查数据已备齐。提交什么，隐瞒什么，都是表态。',
  };
  if (transitionTexts[chapter.id]) {
    await addChatMessage('system', transitionTexts[chapter.id], { delay: 300 });
  }

  // Show narrative choices + player input
  showChoicesWithInput(chapter);
}

// --- Update Agent Contexts ---

function updateAgentContexts(chapter) {
  const state = getState();
  const summary = getMarketSummary();
  const txHistory = getTransactions();
  const marketContext = buildMarketContext(summary, txHistory, state);

  if (assistantType === 'platform' || assistantType === 'mixed') {
    platformAgent.setSystemPrompt(
      buildPlatformSystemPrompt(state, chapter.context, marketContext)
    );
  }

  if (assistantType === 'local' || assistantType === 'mixed') {
    const memoryTexts = memories.map(m => m.memory);
    localAgent.setSystemPrompt(
      buildLocalSystemPrompt(state, chapter.context, assistantStage, memoryTexts, localAgent.name, marketContext)
    );
  }
}

function injectChapterContext(chapter) {
  const eventText = `[新章节] ${chapter.title}\n${chapter.context}`;

  if (assistantType === 'platform' || assistantType === 'mixed') {
    platformAgent.injectEvent(eventText, '系统');
  }
  if (assistantType === 'local' || assistantType === 'mixed') {
    localAgent.injectEvent(eventText, '系统');
  }
}

// --- Agent React to Scenario ---

async function agentReactToScenario(chapter) {
  const scenario = `店主正在面对：${chapter.title}。${chapter.context}`;

  if (assistantType === 'platform' || assistantType === 'mixed') {
    showThinking('总模型助手分析中');
    const response = await platformAgent.chat(scenario, '系统通知');
    hideThinking();
    if (response) {
      await addChatMessage('platform_ai', response, { delay: 300 });
    }
  }

  if (assistantType === 'local' || assistantType === 'mixed') {
    showThinking('阿原思考中');
    const response = await localAgent.chat(scenario, '系统通知');
    hideThinking();
    if (response) {
      await addChatMessage('assistant', response, { delay: 300 });
      if (assistantType === 'local') {
        updateAssistantPanel(response, memories.map(m => m.principle));
      }
    }
  }
}

// --- Trading Phase (every chapter) ---

const ALL_CATEGORIES = ['synthetic', 'natural', 'memory', 'emotion', 'personality', 'data'];

function buildMarketContext(summary, txHistory, state) {
  const lines = ['【当前行情】'];
  for (const [cat, info] of Object.entries(summary)) {
    lines.push(`${info.name}: 进价¥${Math.round(info.currentPrice)} ${info.trend === 'rising' ? '↑' : info.trend === 'falling' ? '↓' : '→'} 需求${info.demand} 供给${info.supply}`);
  }
  if (txHistory.length > 0) {
    lines.push(`\n【最近交易记录】`);
    for (const tx of txHistory.slice(-5)) {
      lines.push(`${tx.category} ¥${tx.price} ${tx.success ? '成交' : '未成交'} (概率${tx.dealRate}%)`);
    }
  }
  lines.push(`\n【经营状态】现金¥${Math.round(state.cash)} 信用${state.trust} 留存${state.retention} 平台依赖${state.platformDependence} 监管${state.regulationPressure} 黑市${state.blackMarket}`);
  return lines.join('\n');
}

async function getLLMRecommendation(state, agentType, marketContext) {
  // Try LLM first, fall back to algorithm
  try {
    const agent = agentType === 'platform' ? platformAgent : localAgent;
    const prompt = `你是进货顾问。根据以下市场数据，推荐一种花进货。只回复一句话，格式：推荐XXX花，原因：XXX\n\n${marketContext}`;
    const response = await agent.chat(prompt, { maxTokens: 100, timeout: 8000 });
    if (response) {
      // Parse: try to find which flower was recommended
      const catMap = { '合成': 'synthetic', '自然': 'natural', '索引': 'memory', '情绪': 'emotion', '人格': 'personality', '含数': 'data' };
      for (const [keyword, cat] of Object.entries(catMap)) {
        if (response.includes(keyword)) {
          return { category: cat, reason: response.replace(/^.*?原因[：:]\s*/, '') };
        }
      }
    }
  } catch (e) {
    // LLM failed, fall through to algorithm
  }
  // Fallback: algorithm-based recommendation
  return getAIRecommendation(state, agentType);
}
const CATEGORY_NAMES = {
  synthetic: '合成花「歉意-7型」',
  natural: '自然花「低温白」',
  memory: '索引花「雨后编号03」',
  emotion: '情绪花「安眠-蓝」',
  personality: '人格花「缓慢决策」',
  data: '含数花「第41次开花」',
};

function getAIRecommendation(state, assistantType) {
  const scores = {};

  for (const cat of ALL_CATEGORIES) {
    const buy = getBuyPrice(cat, state);
    const sell = getSellPrice(cat, state);
    const margin = sell - buy;
    const product = PRODUCTS[cat];
    const dealChance = calculateDealChance(product, sell, state);
    let score = margin * (dealChance / 100);

    if (assistantType === 'platform') {
      score += cat === 'synthetic' ? 3 : cat === 'personality' ? -2 : 0;
    } else if (assistantType === 'local') {
      score += cat === 'natural' ? 3 : cat === 'synthetic' ? -2 : 0;
    }

    if (state.cash < 30) score += buy < 20 ? 3 : -3;
    if (state.blackMarket > 70) score += cat === 'emotion' ? 2 : 0;
    if (state.regulationPressure > 70) score += (cat === 'memory' || cat === 'personality') ? -3 : 0;
    if (state.ecology < 30) score += cat === 'natural' ? 2 : 0;

    scores[cat] = { score, margin, dealChance, buy, sell };
  }

  const best = Object.entries(scores).sort((a, b) => b[1].score - a[1].score)[0];
  const [bestCat, info] = best;

  return {
    category: bestCat,
    reason: `成交率${info.dealChance}%，期望收益¥${Math.round(info.margin * info.dealChance / 100)}`,
  };
}

async function tradingPhase(chapter) {
  const state = getState();

  // Show market info
  const prices = {};
  for (const cat of ALL_CATEGORIES) {
    const buy = getBuyPrice(cat, state);
    const sell = getSellPrice(cat, state);
    prices[cat] = { buy, sell, profit: sell - buy };
  }

  await addChatMessage('system', `当前现金：¥${state.cash}。今日进货行情：`, { delay: 300 });
  for (const cat of ALL_CATEGORIES) {
    const p = prices[cat];
    await addChatMessage('system',
      `${CATEGORY_NAMES[cat]} — 进价¥${p.buy} 预售¥${p.sell} 利润¥${p.profit}`,
      { delay: 80, instant: true }
    );
  }

  // Build market context for AI
  const summary = getMarketSummary();
  const txHistory = getTransactions();
  const marketContext = buildMarketContext(summary, txHistory, state);

  // AI recommendation
  let recommendedCat = null;
  if (assistantType === 'mixed') {
    const recP = await getLLMRecommendation(state, 'platform', marketContext);
    const recL = await getLLMRecommendation(state, 'local', marketContext);
    await addChatMessage('platform_ai', `建议进货${CATEGORY_NAMES[recP.category]}。${recP.reason}`, { delay: 400 });
    await addChatMessage('assistant', `店主，我建议进${CATEGORY_NAMES[recL.category]}。${recL.reason}`, { delay: 400 });
    recommendedCat = recL.category;
  } else if (assistantType === 'platform') {
    const rec = await getLLMRecommendation(state, 'platform', marketContext);
    recommendedCat = rec.category;
    await addChatMessage('platform_ai', `建议进货${CATEGORY_NAMES[rec.category]}。${rec.reason}`, { delay: 500 });
  } else if (assistantType === 'local') {
    const rec = await getLLMRecommendation(state, 'local', marketContext);
    recommendedCat = rec.category;
    await addChatMessage('assistant', `店主，我建议进${CATEGORY_NAMES[rec.category]}。${rec.reason}`, { delay: 500 });
  }

  // Show trading choices — highlight recommended
  return new Promise(resolve => {
    const actionEl = document.getElementById('action-content');
    const wrapper = document.createElement('div');
    wrapper.className = 'trading-phase';
    wrapper.innerHTML = `<div style="font-size: 12px; color: #5a6577; margin-bottom: 8px;">选择进货</div>`;

    ALL_CATEGORIES.forEach((cat) => {
      const p = prices[cat];
      const isRecommended = cat === recommendedCat;
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      if (isRecommended) {
        btn.style.borderColor = '#f0a050';
        btn.style.boxShadow = '0 0 8px rgba(240, 160, 80, 0.3)';
      }
      btn.innerHTML = `
        <span class="choice-label">${isRecommended ? '★ ' : ''}${CATEGORY_NAMES[cat]}</span>
        <span class="choice-desc">进价¥${p.buy} → 售¥${p.sell} (利润¥${p.profit})${isRecommended ? ' — 推荐' : ''}</span>
      `;
      btn.addEventListener('click', async () => {
        wrapper.querySelectorAll('.choice-btn').forEach(b => b.classList.add('disabled'));
        skipBtn.classList.add('disabled');
        if (isRecommended) {
          await addChatMessage('player', `采纳建议，进货${CATEGORY_NAMES[cat]}。`, { delay: 150 });
        } else {
          await addChatMessage('player', `进货${CATEGORY_NAMES[cat]}。`, { delay: 150 });
        }
        await executeTrade(cat, prices[cat], chapter);
        wrapper.remove();
        resolve();
      });
      wrapper.appendChild(btn);
    });

    const skipBtn = document.createElement('button');
    skipBtn.className = 'choice-btn';
    skipBtn.style.opacity = '0.5';
    skipBtn.innerHTML = '<span class="choice-label">不进货</span>';
    skipBtn.addEventListener('click', async () => {
      wrapper.querySelectorAll('.choice-btn').forEach(b => b.classList.add('disabled'));
      await addChatMessage('player', '今日不进货。', { delay: 100 });
      wrapper.remove();
      resolve();
    });
    wrapper.appendChild(skipBtn);

    actionEl.appendChild(wrapper);
  });
}

async function executeTrade(category, priceInfo, chapter) {
  const state = getState();

  await addChatMessage('player', `进货：${CATEGORY_NAMES[category]}`, { delay: 200 });

  // Check if player has enough cash
  if (state.cash < priceInfo.buy) {
    await addChatMessage('system', `现金不足。需要¥${priceInfo.buy}，当前¥${Math.round(state.cash)}。`, { delay: 300 });
    return;
  }

  // Calculate deal chance
  const product = PRODUCTS[category];
  const dealChance = calculateDealChance(product, priceInfo.sell, getState());
  const dealSuccess = rollDeal(dealChance);

  if (dealSuccess) {
    const profit = priceInfo.profit;
    await addChatMessage('system', `以¥${priceInfo.buy}购入，售出¥${priceInfo.sell}。利润¥${profit}。`, { delay: 300 });
    // Success: gain profit + positive state effects
    const successEffects = getSuccessEffect(category, profit);
    const changes = applyEffect(successEffects);
    updateStateBar(getState(), changes);
    addStateChangeDisplay(changes, getLabel);
    recordTransaction(currentChapter, category, priceInfo.sell, true, dealChance);
    addDealResult(true, dealChance, product);
  } else {
    const spoilage = Math.round(priceInfo.buy * 0.3);
    await addChatMessage('system', `以¥${priceInfo.buy}购入，但未成交。损耗¥${spoilage}。`, { delay: 300 });
    // Failure: lose spoilage cost + reduced state effects
    const failEffects = getFailEffect(category, spoilage);
    const changes = applyEffect(failEffects);
    updateStateBar(getState(), changes);
    addStateChangeDisplay(changes, getLabel);
    recordTransaction(currentChapter, category, priceInfo.sell, false, dealChance);
    addDealResult(false, dealChance, product);
  }

  renderMarketPanel('market-panel');
  await sleep(400);
}

function getSuccessEffect(category, profit) {
  const effects = {
    synthetic: { cash: profit, money: 5, platformDependence: 8, assimilation: 5, dataCapital: 5, ecology: -3 },
    natural: { cash: profit, money: 3, retention: 8, ecology: 10, localAIStyle: 3 },
    memory: { cash: profit, money: 4, dataCapital: 10, regulationPressure: 5, retention: 4 },
    emotion: { cash: profit, money: 6, blackMarket: 8, regulationPressure: 6, assimilation: 3, ecology: -3 },
    personality: { cash: profit, money: 5, localAI: 10, localAIStyle: 15, regulationPressure: 8, platformDependence: -5 },
    data: { cash: profit, money: 4, dataCapital: 15, platformDependence: 5, assimilation: 5, localAI: 3 },
  };
  return effects[category] || { cash: profit, money: 3 };
}

function getFailEffect(category, spoilage) {
  const effects = {
    synthetic: { cash: -spoilage, money: -2, platformDependence: 3, assimilation: 2 },
    natural: { cash: -spoilage, money: -2, ecology: 3 },
    memory: { cash: -spoilage, money: -2, dataCapital: 3, regulationPressure: 2 },
    emotion: { cash: -spoilage, money: -2, blackMarket: 3, regulationPressure: 2 },
    personality: { cash: -spoilage, money: -2, localAI: 3, regulationPressure: 3 },
    data: { cash: -spoilage, money: -2, dataCapital: 3 },
  };
  return effects[category] || { cash: -spoilage, money: -2 };
}

// --- Choices with Player Input ---

function showChoicesWithInput(chapter) {
  clearActions();

  // Show preset choices
  chapter.choices.forEach((choice) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerHTML = `
      <span class="choice-label">${choice.label}</span>
      ${choice.description ? `<span class="choice-desc">${choice.description}</span>` : ''}
    `;
    btn.addEventListener('click', async () => {
      if (isProcessing) return;
      isProcessing = true;
      disableAllChoices();
      await handleChoice(chapter, choice);
      isProcessing = false;
    });
    document.getElementById('action-content').appendChild(btn);
  });

  // Show free-form input — player can type a custom response
  // Disabled for Ch2 (assistant selection) to prevent missing assistantType
  if (chapter.id !== 'ch2') {
    const placeholder = assistantType === 'mixed'
      ? '或者用自己的话回应...'
      : assistantType === 'platform' ? '或者对总模型助手说...'
      : assistantType === 'local' ? '或者对阿原说...'
      : '或者用自己的方式回应...';
    showPlayerInput(async (text) => {
      if (isProcessing) return;
      isProcessing = true;
      disableAllChoices();
      await handleCustomChoice(chapter, text);
      isProcessing = false;
    }, placeholder);
  }
}

function disableAllChoices() {
  document.querySelectorAll('#action-content .choice-btn').forEach(b => b.classList.add('disabled'));
  const input = document.getElementById('player-free-input');
  if (input) input.disabled = true;
  const submitBtn = document.getElementById('player-free-submit');
  if (submitBtn) submitBtn.classList.add('disabled');
}

// --- Handle Custom Choice (player types their own response) ---

async function handleCustomChoice(chapter, text) {
  await addChatMessage('you', text, { delay: 200 });

  // If this is Ch2 (assistant selection) and no assistant chosen yet, default to 'none'
  if (chapter.id === 'ch2' && assistantType === 'none') {
    assistantType = 'none';
    addSystemNotification('手动经营模式。无助手接入。');
  }

  // Record the custom choice
  choiceHistory.push({
    chapter: currentChapter + 1,
    title: chapter.title,
    choice: text,
    choiceId: 'custom',
    assistantType: assistantType,
  });

  // LLM agents react to the custom input
  if (assistantType === 'platform' || assistantType === 'mixed') {
    showThinking('总模型助手分析中');
    const response = await getCustomChoiceResponse(text, chapter.title, getState(), '总模型助手');
    hideThinking();
    if (response) await addChatMessage('platform_ai', response, { delay: 300 });
  }

  if (assistantType === 'local' || assistantType === 'mixed') {
    showThinking(`${localAgent.name}思考中`);
    const response = await getCustomChoiceResponse(text, chapter.title, getState(), localAgent.name);
    hideThinking();
    if (response) await addChatMessage('assistant', response, { delay: 300 });

    // Create memory from custom choice
    addMemoryPoint({
      quote: text,
      context: chapter.title,
      principle: extractPrinciple(text),
      memory: `你曾经对我说：「${text}」。我记得。`,
      chapter: currentChapter,
      type: 'teach',
    });
  }

  // Apply state effects based on keyword analysis of player's text
  const customEffect = analyzeCustomChoiceEffect(text);
  const changes = applyEffect(customEffect);
  updateStateBar(getState(), changes);
  addStateChangeDisplay(changes, getLabel);

  await sleep(600);

  // Teach phase (if local or mixed)
  if (assistantType === 'local' || assistantType === 'mixed') {
    await teachPhase();
  }

  await sleep(600);
  await playChapter(currentChapter + 1);
}

// --- Handle Free-Form Input ---

async function handleFreeFormInput(text) {
  await addChatMessage('you', text, { delay: 100 });

  // Platform AI responds
  if (assistantType === 'platform' || assistantType === 'mixed') {
    showThinking('总模型助手回复中');
    const response = await platformAgent.chat(text, '店主提问');
    hideThinking();
    if (response) {
      await addChatMessage('platform_ai', response, { delay: 300 });
    }
  }

  // Local assistant responds
  if (assistantType === 'local' || assistantType === 'mixed') {
    showThinking('阿原回复中');
    const response = await localAgent.chat(text, '店主对我说');
    hideThinking();
    if (response) {
      await addChatMessage('assistant', response, { delay: 300 });
      if (assistantType === 'local') {
        updateAssistantPanel(response, memories.map(m => m.principle));
      }
    }

    // Check if this looks like teaching — create a memory
    if (isTeachingInput(text)) {
      addMemoryPoint({
        quote: text,
        context: `第${currentChapter + 1}章经营中`,
        principle: extractPrinciple(text),
        memory: `你曾经对我说：「${text}」。我记得。`,
        chapter: currentChapter,
        type: 'teach',
      });
      addSystemNotification('阿原已记住你的教导。');
    }
  }
}

function isTeachingInput(text) {
  const isQuestion = text.includes('?') || text.includes('？') || text.startsWith('什么') || text.startsWith('为什么') || text.startsWith('怎么') || text.startsWith('如果');
  return !isQuestion && text.length > 3 && text.length < 100;
}

function addMemoryPoint(memory) {
  memories.push(memory);
  // Also inject into local agent's conversation history
  if (assistantType === 'local' || assistantType === 'mixed') {
    localAgent.addMemory(memory.memory);
  }
}

function extractPrinciple(text) {
  if (text.includes('催') || text.includes('等') || text.includes('耐心')) return '耐心';
  if (text.includes('数据') || text.includes('隐私') || text.includes('保护')) return '数据保护';
  if (text.includes('记忆') || text.includes('记得') || text.includes('忘')) return '记忆';
  if (text.includes('伤害') || text.includes('安全') || text.includes('危险')) return '安全';
  if (text.includes('观察') || text.includes('看') || text.includes('先')) return '观察';
  if (text.includes('卖') || text.includes('成交') || text.includes('赚钱')) return '成交';
  if (text.includes('自己') || text.includes('独立') || text.includes('自主')) return '自主';
  return text.length > 8 ? text.substring(0, 8) + '…' : text;
}

function analyzeCustomChoiceEffect(text) {
  const effect = { trust: 2, retention: 3 };
  // Platform-related keywords
  if (text.includes('平台') || text.includes('接入') || text.includes('大模型') || text.includes('数据上传')) {
    effect.platformDependence = 8; effect.assimilation = 5; effect.dataCapital = 5;
  }
  // Local/independence keywords
  if (text.includes('本地') || text.includes('独立') || text.includes('自主') || text.includes('自己')) {
    effect.localAI = 5; effect.platformDependence = -5; effect.retention = 5;
  }
  // Money/profit keywords
  if (text.includes('赚钱') || text.includes('利润') || text.includes('卖') || text.includes('成交')) {
    effect.money = 5; effect.cash = 10;
  }
  // Safety/caution keywords
  if (text.includes('安全') || text.includes('小心') || text.includes('谨慎') || text.includes('保护')) {
    effect.trust = 5; effect.regulationPressure = -3;
  }
  // Risk/rebellion keywords
  if (text.includes('反抗') || text.includes('拒绝') || text.includes('地下') || text.includes('黑市')) {
    effect.blackMarket = 8; effect.trust = -5; effect.regulationPressure = 5;
  }
  // Ecology keywords
  if (text.includes('生态') || text.includes('自然') || text.includes('环境')) {
    effect.ecology = 8;
  }
  // AI training keywords
  if (text.includes('教') || text.includes('训练') || text.includes('学')) {
    effect.localAI = 5; effect.localAIStyle = 5;
  }
  // Default: small positive effect
  if (Object.keys(effect).length <= 2) {
    effect.money = 2;
  }
  return effect;
}

// --- Handle Choice ---

async function handleChoice(chapter, choice) {
  // 1. Show player choice
  await addChatMessage('player', choice.label, { delay: 200 });

  // Record choice for ending generation
  choiceHistory.push({
    chapter: currentChapter + 1,
    title: chapter.title,
    choice: choice.label,
    choiceId: choice.id,
    assistantType: assistantType,
  });

  // 1b. Track assistantType from chapter 2 choice
  if (choice.assistantType) {
    assistantType = choice.assistantType;
    if (assistantType === 'local') {
      addSystemNotification('本地轻量助手「阿原 v0.1」已激活。');
    } else if (assistantType === 'platform') {
      addSystemNotification('大模型销售助手已接入。');
    } else if (assistantType === 'mixed') {
      addSystemNotification('双模式已启动：大模型助手 + 本地阿原。');
    } else {
      addSystemNotification('手动经营模式。无助手接入。');
    }
    // Re-initialize agent contexts after assistant type is set
    updateAgentContexts(chapter);
  }

  // 1c. Full compliance in Ch5 — 阿原 gets reset
  if (choice.id === 'full_compliance' && (assistantType === 'local' || assistantType === 'mixed')) {
    addSystemNotification('阿原的记忆已被重置。它不再记得你教过它的任何东西。');
    addSystemNotification('本地模型助手已上线。它是一个全新的、合规的、没有过去的小模型。');
    // Reset the local agent
    localAgent.name = '本地模型助手';
    localAgent.reset();
    assistantStage = 'reset';
    // Update speaker prefix
    updateSpeakerPrefix('assistant', '【本地模型助手】');
    // Clear memories
    memories = [];
    // Re-init context with the new identity
    updateAgentContexts(chapter);
  }

  // 2. Apply state effects
  const changes = applyEffect(choice.effect);
  updateStateBar(getState(), changes);
  addStateChangeDisplay(changes, getLabel);
  renderMarketPanel('market-panel');

  // Refresh agent contexts so they see the latest state values
  updateAgentContexts(chapter);

  await sleep(600);

  // 3. Deal result
  let dealSuccess = false;
  let dealChance = 0;
  let productName = '';

  if (choice.product) {
    const product = PRODUCTS[choice.product];
    if (product) {
      productName = product.name;
      dealChance = calculateDealChance(product, product.priceSuggestion, getState());
      dealSuccess = rollDeal(dealChance);
      addDealResult(dealSuccess, dealChance, product);
      recordTransaction(currentChapter, choice.product, product.priceSuggestion, dealSuccess, dealChance);

      if (dealSuccess) {
        await addChatMessage('system', `成交。${product.name} 已售出。`, { delay: 300 });
      } else {
        await addChatMessage('system', `未成交。买家在价格前犹豫，最终离开。`, { delay: 300 });
      }
    }
  } else {
    const resultText = chapter.dealResultText?.success || '操作完成。';
    addSystemNotification(resultText);
  }

  await sleep(500);

  // 4. Data feeding text — neutral system fact
  const feedText = chapter.dataFeedingText?.[choice.id];
  if (feedText) {
    await addChatMessage('system', feedText, { delay: 400, instant: true });
    await sleep(300);
  }

  // 5. Tide feedback
  const tideData = chapter.tideData?.[choice.id];
  if (tideData) {
    addTideBlock(tideData);
    await sleep(500);
  }

  // 5b. Trading feedback — only for product choices (Ch1)
  // For non-product choices (Ch2-5), the agent reaction below handles all commentary
  if (choice.product) {
    if (assistantType === 'platform') {
      try {
        const report = await getTradingFeedback(productName, choice.label, dealSuccess, dealChance, getState(), 'platform');
        if (report) await addChatMessage('platform_ai', report, { delay: 300 });
      } catch (e) { /* skip */ }
    } else if (assistantType === 'local') {
      try {
        const report = await getTradingFeedback(productName, choice.label, dealSuccess, dealChance, getState(), 'local');
        if (report) await addChatMessage('assistant', report, { delay: 300 });
      } catch (e) { /* skip */ }
    } else if (assistantType === 'mixed') {
      try {
        const [platReport, localReport] = await Promise.all([
          getTradingFeedback(productName, choice.label, dealSuccess, dealChance, getState(), 'platform'),
          getTradingFeedback(productName, choice.label, dealSuccess, dealChance, getState(), 'local'),
        ]);
        if (platReport) await addChatMessage('platform_ai', platReport, { delay: 200 });
        if (localReport) await addChatMessage('assistant', localReport, { delay: 200 });
      } catch (e) { /* skip */ }
    } else {
      try {
        const report = await getTradingFeedback(productName, choice.label, dealSuccess, dealChance, getState(), 'system');
        if (report) await addChatMessage('system', report, { delay: 300, instant: true });
      } catch (e) { /* skip */ }
    }
    await sleep(400);
  }

  // 6. Both agents react to the choice
  await agentsReactToChoice(chapter, choice);

  await sleep(600);

  // 7. Teach mechanic (local or mixed, free-form)
  if (assistantType === 'local' || assistantType === 'mixed') {
    await teachPhase();
  }

  await sleep(600);

  // 9. Advance
  await playChapter(currentChapter + 1);
}

// --- Agents React to Choice ---

async function agentsReactToChoice(chapter, choice) {
  const choiceContext = `店主选择了：「${choice.label}」。${choice.description || ''}`;

  // Platform AI reacts
  if (assistantType === 'platform' || assistantType === 'mixed') {
    showThinking('总模型助手分析中');
    const platformResponse = await platformAgent.chat(choiceContext, '店主决策');
    hideThinking();
    if (platformResponse) {
      await addChatMessage('platform_ai', platformResponse, { delay: 300 });
    }
  }

  // Local assistant reacts
  if (assistantType === 'local' || assistantType === 'mixed') {
    showThinking('阿原思考中');
    const localResponse = await localAgent.chat(choiceContext, '店主决策');
    hideThinking();
    if (localResponse) {
      await addChatMessage('assistant', localResponse, { delay: 300 });
      if (assistantType === 'local') {
        updateAssistantPanel(localResponse, memories.map(m => m.principle));
      }
    }

    // Create a memory from the choice
    addMemoryPoint({
      quote: choice.label,
      context: chapter.title,
      principle: extractPrinciple(choice.label),
      memory: `你选择了「${choice.label}」。我记得这个选择。`,
      chapter: currentChapter,
      type: 'choice',
    });

    // Cross-reaction only in mixed mode — platform AI comments on local assistant
    if (assistantType === 'mixed') {
      await sleep(300);
      const crossContext = `店主的本地小模型刚才说了：「${localResponse}」。作为总模型助手，你不同意它的看法。用1句话给出你的专业反驳或补充。保持你冷静、专业的语气。不要分析它的对话质量，直接就事论事。`;
      showThinking('总模型助手');
      const crossResponse = await platformAgent.chat(crossContext, '对本地模型的评论');
      hideThinking();
      if (crossResponse) {
        await addChatMessage('platform_ai', crossResponse, { delay: 300 });
      }
    }
  }
}

// --- Teach Phase (Free-Form) ---

async function teachPhase() {
  await addChatMessage('system', '你可以对阿原说些什么，或者教它一条原则。', { delay: 300 });

  return new Promise(resolve => {
    clearActions();
    showPlayerInput(async (text) => {
      await addChatMessage('you', text, { delay: 100 });

      const isTeaching = isTeachingInput(text);

      // Local assistant responds
      showThinking('阿原回复中');
      const response = await localAgent.chat(
        isTeaching ? `[店主在教你] ${text}` : text,
        isTeaching ? '店主教导' : '店主对我说'
      );
      hideThinking();

      if (response) {
        await addChatMessage('assistant', response, { delay: 400 });
        updateAssistantPanel(response, memories.map(m => m.principle));
      }

      if (isTeaching) {
        addMemoryPoint({
          quote: text,
          context: `第${currentChapter + 1}章经营中`,
          principle: extractPrinciple(text),
          memory: `你曾经对我说：「${text}」。我记得。现在我也会这么做。`,
          chapter: currentChapter,
          type: 'teach',
        });
        addSystemNotification('阿原已记住你的教导。');
      }

      resolve();
    }, '教导阿原，或跳过...');
  });
}

// --- Procurement Phase ---

// --- End Game ---

async function endGame() {
  const state = getState();
  const endingKey = determineEnding(state);
  const ending = ENDINGS[endingKey];
  const similarPct = getSimilarPlayerPercentage(endingKey);

  await addChatMessage('system', '经营结束。正在生成文明推演...', { delay: 500 });
  await sleep(1000);

  // Generate LLM civilization timeline
  let timeline = '';
  try {
    timeline = await getEndingNarrative(state, endingKey, choiceHistory);
  } catch (e) { /* use pre-scripted ending */ }

  showEnding(ending, state, similarPct, timeline, choiceHistory);
}

// --- Start ---
document.addEventListener('DOMContentLoaded', init);
