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
      const tkn = await this.mongo.getToken_name(vsystkn);
      const netData = await this.mongo.getNetworkDetails_Name(vsysnet);
      this.nodeURL = netData.nodeURL;
      this.TKNaddr = tkn.tkn_addr;  
      this.CTRTaddr = tkn.ctrt_addr;
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

    }catch(error){
      console.log(error);
      this.printHeading("Error fetching data from database VSYS:");
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

  async bridgeTOacnt_vsys(amount,desc){    
    this.printHeading(`Sending Token from Bridge to VSYS Account`)
    var minted = [false,0];
    try{
      const tokenBalance = await tkn.getTokenBalance(this.CTRTaddr,this.ch,this.acntbridge);
      const realBalance = tokenBalance.c[0]/10000;
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