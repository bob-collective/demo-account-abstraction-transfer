import { useState, useEffect } from 'react';
import { AaClient } from '../AaClient';
import { accountAbstractionContext } from './accountAbstractionContext';

const AccountAbstractionProvider = ({ children }: { children: JSX.Element }) => {
  const [client, setClient] = useState<AaClient>();

  useEffect(() => {
    new AaClient({
      paymasterAddress: '0xD8Ae58534d5488571E248DdC0A3aD42aD5dBaD26',
      bundlerUrl: 'https://bundler-fluffy-bob.gobob.xyz/rpc', // For local bundler use: 'http://localhost:3000/rpc',
      onInitCallback: (client) => setClient(client)
    });
  }, []);

  const state = {
    client
  };

  return <accountAbstractionContext.Provider value={state}>{children}</accountAbstractionContext.Provider>;
};

export { AccountAbstractionProvider };
