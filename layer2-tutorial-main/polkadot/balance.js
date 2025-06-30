const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');

async function main() {
    const wsProvider = new WsProvider('ws://layer2-rpc.dev.codedsolution.xyz'); // Parachain WS endpoint
    const api = await ApiPromise.create({ provider: wsProvider });

    const block = await api.rpc.chain.getBlock();
    console.log(`Latest Block: ${block.block.header.number}`);
    // Load Alice's account from the test keyring
    const keyring = new Keyring({ type: 'sr25519' });
    const sender = keyring.addFromUri('//CHARLETH');
    
    
    const walletAddress = sender.address;
    console.log(`Wallet Address: ${walletAddress}`);
    await getAccountBalance("0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac");

    process.exit();
}

main().catch(console.error);

async function getAccountBalance(address) {
    const wsProvider = new WsProvider('ws://layer2-rpc.dev.codedsolution.xyz');
    const api = await ApiPromise.create({ provider: wsProvider });

    const { data: balance } = await api.query.system.account(address);
    console.log(`Balance of ${address}: ${balance.free}`);
}