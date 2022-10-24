const express = require("express");
const socketio = require("socket.io");
const crypto = require("crypto");
const cors = require("cors");
const mongoClient = require("./db.js");

const loginRoutes = require("./routes/login.js");
const messagesRoutes = require("./routes/messages.js");

const port = 3001;
const app = express();

// middleware
const corsPolicy = {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }
}
app.use(cors(corsPolicy));
app.use(express.json());

// routes
app.use("/login", loginRoutes);
app.use("/messages", messagesRoutes);

const server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

const io = socketio(server, corsPolicy);

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
