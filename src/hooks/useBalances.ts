import { useQuery } from '@tanstack/react-query';

import { useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { CurrencyTicker, Erc20Currencies, Erc20CurrencyTicker, currencies } from '../constants';
import { REFETCH_INTERVAL } from '../constants/query';
import { ERC20Abi } from '../contracts/abi/ERC20.abi';
import { Amount } from '../utils/amount';
import { useAccountAbstraction } from '../aa/';

type Balances = {
  [ticker in Erc20CurrencyTicker]: bigint;
};

const useBalances = () => {
  const publicClient = usePublicClient();
  const { client } = useAccountAbstraction();
  // const { address } = useAccount();

  // TODO: add transfer event listener and update balance on transfer in/out
  const { data, ...queryResult } = useQuery({
    queryKey: ['balances', client?.smartAccountAddress],
    enabled: !!client?.smartAccountAddress && !!publicClient,
    queryFn: async () => {
      const balancesMulticallResult = await publicClient.multicall({
        contracts: Object.values(Erc20Currencies).map(({ address: erc20Address }) => ({
          abi: ERC20Abi,
          address: erc20Address,
          functionName: 'balanceOf',
          args: [client?.smartAccountAddress]
        }))
      });

      return Object.keys(Erc20Currencies).reduce<Balances>(
        (result, ticker, index) => ({ ...result, [ticker]: balancesMulticallResult[index].result }),
        {} as Balances
      );
    },
    refetchInterval: REFETCH_INTERVAL.MINUTE
  });

  const getBalance = useCallback(
    (ticker: CurrencyTicker) => {
      const currency = currencies[ticker];

      if (data?.[ticker] === undefined) {
        return new Amount(currency, 0);
      }

      return new Amount(currencies[ticker], Number(data[ticker]));
    },
    [data]
  );

  return { ...queryResult, balances: data, getBalance };
};

export { useBalances };
