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

class ETH{
  net;
  nodeURL;
  TKNaddr;
  privKey_BRIDGE;
  bridgeaddr;
  acntaddr_eth;
  acntprivkey_eth;
  mongo;

  constructor(net,acntaddr_eth,accntprivkey_eth,dbURL) {
    this.net = net;
    this.acntaddr_eth = acntaddr_eth;
    this.acntprivkey_eth = accntprivkey_eth;
    this.mongo = new MongoClass(dbURL);
  }

  async init(){
    await this.setUpETH(this.net);
    return this;
  }

  async setUpETH(net) {
  try{
      const netData = await this.mongo.getPairNetworks(net);
      this.nodeURL = netData[1].nodeURL;
      this.TKNaddr = netData[1].token;
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

  async tokenExists(){
    this.printHeading("Checking Existence of Token");
    try{
      const res = await checkToken(this.nodeURL,this.TKNaddr);
      if (!res){
        this.printHeading("Token Doesn't Exist, Creating Token");
        const contractAddress = await deploySmartContract(this.nodeURL,this.privKey_BRIDGE,ERC20ABI.abi,ERC20Bytecode.code,constructorArgs);
        await this.mongo.updateContractToken_ETH(this.net,contractAddress);
        this.TKNaddr = contractAddress;
        this.printHeading("Token Created Successfully");
        return contractAddress;
      }
      this.printHeading("Token Exists");
      return this.TKNaddr;
    }catch(error){
      throw (error);
    }
  }

  async bridgeTOacnt_eth(amount){
    this.printHeading("Sending Bridge Tokens from Bridge to ETH Account");
    try{
      const new_TKNaddr = await this.tokenExists(this.nodeURL,this.TKNaddr);

      const bal = await getTokenBalance(this.nodeURL,this.bridgeaddr,new_TKNaddr);
      if (bal < amount){
        this.printHeading('Insufficient Token In Bridge, Minting Tokens');
        const res1 = await mintTokens(this.nodeURL,this.privKey_BRIDGE,new_TKNaddr,this.bridgeaddr,String(amount - bal));      
        res1.timestamp = this.getFormattedDateTime();
        await this.mongo.insertTransaction(res1);
      }
      const res = await transferERC20Token(this.nodeURL,this.privKey_BRIDGE,this.acntaddr_eth,new_TKNaddr,amount);
      res.timestamp = this.getFormattedDateTime()
      await this.mongo.insertTransaction(res);
    }catch(error){
      console.log(error);
      throw (2);
    }
  }

  async acntTObridge_eth(amount){
    this.printHeading("Sending Bridge Tokens from ETH Account to Bridge")
      try{
        const new_TKNaddr = await this.tokenExists(this.nodeURL,this.TKNaddr);

        const bal = await getTokenBalance(this.nodeURL,this.acntaddr_eth,new_TKNaddr);
        if (bal < amount){
          this.printHeading('Insufficient Token In Bridge, Minting Tokens');
          const res1 = await mintTokens(this.nodeURL,this.privKey_BRIDGE,new_TKNaddr,this.acntaddr_eth,String(amount - bal));      
          res1.timestamp = this.getFormattedDateTime();
          await this.mongo.insertTransaction(res1);
        }

        const res = await transferERC20Token(this.nodeURL,this.acntprivkey_eth,this.bridgeaddr,
          new_TKNaddr,amount);
        res.timestamp = this.getFormattedDateTime();
          await this.mongo.insertTransaction(res);
        return res["Address"];
      }catch(error){
        console.log(error);
        throw (1);
      }
  }
}

export {ETH};