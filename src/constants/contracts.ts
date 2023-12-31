import { ERC20Abi } from '../contracts/abi/ERC20.abi';
import { EntryPointAbi } from '../contracts/abi/EntryPoint.abi';
import { FaucetAbi } from '../contracts/abi/Faucet.abi';
import { HexString } from '../types';
import { Erc20Currencies, Erc20CurrencyTicker } from './currencies';

// TODO: Figure out how we can reuse the ERC20Currency enum
//       here without need to re-define currencies again.
enum ContractType {
  WBTC = 'WBTC',
  // USDT = 'USDT',
  // ERC20_MARKETPLACE = 'ERC20_MARKETPLACE',
  // BTC_MARKETPLACE = 'BTC_MARKETPLACE',
  FAUCET = 'FAUCET',
  ENTRY_POINT = 'ENTRY_POINT'
}

// Contracts config with contract address and ABI
// that is used in useContract hook to automatically infer smart contract types.
const contracts = {
  // Automatically adds all ERC20 currencies contracts here.
  ...Object.entries(Erc20Currencies).reduce(
    (result, [key, value]) => ({ ...result, [key as ContractType]: { ...value, abi: ERC20Abi } }),
    {} as { [ticker in Erc20CurrencyTicker]: { abi: typeof ERC20Abi; address: HexString } }
  ),
  [ContractType.FAUCET]: {
    // TODO: switch to deployed contract address
    address: '0x7884560F14c62E0a83420F17832988cC1a775df1',
    abi: FaucetAbi
  },
  [ContractType.ENTRY_POINT]: {
    address: '0x8b57d6ec08e09078Db50F265729440713E024C6a',
    abi: EntryPointAbi
  }
} as const;

export { ContractType, contracts };
