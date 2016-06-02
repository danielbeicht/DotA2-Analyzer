var express = require('express');
var app = express();
var path = require('path');
var sql = require('mssql');
//var fs = require("fs");
var http = require("http");
var bodyParser = require('body-parser');
var passport = require('passport');
var SteamStrategy = require('passport-steam').Strategy;
var cookie = require('cookie-parser');
var SteamID = require('steamid');
var request = require('request');

var steamAPIKey = "";

var dbConfig = {

};


app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use('/assets', express.static(path.join(process.cwd(), '..', 'assets')));
app.use('/app', express.static(path.join(process.cwd(), '..', 'app')));
app.use('/api', express.static(path.join(process.cwd(), '..', 'api')));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/../../public'));



// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Steam profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the SteamStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier and profile), and invoke a
//   callback with a user object.
passport.use(new SteamStrategy({
    returnURL: 'http://127.0.0.1/auth/steam/return',
    realm: 'http://127.0.0.1/',
    apiKey: steamAPIKey
  },
  function(identifier, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's Steam profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Steam account with a user record in your database,
      // and return that user instead.
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));



// GET /auth/steam
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Steam authentication will involve redirecting
//   the user to steamcommunity.com.  After authenticating, Steam will redirect the
//   user back to this application at /auth/steam/return
app.get('/auth/steam',
  passport.authenticate('steam', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });

// GET /auth/steam/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  function(req, res) {
    //console.log(req.user);
    res.cookie('user', JSON.stringify(req.user)).redirect('/');
    //res.json(req.user).redirect('/#/home')
    //res.redirect('/#/home');
  });
















app.get('/', function (req, res) {
  res.sendFile(path.join(process.cwd(), '..', 'index.html'));
});

app.get('/api/matchups', function (req, res){
  var conn = new sql.Connection(dbConfig);
  var req = new sql.Request(conn);
  conn.connect(function(err) {
    if (err) {
      console.log(err);
    }
    req.query("SELECT * FROM Matchup", function (err, recordset){
      if (err){
        console.log(err);
        return;
      } else {
        console.log("API: Matchups request")
      }
      conn.close();

      res.send(recordset);null;
    });
  });
});

app.get('/api/heroes', function (req, res){
  var conn = new sql.Connection(dbConfig);
  var req = new sql.Request(conn);
  conn.connect(function(err) {
    if (err) {
      console.log(err);
    }
    req.query("SELECT * FROM Held", function (err, recordset){
      if (err){
        console.log(err);
        return;
      } else {
        console.log("API: Heroes request")
      }
      conn.close();

      res.send(recordset);
    });
  });
});

app.post('/api/matchid', function (req, res){
  console.log (req.body.matchID);

  var counter = 0;
  var options = {
    host: 'api.steampowered.com',
    path: "/IDOTA2Match_570/GetMatchDetails/V001/?match_id=" + req.body.matchID + "&key=" + steamAPIKey
  };

  callback = function(response) {
    var str = '';

      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been recieved, so we just print it out here
      response.on('end', function () {
        if (response.statusCode == 200) {
          var obj = JSON.parse(str);
          //console.log(obj.result.players.length);
          if (obj && obj.result && obj.result.players) {
            var array = [];
            for (var i = 0; i < 10; i++) {
              array.push(obj.result.players[i].hero_id);
            }
            res.send(array);
          } else {
            res.send("notfound");
          }
        } else {
          console.log("DotA API has problems " + response.statusCode);
          if (counter < 10) {
            counter++;
            http.request(options, callback).end();
          } else {
            res.send("false");
          }

        }
      });
    }
    http.request(options, callback).end();
});

app.post('/api/getAccountID', function (req, res){
  var sid = new SteamID(req.body.steamID);
  var playerID = sid.getSteam3RenderedID();
  playerID = playerID.substring(playerID.indexOf(':')+1);
  playerID = playerID.substring(playerID.indexOf(':')+1);
  playerID = playerID.substring(0, playerID.length - 1);
  console.log ("Success getAccountID");
  res.send(playerID);
});

app.post('/api/getPlayerMatches', function (req, res){
  var host = "https://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/V001/?matches_requested=25&account_id=" + req.body.accountID + "&key=" + steamAPIKey;
  startRequest();
  function startRequest() {
    request(host, function(err, apiRes, body)  {
      if (!err && apiRes.statusCode == 200) {
        console.log("Success getPlayerMatches");
        return res.send(body);
      } else {
        console.log ("Steam API is busy - " + apiRes.statusCode + " - getPlayerMatches");
      }
      setTimeout(function () {
        startRequest();
      }, 1000);
    });
  }
});

app.post('/api/getPlayerMatch', function (req, res){
  var host = "https://api.steampowered.com/IDOTA2Match_570/GetMatchDetails/V001/?match_id=" + req.body.matchID + "&key=" + steamAPIKey;
  startRequest();
  function startRequest() {
    request(host, function(err, apiRes, body)  {
      if (!err && apiRes.statusCode == 200) {
        console.log("Match successfully");
        return res.send(body);
      } else {
        console.log ("Steam API is busy - " + apiRes.statusCode + " - getPlayerMatch");
      }
      setTimeout(function () {
        startRequest();
      }, 1000);
    });
  }
});

var server = app.listen(80, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Server is running at http://", host, port);
});