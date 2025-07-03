// destroyToken.js
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
async function destroyToken(nodeURL, from, amount, TKNaddr, options = {}) {
    const web3 = new Web3(nodeURL);
    const token = new web3.eth.Contract(ERC20ABI.abi, TKNaddr);

    const decimals = await token.methods.decimals().call();
    const amountWei = web3.utils.toWei(amount.toString(), decimals === '18' ? 'ether' : undefined);

    const fromSelf = options.fromSelf !== false;
    const sender = options.sender || from;

    if (fromSelf) {
        return token.methods.burn(amountWei).send({ from });
    } else {
        return token.methods.burnFrom(from, amountWei).send({ from: sender });
    }
}

export { destroyToken };
