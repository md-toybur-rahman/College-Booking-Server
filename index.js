const express = require('express');
const cors = require('cors')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const app = express();
// const CollegeData = require('./data/CollegeData.json');
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());


// jwt middleware
const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    // bearer token
    const token = authorization.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: true, message: 'unauthorized access' })
        }
        req.decoded = decoded
        next()
    })
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z50rydu.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        const collegesInfo = client.db('college-booking-DB').collection('colleges-data');
        const usersCollection = client.db("college-booking-DB").collection("users");
        const admitCollection = client.db("college-booking-DB").collection("admit");



        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ token })
        })

        app.get('/info', async (req, res) => {
            const cursor = collegesInfo.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/admit', async (req, res) => {
            const cursor = admitCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/info/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await collegesInfo.find(query).toArray();
            res.send(result);
        })


        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        app.post('/admit', async (req, res) => {
            const newToys = req.body;
            const result = await (admitCollection.insertOne(newToys));
            res.send(result)
        })







        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);
















app.get('/', (req, res) => {
    res.send("It's Running")
});


app.listen(port, () => {
    console.log(`College Booking is running on port: ${port}`);
})