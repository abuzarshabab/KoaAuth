const { MongoClient } = require('mongodb')


let state = { db: null };
let Client


exports.connect = () => {
  Client = new MongoClient(process.env.MONGODB_URL);
  Client.connect()
  .then(connection => {
          const msg = `Mongo db connection established to ${process.env.MONGODB_URL} `
          console.log(msg) //
          state.db = connection.db();
          return state.db;
        })
        .catch(err => {
          console.log(`Error DB Connection : ${err}`); // Use Logger Here
          process.exit(0);
        })
      }
      
      exports.db = () => {
        return state.db
      };
      
      exports.close = () => {
        if (Client) {
          Client.close();
          console.log('Connection terminated successfully');
        } else {
          console.log('Failed "connection does not exist"');
        }
      }
      
      // exports.MongoDBConnect = async () => {
      //   Client = new MongoClient(process.env.MONGODB_URL);
      //   Client.connect()
      //       .then(connection => {
      //           console.log(`MongoDB connection established to ${process.env.MONGODB_URL} `) 
      //           database.connection = connection.db();
      //       })
      //       .catch(error => {
      //           console.log(`Error DB Connection : ${error}`); // Use Logger Here
      //           process.exit(0);
      //       })
      // }

// exports.MongoDBConnection = async () => {
//   console.log('Mongodb Request fo connection')
//   if(!database.connection) {
//     console.error('Connection is broken, Trying to reconnect')
//     await this.MongoDBConnect()
//   }

//   return database.connection;
// } 
// exports.close = () => {
//   if (Client) {
//       Client.close();
//       console.log('Connection terminated successfully');
//   } else {
//       console.log('Failed "connection does not exist"');
//   }
// }