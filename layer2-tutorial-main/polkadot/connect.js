const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');

async function balanceOperations() {
    // Connect to local node
    const wsProvider = new WsProvider('ws://127.0.0.1:9944');
    const api = await ApiPromise.create({ provider: wsProvider });

    // Create keyring and accounts
    const keyring = new Keyring({ type: 'sr25519' });
    const alice = keyring.addFromUri('//Alice');
    const bob = keyring.addFromUri('//Bob');

    // Check balance
    const { data: balanceAlice } = await api.query.system.account(alice.address);
    console.log(`Alice's balance: ${balanceAlice.free} tokens`);

    // Transfer tokens
    const transfer = api.tx.balances.transfer(bob.address, 1000);
    const hash = await transfer.signAndSend(alice);

    console.log('Transfer transaction hash:', hash.toHex());

    // Wait and check new balances
    await new Promise(resolve => setTimeout(resolve, 6000)); // Wait for block finalization
    
    const { data: balanceBob } = await api.query.system.account(bob.address);
    console.log(`Bob's new balance: ${balanceBob.free} tokens`);
}

balanceOperations().catch(console.error);