const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const mongoClient = require("../db.js");

router.post("/", async (req, res) => {
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

router.post("/signup", (req, res) => {
  console.log("signup");
});

module.exports = router;
