// Enhanced Intraday Data Provider for Day Trading
import type { IntradayData, MinuteCandle, TechnicalSignals } from "./day-trading-strategies"

export class IntradayDataProvider {
  private polygonApiKey: string
  private alphaVantageKey: string
  private finnhubKey: string

  constructor() {
    this.polygonApiKey = process.env.POLYGON_API_KEY || ""
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY || ""
    this.finnhubKey = process.env.FINNHUB_API_KEY || ""
  }

  // Get real-time intraday data with 1-minute granularity
  async getIntradayData(ticker: string, timeframe: "1min" | "5min" | "15min" = "1min"): Promise<IntradayData> {
    try {
      console.log(`📊 Getting ${timeframe} intraday data for ${ticker}...`)

      // Get current quote
      const currentQuote = await this.getCurrentQuote(ticker)

      // Get minute-by-minute data for the day
      const minuteData = await this.getMinuteCandles(ticker, timeframe)

      // Calculate VWAP
      const vwap = this.calculateVWAP(minuteData)

      return {
        ticker,
        timestamp: new Date().toISOString(),
        price: currentQuote.price,
        volume: currentQuote.volume,
        bid: currentQuote.bid,
        ask: currentQuote.ask,
        spread: currentQuote.ask - currentQuote.bid,
        high: currentQuote.high,
        low: currentQuote.low,
        open: currentQuote.open,
        vwap,
        minuteData,
      }
    } catch (error) {
      console.error(`Error getting intraday data for ${ticker}:`, error)
      throw error
    }
  }

  // Get current real-time quote with bid/ask
  private async getCurrentQuote(ticker: string) {
    try {
      // Use Polygon for real-time data (premium feature)
      const response = await fetch(`https://api.polygon.io/v2/last/trade/${ticker}?apikey=${this.polygonApiKey}`)

      if (!response.ok) {
        throw new Error(`Failed to get quote: ${response.status}`)
      }

      const data = await response.json()

      // Also get current bid/ask
      const quoteResponse = await fetch(`https://api.polygon.io/v2/last/nbbo/${ticker}?apikey=${this.polygonApiKey}`)

      const quoteData = quoteResponse.ok ? await quoteResponse.json() : null

      return {
        price: data.results?.p || 0,
        volume: data.results?.s || 0,
        bid: quoteData?.results?.P || 0,
        ask: quoteData?.results?.p || 0,
        high: 0, // Will be filled from daily data
        low: 0,
        open: 0,
      }
    } catch (error) {
      console.warn(`Failed to get real-time quote for ${ticker}, using fallback`)
      return this.getFallbackQuote(ticker)
    }
  }

