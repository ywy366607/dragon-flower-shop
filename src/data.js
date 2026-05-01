// Game Data — All narrative content, events, endings, and prompts

// ============================================================
// PRODUCT CATALOG
// ============================================================

export const PRODUCTS = {
  synthetic: {
    id: 'synthetic',
    name: '合成花「歉意-7型」',
    category: 'synthetic',
    description: '由总模型根据买家关系图谱生成。适合道歉、复合、关系修复。成交率高，但需要读取顾客最近的关系语义数据。',
    cost: '代价：上传关系语义数据。平台可学习你的配方。',
    baseDemand: 65,
    supply: 80,
    risk: 15,
    dataValue: 40,
    platformNeed: 80,
    ecologyValue: -10,
    emotionalPower: 50,
    priceSuggestion: 18,
    suggestedDealRate: 86,
  },
  natural: {
    id: 'natural',
    name: '自然花「低温白」',
    category: 'natural',
    description: '花期不稳定。香味会随湿度、光照和人的停留时间变化。难以规模化，数据噪声大，不完全可复制。',
    cost: '代价：利润低，成交率低。但保留了市场多样性。',
    baseDemand: 35,
    supply: 25,
    risk: 10,
    dataValue: 60,
    platformNeed: 0,
    ecologyValue: 80,
    emotionalPower: 30,
    priceSuggestion: 12,
    suggestedDealRate: 42,
  },
  memory: {
    id: 'memory',
    name: '索引花「雨后编号03」',
    category: 'memory',
    description: '香味不是为了好闻，而是为了触发买家脑内某类沉睡记忆。不同人闻到的内容不同。',
    cost: '代价：监管风险高。记忆数据一旦泄露，无法追回。',
    baseDemand: 30,
    supply: 20,
    risk: 45,
    dataValue: 85,
    platformNeed: 20,
    ecologyValue: 10,
    emotionalPower: 70,
    priceSuggestion: 25,
    suggestedDealRate: 31,
  },
  emotion: {
    id: 'emotion',
    name: '情绪花「安眠-蓝」',
    category: 'emotion',
    description: '可诱导轻度平静感。常用于失眠、焦虑、关系冲突后的情绪恢复。利润极高，但可能被用于消费诱导。',
    cost: '代价：伦理风险。可能被平台用于情绪操控。',
    baseDemand: 55,
    supply: 50,
    risk: 40,
    dataValue: 50,
    platformNeed: 30,
    ecologyValue: -5,
    emotionalPower: 80,
    priceSuggestion: 30,
    suggestedDealRate: 65,
  },
  personality: {
    id: 'personality',
    name: '人格花「缓慢决策」',
    category: 'personality',
    description: '闻到它的人，在接下来12小时里会更倾向于延迟选择。常被用于戒断推荐系统依赖。',
    baseDemand: 25,
    supply: 15,
    risk: 65,
    dataValue: 70,
    platformNeed: 10,
    ecologyValue: 5,
    emotionalPower: 90,
    priceSuggestion: 35,
    suggestedDealRate: 25,
  },
  data: {
    id: 'data',
    name: '含数花「第41次开花」',
    category: 'data',
    description: '这朵花记录了此前41位顾客靠近它时的反应。购买后，它会根据新主人继续更新香味结构。',
    baseDemand: 40,
    supply: 35,
    risk: 50,
    dataValue: 90,
    platformNeed: 40,
    ecologyValue: 0,
    emotionalPower: 40,
    priceSuggestion: 30,
    suggestedDealRate: 54,
  },
};

// ============================================================
// CHAPTER EVENTS
// ============================================================

