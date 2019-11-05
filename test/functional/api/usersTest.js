const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;
const User = require("../../../models/users");
const { MongoClient } = require("mongodb");

const _ = require("lodash");

let server, mongod, url, db, connection, collection, validID;

describe("Userss", () => {
  before(async () => {
    try {
      mongod = new MongoMemoryServer({
        instance: {
          port: 27017,
          dbPath: "./test/database",
          dbName: "pearlharbordb" // by default generate random dbName
        }
      });
      url = await mongod.getConnectionString();
      connection = await MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      db = connection.db(await mongod.getDbName());
      collection = db.collection("users");
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
            await User.deleteMany({});
            let user = new User();
            user.userid = 1;
            user.email = "Kate@gmail.com";
            user.administrator = "Yes";
            await user.save();
            user = new User();
            user.userid = 2;
            user.email = "Barry@gmail.com";
            user.administrator = "No";
            await user.save();
            user = await User.findOne({userid: 1});
            validID = user.userid;
        } catch (error) {
            console.log(error);
        }
    });

    describe("GET /users", () => {
        it("should return the matching user", done => {
            request(server)
                .get("/users")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200)
                .end((err, res) => {
                    expect(res.body[0]).to.have.property("userid", 1);
                    expect(res.body[0]).to.have.property("administrator", "Yes");
                    done(err);
                });
        });
    });
});