  // Get minute candles for intraday analysis
  private async getMinuteCandles(ticker: string, timeframe: string): Promise<MinuteCandle[]> {
    try {
      const today = new Date().toISOString().split("T")[0]

      // Use Polygon aggregates API for minute data
      const response = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/minute/${today}/${today}?adjusted=true&sort=asc&apikey=${this.polygonApiKey}`,
      )

      if (!response.ok) {
        throw new Error(`Failed to get minute data: ${response.status}`)
      }

      const data = await response.json()

      if (!data.results || data.results.length === 0) {
        return []
      }

      return data.results.map((candle: any) => ({
        timestamp: new Date(candle.t).toISOString(),
        open: candle.o,
        high: candle.h,
        low: candle.l,
        close: candle.c,
        volume: candle.v,
        vwap: candle.vw || 0,
      }))
    } catch (error) {
      console.warn(`Failed to get minute candles for ${ticker}:`, error)
      return []
    }
  }

  // Calculate Volume Weighted Average Price
  private calculateVWAP(candles: MinuteCandle[]): number {
    if (candles.length === 0) return 0

    let totalVolume = 0
    let totalVolumePrice = 0

    for (const candle of candles) {
      const typicalPrice = (candle.high + candle.low + candle.close) / 3
      totalVolumePrice += typicalPrice * candle.volume
      totalVolume += candle.volume
    }

    return totalVolume > 0 ? totalVolumePrice / totalVolume : 0
  }

  // Calculate comprehensive technical signals
  async calculateTechnicalSignals(ticker: string, minuteData: MinuteCandle[]): Promise<TechnicalSignals> {
    if (minuteData.length < 50) {
      throw new Error("Insufficient data for technical analysis")
    }

    const prices = minuteData.map((c) => c.close)
    const volumes = minuteData.map((c) => c.volume)
    const currentPrice = prices[prices.length - 1]

    return {
      rsi: this.calculateRSI(prices, 14),
      macd: this.calculateMACD(prices),
      bollingerBands: this.calculateBollingerBands(prices, currentPrice),
      movingAverages: this.calculateMovingAverages(prices),
      volumeProfile: this.calculateVolumeProfile(volumes),
      momentum: this.calculateMomentum(prices),
    }
  }

  // RSI calculation for day trading (shorter period)
  private calculateRSI(prices: number[], period = 14): number {
    if (prices.length < period + 1) return 50

    let gains = 0
    let losses = 0

    // Calculate initial average gain/loss
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1]
      if (change > 0) gains += change
      else losses += Math.abs(change)
    }

    let avgGain = gains / period
    let avgLoss = losses / period

    // Calculate RSI for remaining periods
    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1]
      const gain = change > 0 ? change : 0
      const loss = change < 0 ? Math.abs(change) : 0

      avgGain = (avgGain * (period - 1) + gain) / period
      avgLoss = (avgLoss * (period - 1) + loss) / period
    }

    const rs = avgGain / avgLoss
    return 100 - 100 / (1 + rs)
  }

  // MACD calculation optimized for day trading
  private calculateMACD(prices: number[]) {
    const ema12 = this.calculateEMA(prices, 12)
    const ema26 = this.calculateEMA(prices, 26)
    const macdLine = ema12 - ema26

    // Signal line is 9-period EMA of MACD line
    const macdHistory = []
    for (let i = 25; i < prices.length; i++) {
      const ema12_i = this.calculateEMA(prices.slice(0, i + 1), 12)
      const ema26_i = this.calculateEMA(prices.slice(0, i + 1), 26)
      macdHistory.push(ema12_i - ema26_i)
    }

    const signalLine = this.calculateEMA(macdHistory, 9)
    const histogram = macdLine - signalLine

    return {
      macd: macdLine,
      signal: signalLine,
      histogram,
    }
  }

  // EMA calculation
  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1]

    const multiplier = 2 / (period + 1)
    let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period

    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * multiplier + ema * (1 - multiplier)
    }

    return ema
  }

  // Bollinger Bands for day trading
  private calculateBollingerBands(prices: number[], currentPrice: number) {
    const period = 20
    const stdDev = 2

    if (prices.length < period) {
      return {
        upper: currentPrice * 1.02,
        middle: currentPrice,
        lower: currentPrice * 0.98,
        position: "above_middle" as const,
      }
    }

    const recentPrices = prices.slice(-period)
    const sma = recentPrices.reduce((sum, price) => sum + price, 0) / period

    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period
    const standardDeviation = Math.sqrt(variance)

    const upper = sma + standardDeviation * stdDev
    const lower = sma - standardDeviation * stdDev

    let position: "above_upper" | "above_middle" | "below_middle" | "below_lower"
    if (currentPrice > upper) position = "above_upper"
    else if (currentPrice > sma) position = "above_middle"
    else if (currentPrice > lower) position = "below_middle"
    else position = "below_lower"

    return {
      upper,
      middle: sma,
      lower,
      position,
    }
  }

  // Moving averages for trend analysis
  private calculateMovingAverages(prices: number[]) {
    const sma5 = this.calculateSMA(prices, 5)
    const sma10 = this.calculateSMA(prices, 10)
    const sma20 = this.calculateSMA(prices, 20)
    const ema9 = this.calculateEMA(prices, 9)
    const ema21 = this.calculateEMA(prices, 21)

    let trend: "bullish" | "bearish" | "neutral"
    if (sma5 > sma10 && sma10 > sma20) trend = "bullish"
    else if (sma5 < sma10 && sma10 < sma20) trend = "bearish"
    else trend = "neutral"

    return {
      sma5,
      sma10,
      sma20,
      ema9,
      ema21,
      trend,
    }
  }

  // Simple Moving Average
  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1]

    const recentPrices = prices.slice(-period)
    return recentPrices.reduce((sum, price) => sum + price, 0) / period
  }

  // Volume analysis for day trading
  private calculateVolumeProfile(volumes: number[]) {
    const averageVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length
    const currentVolume = volumes[volumes.length - 1]
    const volumeRatio = currentVolume / averageVolume
    const volumeSpike = volumeRatio > 2 // 2x average volume

    return {
      averageVolume,
      currentVolume,
      volumeRatio,
      volumeSpike,
    }
  }

  // Momentum indicators
  private calculateMomentum(prices: number[]) {
    const currentPrice = prices[prices.length - 1]
    const previousPrice = prices[prices.length - 2] || currentPrice
    const price5MinAgo = prices[prices.length - 6] || currentPrice

    const priceChange = currentPrice - previousPrice
    const priceChangePercent = (priceChange / previousPrice) * 100
    const velocity = currentPrice - price5MinAgo
    const acceleration = velocity - (price5MinAgo - (prices[prices.length - 11] || price5MinAgo))

    return {
      priceChange,
      priceChangePercent,
      velocity,
      acceleration,
    }
  }

  // Fallback quote using Finnhub
  private async getFallbackQuote(ticker: string) {
    try {
      const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${this.finnhubKey}`)

      const data = await response.json()

      return {
        price: data.c || 0,
        volume: 0,
        bid: data.c * 0.999,
        ask: data.c * 1.001,
        high: data.h || 0,
        low: data.l || 0,
        open: data.o || 0,
      }
    } catch (error) {
      throw new Error(`Failed to get fallback quote for ${ticker}`)
    }
  }

  // Get market session info
  getCurrentMarketSession(): string {
    const now = new Date()
    const hour = now.getHours()
    const minute = now.getMinutes()
    const timeInMinutes = hour * 60 + minute

    // Convert to EST (assuming server time)
    const estOffset = -5 * 60 // EST is UTC-5
    const estTime = timeInMinutes + estOffset

    if (estTime >= 4 * 60 && estTime < 9.5 * 60) return "PRE_MARKET"
    else if (estTime >= 9.5 * 60 && estTime < 10.5 * 60) return "MARKET_OPEN"
    else if (estTime >= 10.5 * 60 && estTime < 11.5 * 60) return "MID_MORNING"
    else if (estTime >= 11.5 * 60 && estTime < 13.5 * 60) return "LUNCH_TIME"
    else if (estTime >= 13.5 * 60 && estTime < 15 * 60) return "AFTERNOON"
    else if (estTime >= 15 * 60 && estTime < 16 * 60) return "POWER_HOUR"
    else return "AFTER_HOURS"
  }
}
