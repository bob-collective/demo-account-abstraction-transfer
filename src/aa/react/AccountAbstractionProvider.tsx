import { useState, useEffect } from 'react';
import { AaClient } from '../AaClient';
import { accountAbstractionContext } from './accountAbstractionContext';

const AccountAbstractionProvider = ({ children }: { children: JSX.Element }) => {
  const [client, setClient] = useState<AaClient>();

  useEffect(() => {
    const createClient = () => {
      new AaClient({
        paymasterAddress: '0x777FA19ea9e771018678161ABf2f1E2879D3cA6C',
        bundlerUrl: 'https://bundler-sepolia.gobob.xyz/rpc', // For local bundler use: 'http://localhost:3000/rpc',
        // bundlerUrl: 'http://localhost:3000/rpc', // For local bundler use: '',
        onInitCallback: (client) => setClient(client)
      });
    };

    createClient();

    window.ethereum?.on('connect', createClient);
    window.ethereum?.on('accountsChanged', createClient);
    window.ethereum?.on('disconnect', () => setClient(undefined));
  }, []);

  const state = {
    client
  };

  return <accountAbstractionContext.Provider value={state}>{children}</accountAbstractionContext.Provider>;
};

export { AccountAbstractionProvider };
