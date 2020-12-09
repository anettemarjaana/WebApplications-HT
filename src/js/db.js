/* This code has been borrowed from the Express v4 demo code. */
var MongoClient = require("mongodb").MongoClient;

// This is a singleton type structure for holding the DB connection

const dbname = "anglerdb";

var state = {
  db: null
};

exports.connect = function (url, done) {
  if (state.db) return done();

  MongoClient.connect(url, function (err, client) {
    if (err) return done(err);
    // Addition: Connecting to right DB
    state.db = client.db(dbname);
    done();
  });
};

exports.get = function () {
  return state.db;
};

exports.close = function (done) {
  if (state.db) {
    state.db.close(function (err, result) {
      state.db = null;
      state.mode = null;
      done(err);
    });
  }
};

// This is a helper function for building the OPENSHIFT Mongo connection string
exports.urlbuilder = function () {
  // Reading env variables (config example from https://github.com/sclorg/nodejs-ex/blob/master/server.js)
  var mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL;
  var mongoURLLabel = "";

  // For local dev
  // var mongoURL = 'mongodb://localhost:27017/demodb';

  if (mongoURL == null) {
    var mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
    // If using plane old env vars via service discovery
    if (process.env.DATABASE_SERVICE_NAME) {
      var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
      mongoHost = process.env[mongoServiceName + "_SERVICE_HOST"];
      mongoPort = process.env[mongoServiceName + "_SERVICE_PORT"];
      mongoDatabase = process.env[mongoServiceName + "_DATABASE"];
      mongoPassword = process.env[mongoServiceName + "_PASSWORD"];
      mongoUser = process.env[mongoServiceName + "_USER"];

      // If using env vars from secret from service binding
    } else if (process.env.database_name) {
      mongoDatabase = process.env.database_name;
      mongoPassword = process.env.password;
      mongoUser = process.env.username;
      var mongoUriParts = process.env.uri && process.env.uri.split("//");
      if (mongoUriParts.length == 2) {
        mongoUriParts = mongoUriParts[1].split(":");
        if (mongoUriParts && mongoUriParts.length == 2) {
          mongoHost = mongoUriParts[0];
          mongoPort = mongoUriParts[1];
        }
      }
    }

    if (mongoHost && mongoPort && mongoDatabase) {
      mongoURLLabel = mongoURL = "mongodb://";
      if (mongoUser && mongoPassword) {
        mongoURL += mongoUser + ":" + mongoPassword + "@";
      }
      // Provide UI label that excludes user id and pw
      mongoURLLabel += mongoHost + ":" + mongoPort + "/" + mongoDatabase;
      mongoURL += mongoHost + ":" + mongoPort + "/" + mongoDatabase;
    }
  }

  return mongoURL;
};
