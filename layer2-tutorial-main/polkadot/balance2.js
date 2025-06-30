// Substrate/Polkadot Wallet Balance Checker
// Install required packages: npm install @polkadot/api
const { ApiPromise, WsProvider } = require('@polkadot/api');

// Example usage with your local node:
const walletAddress = '0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac'; // Replace with your actual wallet address
const nodeUrl = 'ws://layer2-rpc.dev.codedsolution.xyz'; // Your local node WebSocket URL

// Call the function
getSubstrateBalance(walletAddress, nodeUrl)
  .then(result => console.log('Operation completed successfully'))
  .catch(error => console.log('Operation failed'));

async function getSubstrateBalance(address, nodeUrl) {
  try {
    // Create a provider with the node WebSocket endpoint
    const provider = new WsProvider(nodeUrl);
    
    // Create the API instance
    const api = await ApiPromise.create({ provider });
    
    // Fetch account info including balance
    const { data: balance } = await api.query.system.account(address);
    
    // Get the chain decimals and token symbol
    const decimals = api.registry.chainDecimals[0];
    const token = api.registry.chainTokens[0];
    
    // Format the free balance with proper decimals
    const freeBalance = balance.free.toBigInt();
    const formattedBalance = (Number(freeBalance) / Math.pow(10, decimals)).toFixed(4);
    
    console.log(`Address: ${address}`);
    console.log(`Free Balance: ${formattedBalance} ${token}`);
    console.log(`Raw Balance: ${freeBalance.toString()}`);
    
    // Also display reserved and total balances
    const reservedBalance = balance.reserved.toBigInt();
    const formattedReserved = (Number(reservedBalance) / Math.pow(10, decimals)).toFixed(4);
    console.log(`Reserved: ${formattedReserved} ${token}`);
    
    const totalBalance = freeBalance + reservedBalance;
    const formattedTotal = (Number(totalBalance) / Math.pow(10, decimals)).toFixed(4);
    console.log(`Total: ${formattedTotal} ${token}`);
    
    // Clean up - disconnect from the API
    await api.disconnect();
    
    return {
      address,
      freeBalance: freeBalance.toString(),
      formattedFreeBalance: formattedBalance,
      reservedBalance: reservedBalance.toString(),
      formattedReservedBalance: formattedReserved,
      totalBalance: totalBalance.toString(),
      formattedTotalBalance: formattedTotal,
      token
    };
  } catch (error) {
    console.error('Error fetching Substrate wallet balance:', error);
    throw error;
  }
}

