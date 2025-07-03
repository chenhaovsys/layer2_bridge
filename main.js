// bridge_runner.js
import { BridgeClass } from "./main_bridge.js";

export async function runBridgeAction(config) {
  const {
    dbURL,
    acntseed_vsys,
    acntaddr_vsys,
    acntaddr_eth,
    acntprivkey_eth,
    vsystkn,
    ethtkn,
    amount,
    mode
  } = config;

  const bridge = await new BridgeClass(
    dbURL,
    acntseed_vsys,
    acntaddr_vsys,
    acntaddr_eth,
    acntprivkey_eth,
    vsystkn,
    ethtkn
  ).init();

  console.log("--------------------------- Starting Bridge Action ---------------------------");
  console.log(`Mode: ${mode}, Amount: ${amount}`);

  try {
    let result;
    if (mode === "ethTOvsys") {
      result = await bridge.ethTOvsys(amount);
    } else if (mode === "vsysTOeth") {
      result = await bridge.vsysTOeth(amount);
    } else {
      throw new Error("Invalid mode. Use 'ethTOvsys' or 'vsysTOeth'.");
    }
    return { success: true, result };
  } catch (error) {
    console.error("Bridge Error:", error);
    return { success: false, error: error.message };
  }
}
