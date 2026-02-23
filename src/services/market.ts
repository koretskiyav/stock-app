export interface Quote {
  symbol: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

type PriceChangeListener = (symbol: string, price: number) => void;

export class MarketService {
  private static connectionPromise: Promise<void> = Promise.resolve();
  private static instanceCount = 0;
  private id = ++MarketService.instanceCount;
  private socket: WebSocket | null = null;
  private symbols: string[] = [];
  private isDestroyed = false;
  private priceChangeListeners: Set<PriceChangeListener> = new Set();
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private closeResolver: (() => void) | null = null;

  constructor(symbols: string[]) {
    this.symbols = symbols;
  }

  onPriceChange(listener: PriceChangeListener) {
    this.priceChangeListeners.add(listener);
    return () => this.priceChangeListeners.delete(listener);
  }

  async listen(): Promise<void> {
    if (this.isDestroyed) return;

    await MarketService.connectionPromise;

    MarketService.connectionPromise = new Promise((resolve) => {
      if (this.isDestroyed) {
        resolve();
        return;
      }

      console.log(`[MarketService #${this.id}] Connecting for: ${this.symbols.join(', ')}`);

      this.socket = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_KEY}`);

      this.socket.onopen = () => {
        console.log(`[MarketService #${this.id}] WebSocket Connected`);
        this.symbols.forEach((symbol) => {
          this.socket?.send(JSON.stringify({ type: 'subscribe', symbol }));
        });
        resolve();
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'trade') {
          data.data.forEach((trade: any) => {
            this.priceChangeListeners.forEach((listener) => listener(trade.s, trade.p));
          });
        }
      };

      this.socket.onerror = (error) => {
        console.error(`[MarketService #${this.id}] WebSocket Error:`, error);
        resolve();
      };

      this.socket.onclose = (event) => {
        const { code, reason, wasClean } = event;
        if (!this.isDestroyed) {
          console.warn(
            `[MarketService #${this.id}] WebSocket Closed (code: ${code}, reason: ${reason}, clean: ${wasClean}). Reconnecting in 5s...`,
          );
          this.reconnectTimeout = setTimeout(() => this.listen(), 5000);
        } else {
          console.log(
            `[MarketService #${this.id}] WebSocket Closed during cleanup (code: ${code})`,
          );
        }
        if (this.closeResolver) {
          this.closeResolver();
          this.closeResolver = null;
        }
        resolve();
      };
    });

    return MarketService.connectionPromise;
  }

  async destroy() {
    this.isDestroyed = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const waitPromise = new Promise<void>((resolve) => {
        this.closeResolver = resolve;
        // Timeout if close event doesn't fire
        setTimeout(resolve, 1000);
      });
      this.socket.close();
      await waitPromise;
    }
    this.socket = null;
  }
}
