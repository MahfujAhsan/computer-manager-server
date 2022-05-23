const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@computermanager.rqt7r.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const productsCollection = client.db('computerManager').collection('products');
        const ordersCollection = client.db('computerManager').collection('orders');
        const usersCollection = client.db('computerManager').collection('users');

        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productsCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await productsCollection.findOne(query);
            res.send(item);
        });


        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        });

        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const cursor = ordersCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = {email: email};
            const options = {upsert: true};
            const updatedDoc = {
                $set: user
            };
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_KEY, {expiresIn: '24h'});
            res.send({result, token});
        })

    }
    finally {

    }
}

run().catch(console.dir);

app.get("/", (req, res) => {
    res.send('Computer Manager Running')
});

app.listen(port, () => {
    console.log('Computer Manager is Booming')
})
