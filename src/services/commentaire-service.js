//litige-service.js
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = "mongodb://localhost:27017/marcel";

const service = module.service = {};

module.exports = exports = function(config) {

  this.insert = function(commentaire){
  
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("marcel");
         dbo.collection("commentaires").insertOne(commentaire, function(err, res) {
          if (err) throw err;
          console.log("1 commentaire inséré");
          db.close();
        });
    });
  }

  this.update = function(id,commentaire){

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("marcel");
         dbo.collection("commentaires").updateOne(id,{ $set: commentaire}, function(err, res) {
          if (err) throw err;
          console.log("1 commentaire mis à jour");
          db.close();
        });
    });
  }

  this.find = function(query,callback){

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("marcel");
      console.log("Query: ",query);
      dbo.collection("commentaires").find(query).toArray(function(err, result){
        console.log("Commentaire(s) trouvé(s): ", result);
      callback(result);
      }); 
      
    });
  }
};