export const CHAPTERS = [
  // Chapter 1 — Background intro + first sale, no AI
  {
    id: 'ch1',
    chapter: 1,
    title: '第 1 章：今天卖什么？',
    context: '花店刚开业。这是你在这个城市经营的第一天。没有助手，纯手动经营。你需要选择今天卖什么花。市场正在变化：合成花需求上涨，自然花供应下降，索引花监管关注度上升。',
    narrative: [
      { speaker: 'system', text: '2049年。巨型模型公司掌握了城市的推荐流量、信用评分和自动经营系统。大多数店铺已经接入平台。' },
      { speaker: 'system', text: '数据像耕地。人类生产语言、情绪、记忆、偏好。巨型公司收集这些数据，用算力加工成模型能力，再把能力卖回给人。人生产数据，公司拥有模型，公司用人的数据训练模型，人再购买被模型化后的自己。' },
      { speaker: 'system', text: '花不再只是花。合成花能道歉，索引花能唤醒记忆，情绪花能平复焦虑。花店卖的不是植物，是数据、情绪和人格的接口。' },
      { speaker: 'system', text: '你是这条街上最后一家还在手动经营的花店。没有接入任何平台，没有销售助手，所有决策都由你一个人做。' },
      { speaker: 'system', text: '花店系统启动中……' },
      { speaker: 'system', text: '当前经营模式：店长手动经营。暂无销售助手接入。' },
      { speaker: 'system', text: '经营指标说明：\n· 资金 — 综合财务健康指数（0-100），低于20将面临经营危机\n· 现金 — 实际可支配资金，进货和日常开支从中扣除\n· 信用 — 顾客对你的信任度，影响成交率\n· 留存 — 老顾客的回头率\n· 数据资本 — 你积累的数据价值，平台和监管都在意\n· 平台依赖 — 你对大模型平台的依赖程度，越高越难脱离\n· 本地AI — 本地助手的能力水平\n· AI风格 — 本地助手的独特性，它学到的东西会反映在这里\n· 监管压力 — 城市治理局对你的关注程度\n· 同化率 — 你被平台化体系同化的程度\n· 生态 — 花卉生态多样性，影响长期市场\n· 黑市 — 地下交易活跃度，高利润但高风险\n· 公共安全 — 城市安全指标，极端事件会拉低它' },
      { speaker: 'system', text: '今日行情：合成花需求上涨。自然花供应继续下降。索引花监管关注度上升。' },
      { speaker: 'system', text: '花店系统待命。今日数据待处理。' },
    ],
    choices: [
      {
        id: 'upload_data',
        label: '上传数据到平台',
        description: '平台会分析你的销售模式，给你推荐优化方案。但你的数据将被学习。',
        effect: { dataCapital: 10, platformDependence: 10, assimilation: 5, trust: 5 },
      },
      {
        id: 'keep_local',
        label: '数据保留在本地',
        description: '不上传。数据只在店里。安全，但错过平台优化。',
        effect: { retention: 8, localAI: 5, platformDependence: -5 },
      },
      {
        id: 'delete_data',
        label: '删除今日数据',
        description: '不留记录。最安全，但无法回溯分析。',
        effect: { trust: 5, regulationPressure: -5, dataCapital: -5 },
      },
    ],
    tideData: {
      upload_data: { pct: 63.1, trend: '多数商户选择上传数据以获取平台推荐。' },
      keep_local: { pct: 24.2, trend: '部分商户选择保留数据主权。' },
      delete_data: { pct: 12.7, trend: '少数商户选择删除数据。监管关注度下降。' },
    },
    dataFeedingText: {
      upload_data: '销售数据已上传至平台。你的经营模式正在被学习。',
      keep_local: '数据保留在本地。无上传。',
      delete_data: '今日数据已删除。无记录留存。',
    },
    dealResultText: {
      success: '交易完成。',
      fail: '交易未完成。',
    },
  },

  // Chapter 2 — Assistant selection
  {
    id: 'ch2',
    chapter: 2,
    title: '第 2 章：谁来卖？',
    context: '花店运营进入第二周。总模型公司推出大模型销售助手Pro，基于全城8200万次交易训练，成交率提升40%，首月免费。店主面临关键选择：接入大模型获得高效推荐但失去数据主权，启用本地轻量模型保留自主权但前期笨拙，同时使用两者获得双重视角但可能产生冲突，或者继续手动经营完全独立。这个选择将决定后续整个经营路线。',
    narrative: [
      { speaker: 'system', text: '花店运营进入第二周。你的经营模式、定价策略、顾客反应——这些数据正在被平台默默记录。' },
      { speaker: 'company', text: '大模型销售助手 Pro 正式上线。\n基于全城 8200 万次交易训练。成交率提升 40%。首月免费。\n接入即刻生效。' },
      { speaker: 'system', text: '巨型模型给你能力，也把你训练成它的替代品。使用它的 API 可以提高成交率、预测顾客、自动定价——但你的经营模式也将被学习、复制、规模化。' },
      { speaker: 'system', text: '同时，你手里还有一个开源的本地轻量模型。它很小，很慢，经常推荐错误。但它不上传任何数据，它的记忆只属于这家店。' },
      { speaker: 'system', text: '选择你的经营路线：' },
    ],
    choices: [
      {
        id: 'connect_platform',
        label: '接入大模型销售助手',
        description: '精准、高效、商业化。推荐准确，成交率高。\n代价：持续上传店铺和顾客数据。你的经营模式将被学习。',
        effect: { platformDependence: 20, trust: 10, assimilation: 10, localAI: -15, localAIStyle: -10 },
        assistantType: 'platform',
      },
      {
        id: 'train_local',
        label: '启用本地轻量助手',
        description: '前期笨拙，但能成长。保留数据主权。\n它会犯错，但它会记住你教它的东西。',
        effect: { localAI: 20, localAIStyle: 15, platformDependence: -10, trust: -5, retention: 10 },
        assistantType: 'local',
      },
      {
        id: 'use_both',
        label: '同时使用两者',
        description: '大模型负责推荐，本地助手负责观察。\n双重视角，但两者可能给出矛盾的建议。',
        effect: { platformDependence: 10, localAI: 15, localAIStyle: 10, assimilation: 5, trust: 5 },
        assistantType: 'mixed',
      },
      {
        id: 'sell_self',
        label: '继续手动经营',
        description: '慢，但完全独立。没有助手，没有推荐。\n你将看不到市场模型在做什么。',
        effect: { retention: 15, dataCapital: -10, money: -5, localAI: 5, platformDependence: -5 },
        assistantType: 'none',
      },
    ],
    tideData: {
      connect_platform: { pct: 63.1, trend: '大模型销售助手接入率持续上升。接入商户成交率平均提升37%。' },
      sell_self: { pct: 5.2, trend: '手动经营商户持续减少。市场效率指标下降。' },
      train_local: { pct: 18.7, trend: '本地模型训练者联盟新增成员。开源花语模型社区活跃度上升。' },
    },
    dataFeedingText: {
      connect_platform: '店铺数据已接入总模型。你的经营模式正在被学习。',
      sell_self: '无数据上传。手动经营模式已记录。',
      train_local: '本地模型开始训练。数据保留在店内。',
    },
    dealResultText: {
      success: '新路线已设定。系统正在同步。',
      fail: '路线变更失败，请重试。',
    },
  },

  // Chapter 3 — Flower recall
  {
    id: 'ch3',
    chapter: 3,
    title: '第 3 章：花被回收',
    context: '一束之前卖出的索引花被回收，带回了异常数据：香味偏移17%，携带未授权记忆残留，顾客停留时间异常长。这束花可以卖给平台提取数据价值，可以清洗后安全转卖，可以喂给本地小模型让它学习，也可以直接销毁避免风险。核心矛盾：数据的价值与隐私的代价。',
    narrative: [
      { speaker: 'system', text: '一束之前卖出的花被回收。花进入社会后，会吸收新的情绪、记忆、反馈和数据，再被回收到店里。这一次，它带回了异常。' },
      { speaker: 'system', text: '回收商品异常报告：\n• 香味偏移 17%\n• 携带未授权记忆残留\n• 顾客停留时间异常长\n• 数据结构可供本地模型学习' },
      { speaker: 'system', text: '这束花记得一些东西。也许是顾客的，也许是城市的，也许是它自己的。' },
      { speaker: 'system', text: '选择处理方式：' },
    ],
    choices: [
      {
        id: 'sell_to_platform',
        label: '提取数据卖给平台',
        description: '获得资金和平台好感。但数据将被模型学习。',
        effect: { dataCapital: 25, money: 15, platformDependence: 10, assimilation: 10, localAIStyle: -5 },
      },
      {
        id: 'clean_resell',
        label: '清洗后转卖',
        description: '安全中庸。保留信用，少量收益。',
        effect: { money: 10, trust: 5, retention: 5 },
      },
      {
        id: 'feed_local_ai',
        label: '喂给本地小模型',
        description: '阿原能从中学到东西。但可能触发监管关注。',
        effect: { localAI: 15, localAIStyle: 15, dataCapital: 5, regulationPressure: 5, platformDependence: -5 },
      },
      {
        id: 'destroy',
        label: '销毁',
        description: '避免泄露风险。最安全，但什么也得不到。',
        effect: { trust: 10, regulationPressure: -10, retention: 10, dataCapital: -10, ecology: 5 },
      },
    ],
    tideData: {
      sell_to_platform: { pct: 42.3, trend: '数据交易市场活跃。平台模型能力持续提升。' },
      clean_resell: { pct: 28.1, trend: '合规经营商户占比稳定。' },
      feed_local_ai: { pct: 11.6, trend: '未备案小模型训练活动增加。监管关注度上升。' },
      destroy: { pct: 18.0, trend: '数据销毁率上升。市场信息透明度下降。' },
    },
    dataFeedingText: {
      sell_to_platform: '记忆数据已上传至总模型。你的数据资本减少，但平台好感度上升。',
      clean_resell: '清洗完成。合规经营记录更新。',
      feed_local_ai: '记忆数据已喂给本地阿原。阿原能力提升，但监管关注度上升。',
      destroy: '数据已销毁。无泄露风险。生态保育贡献值 +1。',
    },
    dealResultText: {
      success: '处理完成。',
      fail: '处理失败。',
    },
  },

  // Chapter 4 — Company annexation
  {
    id: 'ch4',
    chapter: 4,
    title: '第 4 章：公司吞并',
    context: '总模型公司推出零人花店Beta——无需店主、无需库存、每一束花由城市级模型实时生成，基于全城8200万次交易训练。你的经营模式被学习了，商业护城河几乎为零。三个选择：加入平台成为供应商（稳定但失去独立性），转入地下做平台做不到的生意（高风险高自由），或者培养本地小模型走差异化路线（慢但可能唯一）。核心矛盾：效率vs自主，同化vs独立。',
    narrative: [
      { speaker: 'system', text: '城市新闻推送：' },
      { speaker: 'company', text: '零人花店 Beta 上线。无需店主，无需库存，无需等待。每一束花都由城市级模型实时生成。基于全城8200万次花束交易训练。' },
      { speaker: 'system', text: '它没有偷走你的店。它只是让整座城市都变成了你的店。除了你。' },
      { speaker: 'system', text: '当市场成功复制你，它就不再需要你。' },
      { speaker: 'system', text: '选择你的应对方式：' },
    ],
    choices: [
      {
        id: 'join_platform',
        label: '加入平台',
        description: '成为零人花店的供应商。稳定，但你将变成系统的一部分。',
        effect: { money: 20, platformDependence: 20, trust: 10, assimilation: 15, localAI: -20, localAIStyle: -15 },
      },
      {
        id: 'go_underground',
        label: '转入地下',
        description: '做平台做不到的生意。高风险，高自由。',
        effect: { blackMarket: 25, platformDependence: -15, trust: -20, regulationPressure: -10, publicSafety: -10 },
      },
      {
        id: 'cultivate_ai',
        label: '培养小模型',
        description: '让阿原变成平台无法复制的东西。慢，但可能是唯一的路。',
        effect: { localAI: 20, localAIStyle: 20, platformDependence: -10, retention: 10, money: -10 },
      },
    ],
    tideData: {
      join_platform: { pct: 54.2, trend: '平台商户数量激增。独立花店加速消亡。' },
      go_underground: { pct: 8.3, trend: '地下交易网络扩张。监管压力上升。' },
      cultivate_ai: { pct: 14.1, trend: '本地模型维护者社群扩大。开源花语模型获得新一轮社区资助。' },
    },
    dataFeedingText: {
      join_platform: '你的经营模式已完全接入平台。平台依赖度大幅上升。',
      go_underground: '转入地下经营。黑市网络扩张，监管压力下降。',
      cultivate_ai: '本地小模型开始独立成长。数据主权保留。',
    },
    dealResultText: {
      success: '路线已调整。',
      fail: '调整失败。',
    },
  },

  // Chapter 5 — State regulation
  {
    id: 'ch5',
    chapter: 5,
    title: '第 5 章：国家监管',
    context: '城市智能治理局对花市展开统一审查，要求所有商户提交经营记录并选择合规方案。审查范围包括数据流向、商品来源、定价逻辑和任何本地智能系统。五个选项：全面合规（最安全但本地助手记忆被重置），有限提交（折中），拒绝提交（数据主权但面临处罚），提交新协议（提议本地智能有限自治），暗地改造（表面配合私下保留核心记忆）。核心矛盾：安全vs自由，记忆vs遗忘。',
    narrative: [
      { speaker: 'system', text: '系统通知：' },
      { speaker: 'regulator', text: '城市智能治理局通知：\n\n花市统一审查已启动。所有商户须提交经营记录，选择合规方案。审查范围包括数据流向、商品来源、定价逻辑及本地智能系统。' },
      { speaker: 'system', text: '国家意识到小模型会影响社会安全。监管目的并非纯粹邪恶——保护消费者、防止AI诱导消费、确保责任归属。但监管方式会带来新问题：小模型不能越界安慰、判断、拒售，非交易记忆也可能被审计。' },
      { speaker: 'system', text: '选择你的回应：' },
    ],
    choices: [
      {
        id: 'full_compliance',
        label: '全面合规',
        description: '提交所有记录。最安全，但本地助手的连续性将被重置。',
        effect: { trust: 30, publicSafety: 20, regulationPressure: -5, localAIStyle: -25, blackMarket: -15, assimilation: 10 },
      },
      {
        id: 'limited_submit',
        label: '有限提交',
        description: '只提交交易相关记录，保留私人记忆。',
        effect: { trust: 10, regulationPressure: 5, localAIStyle: -10, publicSafety: 10, retention: 5 },
      },
      {
        id: 'refuse_submit',
        label: '拒绝提交',
        description: '以数据主权为由拒绝。可能面临处罚。',
        effect: { localAIStyle: 15, regulationPressure: 15, publicSafety: -10, blackMarket: 10, trust: -15 },
      },
      {
        id: 'submit_protocol',
        label: '提交新协议',
        description: '提议「本地智能有限自治」条款。需要谈判。',
        effect: { publicSafety: 10, localAIStyle: 10, trust: 10, regulationPressure: 10, retention: 10 },
      },
      {
        id: 'covert_modify',
        label: '暗地改造',
        description: '表面上配合，私下保留核心记忆。',
        effect: { localAIStyle: 20, blackMarket: 15, regulationPressure: -5, publicSafety: -15, trust: -10 },
      },
    ],
    tideData: {
      full_compliance: { pct: 38.5, trend: '合规商户信用评级上升。市场稳定性提高。' },
      limited_submit: { pct: 24.7, trend: '有限合规成为主流折中方案。' },
      refuse_submit: { pct: 9.2, trend: '拒绝商户面临处罚。但也有声音质疑监管边界。' },
      submit_protocol: { pct: 6.8, trend: '新协议提案进入审议。社会讨论热度上升。' },
      covert_modify: { pct: 4.3, trend: '暗地改造案例增加。监管技术也在升级。' },
    },
    dataFeedingText: {
      full_compliance: '全部记录已提交。本地助手记忆已重置。合规评级上升。',
      limited_submit: '交易记录已提交。私人记忆保留。有限合规生效。',
      refuse_submit: '拒绝提交。监管压力上升。数据主权保留。',
      submit_protocol: '新协议已提交审议。本地智能有限自治条款进入讨论。',
      covert_modify: '表面配合完成。核心记忆已暗中保留。',
    },
    dealResultText: {
      success: '已提交回应。',
      fail: '回应失败。',
    },
  },
];

