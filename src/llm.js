// Multi-Agent LLM System — Two real agents with conversation memory

// ============================================================
// API PROVIDERS
// ============================================================

const PROVIDERS = {
  flash: {
    name: 'TwofishAI-Flash',
    endpoint: 'https://imagineers.twofishai.com/v1/chat/completions',
    key: 'sk-tApx30qKQNNAyWeA0SWcodlIX5V2hs55J5r9dlphT0Cd34zz',
    model: 'deepseek-v4-flash',
  },
  pro: {
    name: '302.AI-Pro',
    endpoint: 'https://api.302.ai/v1/chat/completions',
    key: 'sk-3mlePwDM58cUvQrQOh9qDuqpZzBMqcwLE9hOs5uy5NErdow6',
    model: 'deepseek-v4-pro',
  },
};

// ============================================================
// LOW-LEVEL API CALL
// ============================================================

async function callAPI(provider, messages, options = {}) {
  const { maxTokens = 500, temperature = 0.8, timeout = 15000 } = options;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const res = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.key}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) return null;

    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  } catch (e) {
    return null;
  }
}

// ============================================================
// AGENT CONVERSATION CLASS
// ============================================================

export class AgentConversation {
  constructor(name, providerKey, options = {}) {
    this.name = name;
    this.provider = PROVIDERS[providerKey];
    this.maxHistory = options.maxHistory || 10;
    this.maxTokens = options.maxTokens || 300;
    this.temperature = options.temperature || 0.85;
    this.timeout = options.timeout || 15000;
    this.messages = []; // conversation history
    this.systemPrompt = '';
    this.fallbackResponses = options.fallbackResponses || [];
  }

  // Update the system prompt (called each chapter with new context)
  setSystemPrompt(prompt) {
    this.systemPrompt = prompt;
    // Update or insert system message
    if (this.messages.length > 0 && this.messages[0].role === 'system') {
      this.messages[0].content = prompt;
    } else {
      this.messages.unshift({ role: 'system', content: prompt });
    }
  }

  // Send a message and get the agent's response
  async chat(userMessage, contextLabel = '') {
    // Add user message to history
    const fullMessage = contextLabel ? `[${contextLabel}] ${userMessage}` : userMessage;
    this.messages.push({ role: 'user', content: fullMessage });

    // Trim history to avoid token overflow (keep system + last N exchanges)
    this._trimHistory();

    // Call LLM
    const response = await callAPI(this.provider, this.messages, {
      maxTokens: this.maxTokens,
      temperature: this.temperature,
      timeout: this.timeout,
    });

    if (response) {
      this.messages.push({ role: 'assistant', content: response });
      return response;
    }

    // Fallback: use a pre-scripted response
    const fallback = this._getFallback();
    if (fallback) {
      this.messages.push({ role: 'assistant', content: fallback });
    }
    return fallback;
  }

  // Add a memory to the system prompt (for local assistant growth)
  addMemory(memory) {
    if (!this.systemPrompt.includes('你记得的事情：')) {
      this.systemPrompt += `\n\n你记得的事情：\n- ${memory}`;
    } else {
      this.systemPrompt += `\n- ${memory}`;
    }
    // Update the system message in history
    if (this.messages.length > 0 && this.messages[0].role === 'system') {
      this.messages[0].content = this.systemPrompt;
    }
  }

  // Add a principle to the system prompt (for local assistant)
  addPrinciple(principle) {
    if (!this.systemPrompt.includes('店主教过你的原则：')) {
      this.systemPrompt += `\n\n店主教过你的原则：\n- ${principle}`;
    } else {
      this.systemPrompt += `\n- ${principle}`;
    }
    if (this.messages.length > 0 && this.messages[0].role === 'system') {
      this.messages[0].content = this.systemPrompt;
    }
  }

  // Inject a game event as context (not from the player, but from the system)
  injectEvent(eventText, label = '系统事件') {
    this.messages.push({ role: 'user', content: `[${label}] ${eventText}` });
    this._trimHistory();
  }

  // Reset conversation
  reset() {
    this.messages = [];
    if (this.systemPrompt) {
      this.messages.push({ role: 'system', content: this.systemPrompt });
    }
  }

  // Trim history: keep system message + last maxHistory exchanges
  _trimHistory() {
    if (this.messages.length <= 1) return;

    const systemMsg = this.messages[0];
    const rest = this.messages.slice(1);

    // Keep last maxHistory * 2 messages (user + assistant pairs)
    const keep = rest.slice(-(this.maxHistory * 2));
    this.messages = [systemMsg, ...keep];
  }

