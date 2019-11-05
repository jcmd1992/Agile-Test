const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;
const Message = require("../../../models/messages");
const { MongoClient } = require("mongodb");

const _ = require("lodash");

let server, mongod, url, db, connection, collection, validID;

describe("Messagess", () => {
  before(async () => {
    try {
      mongod = new MongoMemoryServer({
        instance: {
          port: 27017,
          dbPath: "./test/database",
          dbName: "pearlhatbordb" // by default generate random dbName
        }
      });
      url = await mongod.getConnectionString();
      connection = await MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      db = connection.db(await mongod.getDbName());
      collection = db.collection("messages");
      // Must wait for DB setup to complete BEFORE starting the API server
      server = require("../../../bin/www");
    } catch (error) {
      console.log(error);
    }
  });

  after(async () => {
    try {
      await connection.close();
      await mongod.stop();
    } catch (error) {
      console.log(error);
    }
  });

    beforeEach(async () => {
        try {
            await Message.deleteMany({});
            let message = new Message();
            message.messageid = 1;
            message.usersid = 1;
            message.messages = "Hello";
            await message.save();
            message = new Message();
            message.messageid = 2;
            message.usersid = 2;
            message.messages = "Hi";
            await message.save();
            message = await Message.findOne({messageid: 1});
            validID = message.messageid;
        } catch (error) {
            console.log(error);
        }
    });

    describe("GET /messages", () => {
        it("should return the matching message", done => {
            request(server)
                .get("/messages")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200)
                .end((err, res) => {
                    expect(res.body[0]).to.have.property("messageid", 1);
                    expect(res.body[0]).to.have.property("usersid", 1);
                    done(err);
                });
        });
    });
    describe("GET /messages/:id", () => {
        describe("when the id is valid", () => {
            it("should return the matching message", done => {
                request(server)
                    .get(`/messages/${validID}`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body[0]).to.have.property("messageid", 1);
                        done(err);
                    });
            });
        });
    });
    describe("POST /messages", () => {
        it("should return confirmation message and update datastore", () => {
            const message = {
                messageid: 3,
                usersid: 3,
                messages: "Good Evening",
            };
            return request(server)
                .post("/messages")
                .send(message)
                .expect(200)
                .then(res => {
                    expect(res.body.message).equals("Message Successfully Added!");
                });
        });
        after(() => {
            return request(server)
                .get("/messages")
                .expect(200)
                .then(res => {
                    expect(res.body[2]).to.have.property("messageid", 3);
                    expect(res.body[2]).to.have.property("usersid", 3);
                    expect(res.body[2]).to.have.property("messages", "Good Evening");
                });
        });
    });
    describe("DELETE /messages/:id", () => {
        describe("when the id is valid", () => {
            it("should DELETE the selected message", done => {
                request(server)
                    .delete(`/messages/${validID}`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body.message).equals("Message NOT DELETED");
                        done(err);
                    });
            });
        });
        describe("when the id is invalid", () => {
            it("should return the NOT found message", done => {
                request(server)
                    .delete("/messages/45786798")
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body.message).equals("Message NOT DELETED");
                        done(err);
                    });
            });
        });
    });
});