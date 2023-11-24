import { ClientConfig, ERC4337EthersProvider, HttpRpcClient, SimpleAccountAPI } from '@account-abstraction/sdk';
import { EntryPoint__factory } from '@account-abstraction/contracts';
import { SimpleAccountFactory__factoryClass } from './AccountFactory';
import { DeterministicDeployer } from './DeterministicDeployer';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Signer } from 'ethers';

async function wrapProvider(
  originalProvider: JsonRpcProvider,
  config: ClientConfig,
  originalSigner: Signer = originalProvider.getSigner()
): Promise<ERC4337EthersProvider> {
  const factoryInstance = new SimpleAccountFactory__factoryClass();
  const entryPoint = EntryPoint__factory.connect(config.entryPointAddress, originalProvider);
  // Initial SimpleAccount instance is not deployed and exists just for the interface
  const deployer = new DeterministicDeployer(originalProvider);

  const SimpleAccountFactory = await deployer.deterministicDeploy(factoryInstance, 0, [entryPoint.address]);
  const smartAccountAPI = new SimpleAccountAPI({
    provider: originalProvider,
    entryPointAddress: entryPoint.address,
    owner: originalSigner,
    factoryAddress: SimpleAccountFactory,
    paymasterAPI: config.paymasterAPI
  });

  const chainId = await originalProvider.getNetwork().then((net) => net.chainId);
  const httpRpcClient = new HttpRpcClient(config.bundlerUrl, config.entryPointAddress, chainId);
  return await new ERC4337EthersProvider(
    chainId,
    config,
    originalSigner,
    originalProvider,
    httpRpcClient,
    entryPoint,
    smartAccountAPI
  ).init();
}

export { wrapProvider };