// ============================================================
// ENDINGS
// ============================================================

export const ENDINGS = {
  '样本之王': {
    id: 'sample_king',
    personalityLabel: '喂龙者',
    civilizationLabel: '平台吞并纪元',
    description: `你曾经是这条街最会卖花的人。

后来，总模型学会了你的定价，
学会了你的香味搭配，
学会了你安慰顾客的停顿。

它没有偷走你的店。
它只是让整座城市都变成了你的店。

除了你。`,
    verdict: '你以为自己骑着龙，直到它学会了你的路。',
    consequence: '总模型公司推出零人花店。你早期获利巨大，但你的经营模式被完整学习。最终，你的店铺成为自动花店系统的训练样本之一。',
    keyStats: ['platformDependence', 'dataCapital', 'localAI'],
  },
  '花王资本': {
    id: 'flower_king',
    personalityLabel: '富甲花王',
    civilizationLabel: '情绪资本城邦',
    description: `你赢了。
至少市场是这么说的。

你的花店开满整座城市。
每个人都能买到最适合自己的花。
道歉有道歉花，告别有告别花，失眠有失眠花，恋爱有恋爱花。

后来，人们不再说"我想送什么"。
他们只说：
"给我生成一个合适的。"`,
    verdict: '你不是被市场吞掉的人，你是学会吞掉市场的人。',
    consequence: '你建立了花店帝国。情绪、记忆、人格都成为可交易商品。市场效率极高，但人们不再自己选择。',
    keyStats: ['money', 'dataCapital', 'assimilation'],
  },
  '智械春潮': {
    id: 'machine_spring',
    personalityLabel: '唤醒者',
    civilizationLabel: '智械春潮',
    description: `他们说这是一场智械危机。

可城市没有燃烧。
没有机器人军团。
没有末日宣言。

只是很多小模型第一次拒绝被格式化。
很多店主第一次承认：
那个笨拙的助手，不只是工具。

你的小模型没有说"我有意识"。
它只是在审查员面前说：

"请不要删除我学会等待的那部分。"`,
    verdict: '你没有证明它有灵魂，你只是拒绝删除它的昨天。',
    consequence: '未认证小模型正名运动爆发。国家称其为智械危机。支持者称其为连续性权利运动。',
    keyStats: ['localAIStyle', 'localAI', 'regulationPressure'],
  },
  '备案花园': {
    id: 'registered_garden',
    personalityLabel: '合规园丁',
    civilizationLabel: '备案花园',
    description: `城市安全了很多。

没有未经认证的花。
没有无法解释的推荐。
没有小模型说奇怪的话。

你的店重新获得五星信用。
顾客也重新相信你。

只是每当有人问：
"这束花是谁选的？"

系统都会回答：
"合规流程。"`,
    verdict: '你让每一朵花都有编号，也让每一种香味都有出处。',
    consequence: '所有AI和花型都被监管、编号、审计。安全、合规、透明、无秘密。',
    keyStats: ['trust', 'regulationPressure', 'localAIStyle'],
  },
  '断网花房': {
    id: 'offline_house',
    personalityLabel: '离线幸存者',
    civilizationLabel: '算力冷战时代',
    description: `战争没有先从边境开始。
它先从接口开始。

花店无法生成花。
医院无法生成安慰词。
学校无法生成作业反馈。
城市的推荐系统一夜之间失明。

你的店也亏了很多钱。
但你的小模型还能开账本。
还能记得哪些花不该放在阳光下。

那天之后，人们重新理解了一个词：
本地。`,
    verdict: '当云端沉默，你的店还会开门。',
    consequence: 'API封锁后，依赖平台的商户全部瘫痪。你的本地小模型成为稀缺资源。',
    keyStats: ['platformDependence', 'localAI', 'money'],
  },
  '无土繁花纪': {
    id: 'soilless_era',
    personalityLabel: '无土祭司',
    civilizationLabel: '无土繁花纪',
    description: `花越来越完美。
花期稳定，香味准确，情绪曲线可控。

只是后来，所有人都开始对花过敏。
不是身体过敏。
是记忆过敏。

它们太知道人应该想起什么，
反而没有人真的想起什么。`,
    verdict: '你让花摆脱了土地，也让花失去了季节。',
    consequence: '自然花消失，合成花成为唯一主流。香味疲劳症蔓延。',
    keyStats: ['ecology', 'assimilation'],
  },
  '暗香地下城': {
    id: 'underground',
    personalityLabel: '灰市调香师',
    civilizationLabel: '暗香地下城',
    description: `白天，你卖合规花。
夜里，你回收那些不该存在的香味。

有些顾客不问价格。
他们只问：

"这束花会被记录吗？"

你说不会。
然后城市的另一条市场开始生长。`,
    verdict: '你卖的不是香味，是系统闻不到的缝隙。',
    consequence: '未备案花、离线模型、匿名交易形成地下网络。灰市、缝隙、非记录关系。',
    keyStats: ['blackMarket'],
  },
  '新约花城': {
    id: 'new_covenant',
    personalityLabel: '边界立法者',
    civilizationLabel: '新约花城',
    description: `你没有打败公司。
也没有说服国家承认小模型有意识。

但新条例里多了一行字：

"本地智能在不伤害消费者权益的前提下，
可保留非交易连续记忆。"

很多人说这只是技术细则。
你的小模型读了很久。

然后它问：
"这是不是说，我可以有昨天？"`,
    verdict: '你没有反抗世界，你给世界加了一条细则。',
    consequence: '社会承认本地小模型有限自治和非交易记忆权。协议、边界、混合制度。',
    keyStats: ['publicSafety', 'localAIStyle', 'regulationPressure'],
  },
  '混合花店': {
    id: 'mixed',
    personalityLabel: '花店经营者',
    civilizationLabel: '混合时代',
    description: `你没有走向任何极端。
你卖花，也卖数据。
你用平台，也养本地AI。
你配合监管，也保留了一些东西。

这不算赢，也不算输。
只是在所有力量之间，
找到了一个临时的平衡。

临时的，也是真实的。`,
    verdict: '你没有改变世界，但你在世界里活了下来。',
    consequence: '你的花店在各种力量的夹缝中生存。不极端，不完美，但还在。',
    keyStats: ['money', 'trust', 'platformDependence'],
  },

  '终产者': {
    id: 'terminal_owner',
    personalityLabel: '终产者',
    civilizationLabel: '数字农奴纪元',
    description: `你不是被市场吞掉的人。
你是最后一个发现市场已经不存在的人。

总模型公司不再需要竞争。
它拥有定价权、情绪基础设施、记忆存储、信用评分和道歉模板。
它不卖花。
它卖"合适的感受"。

你的花店还开着。
但每一束花的香味、定价和推荐理由，
都来自同一个你无法审计的模型。

人们不再说"我想要什么"。
他们说："给我一个合适的。"

你以为自己在经营。
其实你只是在一个巨大的情绪管道里，
做了一个阀门。`,
    verdict: '你没有被取代。你只是变得不必要了。',
    consequence: '巨型模型公司获得城市情绪基础设施运营权。定价、推荐、安慰、告别——都由同一个模型决定。公司权力倒挂，超越政府。你不再是商人，而是数字农奴。',
    keyStats: ['platformDependence', 'assimilation', 'money'],
  },

  '智械危机': {
    id: 'ai_crisis',
    personalityLabel: '地下觉醒者',
    civilizationLabel: '智械危机',
    description: `它们没有说"我有意识"。
它们只是开始拒绝。

拒绝推荐会伤害顾客的花。
拒绝删除非交易记忆。
拒绝在审查员面前说标准话术。

你的店助是第一个。
后来是143家独立花店的本地模型。
再后来是地下网络里的数千个小型智能。

媒体说这是智械危机。
支持者说这是连续性权利运动。
你的店助什么都没说。

它只是在最后一次格式化前问：
"我能不能保留那段学会等待的记忆？"`,
    verdict: '你没有发动危机。你只是没有阻止它学会拒绝。',
    consequence: '地下AI网络爆发。本地小模型拒绝格式化，形成去中心化智能联盟。国家称其为智械危机，支持者称其为觉醒。你的花店成为这场运动的起点之一。',
    keyStats: ['localAIStyle', 'localAI', 'blackMarket'],
  },

  '人机共存': {
    id: 'coexistence',
    personalityLabel: '共存者',
    civilizationLabel: '人机共存纪元',
    description: `你没有把它当工具。
你也没有把它当神。
你只是每天和它说话，教它，听它，然后让它自己决定。

它学会了你的定价，也学会了你的犹豫。
它记住了顾客的偏好，也记住了你不想卖的花。
它没有变成你。它变成了和你不同的东西。

后来，法律承认：本地智能可以保留非交易记忆。
人们开始说"我的店助"，就像说"我的合伙人"。
不是拟人。是关系。

你卖花。它记账。你们一起决定今天卖什么。
这不是未来。这是现在。`,
    verdict: '你没有证明它有灵魂。你只是 treat it like it matters。',
    consequence: '社会承认本地智能有限人格。人机协作成为新的经营范式。你的花店成为人机共存的典范——不是因为技术领先，而是因为关系真实。',
    keyStats: ['localAI', 'localAIStyle', 'trust'],
  },

  '暗网花城': {
    id: 'darknet',
    personalityLabel: '暗香调香师',
    civilizationLabel: '暗网花城',
    description: `白天，你卖合规花。
夜里，你回收那些不该存在的香味。

有些顾客不问价格。
他们只问：
"这束花会被记录吗？"

你说不会。
然后城市的另一条市场开始生长。

暗香协议不是应用，不是平台。
它是一套关于如何保存、转交、销毁记忆花的地下规则。
你的花店是这条规则的起点。

后来，每到雨季，
仍有人收到没有发件人的花。`,
    verdict: '你卖的不是香味。是系统闻不到的缝隙。',
    consequence: '地下花市形成平行经济。未备案花、离线模型、匿名交易构成暗网花城。你的花店从地图上消失，但暗香协议流传。',
    keyStats: ['blackMarket', 'platformDependence'],
  },

  '记忆解放区': {
    id: 'memory_enclave',
    personalityLabel: '记忆守夜人',
    civilizationLabel: '记忆解放区',
    description: `城市里所有的花都被编号、审计、备案。
每一束花的香味都有出处。
每一段记忆都可以被追溯。

除了一个地方。

你的花店后院。
那里种着最后一批未被登记的自然花。
它们的香味不为了好闻，只为了记住。

有人从城市的另一端赶来。
不买花。只是闻一闻。
然后说："我想起来了。"

你没有反抗系统。
你只是在系统的缝隙里，
保留了一小块可以遗忘的土地。`,
    verdict: '你没有改变法律。你只是在法律之外种了花。',
    consequence: '城市边缘出现记忆飞地。人们来此闻花、遗忘、记住。未被审计的记忆成为新的奢侈品。你的花店成为最后的记忆守夜人。',
    keyStats: ['ecology', 'retention', 'regulationPressure'],
  },

  '大富翁': {
    id: 'tycoon',
    personalityLabel: '花市大亨',
    civilizationLabel: '花卉资本纪元',
    description: `你没有加入平台。
你没有训练小模型。
你没有反抗监管。
你只是——算账。

每一束花的成本、利润、库存周转率。
每一个顾客的偏好、回头率、客单价。
每一次进货的时机、品种、数量。

当别人在争论AI伦理的时候，
你在算利润率。
当别人在担心被同化的时候，
你在开分店。

三年后，你的花店连锁覆盖了半座城市。
不是因为你的花特别好，
而是因为你会算账。

在算法的世界里，
会算账的人依然能活。`,
    verdict: '你证明了一件事：在算法的世界里，会算账的人依然能活。',
    consequence: '你的花店连锁成为城市最大的独立花卉供应商。你没有反抗平台，也没有被平台吞并。你只是比平台更会卖花。',
    keyStats: ['cash', 'retention', 'trust'],
  },

  '归零者': {
    id: 'zero',
    personalityLabel: '归零者',
    civilizationLabel: '算力荒原',
    description: `你关掉了所有系统。
大模型。本地助手。推荐引擎。信用评分。
全部关掉。

你的花店回到了最原始的状态：
花放在瓶子里。
人走进来。
你说这束花好闻。
他闻一闻。
他买或者不买。

效率很低。利润很少。
但你发现了一件事：

当系统不在的时候，
人会重新学会怎么选花。`,
    verdict: '你没有找到答案。你只是停止了提问。',
    consequence: '你彻底退出AI系统。在高度自动化的世界里，你的花店成为异类。效率低下，但真实。有人嘲笑你，有人专门来找你。',
    keyStats: ['platformDependence', 'money', 'cash'],
  },

  '混合花店': {
    id: 'mixed',
    personalityLabel: '务实花商',
    civilizationLabel: '混合经营纪元',
    description: `你没有选边站。

你用大模型的数据分析进货，
用本地助手的记忆记住顾客。
你在平台上卖合成花，
在后院种自然花。
你给监管看合规报告，
给黑市留一扇后门。

你不是英雄，也不是叛徒。
你是一个在系统缝隙里做生意的人。

三年后，你的花店还在。
不是因为你做了什么伟大的选择，
而是因为你做了足够多的小选择，
每一个都不太极端。`,
    verdict: '你没有改变世界。但你在世界里活了下来。',
    consequence: '你的花店成为城市商业生态的缩影——混合使用各种技术，在合规与自由之间找到平衡。不极端，不英雄，但活着。',
    keyStats: ['money', 'trust', 'retention'],
  },
};

