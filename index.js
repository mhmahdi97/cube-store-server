const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cvqkxpy.mongodb.net/?retryWrites=true&w=majority`;

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

    const cubeCollection = client.db('cubeStore').collection('cubes')

    // api to get all data
    app.get('/all-cubes', async (req, res) => {
      const cursor = cubeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // api to get data with specific id
    app.get('/cubes/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await cubeCollection.findOne(query);
      res.send(result);
    })
   
    // api to get data with category query params
    app.get('/cubes', async (req, res) => {
      let query = {};
      if (req.query.category) {
        query = {category: req.query.category}
      }
      else if (req.query.sellerEmail) {
        query = {sellerEmail: req.query.sellerEmail}
      }
      const result = await cubeCollection.find(query).toArray();
      res.send(result)
    })

    // api to create data in databse
    app.post('/all-cubes', async (req, res) => {
            const addCube = req.body;
            console.log(addCube);
            const result = await cubeCollection.insertOne(addCube);
            res.send(result);
    });

    // api to delete a specific cube
    app.delete('/cubes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await cubeCollection.deleteOne(query);
            res.send(result);
    })

    // api to update a specific cube
    app.put('/cubes/:id', async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options ={upsert : true};
      const updatedCube = req.body;
    
      const cube = {
        $set: {
            cubeName: updatedCube.cubeName,
            category: updatedCube.category,
            price: updatedCube.price,
            ratings: updatedCube.ratings,
            cubeImage1: updatedCube.cubeImage1,
            quantity: updatedCube.quantity,
            sellerName: updatedCube.sellerName,
            sellerEmail: updatedCube.sellerEmail,
            description: updatedCube.description
        }
      }
      const result = await cubeCollection.updateOne(filter, cube, options);
      res.send(result);
    })



    // api to get data with seller email query params
    // app.get('/cubes', async (req, res) => {
    //   let query = {};
    //   if (req.query.cubeName) {
    //     query = {cubeName: req.query.cubeName}
    //   }
    //   const result = await cubeCollection.find(query).toArray();
    //   res.send(result)
    //   console.log(query)
    // })







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
    res.send('Cube Store server is running...')
})



app.listen(port, () => {
    console.log(`Cube Store server is running on port ${port}`)
})