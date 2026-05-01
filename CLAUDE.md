# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**喂龙花店 / 暗香协议** — A single-page web demo (2-5 min experience) where the player runs a flower shop in an AI-dominated near-future. Each sale, purchase, pricing decision, and AI training choice pushes civilization-level divergence. Target: hackathon-ready, no registration, open-and-play.

The design document (`喂龙花店_WebDemo开发文档.md`) is the authoritative spec. Read it before implementing anything.

## Architecture

Single-page app with three-column layout:
- **Left**: Shop state, world events, shop visuals
- **Center**: Current event/dialogue, product cards, pricing options, action buttons
- **Right**: Market variables, tide records, AI assistant dialogue

### Core Systems

1. **Event-driven narrative**: 5 chapters, each a strong event with 3-5 choices. No low-level loops — every choice matters.
2. **Market state engine**: 12 variables (`MarketState` type in the design doc §9.1) drive all outcomes: money, trust, retention, dataCapital, platformDependence, localAI, localAIStyle, regulationPressure, assimilation, blackMarket, ecology, publicSafety.
3. **Deal probability**: Formula in §9.3 — base demand, price deviation penalty, scarcity bonus, trust bonus, risk penalty, platform boost, trend boost, regulation penalty. Clamp to [5, 95].
4. **Tide system**: After each choice, show statistical distribution of similar merchants' choices. This drives market trends, platform responses, and regulation.
5. **AI assistant**: Starts as a dumb tool, grows a personality based on player-taught principles. Two tracks: platform-enhanced (strong but replaceable) or local-grown (weak but unique).
6. **Ending determination**: 8 endings determined by final `MarketState` values (§18). Priority-ordered condition checks.
7. **Flower types**: synthetic, natural, memory, emotion, personality, data, custom — each with different demand/risk/data profiles.

### Data Structures (from design doc §22)

```ts
type MarketState = {
  money: number;
  trust: number;
  retention: number;
  dataCapital: number;
  platformDependence: number;
  localAI: number;
  localAIStyle: number;
  regulationPressure: number;
  assimilation: number;
  blackMarket: number;
  ecology: number;
  publicSafety: number;
};

type Choice = {
  id: string;
  label: string;
  description: string;
  effect: Partial<MarketState>;
  nextEvent?: string;
};

type EventNode = {
  id: string;
  chapter: number;
  title: string;
  narrative: string;
  aiComment?: string;
  choices: Choice[];
};

type Ending = {
  id: string;
  personalityLabel: string;
  civilizationLabel: string;
  description: string;
  verdict: string;
  conditions: (state: MarketState) => boolean;
};
```

## Implementation Priority

### Day 1 (MVP)
- Static 5-chapter storyline with choice buttons
- State variable tracking and updates
- Ending determination logic
- Result card display (personality label, civilization label, verdict)

### Day 2
- Tide record display after each choice
- Dynamic market feedback text
- AI assistant growth dialogue
- Product card visuals

### Day 3 (polish)
- Custom product/protocol input
- LLM-generated market feedback (prompts in §21)
- Share poster generation
- Animations and sound

## LLM Integration (optional, §21)

Three structured prompts are defined in the spec:
- **Market evaluation**: Generates deal probability, outcome, variable changes, tide records
- **Small model assistant**: Generates advice based on taught principles, in a restrained/awkward/sincere tone
- **Ending generation**: Generates personality label, civilization portrait, verdict

## Content Notes

- The design doc contains all narrative text, character dialogue, event descriptions, and ending verbatim — copy from there, don't invent.
- AI assistant dialogue progression: early (mechanical) → mid (observational) → late (existential questions). See Appendix D.
- All transactions are fictional simulation. Include disclaimer on page.
