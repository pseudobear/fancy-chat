const { MongoClient } = require("mongodb");
const readline = require("readline-sync");

const DBuser = encodeURIComponent(readline.question("please enter DB username: "));
const DBpass = encodeURIComponent(readline.question("please enter DB password: "));

const mongoClient = new MongoClient(`mongodb+srv://${DBuser}:${DBpass}@cluster0.uybyndw.mongodb.net/?retryWrites=true&w=majority`);

module.exports = mongoClient;
