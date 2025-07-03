import { BridgeClass } from "./main_bridge.js";
import * as env from "./env.js";

async function main(dbURL,acntseed_vsys,acntaddr_vsys,acntaddr_eth,acntprivkey_vsys,vsysnet,ethnet) {
    var bridge = await new BridgeClass(dbURL,acntseed_vsys,acntaddr_vsys,acntaddr_eth,acntprivkey_vsys,vsysnet,ethnet).init();
    console.log("---------------------------Starting Bridge Transfer---------------------------");

    try{
        await bridge.ethTOvsys(5000);
    }catch(error){
        console.error("Error:", error);
        return;
    }
}

await main(
    "mongodb://localhost:27017",
    env.ACC1_SEED_VSYS,
    env.ACNT1ADDR_VSYS,
    env.ACNT1ADDR_ETH,
    env.PRIVATEKEY_ACC1_ETH,
    "BRG_VSYS",
    "BRG_LAYER2"
);



