const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');

async function sendTokens() {
    const wsProvider = new WsProvider('ws://127.0.0.1:9944');
    const api = await ApiPromise.create({ provider: wsProvider });

    // Load Alice's account from the test keyring
    const keyring = new Keyring({ type: 'sr25519' });
    const sender = keyring.addFromUri('//Alice');

    // Create a transaction to send 1 unit of native token
    const transfer = api.tx.balances.transferAllowDeath('5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',1000000000000);
    // const transfer = api.tx.balances.forceSetBalance('5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',100000000000000)

    // Sign and send
    const hash = await transfer.signAndSend(sender);
    console.log(`Transaction sent! Hash: ${hash.toHex()}`);
}
// console.log(1152921504606846976-1000000000000)
sendTokens();
// async function listModules() {

//     const wsProvider = new WsProvider('ws://127.0.0.1:9944'); // Adjust your parachain endpoint
//     const api = await ApiPromise.create({ provider: wsProvider });

//     console.log("Available transaction modules:");
//     console.log(Object.keys(api.tx.balances));  // List all tx modules

// }

// listModules();