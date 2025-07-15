<<<<<<< HEAD
# 🌉 Cross-Chain Bridge

A seamless bridge between **VSYS** and **Ethereum** networks, enabling secure token transfers across blockchains.

## ✨ Features

- 🔄 Bidirectional token transfers (VSYS ↔ Ethereum)
- 🔒 Secure wrapped token creation
- 📊 MongoDB transaction logging
- 🚀 RESTful API interface
- ⚡ Automatic token minting/burning

## 🛠️ Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** database (Atlas or local)
- **VSYS** account with seed phrase
- **Ethereum** account with private key

## 🚀 Quick Setup

### 1. **Installation**
```bash
git clone https://github.com/chenhaovsys/layer2_bridge.git
cd bridge
npm run install-all
```

### 2. **Start the Bridge**
```bash
npm start
OR
node api.js
# Bridge API running at http://localhost:3000
```

## 📖 Usage Guide

### 🔧 **Setup Bridge Request**

1. Create `bridge_request.json`:
```json
{
  "dbURL": "YOUR_MONGODB_CLUSTER_CONNECTION_STRING",
  "acntseed_vsys": "your_vsys_seed_phrase",
  "acntaddr_vsys": "your_vsys_address", 
  "acntaddr_eth": "your_eth_address",
  "acntprivkey_eth": "your_eth_private_key",
  "network1": "VSYS",
  "network2": "LAYER2",
  "tkn": "TOKEN_NAME",
  "amount": 1000
}
```

### 🪙 **Available Tokens & Contracts**

| Token Name | VSYS Contract | Ethereum Contract |
|------------|---------------|-------------------|
| **MOUSE** | `TWugNigAshwVkMjgutDdF9AQJMoKC9NFBAoVu3yFK` | `0x32e0fD6C049F69fc8A412d1183f4aA31dd9359D9` |
| **BRG_LAYER2** | `TWuJt8bsbYzffpEWi7R2cYKv7U7Vt5uSJmwnai6VY` | `0x40aC7981e59cfA9d6B25aAd5681A53058A480099` |

> 💡 **Token Reference:** Use the exact token names above in your `bridge_request.json` file.

### 🪙 **Sample Token Configurations**

**Example 1: MOUSE Token Transfer (VSYS → Ethereum)**
```json
{
  "dbURL": "mongodb+srv://username:password@cluster.mongodb.net/transac_details",
  "acntseed_vsys": "glove safe safe collect switch winter jacket skill slender banner gift industry time skin suit",
  "acntaddr_vsys": "AU4b3UZB7a1t9Rz5iaBQvFWrsETVgrG8moX", 
  "acntaddr_eth": "0x10cdeBbA4ef555bfabCDb3336CdcF78A0C32a549",
  "acntprivkey_eth": "0x225f1bc25bb2b62bd2a6e965cb314a3e49c0053175495ede4aa2a9abd3fe26e6",
  "network1": "VSYS",
  "network2": "LAYER2",
  "tkn": "MOUSE",
  "amount": 5000
}
```
> 🔗 **Contracts:** VSYS: `CFBfPDZZLMhMwEKzBwHcvUdFjuFqnMb7xLZr` → Ethereum: `0x742d35Cc6634C0532925a3b8D400E1e7F2f2d122`

**Example 2: BRG_LAYER2 Token Transfer (Ethereum → VSYS)**
```json
{
  "dbURL": "mongodb+srv://username:password@cluster.mongodb.net/transac_details",
  "acntseed_vsys": "glove safe safe collect switch winter jacket skill slender banner gift industry time skin suit",
  "acntaddr_vsys": "AU4b3UZB7a1t9Rz5iaBQvFWrsETVgrG8moX", 
  "acntaddr_eth": "0x10cdeBbA4ef555bfabCDb3336CdcF78A0C32a549",
  "acntprivkey_eth": "0x225f1bc25bb2b62bd2a6e965cb314a3e49c0053175495ede4aa2a9abd3fe26e6",
  "network1": "LAYER2",
  "network2": "VSYS",
  "tkn": "BRG_LAYER2",
  "amount": 5000
}
```

> **⚠️ Important:** Replace the credentials above with your actual account details and MongoDB connection string.

### 📋 **Parameter Guide**

| Parameter | Description | Example |
|-----------|-------------|---------|
| `dbURL` | MongoDB connection string | `mongodb://localhost:27017` |
| `network1` | Source network (token origin) | `VSYS` |
| `network2` | Destination network | `LAYER2` |
| `tkn` | Original token name (must exist in MongoDB) | `MOUSE` |
| `amount` | Number of tokens to transfer | `1000` |

### 🚀 **Execute Bridge Transfer**

**Using cURL**
```bash
curl -X POST http://localhost:3000/bridge -H "Content-Type: application/json" -d @bridge_request.json

## 🔄 Transfer Modes

| Mode  | Flow |
|-------|------|
| **`ethTOvsys`** | Ethereum → VSYS |
| **`vsysTOeth`** | VSYS → Ethereum |

*Mode is automatically detected based on `network1` parameter.*

## 💻 Development

```bash
# Development mode (auto-restart)
npm run dev

# Run setup script
node setup.js

# Install all dependencies
npm run install-all
```

## 🔐 Security Best Practices

- ✅ Never commit `.env` files to git
- ✅ Use environment variables in production
- ✅ Keep private keys and seed phrases secure
- ✅ Validate all API inputs
- ✅ Monitor transaction logs

## 📂 Project Structure

```
bridge/
├── 📁 js-vsys/              # VSYS SDK and contracts
├── 📁 layer2-tutorial-main/ # Ethereum contracts
├── 🔧 api.js               # REST API server
├── 🌉 main_bridge.js       # Bridge core logic
├── 🗄️ mongodb.js           # Database operations
├── ⚙️ setup.js             # Installation script
├── 📋 .env.example         # Environment template
└── 📖 README.md            # This file
```

## 🐛 Troubleshooting

### Common Issues

**Connection Error:**
```bash
Error: MongoDB URI not configured
```
**Solution:** Copy `.env.example` to `.env` and fill in your MongoDB URI.

**Invalid Token:**
```bash
Error: Token not found
```
**Solution:** Ensure token exists in MongoDB `tokens` collection.

**Network Mismatch:**
```bash
Error: Network types do not match
```
**Solution:** Verify `network1` and `network2` are compatible bridge pairs.


## 📝 License

This project is licensed under the ISC License.

---

**Need help?** Open an issue on [GitHub](https://github.com/chenhaovsys/layer2_bridge/issues)
=======
PREREQUISITES 

- node js
- mongodb

INSTALLING THE BRIDGE/DEPENDENCIES

1. in your folder, run git clone https://github.com/chenhaovsys/layer2_bridge.git to clone to repository 
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
>>>>>>> 81cfa7604c9be9ae2391746ea53846c29630893b
