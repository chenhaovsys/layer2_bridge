import Web3 from 'web3';
import { ethers } from 'ethers';

// Example usage for a local Frontier-enabled Substrate node:

// Call the function
// getBlockHeight(nodeUrl)
//   .then(result => console.log('Operation completed successfully'))
//   .catch(error => console.log('Operation failed'));

async function getBlockHeight(nodeUrl) {
  try {
    // Initialize ethers provider with the Frontier EVM RPC endpoint
    const provider = new ethers.JsonRpcProvider(nodeUrl);

    // Check connection
    const network = await provider.getNetwork();
    console.log(`Connected to network: ${network.name} (chainId: ${network.chainId})`);

    // Get current block number
    const blockNumber = await provider.getBlockNumber();
    console.log(`Current Block Height: ${blockNumber}`);

    // Optional: Get more details about the latest block
    const latestBlock = await provider.getBlock('latest');
    console.log('Latest Block Details:');
    console.log(`  Hash: ${latestBlock.hash}`);
    console.log(`  Timestamp: ${new Date(latestBlock.timestamp * 1000).toISOString()}`);
    console.log(`  Number of Transactions: ${latestBlock.transactions.length}`);

    return {
      blockNumber,
      latestBlock: {
        ...latestBlock,
        // Convert any BigInt values to strings for safe JSON handling
        gasLimit: latestBlock.gasLimit.toString(),
        gasUsed: latestBlock.gasUsed.toString(),
        baseFeePerGas: latestBlock.baseFeePerGas ? latestBlock.baseFeePerGas.toString() : null
      }
    };
  } catch (error) {
    console.error('Error fetching block height:', error);
    throw error;
  }
}

export{getBlockHeight};
