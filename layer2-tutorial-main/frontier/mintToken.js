import Web3 from 'web3';
import ERC20ABI from "./contractABI/ERC20ABI.js";
import ERC20Bytecode from "./contractByteCode/ERC20Bytecode.js";
import { ethers } from 'ethers';

async function mintTokens(nodeUrl, privateKey, tokenAddress, recipientAddress, mintAmount) {
  try {
    // Initialize ethers provider and wallet
    const provider = new ethers.JsonRpcProvider(nodeUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    // The minter address derived from the private key
    const minterAddress = wallet.address;
    console.log(`Minting from: ${minterAddress}`);

    // Create contract instance
    const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI.abi, wallet);

    // Get token details for verification
    let tokenSymbol, tokenDecimals;
    try {
      tokenSymbol = await tokenContract.symbol();
      tokenDecimals = await tokenContract.decimals();
      console.log(`Token: ${tokenSymbol}, Decimals: ${tokenDecimals}`);
    } catch (error) {
      console.warn('Could not retrieve token details:', error.message);
      tokenSymbol = 'TOKENS';
      tokenDecimals = 18; // Default to 18 if not available
    }

    // Get recipient's balance before minting
    try {
      const balanceBefore = await tokenContract.balanceOf(recipientAddress);
      console.log(`Recipient's balance before minting: ${balanceBefore.toString()} (${balanceBefore / BigInt(10) ** BigInt(tokenDecimals)} ${tokenSymbol})`);
    } catch (error) {
      console.warn('Could not retrieve balance before minting:', error.message);
    }

    // Calculate amount with decimals
    const mintAmountWithDecimals = ethers.parseUnits(mintAmount, tokenDecimals);
    console.log(`Attempting to mint ${mintAmount} ${tokenSymbol} (${mintAmountWithDecimals.toString()} raw units)`);

    // Prepare the mint transaction
    const mintTx = await tokenContract.mint(recipientAddress, mintAmountWithDecimals);

    // Wait for the transaction to be mined
    console.log('Executing mint transaction...');
    const receipt = await mintTx.wait();

    console.log('Mint transaction successful!');
    console.log(`Transaction hash: ${receipt.transactionHash}`);
    console.log(`Block number: ${receipt.blockNumber}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);

    // Get recipient's balance after minting
    try {
      const balanceAfter = await tokenContract.balanceOf(recipientAddress);
      console.log(`Recipient's balance after minting: ${balanceAfter.toString()} (${balanceAfter / BigInt(10) ** BigInt(tokenDecimals)} ${tokenSymbol})`);
    } catch (error) {
      console.warn('Could not retrieve balance after minting:', error.message);
    }

    return {
      "Type": "Mint",
      "Network": nodeUrl,
      "transactionHash": receipt.transactionHash,
      "blockNumber": receipt.blockNumber,
      "status": receipt.status,
      "gasUsed": receipt.gasUsed.toString(),
      "tokensMinted": mintAmount,
      "recipient": recipientAddress
    };
  } catch (error) {
    console.error('Error minting tokens:', error);
    throw error;
  }
}

export{mintTokens};