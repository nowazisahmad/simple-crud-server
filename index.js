import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 5000;

const client = new MongoClient(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8avnhl5.mongodb.net/`);

app.use(cors());
app.use(express.json());

async function startServer() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");

    const db = client.db("SimpleCRUDAdmin");
    const users = db.collection("users");

    app.get("/", (req, res) => {
      res.send("Simple CRUD Server is Running");
    });

    app.get("/users", async (req, res) => {
      try {
        const allUsers = await users.find({}).toArray();
        res.send(allUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        res.status(500).send({ message: "Failed to fetch users" });
      }
    });

    app.get('/users/:id', async (req, res) => {
    console.log('params in the server', req.params)
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }

    const result = await users.findOne(query);
    res.send(result);
})

    app.post('/users', async (req, res) => {
    const newUser = req.body;
    console.log('Adding new user:', newUser);

    const result = await users.insertOne(newUser);
    res.send(result);
})

app.patch('/users/:id', async(req, res) =>{
    const id = req.params.id;
    const updatedUser = req.body;

    console.log('Updating user with ID:', id, 'with data:', updatedUser);
    const filter = {
        _id: new ObjectId(id)
    }
    const options = { upsert: true };
    const updateDoc = {
        $set: {
            name: updatedUser.name,
            email: updatedUser.email
        }
    }

    const result = await users.updateOne(filter, updateDoc, options);
    res.send(result);

})

app.delete('/users/:id', async(req, res) =>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await users.deleteOne(query);
    res.send(result);
})

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
}

startServer();
