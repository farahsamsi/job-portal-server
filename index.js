const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.tu4i6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// middleware
app.use(cors());
app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const jobsCollection = client.db("jobPortal").collection("jobs");
    const jobApplicationCollection = client
      .db("jobPortal")
      .collection("job_applications");

    //_____________JOBS API______________

    //   loading all jobs api and with limit if limit is available in frontend
    app.get("/jobs", async (req, res) => {
      const limit = req.query.limit ? parseInt(req.query.limit) : null;
      let cursor = jobsCollection.find();
      if (limit) {
        cursor = cursor.limit(limit);
      }
      const result = await cursor.toArray();
      res.send(result);
    });

    //   get specific job using _id
    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    //   _________APPLICATION API____________
    //   post operation for apply job
    app.post("/job-applications", async (req, res) => {
      const application = req.body;
      const result = await jobApplicationCollection.insertOne(application);
      res.send(result);
    });

    //   query for email applicant
    app.get("/job-applications", async (req, res) => {
      const email = req.query.email;
      const query = { applicant_email: email };
      const result = await jobApplicationCollection.find(query).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// checking the server is working or not in local host
app.get("/", (req, res) => {
  res.send("Job Portal Server is working");
});

// in CMD
app.listen(port, () => {
  console.log(`Job Portal Server is running in port ${port}`);
});
