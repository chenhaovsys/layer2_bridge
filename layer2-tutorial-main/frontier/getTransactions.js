import { ethers } from 'ethers';

// getTransactionsByBlockRange(nodeUrl, walletAddress, 100, 200)
//   .then(txs => console.log('Transactions in block range:', txs))
//   .catch(error => console.error('Error:', error));

// analyzeWalletActivity(nodeUrl, walletAddress)
//   .then(analysis => console.log('Wallet analysis:', analysis))
//   .catch(error => console.error('Error:', error));

// await runTransactionAnalysis()
//   .then(() => console.log('Analysis completed'))
//   .catch(error => console.error('Analysis failed:', error));

/**
 * Get recent transactions for a wallet address
 * @param {string} nodeUrl - RPC endpoint URL
 * @param {string} walletAddress - Wallet address to query
 * @param {object} options - Query options
 */
async function getWalletTransactions(nodeUrl, walletAddress, options = {}) {
  const {
    limit = 20,
    includeInternal = false,
    startBlock = null,
    endBlock = 'latest'
  } = options;

  try {
    const provider = new ethers.JsonRpcProvider(nodeUrl);
    
    console.log(`🔍 Fetching transactions for: ${walletAddress}`);
    console.log(`  Limit: ${limit}`);
    console.log(`  Include internal: ${includeInternal}`);

    // Get current block number if endBlock is 'latest'
    const currentBlock = endBlock === 'latest' 
      ? await provider.getBlockNumber() 
      : parseInt(endBlock);

    const fromBlock = startBlock || Math.max(0, currentBlock - 10000); // Look back 10k blocks

    console.log(`  Scanning blocks: ${fromBlock} to ${currentBlock}`);

    const transactions = [];
    let processedBlocks = 0;
    const totalBlocks = currentBlock - fromBlock + 1;

    // Scan blocks for transactions
    for (let blockNum = fromBlock; blockNum <= currentBlock && transactions.length < limit; blockNum++) {
      try {
        const block = await provider.getBlock(blockNum, true); // true = include transactions
        
        if (block && block.transactions) {
          for (const tx of block.transactions) {
            if (transactions.length >= limit) break;
            
            // Check if wallet is involved in transaction
            if (tx.from?.toLowerCase() === walletAddress.toLowerCase() || 
                tx.to?.toLowerCase() === walletAddress.toLowerCase()) {
              
              const txDetails = await getTransactionDetails(provider, tx.hash);
              transactions.push({
                ...txDetails,
                direction: tx.from?.toLowerCase() === walletAddress.toLowerCase() ? 'outgoing' : 'incoming'
              });
            }
          }
        }

        processedBlocks++;
        if (processedBlocks % 100 === 0) {
          console.log(`  Progress: ${processedBlocks}/${totalBlocks} blocks (${((processedBlocks/totalBlocks)*100).toFixed(1)}%)`);
        }

      } catch (error) {
        console.log(`  Warning: Failed to fetch block ${blockNum}: ${error.message}`);
      }
    }

    console.log(`✅ Found ${transactions.length} transactions`);
    return transactions.sort((a, b) => b.blockNumber - a.blockNumber); // Sort by newest first

  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    throw error;
  }
}

/**
 * Get transaction details including receipt
 * @param {ethers.Provider} provider - Ethers provider
 * @param {string} txHash - Transaction hash
 */
async function getTransactionDetails(provider, txHash) {
  try {
    const [tx, receipt] = await Promise.all([
      provider.getTransaction(txHash),
      provider.getTransactionReceipt(txHash)
    ]);

    const block = await provider.getBlock(tx.blockNumber);

    return {
      hash: tx.hash,
      blockNumber: tx.blockNumber,
      blockHash: tx.blockHash,
      timestamp: block.timestamp,
      date: new Date(block.timestamp * 1000).toISOString(),
      from: tx.from,
      to: tx.to,
      value: ethers.formatEther(tx.value),
      gasLimit: tx.gasLimit.toString(),
      gasUsed: receipt.gasUsed.toString(),
      gasPrice: ethers.formatUnits(tx.gasPrice, 'gwei'),
      effectiveGasPrice: receipt.effectiveGasPrice ? ethers.formatUnits(receipt.effectiveGasPrice, 'gwei') : null,
      status: receipt.status === 1 ? 'success' : 'failed',
      nonce: tx.nonce,
      transactionIndex: tx.index,
      confirmations: await tx.confirmations(),
      data: tx.data !== '0x' ? tx.data : null,
      logs: receipt.logs || []
    };
  } catch (error) {
    console.log(`Warning: Could not get details for tx ${txHash}: ${error.message}`);
    return {
      hash: txHash,
      error: error.message
    };
  }
}

