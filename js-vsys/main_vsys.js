'use strict';

import * as jv from './src/index.js';
import {MongoClass} from '../mongodb.js';
import * as tkn from './token.js';

class VSYS{
  vsystkn;
  vsysnet
  nodeURL
  TKNaddr;
  CTRTaddr;
  bridgeaddr;
  bridgeSeed;
  acntaddr_vsys;
  acntSeed_vsys;
  mongo;
  acnt1;
  acntbridge;
  ch;

  constructor(acntaddr_vsys,acntseed_vsys,dbURL,vsysnet,vsystkn) {
    this.vsysnet = vsysnet;
    this.vsystkn = vsystkn;
    this.acntaddr_vsys = acntaddr_vsys;
    this.acntseed_vsys = acntseed_vsys;
    this.mongo = new MongoClass(dbURL);
  }

  async init(){
    await this.setUpVSYS(this.vsystkn,this.vsysnet);
    return this;
  } 

  getFormattedDateTime() {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }

  async setUpVSYS(vsystkn,vsysnet) {
    try{
      const netData = await this.mongo.getNetworkDetails_Name(vsysnet);
      this.nodeURL = netData.nodeURL;
      this.bridgeSeed = await this.mongo.getBridgeSeed();
      this.bridgeaddr = await this.mongo.getBridgeADDR_VSYS();
    
      const seed1 = new jv.Seed(this.acntseed_vsys);
      const bridgedseed = new jv.Seed(this.bridgeSeed);

      const api = jv.NodeAPI.new(this.nodeURL);
      this.ch = new jv.Chain(api, jv.ChainID.TEST_NET);

      const wal_acnt = new jv.Wallet(seed1);
      this.acnt1 = wal_acnt.getAcnt(this.ch, 0);
      const wal_bridge = new jv.Wallet(bridgedseed);
      this.acntbridge = wal_bridge.getAcnt(this.ch, 0);

      if ( typeof vsystkn != 'string' ) {
        await this.wrapToken();
      }else{
        const tkn = await this.mongo.getToken_name(vsystkn);
        this.TKNaddr = tkn.tkn_addr;  
        this.CTRTaddr = tkn.ctrt_addr;
      }

    }catch(error){
      console.log(error);
      this.printHeading("Error fetching data from database VSYS:");
      throw ("Failed to retrieve data from database");
    }
  }

  async wrapToken(){
    try{

      const ogname = this.vsystkn[1];
      const tkname = ogname + "_wrapped";
      const networkName = this.vsysnet;
      const data = await this.mongo.getNetworkDetails_Name(networkName);
      const networkID = data._id.toString();
      const issuer = this.bridgeaddr;
      const desc = "Wrapped Token for " + ogname;
      const data1 = await this.mongo.getToken_name(ogname);
      const wrapped = data1._id.toString();
      const maxSupply = 1000000;
      const unit = 1000000;

      this.printHeading("Wrapped Token Doesn't Exist, Creating Wrapped Token");
      const contractAddress = await tkn.registerToken(this.acntbridge,maxSupply,unit,desc,desc)
      const tokenAddress = await tkn.getTokenID(contractAddress, this.ch, 0);
  
      const timestamp = this.getFormattedDateTime();
  
      const insertedData = await this.mongo.insertTokenData({
          name: tkname,
          network_id: networkID,
          tkn_addr: tokenAddress,
          ctrt_addr: contractAddress,
          networkName: networkName,
          issuer: issuer,
          max: maxSupply,
          registerTime: timestamp,
          desc: desc,
          wrapped: wrapped
        });
  
      this.ethtkn = tkname;
      this.TKNaddr = tokenAddress;
      this.CTRTaddr = contractAddress;
      await this.mongo.updateWrapped(wrapped,insertedData);
      this.printHeading("Wrapped Token Created Successfully");
    }catch(error){
      console.log(error);
      this.printHeading("Error Creating Wrapped Token");
      throw (error);
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

  async bridgeTOacnt_vsys(amount,desc){    
    this.printHeading(`Sending Token from Bridge to VSYS Account`)
    var minted = [false,0];
    try{
      const tokenBalance = await tkn.getTokenBalance(this.CTRTaddr, this.ch, this.acntbridge);
      let realBalance = 0;
      if (tokenBalance && tokenBalance.c && Array.isArray(tokenBalance.c)) {
        realBalance = tokenBalance.c[0] / 10000;
      }
      if (realBalance < amount){
        this.printHeading('Insufficient Token In Bridge, Minting Tokens')
        const res = await tkn.issueToken(this.CTRTaddr,this.ch,this.acntbridge,amount-realBalance,desc);
        res.timestamp = this.getFormattedDateTime();
        await this.mongo.insertTransaction(res);
        minted[0] = true;
        minted[1] = amount-realBalance;
      }
      const res1 = await tkn.sendToken(this.CTRTaddr,this.ch,this.acntbridge,this.acntaddr_vsys,amount,desc);
      res1.timestamp = this.getFormattedDateTime();
      await this.mongo.insertTransaction(res1);
    }catch(error){
      console.log(error)
      throw(minted);
    }
  }

  async acntTObridge_vsys(amount,desc){
    this.printHeading("Sending Bridge Tokens from VSYS Account to Bridge")
    try{
      const res = await tkn.sendToken(this.CTRTaddr,this.ch,this.acnt1,this.bridgeaddr,amount,desc);
      res.timestamp = this.getFormattedDateTime();
      await this.mongo.insertTransaction(res);
    }catch(error){
      console.log(error);
      throw(1);
    }
  }

  async destroyToken(amount){
    this.printHeading("Destroying Minted Tokens");
    try{
      const res = await tkn.destroyTokens(this.CTRTaddr,this.ch,this.acntbridge,amount,
      "Bridge Tokens Revert Minting"
      );
      res.timestamp = this.getFormattedDateTime();
      await this.mongo.insertTransaction(res);
    }catch(error){
      console.log(error);
      throw(error);
    }
  }
}

export {VSYS};