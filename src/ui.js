// UI Rendering — Chat, State Bar, Action Window, Ending

const SPEAKER_CLASSES = {
  customer: 'speaker-customer',
  assistant: 'speaker-assistant',
  platform_ai: 'speaker-platform-ai',
  market: 'speaker-market',
  regulator: 'speaker-regulator',
  company: 'speaker-company',
  tide: 'speaker-tide',
  player: 'speaker-player',
  you: 'speaker-player',
  system: 'speaker-system',
};

const SPEAKER_PREFIXES = {
  customer: '【顾客】',
  assistant: '【阿原】',
  platform_ai: '【总模型助手】',
  market: '【市场数据】',
  regulator: '【城市治理局】',
  company: '【总模型公司】',
  tide: '【潮汐】',
  player: '【你的选择】',
  you: '【你】',
  system: '【系统】',
};

let chatEl, actionEl, tideEl, assistantEl, stateBarEl, chapterEl;

export function updateSpeakerPrefix(speaker, newPrefix) {
  SPEAKER_PREFIXES[speaker] = newPrefix;
}
let messageQueue = [];
let isTyping = false;
let typingSpeed = 30; // ms per character
let skipTyping = false;

export function initUI() {
  chatEl = document.getElementById('chat-messages');
  actionEl = document.getElementById('action-content');
  tideEl = document.getElementById('tide-content');
  assistantEl = document.getElementById('assistant-panel');
  stateBarEl = document.getElementById('state-bar');
  chapterEl = document.getElementById('chapter-indicator');

  // Click chat to skip typing
  chatEl.addEventListener('click', () => {
    if (isTyping) skipTyping = true;
  });
}

// --- Chat Messages ---

export async function addChatMessage(speaker, text, options = {}) {
  const { delay = 0, instant = false } = options;

  if (delay > 0) await sleep(delay);

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${SPEAKER_CLASSES[speaker] || 'speaker-system'}`;

  const prefix = document.createElement('span');
  prefix.className = 'chat-prefix';
  prefix.textContent = SPEAKER_PREFIXES[speaker] || '【系统】';

  const content = document.createElement('span');
  content.className = 'chat-text';
  content.style.whiteSpace = 'pre-wrap';
  content.style.wordBreak = 'break-word';

  msgDiv.appendChild(prefix);
  msgDiv.appendChild(content);
  chatEl.appendChild(msgDiv);

  scrollToBottom();

  if (instant) {
    content.textContent = text;
  } else {
    // Adaptive speed: faster for longer messages
    const speed = text.length > 100 ? 15 : text.length > 50 ? 20 : typingSpeed;
    await typewriterEffect(content, text, speed);
  }

  return msgDiv;
}

async function typewriterEffect(el, text, speed) {
  isTyping = true;
  skipTyping = false;
  el.textContent = '';

  for (let i = 0; i < text.length; i++) {
    if (skipTyping) {
      el.textContent = text;
      break;
    }
    el.textContent += text[i];
    if (text[i] === '\n') {
      await sleep(60);
    } else {
      await sleep(speed || typingSpeed);
    }
    // Scroll periodically during typing
    if (i % 20 === 0) scrollToBottom();
  }
  isTyping = false;
  scrollToBottom();
}

export function addSystemNotification(text) {
  const div = document.createElement('div');
  div.className = 'system-notification';
  div.textContent = text;
  chatEl.appendChild(div);
  scrollToBottom();
}

export function addStateChangeDisplay(changes, getLabelFn) {
  const div = document.createElement('div');
  div.className = 'state-change';

  const parts = [];
  for (const [key, val] of Object.entries(changes)) {
    if (val === 0) continue;
    const label = typeof getLabelFn === 'function' ? getLabelFn(key) : (getLabelFn[key] || key);
    const cls = val > 0 ? 'change-positive' : 'change-negative';
    const sign = val > 0 ? '+' : '';
    parts.push(`<span class="${cls}">${label} ${sign}${val}</span>`);
  }

  if (parts.length > 0) {
    div.innerHTML = parts.join('  |  ');
    chatEl.appendChild(div);
    scrollToBottom();
  }
}

export function addDealResult(success, chance, product) {
  const text = success
    ? `成交。${product ? product.name : '商品'}已售出。成交概率：${chance}%`
    : `未成交。买家犹豫后离开。成交概率：${chance}%`;

  const div = document.createElement('div');
  div.className = `system-notification`;
  div.style.borderLeftColor = success ? '#4ade80' : '#f87171';
  div.style.borderLeftWidth = '2px';
  div.textContent = text;
  chatEl.appendChild(div);
  scrollToBottom();
}

export function addTideBlock(tideData) {
  if (!tideData) return;

  const div = document.createElement('div');
  div.className = 'tide-block';
  div.innerHTML = `
    <div>与你相似的商户中，</div>
    <div><span class="tide-pct">${tideData.pct}%</span> 做出了相同选择。</div>
    <div style="color: #5a6577; font-size: 12px; margin-top: 4px;">${tideData.trend}</div>
  `;
  chatEl.appendChild(div);
  scrollToBottom();
}

export function addChapterTitle(title) {
  const div = document.createElement('div');
  div.className = 'chapter-title';
  div.textContent = title;
  chatEl.appendChild(div);
  scrollToBottom();
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatEl.scrollTop = chatEl.scrollHeight;
  });
}

// --- State Bar ---

export function updateStateBar(state, changes = {}) {
  const items = stateBarEl.querySelectorAll('.state-item');
  items.forEach(item => {
    const key = item.dataset.key;
    if (key && state[key] !== undefined) {
      const em = item.querySelector('em');
      em.textContent = Math.round(state[key]);

      if (changes[key] && changes[key] !== 0) {
        item.classList.add('changed');
        setTimeout(() => item.classList.remove('changed'), 1500);
      }
    }
  });
}

export function updateChapterIndicator(chapter, total) {
  chapterEl.textContent = `第 ${chapter} / ${total} 章`;
}

// --- Action Window ---

export function clearActions() {
  actionEl.innerHTML = '';
}

export function showChoices(choices, onChoose) {
  clearActions();

  choices.forEach((choice, index) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerHTML = `
      <span class="choice-label">${choice.label}</span>
      ${choice.description ? `<span class="choice-desc">${choice.description}</span>` : ''}
    `;
    btn.addEventListener('click', () => {
      // Disable all buttons
      actionEl.querySelectorAll('.choice-btn').forEach(b => b.classList.add('disabled'));
      onChoose(choice, index);
    });
    actionEl.appendChild(btn);
  });
}

export function showCustomProductInput(onSubmit) {
  clearActions();

  const wrapper = document.createElement('div');
  wrapper.className = 'custom-input-wrapper';
  wrapper.innerHTML = `
    <div style="font-size: 12px; color: #5a6577; margin-bottom: 8px;">自定义商品</div>
    <input type="text" placeholder="描述你的商品概念..." id="custom-product-input" />
    <div style="margin-top: 8px; display: flex; gap: 8px;">
      <button id="custom-submit-btn" class="choice-btn" style="flex: 1;">
        <span class="choice-label">提交评估</span>
      </button>
    </div>
  `;
  actionEl.appendChild(wrapper);

  const input = document.getElementById('custom-product-input');
  const submitBtn = document.getElementById('custom-submit-btn');

  submitBtn.addEventListener('click', () => {
    const value = input.value.trim();
    if (value) {
      submitBtn.classList.add('disabled');
      input.disabled = true;
      onSubmit(value);
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const value = input.value.trim();
      if (value) {
        submitBtn.classList.add('disabled');
        input.disabled = true;
        onSubmit(value);
      }
    }
  });

  input.focus();
}

export function showProductCards(products, onSelect) {
  clearActions();

  Object.values(products).forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-name">${product.name}</div>
      <div style="font-size: 12px; color: #c5cdd9; margin: 4px 0;">${product.description}</div>
      <div class="product-stats">
        建议价: ${product.priceSuggestion} | 预计成交率: ${product.suggestedDealRate}%
      </div>
    `;
    card.addEventListener('click', () => {
      actionEl.querySelectorAll('.product-card').forEach(c => c.style.opacity = '0.4');
      card.style.opacity = '1';
      onSelect(product);
    });
    actionEl.appendChild(card);
  });
}

