const express = require("express");
const socketio = require("socket.io");
const crypto = require("crypto");
const cors = require("cors");
const mysql = require("mysql");
const port = 3001;

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

app.post("/login", (req, res) => {
  console.log("login hit:");
  if(req.body.user === "admin") {
    res.json({
      result: "fail"
    });
  } else {
    res.json({
      result: "success",
      auth: crypto.createHash("md5").update(req.body.user + req.body.pass).digest("hex")
    });
  }
});

app.post("/login/verify", (req, res) => {
  console.log("login verification hit:");

});

// socket events
io.on("connection", (socket) => {
  console.log("connection initiated");

  socket.on("send_message", (data) => {
    console.log("message received from: " + data.user);
    io.emit("update_feed", data);
  });

  socket.on("disconnect", () => {
    console.log(`socket disconnected: ${socket.id}`);
  });
});