/**
 * Get transactions within a specific block range
 * @param {string} nodeUrl - RPC endpoint URL
 * @param {string} walletAddress - Wallet address to query
 * @param {number} startBlock - Starting block number
 * @param {number} endBlock - Ending block number
 */
async function getTransactionsByBlockRange(nodeUrl, walletAddress, startBlock, endBlock) {
  try {
    const provider = new ethers.JsonRpcProvider(nodeUrl);
    
    console.log(`🔍 Fetching transactions for ${walletAddress} in blocks ${startBlock}-${endBlock}`);
    
    const transactions = [];
    const totalBlocks = endBlock - startBlock + 1;

    for (let blockNum = startBlock; blockNum <= endBlock; blockNum++) {
      try {
        const block = await provider.getBlock(blockNum, true);
        
        if (block && block.transactions) {
          for (const tx of block.transactions) {
            if (tx.from?.toLowerCase() === walletAddress.toLowerCase() || 
                tx.to?.toLowerCase() === walletAddress.toLowerCase()) {
              
              const txDetails = await getTransactionDetails(provider, tx.hash);
              transactions.push({
                ...txDetails,
                direction: tx.from?.toLowerCase() === walletAddress.toLowerCase() ? 'outgoing' : 'incoming'
              });
            }
          }
        }

        if ((blockNum - startBlock + 1) % 10 === 0) {
          console.log(`  Progress: ${blockNum - startBlock + 1}/${totalBlocks} blocks`);
        }

      } catch (error) {
        console.log(`  Warning: Failed to fetch block ${blockNum}: ${error.message}`);
      }
    }

    console.log(`✅ Found ${transactions.length} transactions in range`);
    return transactions.sort((a, b) => b.blockNumber - a.blockNumber);

  } catch (error) {
    console.error('Error fetching transactions by block range:', error);
    throw error;
  }
}

/**
 * Analyze wallet activity and provide statistics
 * @param {string} nodeUrl - RPC endpoint URL
 * @param {string} walletAddress - Wallet address to analyze
 */
