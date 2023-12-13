# BOB Collective: Gas fee payment in WBTC (using ERC-4337)

In this example, we will show how WBTC can be used for gas fee payment using the ERC-4337 account abstraction standard on BOB. This enables users to use smart contract wallets and transact without the necessity to own ether.

## Local development

### Installing the project

1. Install [pnpm](https://pnpm.io/installation)
2. Run `pnpm install`

### Connecting Metamask

You can either connect directly from the UI, or from Conduit:

1. Go to [Conduit](https://app.conduit.xyz/published/view/puff-bob-jznbxtoq7h)
2. Click the 'Add to wallet button.'

### Funding your account

#### Native token

1. Create a new account in your wallet
2. Fund your account with Sepolia ETH from the [Sepolia testnet faucet](https://faucetlink.to/sepolia).
3. Transfer Sepolia ETH to BOB using [Superbridge](https://puff-bob-jznbxtoq7h.testnets.superbridge.app/).

#### WBTC

1. This can be done by using the faucet button in the UI.
2. Tokens can then be imported into MetaMask using the contract address.

You will need to transfer tokens to the smart contract address shown at the top of the form.

### Starting the project

1. Run `pnpm run dev`
2. Open `localhost:5173` in browser.

### Using the dApp

This application uses the ERC-4337 standard and showcases how a smart contract wallet can be integrated. It contains an implementation of a custom account abstraction client that simplifies the integration of this standard into the UI.

The application consists of a simple form that allows you to send WBTC from the smart contract account with the gas fee paid in WBTC. To use it enter the WBTC amount and the recipient's EVM address. Then the injected wallet will ask for a user operation signature. After that, a signed user operation will be sent to the bundler which will broadcast it to the network.

Note: _Before the first user operation can be made, the paymaster smart contract has to be approved to spend your WBTC. That is why there will be an approval transaction request before the first transfer user operation._

- WBTC contract address: `0x2868d708e442A6a940670d26100036d426F1e16b`
- Entry point contract address: `0x8b57d6ec08e09078Db50F265729440713E024C6a`
- WBTC paymaster address: `0x777FA19ea9e771018678161ABf2f1E2879D3cA6C`
- Bundler (eth-infinitism): `https://bundler-fluffy-bob.gobob.xyz/rpc`

### Using account abstraction

To allow easy integration of ERC-4337 into dApps, a simple account abstraction client is included in this repository. This client handles smart account creation and bundler connection, manages user operations and allows paymaster usage. This repository also includes a React hook and context provider which enable straightforward usage of the client in the React application.

To use `AaClient` in your app wrap it in the `AccountAbstractionProvider`:

```typescript
<AccountAbstractionProvider>
  <App />
</AccountAbstractionProvider>
```

Now you can use the `useAccountAbstraction()` hook anywhere within the app to get the client and utilize its functionality:

```typescript
const { client } = useAccountAbstraction();
...
const userOp = await client.createUserOp({
address: contract.address,
callData,
value: 0,
nonce: approvalUserOpNonce || undefined
});

const transferResult = await client.signAndSendUserOp(userOp);


```

To view the example of a full account abstraction flow please check the `src/App.tsx` component.