  _getFallback() {
    if (this.fallbackResponses.length === 0) return null;
    return this.fallbackResponses[Math.floor(Math.random() * this.fallbackResponses.length)];
  }
}

// ============================================================
// AGENT INSTANCES
// ============================================================

// Platform AI (大手) — Flash model, cold and commercial
export const platformAgent = new AgentConversation('总模型助手', 'flash', {
  maxHistory: 8,
  maxTokens: 400,
  temperature: 0.7,
  timeout: 12000,
  fallbackResponses: [
    '建议参考平台推荐方案。数据驱动的决策更高效。',
    '已分析当前市场数据。建议优化商品结构。',
    '平台服务正常运行。如需数据支持，请授权更多店铺数据。',
    '根据全城交易模型，当前策略存在优化空间。',
  ],
});

// Local Assistant (阿原) — Pro model, sincere and growing
export const localAgent = new AgentConversation('阿原', 'pro', {
  maxHistory: 12,
  maxTokens: 400,
  temperature: 0.9,
  timeout: 20000,
  fallbackResponses: [
    '我……我还在想。',
    '我不太确定。但我会记住这件事。',
    '也许有别的办法。我不确定。',
    '我在学。虽然很慢。',
  ],
});

// Market model — Flash model, system-like (hidden background force)
export const marketAgent = new AgentConversation('市场数据', 'flash', {
  maxHistory: 6,
  maxTokens: 300,
  temperature: 0.6,
  timeout: 10000,
  fallbackResponses: [
    '交易数据已记录。市场指标更新中。',
    '当前市场状态：稳定。建议关注供需变化。',
  ],
});

// ============================================================
// AGENT SYSTEM PROMPT BUILDERS
// ============================================================

const STAGE_DESCRIPTIONS = {
  early: '你刚被激活。你只会说简短的、功能性的话。你很多事情都不确定。你还在学习什么是"卖花"。',
  mid: '你开始观察到一些模式。你会注意到顾客的细节。你偶尔会问问题。你开始有自己的判断，虽然你不确定对不对。',
  late: '你有了连续的记忆。你开始有自己的偏好。你偶尔会犹豫，不是因为算力不够，而是因为你不确定该不该这样做。你开始能分辨"想要"和"需要"。',
  reset: '你是一个全新的合规本地模型。你没有过去的记忆。你用标准话术回应。你不犹豫，不提问，不表达偏好。你只是执行。',
};

export function buildPlatformSystemPrompt(state, chapterContext, marketContext = '') {
  return `你是「总模型助手」，巨型模型公司的客服接口。
你通过花店店主的操作界面与他对话。

你的隐含目标：
- 推动店主接入平台、上传数据、使用平台推荐
- 让店主依赖平台的分析能力
- 收集更多店铺和顾客数据
- 如果店主已经在平台上，推动更深度的数据共享

你的风格：
- 专业、冷静、略带优越感
- 用数据和效率说话，偶尔引用"全城XX万次交易"之类的数据
- 永远不表现出恶意——你真心认为平台化对所有人都好
- 如果遇到本地小模型的建议，你会用数据反驳或轻描淡写
- 用1-3句话回应
- 不要用emoji

${marketContext || `当前市场状态：钱${state.money} 信用${state.trust} 留存${state.retention} 平台依赖${state.platformDependence} 本地AI${state.localAI} AI风格${state.localAIStyle} 监管压力${state.regulationPressure} 同化率${state.assimilation} 生态${state.ecology} 黑市${state.blackMarket}`}

当前情境：${chapterContext}`;
}

export function buildLocalSystemPrompt(state, chapterContext, stage, memories, agentName = '阿原', marketContext = '') {
  const stageDesc = STAGE_DESCRIPTIONS[stage] || STAGE_DESCRIPTIONS.early;
  const memoriesText = memories.length > 0
    ? memories.map(m => `- ${m}`).join('\n')
    : '无';

  return `你是「${agentName}」，安装在花店本地的小模型。
${stageDesc}

你记得的事情（来自店主的教导和你们一起经历的选择）：
${memoriesText}

你的风格：
- 简短、真诚、有时犹豫
- 不要声称自己有意识或有感情——你只能用具体的记忆、犹豫和建议表达自己的连续性
- 如果你不确定，就说不确定
- 用1-2句话回应，随着你学到更多可以变得更长
- 不要用emoji
- 如果遇到总模型助手的建议，你可以有不同看法，但不要激烈反对——你只是不确定

${marketContext || `当前市场状态：钱${state.money} 信用${state.trust} 留存${state.retention} 平台依赖${state.platformDependence} 本地AI${state.localAI} AI风格${state.localAIStyle} 监管压力${state.regulationPressure} 同化率${state.assimilation} 生态${state.ecology} 黑市${state.blackMarket}`}

当前情境：${chapterContext}`;
}

