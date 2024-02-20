import { Card, Flex, H1, Input, TokenInput } from '@interlay/ui';
import { Layout } from './components';

import { GelatoRelay } from '@gelatonetwork/relay-sdk';
import { useForm } from '@interlay/hooks';
import { mergeProps } from '@react-aria/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Key, useState } from 'react';
import { encodeFunctionData } from 'viem';
import { useAccount } from 'wagmi';
import { StyledWrapper } from './App.style';
import { AuthCTA } from './components/AuthCTA';
import { L2_CHAIN_ID } from './config';
import { ContractType, CurrencyTicker, Erc20CurrencyTicker } from './constants';
import { useContract } from './hooks/useContract';
import { useEthersSigner } from './hooks/useEthersSigner';
import { HexString } from './types';
import { toAtomicAmount } from './utils/currencies';
import { isFormDisabled } from './utils/validation';
import './utils/yup.custom';

type TransferForm = {
  amount: string;
  ticker: string;
  address: string;
};

const relay = new GelatoRelay({});

function App() {
  // const { client } = useAccountAbstraction();
  const { address } = useAccount();

  const [ticker, setTicker] = useState<CurrencyTicker>(Erc20CurrencyTicker.WBTC);
  const l1Signer = useEthersSigner({ chainId: L2_CHAIN_ID });

  const contract = useContract(ContractType[Erc20CurrencyTicker.WBTC]);
  const { data } = useQuery({
    queryKey: ['wbtc-balance', address],
    enabled: !!address,
    queryFn: async () => {
      if (!address) return;
      return contract.read.balanceOf([address!]);
    }
  });

  const mutation = useMutation({
    mutationFn: async (form: TransferForm) => {
      if (!address) return;

      // let approvalUserOpNonce: BigNumberish | null = null;
      // // approve wbtc spending by paymaster contract
      // if (address && client.smartAccountAddress) {
      //   const allowance = await contract.read.allowance([address, client.paymasterAddress]);

      //   const uint256Max = BigInt(2 ** 256) - BigInt(1);
      //   if (allowance < uint256Max) {
      //     const approvalCallData = encodeFunctionData({
      //       abi: contract.abi,
      //       functionName: 'approve',
      //       args: [client.paymasterAddress as HexString, uint256Max]
      //     });
      //     const approvalUserOp = await client.createUserOp({
      //       address: contract.address,
      //       callData: approvalCallData,
      //       value: 0
      //     });
      //     approvalUserOp.paymasterAndData = '0x';
      //     await client.signAndSendUserOp(approvalUserOp);
      //     approvalUserOpNonce = await approvalUserOp.nonce;
      //   }
      // }

      const atomicAmount = toAtomicAmount(form.amount, 'WBTC');
      return contract.write.transfer([form.address as HexString, atomicAmount]);
      // send userop
      const callData = encodeFunctionData({
        abi: contract.abi,
        functionName: 'transfer',
        args: [form.address as HexString, atomicAmount]
      });
      // const userOp = await client.createUserOp({
      //   address: contract.address,
      //   callData,
      //   value: 0,
      //   nonce: approvalUserOpNonce ? parseInt(approvalUserOpNonce.toString()) + 1 : undefined
      // });

      const request = {
        chainId: 123420111, // Goerli in this case
        target: contract.address, // target contract address
        data: callData!, // encoded transaction datas
        user: address
      };

      console.log(request);

      const sponsorApiKey = 'QBueYcEV78J_Zs2Hi_uoxuaLeUMQ8HBnSMgrg0r1eHI_';
      console.log(l1Signer);
      const relayResponse = await relay.sponsoredCallERC2771(
        request,
        l1Signer, // new providers.Web3Provider(provider),
        sponsorApiKey
      );
      const taskId = relayResponse.taskId;
      console.log(`https://relay.gelato.digital/tasks/status/${taskId}`);

      // const transferResult = await client?.signAndSendUserOp(userOp);
      // console.log(transferResult);

      return;
    }
  });

  const handleSubmit = (values: TransferForm) => {
    mutation.mutate(values);
  };

  const form = useForm<TransferForm>({
    initialValues: {
      amount: '',
      ticker: 'WBTC',
      address: ''
    },
    onSubmit: handleSubmit,
    hideErrors: 'untouched'
  });

  const isSubmitDisabled = isFormDisabled(form);

  return (
    <Layout>
      <StyledWrapper direction='column' gap='spacing4'>
        <Card>
          <H1 align='center' size='xl'>
            Transfer
          </H1>
          <button
            onClick={async () => {
              contract.write.mint([100000000000000000000000000n]);
            }}
          >
            mint
          </button>
          <form onSubmit={form.handleSubmit}>
            <Flex marginTop='spacing4' direction='column' gap='spacing8'>
              <Flex direction='column' gap='spacing4'>
                <TokenInput
                  type='selectable'
                  label='Amount'
                  balance={'0'}
                  valueUSD={0}
                  selectProps={mergeProps(
                    {
                      items: [
                        {
                          value: 'WBTC',
                          balance: 0,
                          balanceUSD: 0
                        }
                      ],
                      onSelectionChange: (key: Key) => setTicker(key as Erc20CurrencyTicker)
                    },
                    form.getSelectFieldProps('ticker')
                  )}
                  {...form.getTokenFieldProps('amount')}
                />
                <Input label='Address' placeholder='Enter address' {...form.getFieldProps('address')} />
              </Flex>
              <AuthCTA loading={mutation.isLoading} disabled={isSubmitDisabled} size='large' type='submit' fullWidth>
                Transfer
              </AuthCTA>
            </Flex>
          </form>
        </Card>
      </StyledWrapper>
    </Layout>
  );
}

export default App;
