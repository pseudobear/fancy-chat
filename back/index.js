const express = require("express");
const socketio = require("socket.io");
const crypto = require("crypto");
const cors = require("cors");
const SpellChecker = require("spellchecker")
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

app.get("/", (req, res) => {
  res.send("good, alive");
});

// message socket stuff below

const checkFullString = (str) => {
  const errors = SpellChecker.checkSpelling(str);
  let posDiff = 0;
  let correct = true;
  for(let error of errors) {
    let word = str.substring(error.start + posDiff, error.end + posDiff);
    let correction = SpellChecker.getCorrectionsForMisspelling(word)[0];
    if(!correction) { // uncorrectable error
      correct = false;
      continue;
    }
    str = str.substring(0, error.start + posDiff) + 
      correction + 
      str.substring(error.end + posDiff);
    posDiff += correction.length - word.length;
  }
  return { message: str, correct };
}

const io = socketio(server, corsPolicy);

// socket events
io.on("connection", (socket) => {
  console.log("connection initiated");

  socket.on("send_message", async (data) => {
    console.log("message received from: " + data.user);
    try {
      const postCheck = checkFullString(data.message);
      if(postCheck.correct) {
        console.log("   message spellchecked");
        data.message = checkFullString(data.message).message;
        console.log("updating database with message...");
        await mongoClient.connect();
        await mongoClient.db("fancychatdb")
          .collection("messages")
          .insertOne(data);
        console.log("success, updating feeds");
        io.emit("update_feed", data);
      } else {
        console.log("   failed to spell check message");
        socket.emit("bad_message", "on send single");
      }
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
