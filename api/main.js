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
app.get('/auth/steams',
  passport.authenticate('steam', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/about');
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



app.get('/auth/testlogin',
  passport.authenticate('steam', { failureRedirect: '/about' }),
  function(req, res) {
    res.redirect('/about');
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

      res.send(recordset);
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

  var host = "https://api.steampowered.com/IDOTA2Match_570/GetMatchDetails/V001/?match_id=" + req.body.matchID + "&key=" + steamAPIKey;
  startRequest();
  function startRequest() {
    request(host, function(err, apiRes, body)  {
      if (!err && apiRes.statusCode == 200) {
        var obj = JSON.parse(body);
        if (obj && obj.result && obj.result.players) {
          var array = [];
          for (var i = 0; i < 10; i++) {
            array.push(obj.result.players[i].hero_id);
          }
          return res.send(array);
        } else {
          return res.send("notfound");
        }
      } else {
        console.log ("Steam API is busy - " + apiRes.statusCode + " - getPlayerMatches");
      }
      setTimeout(function () {
        startRequest();
      }, 1000);
    });
  }
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
  var host = "https://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/V001/?matches_requested=100&account_id=" + req.body.accountID + "&key=" + steamAPIKey;
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
        console.log("Match " + req.body.matchID + " successfully");
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





// New logic for automatic match calculations
var accountMatches = {};

app.post('api/autosync/newMatch', function (req, res) {
  accountMatches[req.body.accountID] = { pickPhase: true, heroesRadiant: [], heroesDire: [] }
  res.send("OK");
});

app.post('api/autosync/matchStart', function (req, res) {
  accountMatches[req.body.accountID].pickPhase = false;
  res.send("OK");
});

app.post('api/autosync/finishMatch', function (req, res) {
  delete accountMatches[req.body.accountID];
  res.send("OK");
});

app.post('api/autosync/addHeroToMatch', function (req, res) {
  if (req.body.isRadiant) {
    accountMatches[req.body.accountID].heroesRadiant.push(req.body.heroID)
  } else {
    accountMatches[req.body.accountID].heroesDire.push(req.body.heroID)
  }
  res.send("OK");
});

app.get('api/autosync/getMatch', function (req, res) {
  res.send(accountMatches[req.body.accountID]);
});





var server = app.listen(80, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Server is running at http://", host, port);
});