async function analyzeWalletActivity(nodeUrl, walletAddress, options = {}) {
  const { limit = 100, days = 30 } = options;
  
  try {
    console.log(`📊 Analyzing wallet activity for: ${walletAddress}`);
    
    const transactions = await getWalletTransactions(nodeUrl, walletAddress, { limit });
    
    if (transactions.length === 0) {
      return {
        address: walletAddress,
        totalTransactions: 0,
        message: 'No transactions found'
      };
    }

    // Calculate statistics
    const incoming = transactions.filter(tx => tx.direction === 'incoming');
    const outgoing = transactions.filter(tx => tx.direction === 'outgoing');
    const successful = transactions.filter(tx => tx.status === 'success');
    const failed = transactions.filter(tx => tx.status === 'failed');

    const totalValueIn = incoming.reduce((sum, tx) => sum + parseFloat(tx.value || 0), 0);
    const totalValueOut = outgoing.reduce((sum, tx) => sum + parseFloat(tx.value || 0), 0);
    const totalGasUsed = transactions.reduce((sum, tx) => sum + parseFloat(tx.gasUsed || 0), 0);

    // Get unique addresses interacted with
    const uniqueAddresses = new Set();
    transactions.forEach(tx => {
      if (tx.from && tx.from.toLowerCase() !== walletAddress.toLowerCase()) {
        uniqueAddresses.add(tx.from.toLowerCase());
      }
      if (tx.to && tx.to.toLowerCase() !== walletAddress.toLowerCase()) {
        uniqueAddresses.add(tx.to.toLowerCase());
      }
    });

    // Time-based analysis
    const now = Date.now() / 1000;
    const cutoffTime = now - (days * 24 * 60 * 60);
    const recentTxs = transactions.filter(tx => tx.timestamp > cutoffTime);

    // Calculate average transaction value and gas
    const avgValueOut = outgoing.length > 0 ? totalValueOut / outgoing.length : 0;
    const avgValueIn = incoming.length > 0 ? totalValueIn / incoming.length : 0;
    const avgGasUsed = transactions.length > 0 ? totalGasUsed / transactions.length : 0;

    const analysis = {
      address: walletAddress,
      totalTransactions: transactions.length,
      successfulTransactions: successful.length,
      failedTransactions: failed.length,
      successRate: `${((successful.length / transactions.length) * 100).toFixed(2)}%`,
      
      incoming: {
        count: incoming.length,
        totalValue: `${totalValueIn.toFixed(6)} ETH`,
        averageValue: `${avgValueIn.toFixed(6)} ETH`
      },
      
      outgoing: {
        count: outgoing.length,
        totalValue: `${totalValueOut.toFixed(6)} ETH`,
        averageValue: `${avgValueOut.toFixed(6)} ETH`
      },
      
      netFlow: `${(totalValueIn - totalValueOut).toFixed(6)} ETH`,
      totalGasUsed: totalGasUsed.toFixed(0),
      averageGasUsed: avgGasUsed.toFixed(0),
      
      uniqueAddressesInteracted: uniqueAddresses.size,
      
      recentActivity: {
        days: days,
        transactionCount: recentTxs.length,
        averagePerDay: (recentTxs.length / days).toFixed(2)
      },
      
      firstTransaction: transactions.length > 0 ? {
        date: transactions[transactions.length - 1].date,
        hash: transactions[transactions.length - 1].hash
      } : null,
      
      lastTransaction: transactions.length > 0 ? {
        date: transactions[0].date,
        hash: transactions[0].hash
      } : null,
      
      topInteractions: getTopInteractions(transactions, walletAddress)
    };

    console.log(`✅ Analysis complete:`);
    console.log(`  Total transactions: ${analysis.totalTransactions}`);
    console.log(`  Success rate: ${analysis.successRate}`);
    console.log(`  Net flow: ${analysis.netFlow}`);
    console.log(`  Unique addresses: ${analysis.uniqueAddressesInteracted}`);

    return analysis;

  } catch (error) {
    console.error('Error analyzing wallet activity:', error);
    throw error;
  }
}

/**
 * Get top addresses by interaction frequency
 * @param {Array} transactions - Transaction array
 * @param {string} walletAddress - Main wallet address
 */
function getTopInteractions(transactions, walletAddress) {
  const interactions = {};
  
  transactions.forEach(tx => {
    const otherAddress = tx.from?.toLowerCase() === walletAddress.toLowerCase() 
      ? tx.to?.toLowerCase() 
      : tx.from?.toLowerCase();
      
    if (otherAddress && otherAddress !== walletAddress.toLowerCase()) {
      if (!interactions[otherAddress]) {
        interactions[otherAddress] = {
          address: otherAddress,
          count: 0,
          totalValue: 0,
          incoming: 0,
          outgoing: 0
        };
      }
      
      interactions[otherAddress].count++;
      interactions[otherAddress].totalValue += parseFloat(tx.value || 0);
      
      if (tx.direction === 'incoming') {
        interactions[otherAddress].incoming++;
      } else {
        interactions[otherAddress].outgoing++;
      }
    }
  });
  
  return Object.values(interactions)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(interaction => ({
      address: interaction.address,
      transactionCount: interaction.count,
      totalValue: `${interaction.totalValue.toFixed(6)} ETH`,
      incoming: interaction.incoming,
      outgoing: interaction.outgoing
    }));
}

/**
 * Monitor wallet for new transactions
 * @param {string} nodeUrl - RPC endpoint URL
 * @param {string} walletAddress - Wallet address to monitor
 * @param {Function} callback - Callback function for new transactions
 */