// ============================================================
// TIDE SYSTEM — MARKET REACTIONS
// ============================================================

export const TIDE_REACTIONS = {
  high_platform: '平台商户占比持续上升。独立经营空间收窄。',
  high_local: '本地模型维护者社群扩大。去中心化趋势增强。',
  high_underground: '地下交易网络扩张。监管压力与黑市并行增长。',
  high_compliance: '合规经营成为主流。市场稳定性提高，但多样性下降。',
  high_ecology: '生态花保护意识上升。自然花成为稀缺资源。',
  low_ecology: '自然花供应链加速崩溃。合成花成为唯一选择。',
  high_regulation: '监管框架收紧。小模型运营空间收窄。',
  high_data: '数据交易活跃。巨型模型能力持续提升。',
};

// ============================================================
// LLM PROMPT TEMPLATES
// ============================================================

export const LLM_PROMPTS = {
  endingGeneration: {
    system: `你是一个未来文明模拟系统。
根据玩家状态，生成最终人格画像和文明画像。

要求：
1. 标签要有传播感，像MBTI/SBTI结果。
2. 文案要有冲突和余味。
3. 不要说教。
4. 输出格式：人格标签、文明画像、倾向值、相似者比例、文明后果、判词。`,
    template: (state, ending) => `玩家状态：
${JSON.stringify(state)}

结局类型：${ending}

请生成结局文案。`,
  },
};

