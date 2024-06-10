const { expect } = require('chai');
const supertest = require('supertest');
const { describe, it, after } = require('mocha');
const mongoose = require('mongoose');
const usuariosModelo = require('../src/dao/models/usermodel')
const { Cart } = require('../src/dao/index');

const requester = supertest("http://localhost:3000");

describe("Prueba routers products", async function () {

    this.timeout(5000)
    let agent;
    let agent2;

    before(async () => {
        await mongoose.connect('mongodb+srv://tavolujan13:2DzswDTS9op17gvl@cluster0.hmxtrlt.mongodb.net/?retryWrites=true&w=majority&dbName=Cluster0')
        agent = supertest.agent("http://localhost:3000");
        agent2 = supertest.agent("http://localhost:3000");
    });

    describe("Pruebas endpoints", async function () {


        after(async () => {
            const user = await usuariosModelo.findOne({ email: 'TESTING@ROUTER.com' });
            if (user) {
                await Cart.findByIdAndDelete(user.cart);
            }
            await mongoose.connection.collection("sessions").deleteOne({ email: "TESTING@ROUTER.com" });
        })

        it("POST /api/sessions/registrate", async () => {
            const res = await requester.post("/api/sessions/registrate").send({
                first_name: 'Test',
                last_name: 'User',
                age: 30,
                email: 'TESTING@ROUTER.com',
                password: 'testpassword'
            });

            let UserInMongo = await mongoose.connection.collection("sessions").findOne({ email: "TESTING@ROUTER.com" });

            expect(res.status).to.equal(302);
            expect(UserInMongo).exist
            expect(UserInMongo.email).to.be.equal("TESTING@ROUTER.com")
            expect(UserInMongo.password).not.be.equal("testpassword")

        });

        it("POST /api/sessions/login", async () => {
            const res = await agent.post("/api/sessions/login").send({
                email: 'TESTING@ROUTER.com',
                password: 'testpassword'
            });


            expect(res.status).to.equal(302);
            expect(res.header['location']).to.equal('/views/products');
            expect(res.header['set-cookie']).to.exist;
        });

        it("GET /api/sessions/current", async () => {

            const res = await agent.get("/api/sessions/current");

            expect(res.status).to.equal(200);
            expect(res.body.user.email).to.equal('TESTING@ROUTER.com');
            expect(res.body.user.nombre).to.equal('TEST');
            expect(res.body.user.apellido).to.equal('USER');


            const out = await agent.get("/api/sessions/logout");
            expect(out.status).to.equal(302);
        });

    })
})