PREREQUISITES 

- node js
- mongodb

INSTALLING THE BRIDGE/DEPENDENCIES

1. in your folder, run git clone https://github.com/chenhaovsys/layer2_bridge.git to clone the repository 
2. navigate to the bridge folder, and run npm run install-all to install all dependencies 

HOW TO USE

1. navigate to the bridge folder, create a json file called bridge_request (bridge_request.json)
2. in the file, copy and paste the following

{
  "dbURL": YOUR_DB_URL,
  "acntseed_vsys": YOUR_VSYS_ACCOUNT_SEED,
  "acntaddr_vsys": YOUR_VSYS_ACCOUNT_ADDRESS,
  "acntaddr_eth": YOUR_ETH_ACCOUNT_ADDRESS,
  "acntprivkey_eth": YOUR_VSYS_ACCOUNT_SEED,
  "network1": NATIVE_NETWORK ,
  "network2": FOREIGN_NETWORK ,
  "tkn": TOKEN_NAME ,
  "amount": amount_of_tokens_to_transfer
}

3. 
dbURL - mongodb connection string
network1 - if tokens are bridged from VSYS to LAYER2, VSYS will be network1
network2 - if tokens are bridged from VSYS to LAYER2, LAYER2 will be network2
tkn - name of the original token, must be deployed before the use of the bridge, and inserted into mongoDB 

4. make sure bridge_request.json is valid before running the bridge 

RUNNING THE BRIDGE

1. run api.js, it should say "Bridge API running at http://localhost:3000" 
2. open shellscript, navigate to the folder of the bridge
3. run the follinwing line into your shellscript
curl -X POST http://localhost:3000/bridge -H "Content-Type: application/json" -d @bridge_request.json
