// Advanced Day Trading Strategies and Technical Analysis
export interface IntradayData {
  ticker: string
  timestamp: string
  price: number
  volume: number
  bid: number
  ask: number
  spread: number
  high: number
  low: number
  open: number
  vwap: number
  minuteData: MinuteCandle[]
}

export interface MinuteCandle {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  vwap: number
}

export interface TechnicalSignals {
  rsi: number
  macd: {
    macd: number
    signal: number
    histogram: number
  }
  bollingerBands: {
    upper: number
    middle: number
    lower: number
    position: "above_upper" | "above_middle" | "below_middle" | "below_lower"
  }
  movingAverages: {
    sma5: number
    sma10: number
    sma20: number
    ema9: number
    ema21: number
    trend: "bullish" | "bearish" | "neutral"
  }
  volumeProfile: {
    averageVolume: number
    currentVolume: number
    volumeRatio: number
    volumeSpike: boolean
  }
  momentum: {
    priceChange: number
    priceChangePercent: number
    velocity: number
    acceleration: number
  }
}

export interface DayTradingSetup {
  strategy: string
  entryTime: string
  exitTime: string
  entryPrice: number
  targetPrice: number
  stopLoss: number
  riskReward: number
  confidence: number
  timeframe: string
  reasoning: string
  technicalSetup: string
  volumeConfirmation: boolean
  marketConditions: string
}

// Day Trading Strategy Definitions
export const DAY_TRADING_STRATEGIES = {
  MOMENTUM_BREAKOUT: {
    name: "Momentum Breakout",
    description: "Trade stocks breaking above resistance with volume",
    timeframe: "5-15 minutes",
    riskReward: "1:2 to 1:3",
    successRate: "65-70%",
    bestMarketConditions: "Trending markets, high volume",
    keyIndicators: ["Volume spike", "RSI > 50", "Price above VWAP", "Breaking resistance"],
  },

  SCALPING: {
    name: "Scalping",
    description: "Quick trades capturing small price movements",
    timeframe: "1-5 minutes",
    riskReward: "1:1 to 1:1.5",
    successRate: "70-80%",
    bestMarketConditions: "High liquidity, tight spreads",
    keyIndicators: ["Level 2 data", "Bid/ask spread", "Order flow", "Tick data"],
  },

  MEAN_REVERSION: {
    name: "Mean Reversion",
    description: "Trade oversold/overbought conditions back to mean",
    timeframe: "15-30 minutes",
    riskReward: "1:1.5 to 1:2",
    successRate: "60-65%",
    bestMarketConditions: "Range-bound markets",
    keyIndicators: ["RSI extremes", "Bollinger Band touches", "VWAP deviation"],
  },

  GAP_TRADING: {
    name: "Gap Trading",
    description: "Trade gaps at market open",
    timeframe: "First 30-60 minutes",
    riskReward: "1:2 to 1:4",
    successRate: "55-60%",
    bestMarketConditions: "Market open, news catalysts",
    keyIndicators: ["Gap size", "Pre-market volume", "News sentiment"],
  },

  VWAP_STRATEGY: {
    name: "VWAP Strategy",
    description: "Trade around Volume Weighted Average Price",
    timeframe: "Throughout day",
    riskReward: "1:1.5 to 1:2.5",
    successRate: "65-70%",
    bestMarketConditions: "Institutional trading hours",
    keyIndicators: ["Price vs VWAP", "Volume profile", "Standard deviations"],
  },

  NEWS_MOMENTUM: {
    name: "News Momentum",
    description: "Trade immediate reaction to news events",
    timeframe: "1-10 minutes",
    riskReward: "1:2 to 1:5",
    successRate: "50-60%",
    bestMarketConditions: "Breaking news, earnings",
    keyIndicators: ["News sentiment", "Volume explosion", "Price velocity"],
  },
}

// Market Session Analysis
export const MARKET_SESSIONS = {
  PRE_MARKET: {
    time: "4:00 AM - 9:30 AM EST",
    characteristics: "Lower volume, wider spreads, gap setups",
    strategies: ["Gap analysis", "News reaction", "Earnings plays"],
    riskLevel: "High",
  },

  MARKET_OPEN: {
    time: "9:30 AM - 10:30 AM EST",
    characteristics: "Highest volume, volatility, institutional activity",
    strategies: ["Momentum breakouts", "Gap fills", "Opening range breakouts"],
    riskLevel: "High",
  },

  MID_MORNING: {
    time: "10:30 AM - 11:30 AM EST",
    characteristics: "Consolidation, trend continuation",
    strategies: ["Pullback entries", "Flag patterns", "VWAP plays"],
    riskLevel: "Medium",
  },

  LUNCH_TIME: {
    time: "11:30 AM - 1:30 PM EST",
    characteristics: "Lower volume, choppy price action",
    strategies: ["Range trading", "Mean reversion", "Avoid overtrading"],
    riskLevel: "Medium",
  },

  AFTERNOON: {
    time: "1:30 PM - 3:00 PM EST",
    characteristics: "Renewed activity, trend resumption",
    strategies: ["Trend continuation", "Breakout trades", "Momentum plays"],
    riskLevel: "Medium",
  },

  POWER_HOUR: {
    time: "3:00 PM - 4:00 PM EST",
    characteristics: "High volume, institutional rebalancing",
    strategies: ["Momentum trades", "Reversal plays", "End-of-day positioning"],
    riskLevel: "High",
  },
}

// Risk Management Rules for Day Trading
export const DAY_TRADING_RISK_RULES = {
  POSITION_SIZING: {
    maxRiskPerTrade: 0.01, // 1% of account
    maxDailyRisk: 0.03, // 3% of account
    maxPositionSize: 0.25, // 25% of account
  },

  TIME_STOPS: {
    maxHoldTime: "4 hours",
    endOfDayExit: "3:45 PM EST",
    lunchTimeExit: "11:45 AM EST", // If in losing position
  },

  PROFIT_TARGETS: {
    scalping: "0.1-0.3%",
    momentum: "0.5-2%",
    breakout: "1-3%",
    gap: "2-5%",
  },

  STOP_LOSSES: {
    tight: "0.1-0.2%", // Scalping
    normal: "0.3-0.5%", // Most strategies
    wide: "0.5-1%", // Breakouts, gaps
  },
}
