const express = require("express");
const router = express.Router();
const mongoClient = require("../db.js");

router.get("/get20", async (req, res) => {
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

module.exports = router;