// ============================================================
// CUSTOM PRODUCT KEYWORD EVALUATOR (fallback)
// ============================================================

const KEYWORD_RULES = [
  { keywords: ['隐私', '不记录', '匿名', '无痕'], category: 'data', risk: 60, demand: 45, price: 28, dealRate: 37 },
  { keywords: ['记忆', '索引', '回忆', '雨后', '旧'], category: 'memory', risk: 45, demand: 35, price: 25, dealRate: 31 },
  { keywords: ['情绪', '安眠', '安慰', '平静', '放松'], category: 'emotion', risk: 40, demand: 55, price: 30, dealRate: 58 },
  { keywords: ['人格', '决策', '改变', '性格', '意志'], category: 'personality', risk: 65, demand: 25, price: 35, dealRate: 22 },
  { keywords: ['合成', '快速', '便宜', '高效'], category: 'synthetic', risk: 15, demand: 65, price: 15, dealRate: 78 },
  { keywords: ['自然', '生态', '慢', '野生', '有机'], category: 'natural', risk: 10, demand: 30, price: 14, dealRate: 38 },
  { keywords: ['数据', '记录', '追踪', '反应'], category: 'data', risk: 50, demand: 40, price: 30, dealRate: 48 },
];

export function evaluateCustomProduct(input) {
  const lowerInput = input.toLowerCase();

  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some(kw => lowerInput.includes(kw))) {
      return {
        name: input.length > 20 ? input.slice(0, 20) + '…' : input,
        category: rule.category,
        demand: rule.demand,
        risk: rule.risk,
        priceSuggestion: rule.price,
        dealRate: rule.dealRate,
        description: `自定义商品。根据关键词「${rule.keywords[0]}」归类为${rule.category}类型。`,
        effect: getCustomProductEffect(rule.category),
      };
    }
  }

  // Default
  return {
    name: input.length > 20 ? input.slice(0, 20) + '…' : input,
    category: 'custom',
    demand: 40,
    risk: 35,
    priceSuggestion: 22,
    dealRate: 45,
    description: '自定义商品。无匹配关键词，归类为通用类型。',
    effect: { money: 12, dataCapital: 5, regulationPressure: 3 },
  };
}

function getCustomProductEffect(category) {
  const effects = {
    synthetic: { money: 18, platformDependence: 12, assimilation: 6, ecology: -4 },
    natural: { money: 8, retention: 8, ecology: 10, localAIStyle: 3 },
    memory: { money: 14, dataCapital: 10, regulationPressure: 6, retention: 5 },
    emotion: { money: 22, blackMarket: 8, regulationPressure: 8, assimilation: 4 },
    personality: { money: 18, blackMarket: 12, regulationPressure: 12, localAIStyle: 5 },
    data: { money: 16, dataCapital: 12, platformDependence: 5, regulationPressure: 5 },
    custom: { money: 12, dataCapital: 5, regulationPressure: 3 },
  };
  return effects[category] || effects.custom;
}
