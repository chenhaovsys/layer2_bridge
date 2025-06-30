import { ethers } from 'ethers';
import ERC20ABI from "./contractABI/ERC20ABI.js";
import ERC20Bytecode from "./contractByteCode/ERC20Bytecode.js";

var decimals = 2; // Number of decimals for the token
var maxSupply = BigInt(100000000 * (Math.pow(10, decimals)));

// Example constructor arguments (if any)
const constructorArgs = ["BRIDGE", "BRG", decimals, maxSupply, "1", "USD"]; // Replace with your constructor args

async function deploySmartContract(nodeUrl, privateKey, contractABI, contractByteCode, constructorArgs = []) {
  try {
    const provider = new ethers.JsonRpcProvider(nodeUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`Deploying from: ${wallet.address}`);

    // Get nonce
    const nonce = await provider.getTransactionCount(wallet.address, 'latest');
    console.log(`Current nonce: ${nonce}`);

    // Get gas price
    const gasPrice = await provider.send('eth_gasPrice', []);
    console.log(`Gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);

    // Create a ContractFactory instance
    const factory = new ethers.ContractFactory(contractABI, contractByteCode, wallet);

    // Estimate gas
    let gasLimit;
    try {
      gasLimit = await factory.getDeployTransaction(...constructorArgs).then(tx => provider.estimateGas(tx));
      console.log(`Estimated gas: ${gasLimit.toString()}`);
    } catch (error) {
      console.warn('Gas estimation failed, using default gas limit:', error.message);
      gasLimit = ethers.toBigInt(3000000); // Default gas limit
    }

    // Add buffer to gas limit
    const gasLimitWithBuffer = gasLimit * 120n / 100n;

    console.log('Deploying contract...');
    const contract = await factory.deploy(...constructorArgs, {
      gasLimit: gasLimitWithBuffer,
      gasPrice
    });

    console.log(`Transaction hash: ${contract.deploymentTransaction().hash}`);

    // Wait for deployment
    const deployedContract = await contract.waitForDeployment();

    console.log('Contract deployed successfully!');

    const contractAddress = await deployedContract.getAddress();
    console.log(`Contract address: ${contractAddress}`);

    // Verify contract is deployed
    const deployedCode = await provider.getCode(await deployedContract.getAddress());
    console.log(`Contract deployment verified: ${deployedCode !== '0x'}`);

    return contractAddress;
  } catch (error) {
    console.error('Error deploying smart contract:', error);
    throw error;
  }
}

export {constructorArgs,deploySmartContract};
