import { BaseAccountAPI, HttpRpcClient } from '@account-abstraction/sdk';
import { createContext, useContext, useEffect, useState } from 'react';
import { providers } from 'ethers';
import { wrapProvider } from './utils';
import { HexString } from '../types';
import { Web3Provider } from '@ethersproject/providers';
import { PromiseOrValue } from './accountFactory';

const ENTRY_POINT_ADDRESS = '0x7A660708DB3D56BB0dC3694344777c805716Fca7'; // '0x8B2e6AA2451a49d2cb124f69896Bc927333c7f33';

type accountAbstractionContextValue = {
  client?: AaClient;
};

const initialState = {
  client: undefined
};

const accountAbstractionContext = createContext<accountAbstractionContextValue>(initialState);

const useAccountAbstraction = () => {
  const context = useContext(accountAbstractionContext);

  if (!context) {
    throw new Error('useAccountAbstraction should be used within an AccountAbstraction Provider');
  }

  return context;
};

interface AaClientConstructorOpts {
  bundlerUrl?: string;
  paymasterAddress?: HexString;
  onInitCallback?: (client: AaClient) => void;
}
export type Bytes = ArrayLike<number>;

export type BytesLike = Bytes | string;

export type BigNumberish = Bytes | bigint | string | number;

export type UserOperationStruct = {
  sender: PromiseOrValue<string>;
  nonce: PromiseOrValue<BigNumberish>;
  initCode: PromiseOrValue<BytesLike>;
  callData: PromiseOrValue<BytesLike>;
  callGasLimit: PromiseOrValue<BigNumberish>;
  verificationGasLimit: PromiseOrValue<BigNumberish>;
  preVerificationGas: PromiseOrValue<BigNumberish>;
  maxFeePerGas: PromiseOrValue<BigNumberish>;
  maxPriorityFeePerGas: PromiseOrValue<BigNumberish>;
  paymasterAndData: PromiseOrValue<BytesLike>;
  signature: PromiseOrValue<BytesLike>;
};

/**
 * an API to external a UserOperation with paymaster info
 */
class WBTCPaymasterAPI {
  /**
   * @param userOp a partially-filled UserOperation (without signature and paymasterAndData
   *  note that the "preVerificationGas" is incomplete: it can't account for the
   *  paymasterAndData value, which will only be returned by this method..
   * @returns the value to put into the PaymasterAndData, undefined to leave it empty
   */
  public paymasterAddress: HexString;

  constructor(address: HexString) {
    this.paymasterAddress = address;
  }

  async getPaymasterAndData(): Promise<string | undefined> {
    // TODO: Add custom fee limit passed into class constructor.
    const unlimitedPaymasterAndData = `${this.paymasterAddress}ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff`;
    return unlimitedPaymasterAndData;
  }
}
class AaClient {
  public isInitialized = false;
  public paymasterAddress: HexString | undefined;
  public accountApi: BaseAccountAPI | null = null;
  public smartAccountAddress: HexString | null = null;
  public rpcClient: HttpRpcClient | null = null;

  private _signer: providers.JsonRpcSigner | null = null;
  private _injectedProvider: Web3Provider;

  constructor(opts: AaClientConstructorOpts = {}) {
    if (!window.ethereum) {
      throw new Error('Injected wallet not found.');
    }
    this._injectedProvider = new providers.Web3Provider(window.ethereum);
    this.paymasterAddress = opts.paymasterAddress;

    this._initialize(opts);
  }

  /**
   * Initializes connection to bundler and prepares class members.
   * @param opts Initialization params.
   */
  private async _initialize(opts: AaClientConstructorOpts) {
    const config = {
      chainId: await this._injectedProvider.getNetwork().then((network) => network.chainId),
      entryPointAddress: ENTRY_POINT_ADDRESS,
      bundlerUrl: opts.bundlerUrl || 'https://bundler-fluffy-bob.gobob.xyz/rpc',
      paymasterAPI: opts.paymasterAddress && new WBTCPaymasterAPI(opts.paymasterAddress) // TODO: make optional and allow other paymasters.
    };
    this._signer = this._injectedProvider.getSigner();

    const wrappedProvider = await wrapProvider(this._injectedProvider, config, this._signer);
    this.accountApi?.paymasterAPI;
    this.smartAccountAddress = (await wrappedProvider.smartAccountAPI.getAccountAddress()) as HexString;
    this.accountApi = wrappedProvider.smartAccountAPI;
    this.rpcClient = wrappedProvider.httpRpcClient;

    this.isInitialized = true;
    opts.onInitCallback?.(this);
  }

  private _checkInitialized() {
    if (!this.isInitialized) {
      throw new Error('AA client is not initialized yet.');
    }
  }

  public async createUserOp({
    address,
    value,
    callData
  }: {
    address: HexString;
    value: string | number | undefined;
    callData: HexString;
  }) {
    this._checkInitialized();

    const op = await this.accountApi!.createUnsignedUserOp({
      target: address,
      value: value,
      data: callData,
      // TODO: Set gas limits dynamically.
      maxFeePerGas: 0x6507a5d0,
      maxPriorityFeePerGas: 0x6507a5c0
    });

    console.log(op);
    return op as UserOperationStruct;
  }

  protected async _preSendUserOp() {
    this._checkInitialized();
    // TODO: check if the account has funded the entrypoint yet.
    // If not, then:
    // Fund the account.

    // const hexStrippedSmartAccount = this.smartAccountAddress!.slice(2);
    // await this._signer!.sendTransaction({
    //   to: ENTRY_POINT_ADDRESS,
    //   value: 1000000000000000,
    //   data: `0xb760faf9000000000000000000000000${hexStrippedSmartAccount}`,
    //   gasLimit: 100000
    // }).then(async (tx) => await tx.wait());
  }

  public async sendUserOp(userOp: UserOperationStruct) {
    await this._preSendUserOp();

    const signedUserOp = await this.accountApi!.signUserOp(userOp);

    return await this.rpcClient?.sendUserOpToBundler(signedUserOp);
  }
}

const AccountAbstractionProvider = ({ children }: { children: JSX.Element }) => {
  const [client, setClient] = useState<AaClient>();

  useEffect(() => {
    new AaClient({
      paymasterAddress: '0xD8Ae58534d5488571E248DdC0A3aD42aD5dBaD26',
      bundlerUrl: 'http://localhost:3000/rpc',
      onInitCallback: (client) => setClient(client)
    });
  }, []);

  const state = {
    client
  };

  return <accountAbstractionContext.Provider value={state}>{children}</accountAbstractionContext.Provider>;
};

export { AccountAbstractionProvider, useAccountAbstraction };