export function showPlayerInput(onSubmit, placeholder = '输入你想说的...') {
  const wrapper = document.createElement('div');
  wrapper.className = 'custom-input-wrapper';
  wrapper.innerHTML = `
    <input type="text" placeholder="${placeholder}" id="player-free-input" />
    <div style="margin-top: 6px;">
      <button id="player-free-submit" class="choice-btn" style="font-size: 12px; padding: 8px 12px;">
        <span class="choice-label">发送</span>
      </button>
    </div>
  `;
  actionEl.appendChild(wrapper);

  const input = document.getElementById('player-free-input');
  const submitBtn = document.getElementById('player-free-submit');

  const doSubmit = () => {
    const value = input.value.trim();
    if (!value) return;
    input.value = '';
    onSubmit(value);
  };

  submitBtn.addEventListener('click', doSubmit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSubmit();
  });
}

let thinkingDiv = null;

export function showThinking(label = '思考中') {
  if (thinkingDiv) thinkingDiv.remove();
  thinkingDiv = document.createElement('div');
  thinkingDiv.className = 'chat-msg speaker-system';
  thinkingDiv.innerHTML = `<span class="chat-prefix">【系统】</span><span class="chat-text" style="color:#5a6577;">${label}<span class="typing-indicator"><span></span><span></span><span></span></span></span>`;
  chatEl.appendChild(thinkingDiv);
  scrollToBottom();
  return thinkingDiv;
}

export function hideThinking() {
  if (thinkingDiv) {
    thinkingDiv.remove();
    thinkingDiv = null;
  }
}

export function showRestartButton(onRestart) {
  clearActions();
  const btn = document.createElement('button');
  btn.className = 'restart-btn';
  btn.textContent = '重新开始';
  btn.addEventListener('click', onRestart);
  actionEl.appendChild(btn);
}

// --- Assistant Panel ---

