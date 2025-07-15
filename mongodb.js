"use strict";

import * as mg from "mongodb";
import { net } from "web3";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class MongoClass{

    url;
    constructor(url = "mongodb+srv://appuser:VEhyV2N9RIHuyYB1@cluster0.dyjn3l1.mongodb.net/") {
        // Use provided URL or fall back to environment variable
        this.url = url
        
        if (!this.url) {
            console.warn('⚠️  MongoDB URI not provided. Please set MONGODB_URI environment variable or pass URL to constructor.');
            console.warn('📝 Copy .env.example to .env and fill in your MongoDB details.');
            // Don't throw error immediately - let individual methods handle it
        }
    }

    _checkConnection() {
        if (!this.url) {
            throw new Error('MongoDB URI not configured. Please set MONGODB_URI environment variable or pass URL to constructor.');
        }
    }

    async getBridgeSeed() {
        this._checkConnection();
        const client = new mg.MongoClient(this.url);
        try {
            await client.connect();
            const database = client.db("transac_details");
            const collection1 = database.collection("seeds");
            // Find the document where the field matches the word
        const doc = await collection1.findOne({["name"]: "BRIDGE_VSYS"});
            if (doc) {
                return doc.value;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching Bridge Seed:", error);
            return null;
        } finally {
            await client.close();
        }
    }

    async getBridgeADDR_VSYS() {
        const client = new mg.MongoClient(this.url);
        try {
            await client.connect();
            const database = client.db("transac_details");
            const collection1 = database.collection("addresses");
            // Find the document where the field matches the word
        const doc = await collection1.findOne({["name"]: "BRIDGE_ADDR_VSYS"});
            if (doc) {
                return doc.value;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching Bridge Seed:", error);
            return null;
        } finally {
            await client.close();
        }
    }

    async getBridgeADDR_ETH() {
        const client = new mg.MongoClient(this.url);
        try {
            await client.connect();
            const database = client.db("transac_details");
            const collection1 = database.collection("addresses");
            // Find the document where the field matches the word
        const doc = await collection1.findOne({["name"]: "BRIDGE_ADDR_ETH"});
            if (doc) {
                return doc.value;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching Bridge Seed:", error);
            return null;
        } finally {
            await client.close();
        }
    }

    async getBridgeKey_ETH() {
        const client = new mg.MongoClient(this.url);
        try {
            await client.connect();
            const database = client.db("transac_details");
            const collection1 = database.collection("keys");
            // Find the document where the field matches the word
            const doc = await collection1.findOne({["name"]: "BRIDGE_PRIVKEY_ETH"});
            if (doc) {
                return doc.value;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching Bridge Key:", error);
            return null;
        } finally {
            await client.close();
        }
    }

    async getPairNetworks(net) {
        const client = new mg.MongoClient(this.url);
        try {
            await client.connect();
            const database = client.db("transac_details");
            const collection1 = database.collection("networks");

            const allDocs = await collection1.find({}).toArray();

            const doc = allDocs.find(d => d.hasOwnProperty(net));
            const networkData = doc[net];

            const network1 = {
                nodeURL: networkData.network1,
                token: networkData.token1,
                contract: networkData.contract1,
            };

            const network2 = {
                nodeURL: networkData.network2,
                token: networkData.token2,
                contract: networkData.contract2,
            };

            return [network1, network2];
        } catch (error) {
            console.error("Error fetching Network Data:", error);
            return null;
        } finally {
            await client.close();
        }
    }

    async getNetworkDetails_ID(networkId) {
        const client = new mg.MongoClient(this.url);
        try {
            await client.connect();
            const database = client.db("transac_details");
            const collection1 = database.collection("networks");

            const network = await collection1.findOne({ _id: new mg.ObjectId(networkId) });

            if (!network) {
                throw new Error("Network not found");
            }

            return network;
        } catch (err) {
            console.error("Error fetching network:", err);
        } finally {
            await client.close();
        }
    }

    async getNetworkDetails_Name(name) {
        const client = new mg.MongoClient(this.url);
        try {
            await client.connect();
            const database = client.db("transac_details");
            const collection1 = database.collection("networks");

            const network = await collection1.findOne({ name: name });

            if (!network) {
                throw new Error("Network not found");
            }

            return network;
        } catch (err) {
            console.error("Error fetching network:", err);
        } finally {
            await client.close();
        }
    }

    async getToken_name(name) {
        const client = new mg.MongoClient(this.url);
        try {
            await client.connect();
            const database = client.db("transac_details");
            const collection1 = database.collection("tokens");

            const token = await collection1.findOne({ name: name });

            if (!token) {
                throw new Error("Token not found");
            }

            return token;
        } catch (err) {
            console.error("Error fetching Token:", err);
        } finally {
            await client.close();
        }
    }

    async getToken_addr(tkn_addr) {
        const client = new mg.MongoClient(this.url);
        try {
            await client.connect();
            const database = client.db("transac_details");
            const collection1 = database.collection("tokens");

            const token = await collection1.findOne({ tkn_addr: tkn_addr });

            if (!token) {
                throw new Error("Token not found");
            }

            return token;
        } catch (err) {
            console.error("Error fetching Token:", err);
        } finally {
            await client.close();
        }
    }

    async getToken_id(id) {
        const client = new mg.MongoClient(this.url);
        try {
            await client.connect();
            const database = client.db("transac_details");
            const collection1 = database.collection("tokens");

            const token = await collection1.findOne({_id: new mg.ObjectId(id)});

            if (!token) {
                throw new Error("Token not found");
            }

            return token;
        } catch (err) {
            console.error("Error fetching Token:", err);
        } finally {
            await client.close();
        }
    }

    async insertTokenData({
        name,
        network_id,
        tkn_addr,
        ctrt_addr,
        networkName,
        issuer,
        max,
        registerTime,
        desc = "",
        wrapped
        }) {
            const client = new mg.MongoClient(this.url);
        try {
            await client.connect();
            const db = client.db("transac_details"); // Change to your DB name
            const collection = db.collection("tokens"); // Change to your collection name

            const result = await collection.insertOne({
            name : name,
            network_id: new mg.ObjectId(network_id),
            tkn_addr : tkn_addr,
            ctrt_addr : ctrt_addr,
            desc : desc,
            issuer  : issuer,
            max: max,
            registerTime: new Date(registerTime),
            networkName : networkName,
            wrapped: new mg.ObjectId(wrapped)
            });
            
            const id = result.insertedId; // Get the inserted ID
            console.log("Inserted document ID:", id);
            return id.toString();
        } catch (err) {
            console.error("Error inserting token data:", err);
        } finally {
            await client.close();
        }
    }

    async updateWrapped(token_id,wrapped_id){
        const client = new mg.MongoClient(this.url);
        try {
            await client.connect();
            const db = client.db("transac_details");
            const collection = db.collection("tokens");

            const result = await collection.updateOne(
                { _id: new mg.ObjectId(token_id) },
                { $set: { "wrapped": new mg.ObjectId(wrapped_id) } }
        );

            console.log("Matched:", result.matchedCount, "Modified:", result.modifiedCount);
        } catch (error) {
            console.error("Update failed:", error);
        } finally {
            await client.close();
        }
    }

    async updateTokenAddress(name,contractAddress,tokenAddress) {
        const client = new mg.MongoClient(this.url);
        try {
            await client.connect();
            const db = client.db("transac_details");
            const collection = db.collection("tokens");

            const result = await collection.updateOne(
            { name: name },
            { $set: { tkn_addr : tokenAddress , ctrt_addr: contractAddress } }
            );

            console.log("Matched:", result.matchedCount, "Modified:", result.modifiedCount);
        } catch (error) {
            console.error("Update failed:", error);
        } finally {
            await client.close();
        }
    }

    async insertTransaction(data) {
        const client = new mg.MongoClient(this.url);
        
        try {
            await client.connect();
            const db = client.db("transac_details");
            const collection = db.collection("transactions");

            const result = await collection.insertOne(data);
            console.log('Inserted:', result.insertedId);
        } catch (err) {
            console.error('Insert failed:', err);
        } finally {
            await client.close();
        }
    }

    async checkTokenPair(tkn1,tkn2){
        const client = new mg.MongoClient(this.url);
        try {
            await client.connect();
            const db = client.db("transac_details");
            const tokens = db.collection("tokens");
            const networks = db.collection("networks");

            const token1 = await tokens.findOne({ name:tkn1 });
            const token2 = await tokens.findOne({ name:tkn2 });


            if (!token1) {
                console.log("VSYS Token not found");
                return false;
            }
            if (!token2) {
                console.log("ETH Token not found");
                return false;
            }

            const networkObjectId1 = token1.network_id; // this is already an ObjectId
            const networkObjectId2 = token2.network_id; // this is already an ObjectId

            // Step 2: Use it to find the network document
            const network1 = await networks.findOne({ _id: networkObjectId1 });
            const network2 = await networks.findOne({ _id: networkObjectId2 });

            if (!network1) {
                console.log("Network for VSYS Token not found");  
                return false;
            }
            if (!network2) {
                console.log("Network for ETH Token not found");  
                return false;
            }
            if (network1.chain != "VSYS"){
                console.log("1st Network is not VSYS Chain");
                return false;
            }
            if (network2.chain != "ETH") {
                console.log("2nd Network is not ETH Chain");
                return false;
            }

            if (network1.type != network2.type) {
                console.log("Network types do not match");
                return false;
            }

            return true;
        } catch (err) {
            console.error(err);
        } finally {
            await client.close();
        }
    }

    async checkToken_test(tkn,network1,network2){
        const client = new mg.MongoClient(this.url);
        try {
            var original = true;
            var wrapped = true;
            var mode = "vsysTOeth";
            await client.connect();
            const db = client.db("transac_details");

            const token = await this.getToken_name(tkn);

            if (!token) {
                throw Error("Token not found");
            }

            const network_token = await this.getNetworkDetails_ID(token.network_id.toString());
            const network_prim = await this.getNetworkDetails_Name(network1);
            const network_second = await this.getNetworkDetails_Name(network2);
            
            if (!network_prim) {
                throw Error("1st Network not found");
            }
            if (!network_second) {
                throw Error("2nd Network not found");
            }
            
            if (network_prim.type != network_second.type) {
                throw Error("Network types do not match");
            }

            if (network_prim.chain == network_second.chain) {
                throw Error("Both networks chain are the same");
            }

            if (network_prim.chain == "ETH") {
                mode = "ethTOvsys";
            }

            if (network_token._id.toString() != network_prim._id.toString()) {
                original = false;
            }

            if (token.wrapped == "false") {
                wrapped = false;
            }

            return {"wrapped":wrapped,"original":original,"mode":mode};
        } catch (err) {
            console.error(err);
        } finally {
            await client.close();
        }
    }
}

var mongo = new MongoClass();

export { MongoClass };