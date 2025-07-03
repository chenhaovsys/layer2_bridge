"use strict";

import * as mg from "mongodb";

class MongoClass{

    url;
    constructor(url) {
        this.url = url;
    }

    async getBridgeSeed() {
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

    async getToken(name) {
        const client = new mg.MongoClient(this.url);
        try {
            await client.connect();
            const database = client.db("transac_details");
            const collection1 = database.collection("tokens");

            const token = await collection1.findOne({ name: name });

            if (!token) {
                throw new Error("Network not found");
            }

            return token;
        } catch (err) {
            console.error("Error fetching network:", err);
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
        desc = ""
        }) {
        try {
            await client.connect();
            const db = client.db("transac_details"); // Change to your DB name
            const collection = db.collection("tokens"); // Change to your collection name

            const result = await collection.insertOne({
            name : name,
            network_id: new ObjectId(network_id),
            tkn_addr : tkn_addr,
            ctrt_addr : ctrt_addr,
            desc : desc,
            issuer  : issuer,
            max: max,
            registerTime: new Date(registerTime),
            networkName : networkName
            });

            console.log("Inserted document ID:", result.insertedId);
        } catch (err) {
            console.error("Error inserting token data:", err);
        } finally {
            await client.close();
        }
    }

    async updateTokenAddress(name,chainName,contractAddres = "",tokenAddress = "") {
        const client = new mg.MongoClient(this.url);
        try {
            await client.connect();
            const db = client.db("transac_details");
            const collection = db.collection("tokens");

            const result = await collection.updateOne(
            { name: name },
            { chainName : chainName },
            { $set: { ctrt_addr: contractAddress } }
            );

            console.log("Matched:", result.matchedCount, "Modified:", result.modifiedCount);
        } catch (error) {
            console.error("Update failed:", error);
        } finally {
            await client.close();
        }
    }

    async updateContractToken_ETH(net,contractAddress) {
        const client = new mg.MongoClient(this.url);
        try {
            await client.connect();
            const db = client.db("transac_details");
            const collection = db.collection("networks");

            const filter = { [net]: { $exists: true } }; // replace with actual ID
            const update = {
                $set: {
                    [`${net}.contract2`]: contractAddress,
                    [`${net}.token2`]: contractAddress
                }
            };

            const result = await collection.updateOne(filter, update);
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

    async insertData() {
        const client = new mg.MongoClient(this.url);
        
        try {
            await client.connect();
            const db = client.db("transac_details");
            const collection = db.collection("tokens");

            const networkId = new mg.ObjectId("686240ebaba2127d1acc175c");

            const result = await collection.insertOne({
                name: "BRG",
                network_id: networkId,
                tkn_addr: "0xFc20B919e24580663E8c127eAdD37E7c0c6F056B",
                ctrt_addr: "0xFc20B919e24580663E8c127eAdD37E7c0c6F056B",
                desc: "Bridge Tokens in Holesky Testnet",
                chainName:"HOLESKY",
                issuer: "0x10cdeBbA4ef555bfabCDb3336CdcF78A0C32a549",
                max: 10000000000,
                registerTime:"2025-06-16 16:01:36"
            });
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


            if (!token1 || !token2) {
                console.log("Token pair not found");
                return false;
            }

            const networkObjectId1 = token1.network_id; // this is already an ObjectId
            const networkObjectId2 = token2.network_id; // this is already an ObjectId

            // Step 2: Use it to find the network document
            const network1 = await networks.findOne({ _id: networkObjectId1 });
            const network2 = await networks.findOne({ _id: networkObjectId2 });

            if (!network1 || !network2) {
                console.log("Network pair not found");  
                return false;
            }

            if (network1.type != network2.type) {
                console.log("Network types do not match");
                return false;
            }

            return true;
        } catch (err) {
            console.error("Error:", err);
        } finally {
            await client.close();
        }
    }
}

export { MongoClass };