export function updateAssistantPanel(text, principles = []) {
  const textEl = assistantEl.querySelector('.text-speaker-assistant') || assistantEl.querySelector('div:first-child');
  if (textEl) textEl.textContent = text;

  const principlesEl = document.getElementById('assistant-principles');
  if (principlesEl) {
    principlesEl.textContent = principles.length > 0
      ? `已教导原则：${principles.join('、')}`
      : '已教导原则：无';
  }
}

// --- Ending Overlay ---

export function showEnding(ending, state, similarPct, timeline = '', choiceHistory = []) {
  const overlay = document.getElementById('ending-overlay');
  const content = document.getElementById('ending-content');

  overlay.classList.remove('hidden');

  const stateLabels = {
    money: '资金', cash: '现金', trust: '信用', retention: '留存',
    platformDependence: '平台依赖', localAI: '本地AI', localAIStyle: 'AI风格',
    regulationPressure: '监管压力', assimilation: '同化率',
    ecology: '生态', blackMarket: '黑市', publicSafety: '公共安全',
  };

  const allStatsHtml = Object.entries(stateLabels)
    .map(([key, label]) => {
      const value = Math.round(state[key] || 0);
      return `<div class="ending-stat"><span class="stat-label">${label}</span><span class="stat-value">${value}</span></div>`;
    })
    .join('');

  // Choice history summary
  const choiceSummaryHtml = choiceHistory.length > 0
    ? choiceHistory.map(c =>
      `<div style="font-size: 12px; color: #5a6577; margin: 4px 0;">第${c.chapter}章「${c.title}」：${c.choice}</div>`
    ).join('')
    : '';

  // Timeline content — use LLM-generated or fallback to pre-scripted
  const timelineText = timeline || ending.description || ending.consequence;

  // Archive number based on ending type
  const archiveNum = `FLOWER-CIV-2045-${String(Math.floor(Math.random() * 900) + 100)}`;

  // Build the static parts first
  content.innerHTML = `
    <!-- Layer 1: Short-term settlement -->
    <div style="border-bottom: 1px solid #1a2332; padding-bottom: 20px; margin-bottom: 24px;">
      <div style="font-size: 12px; color: #5a6577; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.1em;">经营结算</div>
      <div class="ending-stats">${allStatsHtml}</div>
      ${choiceSummaryHtml ? `
        <div style="margin-top: 12px; border-top: 1px solid #1a2332; padding-top: 12px;">
          <div style="font-size: 12px; color: #5a6577; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.1em;">关键选择链</div>
          ${choiceSummaryHtml}
        </div>
      ` : ''}
    </div>

    <!-- Layer 2: Civilization timeline -->
    <div class="result-card" style="margin-top: 0;">
      <div style="font-size: 11px; color: #3a4557; font-family: 'JetBrains Mono', monospace; margin-bottom: 8px;">
        【文明推演档案】编号：${archiveNum}
      </div>

      <div style="text-align: center; margin-bottom: 20px;">
        <div class="ending-label" style="color: #f0a050;">${ending.personalityLabel}</div>
        <div class="ending-subtitle">${ending.civilizationLabel}</div>
      </div>

      <div id="ending-timeline" style="font-size: 14px; line-height: 2; color: #c5cdd9; min-height: 200px; margin-bottom: 20px; font-family: 'Noto Sans SC', sans-serif;">
      </div>

      <div id="ending-verdict" style="display: none;" class="ending-verdict">「${ending.verdict}」</div>

      <div id="ending-similar" style="display: none;" class="ending-similar">与你相似的玩家：${similarPct}%</div>
    </div>

    <button class="restart-btn" onclick="location.reload()">重新开始</button>
  `;

  // Animate timeline with typewriter effect
  animateEndingTimeline(timelineText);
}

async function animateEndingTimeline(text) {
  const timelineEl = document.getElementById('ending-timeline');
  const verdictEl = document.getElementById('ending-verdict');
  const similarEl = document.getElementById('ending-similar');
  const overlay = document.getElementById('ending-overlay');
  if (!timelineEl) return;

  const lines = text.split('\n').filter(l => l.trim());

  for (let i = 0; i < lines.length; i++) {
    const lineEl = document.createElement('div');
    lineEl.style.marginBottom = '8px';
    timelineEl.appendChild(lineEl);

    // Typewriter effect for each line
    const line = lines[i];
    const speed = line.length > 60 ? 12 : line.length > 30 ? 18 : 25;
    for (let j = 0; j < line.length; j++) {
      lineEl.textContent += line[j];
      if (j % 3 === 0) {
        timelineEl.scrollTop = timelineEl.scrollHeight;
        overlay.scrollTop = overlay.scrollHeight;
      }
      await sleep(speed);
    }

    // Pause between lines for dramatic effect
    await sleep(400);
    timelineEl.scrollTop = timelineEl.scrollHeight;
    overlay.scrollTop = overlay.scrollHeight;
  }

  // Show verdict after timeline
  await sleep(800);
  if (verdictEl) verdictEl.style.display = 'block';
  await sleep(600);
  if (similarEl) similarEl.style.display = 'block';
}

// --- Utility ---

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { sleep };
