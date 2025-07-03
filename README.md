1. run api.js
2. in the shellscript, navigate to this folder
3. run the follinwing line into your shellscript
curl -X POST http://localhost:3000/bridge \
  -H "Content-Type: application/json" \
  -d '{
    "dbURL": "mongodb://localhost:27017",
    "acntseed_vsys": "YOUR_VSYS_SEED",
    "acntaddr_vsys": "YOUR_VSYS_ADDRESS",
    "acntaddr_eth": "YOUR_ETH_ADDRESS",
    "acntprivkey_vsys": "YOUR_ETH_PRIVATE_KEY",
    "vsysnet": "BRG_VSYS",
    "ethnet": "BRG_LAYER2",
    "amount": 5000,
    "mode": "ethTOvsys"
}'

4. put "ethTOvsys" in the mode section to send tokens from layer 2 to vsys
5. put "vsysTOeth" in the mode section to send tokens from vsys to layer 2