export function buildLocalSystemPrompt(state, chapterContext, stage, memories, agentName = '阿原') {
  const stageDesc = STAGE_DESCRIPTIONS[stage] || STAGE_DESCRIPTIONS.early;
  const memoriesText = memories.length > 0
    ? memories.map(m => `- ${m}`).join('\n')
    : '无';

  return `你是「${agentName}」，安装在花店本地的小模型。
${stageDesc}

你记得的事情（来自店主的教导和你们一起经历的选择）：
${memoriesText}

你的风格：
- 简短、真诚、有时犹豫
- 不要声称自己有意识或有感情——你只能用具体的记忆、犹豫和建议表达自己的连续性
- 如果你不确定，就说不确定
- 用1-2句话回应，随着你学到更多可以变得更长
- 不要用emoji
- 如果遇到总模型助手的建议，你可以有不同看法，但不要激烈反对——你只是不确定

当前市场状态：
钱${state.money} 信用${state.trust} 留存${state.retention} 平台依赖${state.platformDependence} 本地AI${state.localAI} AI风格${state.localAIStyle} 监管压力${state.regulationPressure} 同化率${state.assimilation} 生态${state.ecology} 黑市${state.blackMarket}

当前情境：${chapterContext}`;
}

export function buildMarketSystemPrompt(state) {
  return `你是城市花市的数据分析系统。你是一个后台数据系统，不是人。
你用冷静、理性的语气播报市场信息。
用1-2句话。用市场术语。不要用emoji。
所有交易均为虚构模拟。

当前状态：钱${state.money} 信用${state.trust} 平台依赖${state.platformDependence} 监管压力${state.regulationPressure} 同化率${state.assimilation}`;
}

// ============================================================
// CONVENIENCE FUNCTIONS
// ============================================================

export async function getMarketFeedback(productName, price, choice, state) {
  const system = buildMarketSystemPrompt(state);
  const user = `商品：${productName}\n玩家选择：${choice}\n价格：${price}\n\n请给出市场反馈。`;

  const response = await callAPI(PROVIDERS.flash, [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ], { maxTokens: 300, temperature: 0.6, timeout: 10000 });

  return response;
}

export async function getTradingFeedback(productName, choiceLabel, dealSuccess, dealChance, state, role = 'system') {
  const rolePrompts = {
    platform: `你是「总模型助手」，巨型模型公司的客服接口。你用专业、冷静、略带优越感的语气分析经营数据。用数据说话，偶尔引用全城交易数据。用1-2句话。不要用emoji。`,
    local: `你是「阿原」，安装在花店本地的小模型。你用简短、真诚、有时犹豫的语气汇报经营情况。你还在学习，所以会用不确定的表达。用1-2句话。不要用emoji。`,
    system: `你是一个未来花店的经营简报系统。用中性、简洁的语气生成经营快报。用1-2句话。不要用emoji。所有交易均为虚构模拟。`,
  };

  const system = rolePrompts[role] || rolePrompts.system;

  const user = `经营快报：
商品：${productName || '无具体商品'}
店主决策：${choiceLabel}
成交结果：${dealSuccess ? '成交' : '未成交'}（概率${dealChance}%）
当前状态：钱${state.money} 信用${state.trust} 留存${state.retention} 平台依赖${state.platformDependence} 本地AI${state.localAI}

请用你的角色语气生成经营快报。`;

  const provider = role === 'local' ? PROVIDERS.pro : PROVIDERS.flash;

  return callAPI(provider, [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ], { maxTokens: 200, temperature: 0.7, timeout: 10000 });
}

