import { HexString } from '../types';

enum Erc20CurrencyTicker {
  WBTC = 'WBTC',
  USDT = 'USDT'
}

type CurrencyTicker = keyof typeof Erc20CurrencyTicker;

interface CurrencyBase {
  ticker: string;
  name: string;
  decimals: number;
}

interface Erc20Currency extends CurrencyBase {
  ticker: Erc20CurrencyTicker;
  address: HexString;
}

type Currency = Erc20Currency;

const Erc20Currencies: {
  [ticker in Erc20CurrencyTicker]: Erc20Currency;
} = {
  [Erc20CurrencyTicker.WBTC]: {
    ticker: Erc20CurrencyTicker.WBTC,
    name: 'wBTC',
    decimals: 8,
    address: '0x2868d708e442A6a940670d26100036d426F1e16b'
  },
  [Erc20CurrencyTicker.USDT]: {
    ticker: Erc20CurrencyTicker.USDT,
    name: 'Tether USD',
    decimals: 6,
    address: '0x3c252953224948E441aAfdE7b391685201ccd3bC'
  }
};

const currencies = {
  ...Erc20Currencies
};

export { Erc20Currencies, Erc20CurrencyTicker, currencies };
export type { Erc20Currency, Currency, CurrencyTicker };
