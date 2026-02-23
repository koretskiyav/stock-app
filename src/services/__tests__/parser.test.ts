import { describe, it, expect } from 'vitest';
import { parseStatements } from '../parser';

describe('parser', () => {
  it('should parse complex statements including splits and spinoffs', () => {
    const csvContent = `
Trades,Header,DataDiscriminator,Asset Category,Symbol,Date/Time,Quantity,T. Price,Proceeds,Comm/Fee,Basis,Realized P/L
Trades,Data,Order,Stocks,AAPL,"2024-01-01, 10:00:00",10,150,-1500,-1,1501,0
Trades,Data,Trade,Stocks,FB,"2023-01-01, 10:00:00",5,200,-1000,-2,1002,0
Trades,Data,Order,Stocks,GOOG,"2024-01-02, 11:30:00",20,100,-2000,-1,2001,0
Trades,Data,Order,Stocks,MSFT,"2024-01-03, 15:45:00",15,300,-4500,-2,4502,0
Trades,Data,Trade,Stocks,AAPL,"2024-01-05, 10:00:00",-5,160,800,-1,-750,50

Corporate Actions,Header,DataDiscriminator,Asset Category,Symbol,Date/Time,Description,Quantity,T. Price,Proceeds,Comm/Fee,Basis,Realized P/L
Corporate Actions,Data,Split,Stocks,AAPL,"2024-02-01, 00:00:00","AAPL(US0378331005) Split 4 FOR 1",0,0,0,0,0,0
Corporate Actions,Data,Split,Stocks,GOOG,"2024-02-15, 00:00:00","ALPHABET INC-CL C Split 20 FOR 1 (GOOG)",0,0,0,0,0,0
Corporate Actions,Data,Spinoff,Stocks,TSLA,"2024-03-01, 00:00:00","TESLA INC (TSLA) Spinoff (NVDA, NVIDIA CORP) (Ordinary Dividend)",1,0,0,0,0,0

Dividends,Header,Currency,Date,Description,Amount,Tax,Net
Dividends,Data,USD,2024-04-01,"AAPL(US0378331005) Cash Dividend USD 0.25 per Share (Ordinary Dividend)",2.5,-0.37,2.13
Dividends,Data,USD,2024-04-15,"MSFT(US5949181045) Cash Dividend USD 0.75 per Share (Ordinary Dividend)",11.25,-1.69,9.56
Dividends,Data,USD,2024-05-01,"GOOG(US02079K1079) Cash Dividend USD 0.20 per Share (Ordinary Dividend)",4.0,-0.60,3.40

Net Asset Value,Header,Asset Class,Current Total
Net Asset Value,Data,Cash,15000.75
`;

    const result = parseStatements([csvContent]);

    // 1. Verify Cash
    expect(result.cash).toBe(15000.75);

    // 2. Verify Trades (including Split adjustments)
    // AAPL Buy: 10 shares -> 40 after 4:1 split
    const aaplBuy = result.trades.find((t) => t.symbol === 'AAPL' && t.quantity > 0);
    expect(aaplBuy).toBeDefined();
    expect(aaplBuy?.quantity).toBe(40);
    expect(aaplBuy?.tPrice).toBe(37.5);

    // AAPL Sell: -5 shares -> -20 after 4:1 split
    const aaplSell = result.trades.find((t) => t.symbol === 'AAPL' && t.quantity < 0);
    expect(aaplSell).toBeDefined();
    expect(aaplSell?.quantity).toBe(-20);
    expect(aaplSell?.tPrice).toBe(40); // 160 / 4

    // GOOG: 20 shares -> 400 after 20:1 split
    const googTrade = result.trades.find((t) => t.symbol === 'GOOG');
    expect(googTrade).toBeDefined();
    expect(googTrade?.quantity).toBe(400);
    expect(googTrade?.tPrice).toBe(5); // 100 / 20

    // MSFT: 15 shares (no split)
    const msftTrade = result.trades.find((t) => t.symbol === 'MSFT');
    expect(msftTrade).toBeDefined();
    expect(msftTrade?.quantity).toBe(15);
    expect(msftTrade?.tPrice).toBe(300);

    // FB should be renamed to META
    const metaTrade = result.trades.find((t) => t.symbol === 'META');
    expect(metaTrade).toBeDefined();

    // 3. Verify Spinoffs
    const nvdaTrade = result.trades.find((t) => t.symbol === 'NVDA');
    expect(nvdaTrade).toBeDefined();
    expect(nvdaTrade?.quantity).toBe(1);

    // 4. Verify Dividends
    expect(result.dividends).toHaveLength(3);

    const aaplDiv = result.dividends.find((d) => d.symbol === 'AAPL');
    expect(aaplDiv?.perShare).toBe(0.25);
    expect(aaplDiv?.quantity).toBe(10); // 2.5 / 0.25

    const msftDiv = result.dividends.find((d) => d.symbol === 'MSFT');
    expect(msftDiv?.perShare).toBe(0.75);
    expect(msftDiv?.quantity).toBe(15); // 11.25 / 0.75

    const googDiv = result.dividends.find((d) => d.symbol === 'GOOG');
    expect(googDiv?.perShare).toBe(0.2);
    expect(googDiv?.quantity).toBe(20); // 4 / 0.2

    // 5. Verify Splits
    expect(result.splits).toHaveLength(2);
    expect(result.splits.find((s) => s.symbol === 'AAPL')?.ratio).toBe(4);
    expect(result.splits.find((s) => s.symbol === 'GOOG')?.ratio).toBe(20);
  });

  it('should handle multiple files with varying content', () => {
    const file1 = `
Trades,Header,DataDiscriminator,Asset Category,Symbol,Date/Time,Quantity,T. Price,Proceeds,Comm/Fee,Basis,Realized P/L
Trades,Data,Order,Stocks,MSFT,"2024-01-01, 10:00:00",5,300,-1500,-1,1501,0
`;
    const file2 = `
Net Asset Value,Header,Asset Class,Current Total
Net Asset Value,Data,Cash,1000
`;

    const result = parseStatements([file1, file2]);
    expect(result.trades).toHaveLength(1);
    expect(result.trades[0].symbol).toBe('MSFT');
    expect(result.cash).toBe(1000);
  });
});
