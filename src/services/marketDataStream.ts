const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const WS_URL = 'wss://ws.finnhub.io';

export type PriceUpdateCallback = (symbol: string, price: number) => void;

class MarketDataStream {
  private socket: WebSocket | null = null;
  private subscribers: Map<string, Set<PriceUpdateCallback>> = new Map();
  private isConnected = false;

  constructor() {
    if (!API_KEY || API_KEY === 'your_finnhub_key_here') {
      console.warn('Finnhub API key not set for WebSocket');
      return;
    }
  }

  private connect() {
    if (this.socket || !API_KEY) return;

    this.socket = new WebSocket(`${WS_URL}?token=${API_KEY}`);

    this.socket.onopen = () => {
      this.isConnected = true;
      console.log('Finnhub WebSocket Connected');
      // Resubscribe to existing symbols
      this.subscribers.forEach((_, symbol) => {
        this.sendSubscribe(symbol);
      });
    };

    this.socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'trade') {
        msg.data.forEach((trade: { s: string; p: number }) => {
          const symbolSubscribers = this.subscribers.get(trade.s);
          if (symbolSubscribers) {
            symbolSubscribers.forEach((callback) => callback(trade.s, trade.p));
          }
        });
      }
    };

    this.socket.onclose = () => {
      this.isConnected = false;
      this.socket = null;
      console.log('Finnhub WebSocket Disconnected. Retrying in 5s...');
      setTimeout(() => this.connect(), 5000);
    };

    this.socket.onerror = (error) => {
      console.error('Finnhub WebSocket Error:', error);
    };
  }

  private sendSubscribe(symbol: string) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({ type: 'subscribe', symbol }));
    }
  }

  private sendUnsubscribe(symbol: string) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    }
  }

  subscribe(symbol: string, callback: PriceUpdateCallback) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
      this.sendSubscribe(symbol);
    }
    this.subscribers.get(symbol)!.add(callback);

    if (!this.socket) {
      this.connect();
    }
  }

  unsubscribe(symbol: string, callback: PriceUpdateCallback) {
    const symbolSubscribers = this.subscribers.get(symbol);
    if (symbolSubscribers) {
      symbolSubscribers.delete(callback);
      if (symbolSubscribers.size === 0) {
        this.subscribers.delete(symbol);
        this.sendUnsubscribe(symbol);
      }
    }
  }
}

export const marketDataStream = new MarketDataStream();
