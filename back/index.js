const express = require("express");
const socketio = require("socket.io");
const crypto = require("crypto");
const cors = require("cors");
const mongoClient = require("./db.js");

const port = 3001;

const loginRoutes = require("./routes/login.js");

const app = express();
const corsPolicy = {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }
}

app.use(cors(corsPolicy));
app.use(express.json());

app.use("/login", loginRoutes);

const server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

const io = socketio(server, corsPolicy);

app.get("/messages/get20", async (req, res) => {
  console.log("message get 20 hit:");
  try {
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
