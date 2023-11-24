import { HexString } from '../types';

/**
 * an API to external a UserOperation with paymaster info
 */
class SimplePaymasterApi {
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
export { SimplePaymasterApi };