async function monitorWallet(nodeUrl, walletAddress, callback, options = {}) {
  const { pollingInterval = 10000 } = options; // 10 seconds default
  
  try {
    const provider = new ethers.JsonRpcProvider(nodeUrl);
    let lastCheckedBlock = await provider.getBlockNumber();
    
    console.log(`👀 Monitoring wallet ${walletAddress} for new transactions...`);
    console.log(`  Starting from block: ${lastCheckedBlock}`);
    console.log(`  Polling interval: ${pollingInterval}ms`);
    
    const monitor = setInterval(async () => {
      try {
        const currentBlock = await provider.getBlockNumber();
        
        if (currentBlock > lastCheckedBlock) {
          console.log(`🔍 Checking blocks ${lastCheckedBlock + 1} to ${currentBlock}`);
          
          const newTxs = await getTransactionsByBlockRange(
            nodeUrl, 
            walletAddress, 
            lastCheckedBlock + 1, 
            currentBlock
          );
          
          if (newTxs.length > 0) {
            console.log(`🆕 Found ${newTxs.length} new transactions`);
            newTxs.forEach(tx => callback(tx));
          }
          
          lastCheckedBlock = currentBlock;
        }
      } catch (error) {
        console.error('Error in monitoring loop:', error);
      }
    }, pollingInterval);
    
    return monitor; // Return interval ID so it can be cleared
    
  } catch (error) {
    console.error('Error starting wallet monitor:', error);
    throw error;
  }
}

/**
 * Export transaction data to CSV format
 * @param {Array} transactions - Transaction array
 * @param {string} filename - Output filename
 */
function exportTransactionsToCSV(transactions, filename = 'transactions.csv') {
  const headers = [
    'Hash', 'Date', 'Block', 'Direction', 'From', 'To', 'Value (ETH)', 
    'Gas Used', 'Gas Price (Gwei)', 'Status', 'Confirmations'
  ];
  
  const csvContent = [
    headers.join(','),
    ...transactions.map(tx => [
      tx.hash,
      tx.date,
      tx.blockNumber,
      tx.direction,
      tx.from,
      tx.to,
      tx.value,
      tx.gasUsed,
      tx.gasPrice,
      tx.status,
      tx.confirmations
    ].map(field => `"${field}"`).join(','))
  ].join('\n');
  
  console.log(`📄 CSV export ready (${transactions.length} transactions):`);
  console.log(`Filename: ${filename}`);
  console.log('CSV Content:');
  console.log(csvContent);
  
  return csvContent;
}

// Example usage and test scenarios
async function runTransactionAnalysis() {
  console.log('🚀 Starting comprehensive transaction analysis...');
  
  try {
    // 1. Get recent transactions
    console.log('\n1️⃣ Getting recent transactions...');
    const recentTxs = await getWalletTransactions(nodeUrl, walletAddress, { limit: 10 });
    console.log(`Found ${recentTxs.length} recent transactions`);
    
    // 2. Analyze wallet activity
    console.log('\n2️⃣ Analyzing wallet activity...');
    const analysis = await analyzeWalletActivity(nodeUrl, walletAddress, { limit: 50, days: 30 });
    
    // 3. Export to CSV
    if (recentTxs.length > 0) {
      console.log('\n3️⃣ Exporting to CSV...');
      exportTransactionsToCSV(recentTxs, `transactions_${walletAddress}_${Date.now()}.csv`);
    }
    
    // 4. Example of monitoring (commented out to avoid infinite loop)
    /*
    console.log('\n4️⃣ Starting wallet monitor...');
    const monitorId = await monitorWallet(nodeUrl, walletAddress, (tx) => {
      console.log(`🆕 New transaction: ${tx.hash} - ${tx.direction} ${tx.value} ETH`);
    });
    
    // Stop monitoring after 60 seconds
    setTimeout(() => {
      clearInterval(monitorId);
      console.log('⏹️ Monitoring stopped');
    }, 60000);
    */
    
    return {
      recentTransactions: recentTxs,
      analysis: analysis
    };
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    throw error;
  }
}

// Export functions for use in other files
export {
  getWalletTransactions,
  getTransactionsByBlockRange,
  analyzeWalletActivity,
  monitorWallet,
  exportTransactionsToCSV,
  runTransactionAnalysis
};
