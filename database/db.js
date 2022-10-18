const { MongoClient } = require("mongodb");

let state = { db: null };
let Client;

mongodbCreateConnection = () => {
  Client = new MongoClient(process.env.MONGODB_URL);
  Client.connect()
    .then((connection) => {
      const msg = `Mongo db connection established to ${process.env.MONGODB_URL} `;
      console.log(msg); //
      state.db = connection.db();
      return state.db;
    })
    .catch((err) => {
      console.log(`Error DB Connection : ${err}`); // Use Logger Here
      process.exit(0);
    });
};

getConnection = () => {
  return state.db;
};

closeConnection = () => {
  if (Client) {
    Client.close();
    console.log("Connection terminated successfully");
  } else {
    console.log('Failed "connection does not exist"');
  }
};

module.exports = { mongodbCreateConnection, getConnection , closeConnection }