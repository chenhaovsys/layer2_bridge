"use strict";

import Web3 from 'web3';
import { ethers } from 'ethers';
import { ETH } from './layer2-tutorial-main/frontier/main_eth.js';
import { VSYS } from './js-vsys/main_vsys.js';
import { MongoClass } from './mongodb.js';

class BridgeClass{

    dbURL;
    acntaddr_vsys;
    acntseed_vsys;
    acntaddr_eth;
    acntprivkey_eth;
    vsystkn;
    ethtkn;
    eth;
    vsys;
    mongo;

    constructor(dbURL,seed_vsys,addr_vsys,addr_eth,acntprivkey_eth,vsystkn,ethtkn) {
        this.dbURL = dbURL;
        this.acntseed_vsys = seed_vsys;
        this.acntaddr_vsys = addr_vsys;
        this.acntaddr_eth = addr_eth;
        this.acntprivkey_eth = acntprivkey_eth;
        this.ethtkn = ethtkn;
        this.vsystkn = vsystkn;
        this.mongo = new MongoClass(dbURL);
    }

    printHeading(msg) {
        function times(char, num) {
        let ret = '';
        while (num-- > 0) ret += char;

        return ret;
        }
        console.log(times('=', 10), msg, times('=', 10));
    }

    async init(){
        const res = await this.mongo.checkTokenPair(this.vsystkn,this.ethtkn);        
        if (!res) {
            console.log(
                "Network Pair Check Failed. Please ensure that the VSYS and ETH network environment are the same"
            )
            throw Error("Network Pair Check Failed");
        }

        this.eth = await new ETH(this.ethtkn,this.acntaddr_eth,this.acntprivkey_eth,this.dbURL).init();
        this.vsys = await new VSYS(this.vsystkn,this.acntaddr_vsys,this.acntseed_vsys,this.dbURL).init();
        return this;
    }

    async ethTOvsys(amount){
        this.printHeading(`Transferring Tokens From ETH to VSYS`);
        try{
            const res = await this.eth.acntTObridge_eth(amount);
            await this.vsys.bridgeTOacnt_vsys(amount,"ETH Transfer Address : "+res);
            this.printHeading('Operation Successful');
        }catch(error){
            this.printHeading('Operation Failed')
            if (typeof error != "number"){
                if (error[0] == true){
                    this.printHeading('Destroying Minted Tokens');
                    await this.vsys.destroyToken(error[1]);
                }
                this.printHeading('Refunding Tokens Sent');
                await this.eth.bridgeTOacnt_eth(amount);
            }
        }
    }
    
    async vsysTOeth(amount){
        this.printHeading(`Transferring Tokens From VSYS to ETH`);
        try{
            await this.vsys.acntTObridge_vsys(amount,"Bridge Tokens From VSYS to ETH");
            await this.eth.bridgeTOacnt_eth(amount);
            this.printHeading('Operation Successful');
        }catch(error){
            this.printHeading('Operation Failed')
            if (typeof error != "number"){
                if (error[0] == true){
                    this.printHeading('Destroying Minted Tokens');
                    await this.eth.destroyToken(error[1]);
                }
                this.printHeading('Refunding Tokens Sent');
                await this.vsys.bridgeTOacnt_vsys(amount);
            }
        }
    }
}

export { BridgeClass };