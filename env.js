import dotenv from 'dotenv';
dotenv.config();


const ACC1_SEED_VSYS = process.env.ACC1_SEED_VSYS;
const ACNT1ADDR_VSYS = process.env.ACNT1ADDR_VSYS;
const PRIVATEKEY_ACC1_ETH = process.env.PRIVATEKEY_ACC1_ETH;
const ACNT1ADDR_ETH = process.env.ACNT1ADDR_ETH;

export { ACC1_SEED_VSYS,ACNT1ADDR_ETH,ACNT1ADDR_VSYS,PRIVATEKEY_ACC1_ETH
 };