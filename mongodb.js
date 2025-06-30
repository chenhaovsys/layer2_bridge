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

    async updateContract_VSYS(net,contractAddress) {
        const client = new mg.MongoClient(this.url);
        try {
            await client.connect();
            const db = client.db("transac_details");
            const collection = db.collection("networks");

            const filter = { [net]: { $exists: true } }; 
            const update = {
                $set: {
                    [`${net}.contract1`]: contractAddress
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

    async updateToken_VSYS(net,tokenAddress) {
        const client = new mg.MongoClient(this.url);
        try {
            await client.connect();
            const db = client.db("transac_details");
            const collection = db.collection("networks");

            const filter = { [net]: { $exists: true } }; // replace with actual ID
            const update = {
                $set: {
                    [`${net}.token1`]: tokenAddress
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
            const collection = db.collection("networks");

            const result = await collection.insertOne({
            testnet_layer2: {
                network1: "http://gemmer.vcoin.systems:9924",
                network2: "https://sentosa.aeris.codedsolution-web3.com",
                token1: "",
                token2: "",
                contract1: "",
                contract2: ""
            }
            });
            console.log('Inserted:', result.insertedId);
        } catch (err) {
            console.error('Insert failed:', err);
        } finally {
            await client.close();
        }
    }
}

export { MongoClass };