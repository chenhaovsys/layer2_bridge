const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');

async function listModules() {

    const wsProvider = new WsProvider('ws://127.0.0.1:9944'); // Adjust your parachain endpoint
    const api = await ApiPromise.create({ provider: wsProvider });

    console.log("Available transaction modules:");
    console.log(Object.keys(api.tx.balances));  // List all tx modules

}

listModules();