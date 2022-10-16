const express = require("express");
const readline = require("readline-sync");
const socketio = require("socket.io");
const crypto = require("crypto");
const cors = require("cors");
const {MongoClient} = require("mongodb");
const port = 3001;

const DBuser = encodeURIComponent(readline.question("please enter DB username: "));
const DBpass = encodeURIComponent(readline.question("please enter DB password: "));

const mongoClient = new MongoClient(`mongodb+srv://${DBuser}:${DBpass}@cluster0.uybyndw.mongodb.net/?retryWrites=true&w=majority`);

const app = express();
const corsPolicy = {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }
}

app.use(cors(corsPolicy));
app.use(express.json());

const server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

const io = socketio(server, corsPolicy);

app.get("/", (req, res) => {
  res.send("hello world");
  console.log("heet");
});

app.post("/login", async (req, res) => {
  console.log("login hit:");
  if(req.body.user === "admin") {
    try {
      await mongoClient.connect();
      const queryResult = await mongoClient
        .db("fancychatdb")
        .collection("users")
        .find({ user: req.body.user }).toArray();
      if(queryResult.length === 0) throw "user does not exist!";

      const queriedHash = queryResult[0].userHash;
      const candidateHash = crypto.createHash("md5").update(req.body.user + req.body.pass).digest("hex");
      if(candidateHash === queriedHash) {
        res.json({
          result: "success",
          auth: queriedHash 
        });
      } else {
        res.json({
          result: "fail"
        });
      }
    } catch(e) {
      res.json({
        result: "error"
      });
      console.error(e);
    } finally {
      await mongoClient.close();
    }
  } else { // for now, authenticate literally everyone except for admin
    res.json({
      result: "success",
      auth: crypto.createHash("md5").update(req.body.user + req.body.pass).digest("hex")
    });
  }
});

app.post("/login/verify", (req, res) => {
  console.log("login verification hit:");

});

app.get("/messages/get20", async (req, res) => {
  console.log("message get 20 hit:");
  try{
    await mongoClient.connect();
    const queryResult = await mongoClient.db("fancychatdb")
      .collection("messages")
      .find()
      .sort({ time: -1 })
      .limit(20)
      .toArray();
    res.json(queryResult);
  } catch(e) {
    console.error(e);
  } finally {
    await mongoClient.close();
  }
});

// socket events
io.on("connection", (socket) => {
  console.log("connection initiated");

  socket.on("send_message", async (data) => {
    console.log("message received from: " + data.user);
    try{
      console.log("updating database with message...");
      await mongoClient.connect();
      await mongoClient.db("fancychatdb")
        .collection("messages")
        .insertOne(data);
      console.log("success, updating feeds");
      io.emit("update_feed", data);
    } catch(e) {
      console.error(e);
    } finally {
      await mongoClient.close();
    }
  });

  socket.on("disconnect", () => {
    console.log(`socket disconnected: ${socket.id}`);
  });
});
