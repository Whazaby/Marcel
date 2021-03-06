//litige-service.js
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = "mongodb://localhost:27017/marcel";

const service = module.service = {};

module.exports = exports = function(config) {

  this.insert = function(litige,callback){

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("marcel");
         dbo.collection("litiges").insertOne(litige, function(err, res) {
          if (err) throw err;
          console.log("Litige inséré: ",res.ops[0]);
          callback(res.ops[0]);
          db.close();
        });
    });
  }

  this.update = function(id,litige){

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("marcel");
         dbo.collection("litiges").updateOne(id,{ $set: litige}, function(err, res) {
          if (err) throw err;
          console.log("1 document updated");
          db.close();
        });
    });
  }

  this.find = function(query,callback){
    console.log("Query: ",query);

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("marcel");
      console.log("Query: ",query);
      dbo.collection("litiges").find(query).toArray(function(err, result){
        console.log("Find: ", result);
      callback(result);
      }); 
      
    });
  }
};




