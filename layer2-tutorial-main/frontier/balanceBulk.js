import { ethers } from 'ethers';

// Node URL for a local Frontier-enabled Substrate node

// Array of addresses to check
const addresses = [
  { name: "Andy", address: "0x8eb2bef898e9769a90b4fe640d0052dd81f100c1" },
  { name: "Andy", address: "0xCD629DEfE3e1f5DCf05973A7FAB6d19068E40E8F" },
  { name: "YiXiong", address: "0xa723CFa753e62C4e5c20E41eF639Ad86Dfd86664" },
  { name: "WeiKen", address: "0x4B7de30082e63149c53893603D2e2F0fB4799fEe" },
  { name: "Tristan", address: "0x5c1D541Be8ceF36A125Ca66a4cF1B9f2C400479B" },
  { name: "Chen Hao", address: "0x10cdeBbA4ef555bfabCDb3336CdcF78A0C32a549" },
  { name: "Kevin", address: "0xA294728127809CF7D0af2B64e1cf8685e101163C" }
];

// Execute the main function
checkAllBalances()
  .then(() => console.log('Operation completed successfully'))
  .catch(error => console.log('Operation failed:', error.message));


// Main function to check all balances
async function checkAllBalances() {
  console.log("Checking balances for all addresses...\n");
  console.log("Node Url: ", nodeUrl);
  
  try {
    // Initialize ethers provider
    const provider = new ethers.JsonRpcProvider(nodeUrl);
    
    // Check connection
    const network = await provider.getNetwork();
    console.log(`Connected to network: ${network.name} (Chain ID: ${network.chainId})\n`);
    
    // Check balance for each address
    for (const { name, address } of addresses) {
      try {
        const balanceWei = await provider.getBalance(address);
        const balanceEther = ethers.formatEther(balanceWei);
        
        console.log(`${name}'s Address: ${address}`);
        console.log(`Balance: ${balanceEther} ETH`);
        console.log(`Balance (Wei): ${balanceWei.toString()}`);
        console.log("-".repeat(50));
      } catch (error) {
        console.error(`Error checking balance for ${name} (${address}):`, error.message);
        console.log("-".repeat(50));
      }
    }
    
    console.log("Balance check completed.");
  } catch (error) {
    console.error("Failed to connect to the network:", error);
  }
}