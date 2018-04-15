//litige-service.js
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = "mongodb://localhost:27017/marcel";

const service = module.service = {};

module.exports = exports = function(config) {
  // Do something with config here

  this.insert = function(litige){

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("marcel");
         dbo.collection("litiges").insertOne(litige, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
        });
    });
  }

  this.find = function(callback){
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("marcel");
      dbo.collection("litiges").find().toArray(function(err, result){
        console.log("Find: ", result);
      callback(result);
      }); 
      
    });
  }
};