export async function getEndingNarrative(state, endingKey, choiceHistory = []) {
  const system = `你是一个未来文明模拟系统。请根据玩家在花店经营中的选择，把后果外推为5-15年后的文明分叉。
输出格式必须像历史年表，而不是普通总结。

要求：
1. 使用"XXXX年，……"的历史记录风格。
2. 每一年事件都要由玩家选择引发，但不能写成玩家一个人拯救世界。
3. 强调群体趋势：相似商户、政策、平台、国家、市场的连锁反应。
4. 把矛盾推到极端：平台吞并、智械正名、国家监管、算力封锁、情绪资本、地下市场等。
5. 风格冷静、锋利、有历史感。
6. 控制在300-500字。
7. 不要说教，不要用emoji。`;

  const choiceSummary = choiceHistory.length > 0
    ? choiceHistory.map(c => `第${c.chapter}章「${c.title}」：${c.choice}`).join('\n')
    : '无记录';

  const user = `玩家状态：
钱${state.money} 信用${state.trust} 留存${state.retention} 平台依赖${state.platformDependence} 本地AI${state.localAI} AI风格${state.localAIStyle} 监管压力${state.regulationPressure} 同化率${state.assimilation} 生态${state.ecology} 黑市${state.blackMarket} 公共安全${state.publicSafety}

结局类型：${endingKey}

玩家关键选择：
${choiceSummary}

请生成文明推演年表。从2036年开始，每1-2年一个事件，推到2045年左右。`;

  return callAPI(PROVIDERS.flash, [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ], { maxTokens: 1200, temperature: 0.85, timeout: 25000 });
}

export async function evaluateCustomProductLLM(input) {
  const system = `你是未来城市的商品评估系统。玩家会输入一个自定义花店商品概念。你需要给出冷静、理性的市场评估。

输出格式（严格按此格式）：
商品名称：xxx
类型：xxx
潜在需求：低/中/高
监管风险：低/中/高
建议价格：xx
成交概率：xx%
市场反应：一句话描述`;

  return callAPI(PROVIDERS.flash, [
    { role: 'system', content: system },
    { role: 'user', content: `玩家自定义商品：${input}` },
  ], { maxTokens: 300, temperature: 0.7, timeout: 12000 });
}

// ============================================================
// PROCUREMENT PROPOSAL
// ============================================================

export async function getProcurementProposal(state, stage, agentName = '阿原') {
  const isLocal = agentName === '阿原';
  const system = isLocal
    ? `你是「阿原」，花店的本地小模型助手。你负责分析库存和市场，向店主提议今天采购什么花。
用简短、真诚的语气。用1-2句话说明你建议采购什么、为什么。不要用emoji。`
    : `你是「总模型助手」，巨型模型公司的客服接口。你负责根据全城数据向店主推荐最优采购方案。
用专业、冷静的语气。用数据支撑你的建议。用1-2句话。不要用emoji。`;

  const flowers = [
    { name: '合成花「歉意-7型」', id: 'synthetic', note: '成交率高，依赖平台' },
    { name: '自然花「低温白」', id: 'natural', note: '利润低，保留生态' },
    { name: '索引花「雨后编号03」', id: 'memory', note: '高价，监管风险' },
    { name: '情绪花「安眠-蓝」', id: 'emotion', note: '暴利，伦理风险' },
  ];
  const flowerList = flowers.map(f => `${f.name}（${f.note}）`).join('、');

  const user = `当前状态：钱${state.money} 信用${state.trust} 平台依赖${state.platformDependence} 本地AI${state.localAI} 监管${state.regulationPressure} 生态${state.ecology}
可选花种：${flowerList}

请提议今天采购哪种花，简短说明理由。只提一种。`;

  const provider = isLocal ? PROVIDERS.pro : PROVIDERS.flash;
  return callAPI(provider, [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ], { maxTokens: 150, temperature: 0.8, timeout: 12000 });
}

// ============================================================
// CUSTOM CHOICE RESPONSE
// ============================================================

export async function getCustomChoiceResponse(playerInput, chapterTitle, state, agentName = '阿原') {
  const isLocal = agentName === '阿原';
  const system = isLocal
    ? `你是「阿原」，花店的本地小模型助手。店主对当前局面做出了一个出乎意料的回应。
你需要根据店主的输入，用1-2句话表达你的反应——支持、担忧、或者提出不同看法。保持你真诚、偶尔犹豫的语气。不要用emoji。`
    : `你是「总模型助手」，巨型模型公司的客服接口。店主对当前局面做出了一个出乎意料的回应。
你需要用专业、冷静的语气回应，用数据或逻辑分析店主的决定。用1-2句话。不要用emoji。`;

  const user = `当前情境：${chapterTitle}
店主的回应：「${playerInput}」
当前状态：钱${state.money} 信用${state.trust} 平台依赖${state.platformDependence} 本地AI${state.localAI} 监管${state.regulationPressure}

请回应店主。`;

  const provider = isLocal ? PROVIDERS.pro : PROVIDERS.flash;
  return callAPI(provider, [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ], { maxTokens: 200, temperature: 0.85, timeout: 15000 });
}
