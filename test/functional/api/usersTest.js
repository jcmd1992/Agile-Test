const chai = require("chai")
const expect = chai.expect
const request = require("supertest")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()
const User = require("../../../models/users")

const _ = require("lodash")

let server, db, validID

describe("Userss", () => {
    before(async () => {
        try {
            // eslint-disable-next-line no-undef
            await mongoose.connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
            server = require("../../../bin/www")
            db = mongoose.connection
        } catch (error) {
            console.log(error)
        }
    })

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
    /*describe("GET /users/:id", () => {
        describe("when the id is valid", () => {
            it("should return the matching user", done => {
                request(server)
                    .get(`/users/${validID}`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body[0]).to.have.property("userid", 1);
                        done(err);
                    });
            });
        });
    });*/

    describe("POST /users", () => {
        it("should return confirmation message and update datastore", () => {
            const user = {
                userid: 3,
                email: "Jack@gmail.com",
                administrator: "No",
            };
            return request(server)
                .post("/users")
                .send(user)
                .expect(200)
                .then(res => {
                    expect(res.body.message).equals("User Successfully Added!");
                });
        });
        after(() => {
            return request(server)
                .get("/users")
                .expect(200)
                .then(res => {
                    expect(res.body[2]).to.have.property("userid", 3);
                    expect(res.body[2]).to.have.property("email", "Jack@gmail.com");
                    expect(res.body[2]).to.have.property("administrator", "No");
                });
        });
    });
    describe("DELETE /users/:id", () => {
        describe("when the id is valid", () => {
            it("should DELETE the selected user", done => {
                request(server)
                    .delete(`/users/${validID}`)
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body.message).equals("User NOT DELETED");
                        done(err);
                    });
            });
        });
        describe("when the id is invalid", () => {
            it("should return the NOT found user", done => {
                request(server)
                    .delete("/users/45786798")
                    .set("Accept", "application/json")
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .end((err, res) => {
                        expect(res.body.message).equals("User NOT DELETED");
                        done(err);
                    });
            });
        });
    });
});