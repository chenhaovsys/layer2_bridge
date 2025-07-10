import Web3 from 'web3';
import ERC20ABI from "./contractABI/ERC20ABI.js";
import { ethers } from 'ethers';
import { transferERC20Token } from './transfer.js';
import { checkToken } from './getContractInfo.js';
import { getTokenBalance } from './balance.js';
import { mintTokens } from './mintToken.js';
import { deploySmartContract,constructorArgs } from './deployContract.js';
import ERC20Bytecode from "./contractByteCode/ERC20Bytecode.js";
import {MongoClass} from '../../mongodb.js';
import { destroyToken } from './destroytoken.js';

class ETH{
  ethnet;
  ethtkn;
  nodeURL;
  TKNaddr;
  privKey_BRIDGE;
  bridgeaddr;
  acntaddr_eth;
  acntprivkey_eth;
  mongo;

  constructor(acntaddr_eth,accntprivkey_eth,dbURL,ethnet,ethtkn) {
    this.ethnet = ethnet;
    this.ethtkn = ethtkn;
    this.acntaddr_eth = acntaddr_eth;
    this.acntprivkey_eth = accntprivkey_eth;
    this.mongo = new MongoClass(dbURL);
  }

  async init(){
    await this.setUpETH(this.ethtkn,this.ethnet);
    return this;
  }

  async setUpETH(ethtkn,ethnet) {
  try{
      if ( typeof ethtkn != 'string' ) {
        await this.wrapToken();
      }

      const tkn = await this.mongo.getToken_name(ethtkn);
      const netData = await this.mongo.getNetworkDetails_Name(ethnet);
      this.nodeURL = netData.nodeURL;
      this.TKNaddr = tkn.tkn_addr;
      this.privKey_BRIDGE = await this.mongo.getBridgeKey_ETH();
      this.bridgeaddr = await this.mongo.getBridgeADDR_ETH();
    }catch(error){
      console.log("Error fetching data from database ETH:", error);
      throw ("Failed to retrieve data from database");
    }
  }
  
  printHeading(msg) {
    function times(char, num) {
      let ret = '';
      while (num-- > 0) ret += char;

      return ret;
    }
    console.log(times('=', 10), msg, times('=', 10));
  }

  getFormattedDateTime() {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }

  async wrapToken(){
    try{
      this.printHeading("Wrapped Token Doesn't Exist, Creating Wrapped Token");

      const ogname = this.ethtkn[1];
      const tkname = ogname+"_wrapped";
      var decimals = 2; 
      var maxSupply = BigInt(100000000 * (Math.pow(10, decimals)));
      const constructorArgs = [tkname, "WRP", decimals, maxSupply, "1", "USD"];
      
      const contractAddress = await deploySmartContract(this.nodeURL,this.privKey_BRIDGE,ERC20ABI.abi,ERC20Bytecode.code,constructorArgs);
      const timestamp = this.getFormattedDateTime()
      const networkName = this.ethnet;
      const data = await this.mongo.getNetworkDetails_Name(networkName);
      const networkID = data._id.toString();
      const issuer = this.bridgeaddr;
      const desc = "Wrapped Token for "+ogname;
      const data1 = await this.mongo.getToken_name(ogname);
      const wrapped = data1._id.toString();

      await this.mongo.insertTokenData({tkname,networkID,contractAddress,contractAddress,networkName,
        issuer,maxSupply,timestamp,desc,wrapped
      });

      this.ethtkn = tkname;
      this.TKNaddr = contractAddress;
      this.printHeading("Wrapped Token Created Successfully");
      return contractAddress;
    }catch(error){
      throw (error);
    }
  }

  async bridgeTOacnt_eth(amount){
    this.printHeading("Sending Bridge Tokens from Bridge to ETH Account");
    var minted = [false,0];
    try{
      const bal = await getTokenBalance(this.nodeURL,this.bridgeaddr,this.TKNaddr);
      minted[1] = (amount-bal);
      if (bal < amount){
        this.printHeading('Insufficient Token In Bridge, Minting Tokens');
        const res1 = await mintTokens(this.nodeURL,this.privKey_BRIDGE,this.TKNaddr,this.bridgeaddr,String(amount - bal));      
        res1.timestamp = this.getFormattedDateTime();
        await this.mongo.insertTransaction(res1);
        minted[0] = true;
      }
      const res =  await transferERC20Token(this.nodeURL, this.privKey_BRIDGE,this.acntaddr_eth, this.TKNaddr, amount);
      res.timestamp = this.getFormattedDateTime()
      await this.mongo.insertTransaction(res);
    }catch(error){
      console.log(error);
      throw minted;
    }
  }

  async acntTObridge_eth(amount){
    this.printHeading("Sending Bridge Tokens from ETH Account to Bridge")
      try{
        const res = await transferERC20Token(this.nodeURL,this.acntprivkey_eth,this.bridgeaddr,
          this.TKNaddr,amount);
        res.timestamp = this.getFormattedDateTime();
          await this.mongo.insertTransaction(res);
        return res["Address"];
      }catch(error){
        console.log(error);
        throw (1);
      }
  }

  async destroyToken(amount) {
    this.printHeading("Destroying Minted Tokens");
    try {
      const res = await destroyToken(this.nodeURL,this.bridgeaddr,this.privKey_BRIDGE,amount,this.TKNaddr);
      res.timestamp = this.getFormattedDateTime();
      await this.mongo.insertTransaction(res);
      return res;
    } catch (error) {
      console.log(error);
      throw (error);
    }
  }
}

export {ETH};