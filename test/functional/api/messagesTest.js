const expect = require("chai").expect;
const request = require("supertest");
const {MongoMemoryServer} = require("mongodb-memory-server");
const Message = require("../../../models/messages");
const mongoose = require("mongoose");

let server;
let mongod;
let db, validID;


describe("Messagess", () => {
    before(async () => {
        try {
            mongod = new MongoMemoryServer();
            // Async Trick - this ensures the database is created before
            // we try to connect to it or start the server
            const connString = await mongod.getConnectionString();

            await mongoose.connect(connString, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            server = require("../../../bin/www");
            db = mongoose.connection;
        } catch (error) {
            console.log(error);
        }
    });

    after(async () => {
        try {
            await db.dropDatabase();
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