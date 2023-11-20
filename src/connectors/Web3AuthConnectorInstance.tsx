// Web3Auth Libraries
import { Web3AuthConnector } from '@web3auth/web3auth-wagmi-connector';
import { Web3Auth } from '@web3auth/modal';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { Chain } from 'wagmi';
import { L2_BLOCK_EXPLORER, L2_RPC_URL } from '../config';

export default function Web3AuthConnectorInstance(chains: Chain[]) {
  // Create Web3Auth Instance
  const name = 'My App Name';
  const chainConfig = {
    chainNamespace: 'eip155',
    chainId: '0x385',
    rpcTarget: L2_RPC_URL,
    displayName: 'BOB',
    blockExplorer: L2_BLOCK_EXPLORER,
    ticker: 'ETH',
    tickerName: 'Ethereum'
  };

  const web3AuthInstance = new Web3Auth({
    clientId: 'BNb7d5td0513e3XyZ3PLzk-jE6YtISkFLLXRKLqMrPzPZXiV9SxqWvn7w0MCDBFsth6w9Fgx9JWW2jcfKR56mUc', // Get your Client ID from the Web3Auth Dashboard
    web3AuthNetwork: 'sapphire_devnet',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chainConfig: chainConfig as any,
    uiConfig: {
      appName: name,
      loginMethodsOrder: ['github', 'google'],
      defaultLanguage: 'en',
      modalZIndex: '2147483647'
    },
    enableLogging: true
  });

  // Add openlogin adapter for customisations
  const privateKeyProvider = new EthereumPrivateKeyProvider({
    config: { chainConfig }
  });

  const openloginAdapterInstance = new OpenloginAdapter({
    privateKeyProvider,
    adapterSettings: {
      network: 'cyan',
      uxMode: 'popup',
      whiteLabel: {
        logoLight: 'https://web3auth.io/images/w3a-L-Favicon-1.svg',
        logoDark: 'https://web3auth.io/images/w3a-D-Favicon-1.svg',
        defaultLanguage: 'en'
      }
    }
  });

  web3AuthInstance.configureAdapter(openloginAdapterInstance);

  return new Web3AuthConnector({
    chains,
    options: {
      web3AuthInstance
    }
  });
}
