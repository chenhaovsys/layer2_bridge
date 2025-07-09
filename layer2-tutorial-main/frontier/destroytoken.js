import Web3 from 'web3';
import ERC20ABI from "./contractABI/ERC20ABI.js";

/**
 * Destroy (burn) tokens from a wallet.
 *
 * @param {string} nodeURL - RPC endpoint (e.g., Infura, Ankr)
 * @param {string} from - The address holding tokens.
 * @param {string | number} amount - Amount to burn (as tokens, not wei).
 * @param {string} TKNaddr - Deployed token address
 * @param {Object} options - Options: { fromSelf?: boolean, sender?: string }
 * @returns {Promise<TransactionReceipt>}
 */
async function destroyToken(nodeURL, from,privkey, amount, TKNaddr) {
    const web3 = new Web3(nodeURL);
    web3.eth.accounts.wallet.add(privkey); 
    
    const token = new web3.eth.Contract(ERC20ABI.abi, TKNaddr);

    const decimals = await token.methods.decimals().call();
    const amountWei = BigInt(amount) * 10n ** BigInt(decimals);

    const balance = await token.methods.balanceOf(from).call();
    if (BigInt(balance) < amountWei) {
        throw new Error("Burn amount exceeds balance");
    }
    const sender = from;

    return token.methods.burn(amountWei.toString()).call({ from: sender, gas: 100000 });
}

export { destroyToken };
