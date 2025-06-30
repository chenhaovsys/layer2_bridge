import Web3 from 'web3';
import ERC20ABI from './contractABI/ERC20ABI.js';
import { ethers } from 'ethers';

async function sendNativeToken(nodeUrl, privateKey, toAddress, amount) {
  try {
    const startTime = Date.now(); // Start timing
    
    // Initialize ethers provider
    const provider = new ethers.JsonRpcProvider(nodeUrl);

    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey, provider);

    // Convert amount to wei (from ETH or your native token unit)
    const amountWei = ethers.parseEther(amount.toString());

    // Create transaction object
    const txObject = {
      to: toAddress,
      value: amountWei,
    };

    console.log('Transaction object created:');
    console.log(`  To: ${txObject.to}`);
    console.log(`  Value: ${ethers.formatEther(txObject.value)} ETH`);

    // Send transaction and measure time
    console.log('Sending transaction...');
    const sendStartTime = Date.now();
    const txResponse = await wallet.sendTransaction(txObject);
    const sendEndTime = Date.now();

    console.log('Transaction sent successfully!');
    console.log(`Transaction hash: ${txResponse.hash}`);
    console.log(`⏱️  Time to send: ${sendEndTime - sendStartTime}ms`);

    // Wait for the transaction to be mined and measure time
    const miningStartTime = Date.now();
    const receipt = await txResponse.wait();
    const miningEndTime = Date.now();

    const totalTime = miningEndTime - startTime;
    const miningTime = miningEndTime - miningStartTime;

    console.log('Transaction mined successfully!');
    console.log(`Block number: ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed}`);
    console.log(`⏱️  Mining time: ${miningTime}ms`);
    console.log(`⏱️  Total time: ${totalTime}ms`);

    return {
      ...receipt,
      timings: {
        sendTime: sendEndTime - sendStartTime,
        miningTime: miningTime,
        totalTime: totalTime
      }
    };
  } catch (error) {
    console.error('Error sending native token:', error);
    throw error;
  }
}

async function transferERC20Token(nodeUrl, privateKey, recipientAddress, tokenAddress, amount) {
  try {
    const startTime = Date.now(); // Start timing
    
    // Initialize provider & wallet
    const provider = new ethers.JsonRpcProvider(nodeUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`Sending transaction from: ${wallet.address}`);

    // Create contract instance
    const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI.abi, wallet);

    // Get token decimals
    const decimals = await tokenContract.decimals();
    const formattedAmount = BigInt(amount) * (BigInt(10) ** BigInt(decimals)); // Convert to smallest unit

    console.log(`Transferring ${amount} tokens (${formattedAmount}) to ${recipientAddress}`);

    // Estimate gas
    const gasLimit = await tokenContract.transfer.estimateGas(recipientAddress, formattedAmount);
    console.log(`Estimated Gas: ${gasLimit.toString()}`);

    // Get current gas price and add a buffer
    const gasPrice = BigInt(await provider.send('eth_gasPrice', [])) * 120n / 100n; // Add 20% buffer
    console.log(`Gas Price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);

    // Send the transaction and measure time
    const sendStartTime = Date.now();
    const tx = await tokenContract.transfer(recipientAddress, formattedAmount, {
      gasLimit: gasLimit * 120n / 100n, // Add 20% buffer
      gasPrice: gasPrice, // Explicitly set gas price
    });
    const sendEndTime = Date.now();

    console.log(`Transaction sent: ${tx.hash}`);
    console.log(`⏱️  Time to send: ${sendEndTime - sendStartTime}ms`);

    // Wait for confirmation and measure time
    const miningStartTime = Date.now();
    const receipt = await tx.wait();
    const miningEndTime = Date.now();

    const totalTime = miningEndTime - startTime;
    const miningTime = miningEndTime - miningStartTime;

    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    console.log(`⏱️  Mining time: ${miningTime}ms`);
    console.log(`⏱️  Total time: ${totalTime}ms`);


    const sendTime = sendEndTime - sendStartTime;

    return {
      "Network":nodeUrl,
      "Type": "Transfer Tokens",
      "Address" : tx.hash,
      "blockNumber": receipt.blockNumber,
      "gasUsed": receipt.gasUsed.toString(), 
      "sendTime": sendTime,
      "miningTime": miningTime,
      "totalTime": totalTime 
    };

  } catch (error) {
    console.error("Error transferring ERC-20 token:", error);
    throw error;
  }
}

export {transferERC20Token};