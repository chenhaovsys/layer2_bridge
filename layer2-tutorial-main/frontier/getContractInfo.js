import Web3 from 'web3';
import { ethers } from 'ethers';
import ERC20ABI from "./contractABI/ERC20ABI.js";
import ERC20Bytecode from "./contractByteCode/ERC20Bytecode.js";

async function checkToken(nodeUrl, tokenAddress){
  try{
    await getTokenContractInfo(nodeUrl,tokenAddress);
    return true;
  }catch(error){
    return false;
  }
}

async function getTokenContractInfo(nodeUrl, tokenAddress, accountAddress = null) {
    try {
      // Initialize ethers provider
      const provider = new ethers.JsonRpcProvider(nodeUrl);
      
      // Create contract instance
      const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI.abi, provider);
    
      // Token information object to store results
      const tokenInfo = {
        address: tokenAddress,
        properties: {}
      };
  
      // Fetch token details
      try {
        tokenInfo.properties.name = await tokenContract.name();
      } catch (error) {
        console.log('Could not retrieve token name:', error.message);
        tokenInfo.properties.name = 'Unknown';
      }
  
      try {
        tokenInfo.properties.symbol = await tokenContract.symbol();
      } catch (error) {
        console.log('Could not retrieve token symbol:', error.message);
        tokenInfo.properties.symbol = 'Unknown';
      }
  
      try {
        const decimals = await tokenContract.decimals();
        tokenInfo.properties.decimals = Number(decimals);
      } catch (error) {
        console.log('Could not retrieve token decimals:', error.message);
        tokenInfo.properties.decimals = 18; // Default to 18
      }
  
      try {
        const totalSupply = await tokenContract.totalSupply();
        tokenInfo.properties.totalSupplyRaw = totalSupply.toString();
        tokenInfo.properties.totalSupplyFormatted = (Number(totalSupply) / (10 ** tokenInfo.properties.decimals)).toString();
      } catch (error) {
        console.log('Could not retrieve total supply:', error.message);
        tokenInfo.properties.totalSupplyRaw = 'Unknown';
        tokenInfo.properties.totalSupplyFormatted = 'Unknown';
      }
  
      // Get balance of a specific account if provided
      if (accountAddress) {
        try {
          const balance = await tokenContract.balanceOf(accountAddress);
          tokenInfo.properties.balanceRaw = balance.toString();
          tokenInfo.properties.balanceFormatted = (Number(balance) / (10 ** tokenInfo.properties.decimals)).toString();
        } catch (error) {
          console.log('Could not retrieve account balance:', error.message);
          tokenInfo.properties.balanceRaw = 'Unknown';
          tokenInfo.properties.balanceFormatted = 'Unknown';
        }
      }
  
      // Get contract code size
      const code = await provider.getCode(tokenAddress);
      tokenInfo.contractCode = {
        size: (code.length - 2) / 2, // Convert hex length to bytes
        isContract: code !== '0x'
      };

      return tokenInfo;
    } catch (error) {
      throw error;
    }
  }

export {checkToken};