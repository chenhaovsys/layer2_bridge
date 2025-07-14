import * as jv from "./src/index.js";
import BN from "bn.js";

function printHeading(msg) {
  function times(char, num) {
    let ret = '';
    while (num-- > 0) ret += char;

    return ret;
  }
  console.log(times('=', 10), msg, times('=', 10));
}

async function registerToken(acnt,max,unit,tokDesc,ctrtDesc){
    printHeading("Creating Token");
    try{
        const realunit = new BN(unit);
        const tokenContract = await jv.TokCtrtWithoutSplit.register(
            acnt,
            max,
            realunit,
            tokDesc,
            ctrtDesc
        );
        console.log(tokenContract);
        const contractID = tokenContract.ctrtId.data;
        return contractID;
    }catch(error){
        console.log(error);
        throw (error);
    }
}

async function getIssuer(contractID,chain){
    try{
        const contract = new jv.TokCtrtWithoutSplit(contractID,chain);
        const res = await contract.getIssuer();
        return res.data;
    }catch(error){
        console.log(error);
        throw (error);
    }
}

async function checkToken(contractID,chain){
  try{
    await getIssuer(contractID,chain);
    return true;
  }catch(error){
    return false;
  }
}

//gets te maker of the contract
async function getMaker(contractID,chain){
    printHeading("Get Maker of Contract")
    try{
        const contract = new jv.TokCtrtWithoutSplit(contractID,chain);
        const res = await contract.getMaker();
        console.log("Contract Maker: "+res.data);
    }catch(error){
        console.log(error);
        throw (error);
    }
}

//gets the ID of the token of the contract
async function getTokenID(contractID,chain,tokIndex){
    printHeading("Get Token ID")
    try{
        const contract = new jv.TokCtrtWithoutSplit(contractID,chain);
        const res = await contract.getTokId(tokIndex);
        return res.data;
    }catch(error){
        console.log(error);
        throw (error);
    }
}

//gets the current number of tokens
async function getUnit(contractID,chain){
    printHeading("Get Token Units")
    try{
        const contract = new jv.TokCtrtWithoutSplit(contractID,chain);
        const res = await contract.getUnit();
        console.log("Token Units: "+res);
    }catch(error){
        console.log(error);
        throw (error);
    }
}

//get token balance of an account
async function getTokenBalance(contractID,chain,acnt){
    try{
        const contract = new jv.TokCtrtWithoutSplit(contractID,chain);
        const res = await contract.getTokBal(acnt.addr.data);
        return (res.data);
    }catch(error){
        console.log(error);
        throw (error);
    }
}

async function issueToken(contractID,chain,acnt,amount,attachment=''){
    try{
        const contract = new jv.TokCtrtWithoutSplit(contractID,chain);
        const res = await contract.issue(acnt,amount,attachment);
        console.log(res);
        return res;
    }catch(error){
        console.log(error);
        throw (error);
    }
}

async function sendToken(contractID,chain,acnt,recipient,amount,attachment='',fee=30000000){
    try{
        const contract = new jv.TokCtrtWithoutSplit(contractID,chain);
        const res = await contract.send(acnt,recipient,amount,attachment);
        console.log(res);
        return res;
    }catch(error){
        console.log(error);
        throw (error);
    }
}

async function destroyTokens(contractID,chain,acnt,amount,attachment='',fee=30000000){
    printHeading(`Destorying ${amount} Tokens`)
    try{
        const contract = new jv.TokCtrtWithoutSplit(contractID,chain);
        const res = await contract.destroy(acnt,amount,attachment);
        return res;
    }catch(error){
        console.log(error);
        throw (error);
    }
}

export {registerToken,getIssuer,getMaker,getTokenID,getTokenBalance,
    issueToken,getUnit,sendToken,destroyTokens,checkToken
}

