import Web3 from 'web3';
import ERC20ABI from "./contractABI/ERC20ABI.js";
import { ethers } from 'ethers';
// Call the function

async function getFrontierEVMBalance(address, nodeUrl) {
  try {
    // Initialize ethers provider with the Frontier EVM RPC endpoint
    const provider = new ethers.JsonRpcProvider(nodeUrl);

    // Check connection
    const network = await provider.getNetwork();
    console.log(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`);

    // Get balance in wei
    const balanceWei = await provider.getBalance(address);

    // Convert wei to ether
    const balanceEther = ethers.formatEther(balanceWei);

    console.log(`EVM Address: ${address}`);
    console.log(`Balance: ${balanceEther} ETH`);
    console.log(`Balance (Wei): ${balanceWei.toString()}`);

    return {
      address,
      balanceWei: balanceWei.toString(),
      balanceEther,
      networkId: network.chainId
    };
  } catch (error) {
    console.error('Error fetching Frontier EVM wallet balance:', error);
    throw error;
  }
}

async function getTokenBalance(nodeURL,walletAddress, tokenAddress) {
  try {
    // Initialize ethers provider with the Frontier EVM RPC endpoint
    const provider = new ethers.JsonRpcProvider(nodeURL);

    // Create a contract instance
    const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI.abi, provider);

    // Get balance (raw value)
    const balance = await tokenContract.balanceOf(walletAddress);

    // Get token decimals
    const decimals = await tokenContract.decimals();

    // Convert balance to human-readable format
    const formattedBalance = ethers.formatUnits(balance, decimals);

    return formattedBalance;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    throw (error);  
  }
}

export {getTokenBalance};