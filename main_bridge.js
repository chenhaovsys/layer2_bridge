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
    network1;
    network2;
    ethnet;
    vsysnet;
    eth;
    vsys;
    mongo;
    mode;
    tkn;
    wrapped_tkn;
    ethtkn;
    vsystkn;

    constructor(dbURL,seed_vsys,addr_vsys,addr_eth,acntprivkey_eth,network1,network2,tkn) {
        this.dbURL = dbURL;
        this.acntseed_vsys = seed_vsys;
        this.acntaddr_vsys = addr_vsys;
        this.acntaddr_eth = addr_eth;
        this.acntprivkey_eth = acntprivkey_eth;
        this.network1 = network1;
        this.network2 = network2;
        this.tkn = tkn;
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
        try{
            const res = await this.mongo.checkToken_test(this.tkn,this.network1,this.network2);        
            this.mode = res.mode;

            if (this.mode == "ethTOvsys"){
                this.printHeading(`Bridge Mode: ETH to VSYS`);
                this.ethnet = this.network1;
                this.vsysnet = this.network2;
            }else if (this.mode == "vsysTOeth"){
                this.printHeading(`Bridge Mode: VSYS to ETH`);
                this.ethnet = this.network2;
                this.vsysnet = this.network1;
            }
            
            if (res.wrapped){
                this.wrapped_tkn = this.tkn+"_wrapped";
            }else{
                this.wrapped_tkn = ["wrapped_false",this.tkn];
            }

            if ((this.mode == "vsysTOeth" && res.original ) || (this.mode == "ethTOvsys" && !res.original )){
                this.vsystkn = this.tkn;
                this.ethtkn = this.wrapped_tkn;
            }else{
                this.ethtkn = this.tkn;
                this.vsystkn = this.wrapped_tkn;
            }

            this.eth = await new ETH(this.acntaddr_eth,this.acntprivkey_eth,this.dbURL,this.ethnet,this.ethtkn).init();
            this.vsys = await new VSYS(this.acntaddr_vsys,this.acntseed_vsys,this.dbURL,this.vsysnet,this.vsystkn).init();
            return this;
        } catch (error) {
            this.printHeading('Error Initializing Bridge');
            console.error(error);
            throw error;
        }
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
    getMode() {
        return this.mode;
    }
}

export { BridgeClass };