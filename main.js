// bridge_runner.js
import { BridgeClass } from "./main_bridge.js";

export async function runBridgeAction(config) {
  const {
    dbURL,
    acntseed_vsys,
    acntaddr_vsys,
    acntaddr_eth,
    acntprivkey_eth,
    vsysnet,
    ethnet,
    tkn,
    amount
  } = config;

  const bridge = await new BridgeClass(
    dbURL,
    acntseed_vsys,
    acntaddr_vsys,
    acntaddr_eth,
    acntprivkey_eth,
    vsysnet,
    ethnet,
    tkn,
  ).init();

  console.log("--------------------------- Starting Bridge Action ---------------------------");
  console.log(`Mode: ${bridge.getMode()}, Amount: ${amount}`);

  try {
    let result;
    if (bridge.getMode() === "ethTOvsys") {
      result = await bridge.ethTOvsys(amount);
    } else if (bridge.getMode() === "vsysTOeth") {
      result = await bridge.vsysTOeth(amount);
    } else {
      throw new Error("Invalid modes");
    }
    return { success: true, result };
  } catch (error) {
    console.error("Bridge Error:", error);
    return { success: false, error: error.message };
  }
}
