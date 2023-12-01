# BOB Collective: Gas fee payment in WBTC (using ERC-4337)

In this example, we will show how WBTC can be used for gas fee payment using the ERC-4337 account abstraction standard on BOB. This enables users to use smart contract wallets and transact without the necessity to own ether.

## Local development

### Installing the project

1. Install [pnpm](https://pnpm.io/installation)
2. Run `pnpm install`

### Connecting Metamask

1. Go to [Conduit](https://app.conduit.xyz/published/view/fluffy-bob-7mjgi9pmtg)
2. Click the 'Add to wallet button.'

### Funding your account

#### Native token

1. Create a new account in your wallet
2. From the L2 Faucet section in [Conduit](https://app.conduit.xyz/published/view/fluffy-bob-7mjgi9pmtg), enter your address and click the 'Claim' button.

Note: we have seen instances of this failing. If this happens, the api can be called from a terminal:
`curl -XPOST -i https://faucetl2-fluffy-bob-7mjgi9pmtg.t.conduit.xyz/drip/0x4062e44077b1e58C3D630a0e4e632fF81868e448`

#### Other supported tokens

1. This can be done either by using the faucet button in the UI or by interacting with the smart contract in [Conduit](https://explorerl2-fluffy-bob-7mjgi9pmtg.t.conduit.xyz/address/[address])

### Starting the project

1. Run `pnpm run dev`
2. Open `localhost:5173` in browser.

### Using the dApp

This application uses the ERC-4337 standard and showcases how a smart contract wallet can be integrated. It contains an implementation of a custom account abstraction client that simplifies the integration of this standard into the UI. 


The application consists of a simple form that allows you to send WBTC from the smart contract account with the gas fee paid in WBTC. To use it enter the WBTC amount and the recipient's EVM address. Then the injected wallet will ask for a user operation signature. After that, a signed user operation will be sent to the bundler which will broadcast it to the network.

Note: *Before the first user operation can be made, the paymaster smart contract has to be approved to spend your WBTC. That is why there will be an approval transaction request before the first transfer user operation.*

WBTC contract address: `0x28A13b11551f91651e8Da8Cd997886aA0B46CD16`

Entry point contract address: `0x7A660708DB3D56BB0dC3694344777c805716Fca7`

WBTC paymaster address:
`0xD8Ae58534d5488571E248DdC0A3aD42aD5dBaD26`

Bundler (eth-infinitism):
`https://bundler-fluffy-bob.gobob.xyz/rpc`

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