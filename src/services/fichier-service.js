//litige-service.js
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = "mongodb://localhost:27017/marcel";

const service = module.service = {};

module.exports = exports = function(config) {

  this.insert = function(fichiers){

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("marcel");
         dbo.collection("fichiers").insert(fichiers, function(err, res) {
          if (err) throw err;
          console.log("fichier(s) inséré(s)");
          db.close();
        });
    });
  }

  this.find = function(query,callback){

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("marcel");
      dbo.collection("fichiers").find(query).toArray(function(err, result){
        console.log("Fichier(s) trouvé(s): ", result);
      callback(result);
      }); 
      
    });
  }
};




