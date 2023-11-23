import { Card, Flex, H1, Input, P, TokenInput } from '@interlay/ui';
import { Layout } from './components';

import { useForm } from '@interlay/hooks';
import { mergeProps } from '@react-aria/utils';
import { useMutation } from '@tanstack/react-query';
import { Key, useEffect, useState } from 'react';
import { StyledWrapper } from './App.style';
import { AuthCTA } from './components/AuthCTA';
import { ContractType, CurrencyTicker, Erc20CurrencyTicker } from './constants';
import { useBalances } from './hooks/useBalances';
import { isFormDisabled } from './utils/validation';
import './utils/yup.custom';
import { useAccountAbstraction } from './aa/context';
import { encodeFunctionData } from 'viem';
import { HexString } from './types';
import { toAtomicAmount } from './utils/currencies';
import { useContract } from './hooks/useContract';

type TransferForm = {
  amount: string;
  ticker: string;
  address: string;
};

function App() {
  const { client } = useAccountAbstraction();

  const [ticker, setTicker] = useState<CurrencyTicker>(Erc20CurrencyTicker.WBTC);
  const { balances, getBalance, refetch } = useBalances();

  const contract = useContract(ContractType[Erc20CurrencyTicker.WBTC]);
  const mutation = useMutation({
    mutationFn: async (form: TransferForm) => {
      if (!client) {
        return;
      }
      console.log(form);

      // approve wbtc spending by paymaster contract
      if (client.paymasterAddress && client.smartAccountAddress) {
        const allowance = await contract.read.allowance([client.smartAccountAddress, client.paymasterAddress]);

        const uint256Max = BigInt(2 ** 256) - BigInt(1);
        if (allowance < uint256Max) {
          const approvalCallData = encodeFunctionData({
            abi: contract.abi,
            functionName: 'approve',
            args: [client.paymasterAddress as HexString, uint256Max]
          });
          const approvalUserOp = await client.createUserOp({
            address: contract.address,
            callData: approvalCallData,
            value: 0
          });
          approvalUserOp.paymasterAndData = '0x';
          const approvalResult = await client.sendUserOp(approvalUserOp);
          console.log(approvalResult);
        }
      }

      const atomicAmount = toAtomicAmount(form.amount, 'WBTC');
      // send userop
      const callData = encodeFunctionData({
        abi: contract.abi,
        functionName: 'transfer',
        args: [form.address as HexString, atomicAmount]
      });
      const userOp = await client.createUserOp({ address: contract.address, callData, value: 0 });

      const transferResult = await client?.sendUserOp(userOp);
      console.log(transferResult);

      refetch();
      return;
    }
  });

  const handleSubmit = (values: TransferForm) => {
    mutation.mutate(values);
  };

  const balance = getBalance(ticker);

  const form = useForm<TransferForm>({
    initialValues: {
      amount: '',
      ticker: 'WBTC',
      address: ''
    },
    onSubmit: handleSubmit,
    hideErrors: 'untouched'
  });

  useEffect(() => {
    if (!balances) return;

    form.validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balances]);

  const isSubmitDisabled = isFormDisabled(form);

  return (
    <Layout>
      <StyledWrapper direction='column' gap='spacing4'>
        <Card>
          <H1 align='center' size='xl'>
            Transfer
          </H1>
          <P align='center' style={{ padding: '1.5rem 0' }}>
            Using smart account {client?.smartAccountAddress}
          </P>
          <form onSubmit={form.handleSubmit}>
            <Flex marginTop='spacing4' direction='column' gap='spacing8'>
              <Flex direction='column' gap='spacing4'>
                <TokenInput
                  type='selectable'
                  label='Offer'
                  balance={balance?.toBig().toString()}
                  valueUSD={0}
                  selectProps={mergeProps(
                    {
                      items: [
                        {
                          value: 'WBTC',
                          balance: getBalance(Erc20CurrencyTicker.WBTC).toBig().toNumber(),
                          balanceUSD: 0
                        },
                        {
                          value: 'USDT',
                          balance: getBalance(Erc20CurrencyTicker.USDT).toBig().toNumber(),
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
