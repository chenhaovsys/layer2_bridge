// bridge_runner.js
import { BridgeClass } from "./main_bridge.js";

export async function runBridgeAction(config) {
  const {
    dbURL,
    acntseed_vsys,
    acntaddr_vsys,
    acntaddr_eth,
    acntprivkey_eth,
    network1,
    network2,
    tkn,
    amount
  } = config;

  if (amount <= 0) {
    console.error("Invalid amount:", amount);
    throw new Error("Amount must be greater than zero");
  }

  const bridge = await new BridgeClass(
    dbURL,
    acntseed_vsys,
    acntaddr_vsys,
    acntaddr_eth,
    acntprivkey_eth,
    network1,
    network2,
    tkn
  ).init();

  console.log("--------------------------- Starting Bridge Action ---------------------------");
  console.log(`Mode: ${bridge.getMode()}, Amount: ${amount}`);

  try {
    let result;
    if (bridge.getMode() === "ethTOvsys") {
      bridge.ethTOvsys(amount);
    } else if (bridge.getMode() === "vsysTOeth") {
      bridge.vsysTOeth(amount);
    } else {
      throw new Error("Invalid modes");
    }
    return { success: true, result };
  } catch (error) {
    console.error("Bridge Error:", error);
    return { success: false, error: error.message };
  }
}
