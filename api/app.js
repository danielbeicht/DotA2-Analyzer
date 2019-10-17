var express = require('express');
var app = express();
var path = require('path');
var sql = require('mssql');
var bodyParser = require('body-parser');
var passport = require('passport');
var SteamStrategy = require('passport-steam').Strategy;
var SteamID = require('steamid');
var request = require('request');

const opendotaAPI = "https://api.opendota.com/api/";
const steamAPI = "https://api.steampowered.com/";
const hostURL = "http://127.0.0.1";

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

var restResponse = {};
restResponse.status = 0;
restResponse.text = "Success";

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
    returnURL: hostURL + '/auth/steam/return',
    realm: hostURL,
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
  let conSQL = new sql.Connection(dbConfig);
  let reqSQL = new sql.Request(conSQL);
  conSQL.connect(function(err) {
    if (err) {
      console.log(err);
    }
    reqSQL.query("SELECT * FROM Matchup", function (err, recordset){
      if (err){
        console.log(err);
        return;
      } else {
        console.log("API: Matchups request")
      }
      conSQL.close();

      res.send(recordset);
    });
  });
});

app.get('/api/heroes', function (req, res){
  let conSQL = new sql.Connection(dbConfig);
  let reqSQL = new sql.Request(conSQL);
  conSQL.connect(function(err) {
    if (err) {
      console.log(err);
    }
    reqSQL.query("SELECT * FROM Held", function (err, recordSet){
      if (err){
        console.log(err);
        return;
      } else {
        console.log("API: Heroes request")
      }
      conSQL.close();
      res.send(recordSet);
    });
  });
});

app.post('/api/matchid', function (req, res){
  let host = steamAPI + "IDOTA2Match_570/GetMatchDetails/V001/?match_id=" + req.body.matchID + "&key=" + steamAPIKey;
  startRequest();
  function startRequest() {
    request(host, function(err, apiRes, body)  {
      if (!err && apiRes.statusCode === 200) {
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
  let sid = new SteamID(req.body.steamID);
  let playerID = sid.getSteam3RenderedID();
  playerID = playerID.substring(playerID.indexOf(':')+1);
  playerID = playerID.substring(playerID.indexOf(':')+1);
  playerID = playerID.substring(0, playerID.length - 1);
  console.log ("Success getAccountID");

  res.send(playerID);
});


app.post('/api/getPlayerMatches', function (req, res){
  let host = steamAPI + "IDOTA2Match_570/GetMatchHistory/V001/?matches_requested=100&account_id=" + req.body.accountID + "&key=" + steamAPIKey;
  startRequest();
  function startRequest() {
    request(host, function(err, apiRes, body)  {
      if (!err && apiRes.statusCode === 200) {
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
  let host = steamAPI + "IDOTA2Match_570/GetMatchDetails/V001/?match_id=" + req.body.matchID + "&key=" + steamAPIKey;
  startRequest();
  function startRequest() {
    request(host, function(err, apiRes, body)  {
      if (!err && apiRes.statusCode === 200) {
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

app.post('/api/autosync/newMatch', function (req, res) {
  delete accountMatches[req.body.accountID];
  accountMatches[req.body.accountID] = { pickPhase: true, heroesRadiant: [], heroesDire: [] };
  res.send("OK new match");
});

// additional feature to reduce server load
app.post('/api/autosync/matchStart', function (req, res) {
  accountMatches[req.body.accountID].pickPhase = false;
  res.send("OK");
});

// additional feature to reduce server load
app.post('/api/autosync/finishMatch', function (req, res) {
  delete accountMatches[req.body.accountID];
  res.send("OK");
});

app.post('/api/autosync/addHeroToMatch', function (req, res) {
  if (req.body.isRadiant) {
    accountMatches[req.body.accountID].heroesRadiant.push(req.body.heroID)
  } else {
    accountMatches[req.body.accountID].heroesDire.push(req.body.heroID)
  }
  res.send("OK");
});

app.post('/api/autosync/getMatch', function (req, res) {
  if (typeof accountMatches[req.body.accountID] === 'undefined'){
    res.send( { heroesRadiant: [], heroesDire: [] })
  }
  else{
    res.send(accountMatches[req.body.accountID]);
  }
});

// Fill test data
//accountMatches["76561198026188411"] = { pickPhase: true, heroesRadiant: [], heroesDire: [] }
//accountMatches["76561198026188411"].heroesRadiant.push(5);




// New logic for saving friends
app.post('/api/friends/addFriend', function (req, res) {
  let steamID = calcSteamID(req.body.accountID);
  // create player in database
  let conSQL = new sql.Connection(dbConfig);
  let reqSQL = new sql.Request(conSQL);
  conSQL.connect(function(err) {
    if (err) {
      console.log(err);
    }

    reqSQL.query("INSERT INTO account (AccountID) VALUES (" + calcSteamID(req.body.accountID) + ")").then(function(recordSet) {
      console.log('Recordset: ' + recordSet);
      console.log('Affected: ' + request.rowsAffected);
    }).catch(function(err) {
      console.log('Request error: ' + err);
    });

    reqSQL.query("INSERT INTO AccountFriend VALUES (" + steamID +", '" + req.body.name + "')").then(function(recordSet) {
      console.log('Recordset: ' + recordSet);
      console.log('Affected: ' + request.rowsAffected);
      res.send("OK");
    }).catch(function(err) {
      console.log('Request error: ' + err);
      res.send("Error");
    });
  });
});

app.post('/api/friends/friendlist', function (req, res) {
  let conSQL = new sql.Connection(dbConfig);
  let reqSQL = new sql.Request(conSQL);
  conSQL.connect(function(err) {
    if (err) {
      console.log(err);
    }

    reqSQL.query("SELECT FriendName FROM AccountFriend WHERE AccountID=(" + calcSteamID(req.body.accountID) + ")").then(function (recordSet) {
      res.send(JSON.stringify(recordSet));
    }).catch(function (err) {
      console.log('Request error: ' + err);
      res.send("ERROR");
    });
  });
});

app.post('/api/friends/deleteFriend', function (req, res) {
  let conSQL = new sql.Connection(dbConfig);
  let reqSQL = new sql.Request(conSQL);
  conSQL.connect(function(err) {
    if (err) {
      console.log(err);
    }

    reqSQL.query("DELETE FROM AccountFriendHero WHERE AccountID=" + calcSteamID(req.body.accountID) + " AND FriendName='" + req.body.name + "'").then(function () {
      res.send("Deleted");
    }).catch(function (err) {
      console.log('Request error: ' + err);
      res.send("ERROR");
    });

    reqSQL.query("DELETE FROM AccountFriend WHERE AccountID=" + calcSteamID(req.body.accountID) + " AND FriendName='" + req.body.name + "'").then(function () {
      res.send("Deleted");
    }).catch(function (err) {
      console.log('Request error: ' + err);
      res.send("ERROR");
    });
  });
});


app.post('/api/friends/addHeroToFriend', function (req, res) {
  let steamID = calcSteamID(req.body.accountID);
  // create player in database
  let conSQL = new sql.Connection(dbConfig);
  let reqSQL = new sql.Request(conSQL);
  conSQL.connect(function(err) {
    if (err) {
      console.log(err);
    }

    reqSQL.query("INSERT INTO AccountFriendHero VALUES (" + steamID +", '" + req.body.name + "', " + req.body.heroID + ")").then(function(recordset) {
      restResponse.status = 200;
      restResponse.text = "Hero successfully added.";
      res.send(JSON.stringify(restResponse));
    }).catch(function(err) {
      restResponse.status = 400;
      restResponse.text = "Hero already selected.";
      console.log('Request error: ' + err);
      res.send(JSON.stringify(restResponse));
    });
  });
});

app.post('/api/friends/deleteFriendHero', function (req, res) {
  let conSQL = new sql.Connection(dbConfig);
  let reqSQL = new sql.Request(conSQL);
  conSQL.connect(function(err) {
    if (err) {
      console.log(err);
    }

    reqSQL.query("DELETE FROM AccountFriendHero WHERE AccountID=" + calcSteamID(req.body.accountID) + " AND FriendName='" + req.body.name + "' AND HeroID=" + req.body.heroID).then(function (recordset) {
      res.send("Deleted");
    }).catch(function (err) {
      console.log('Request error: ' + err);
      res.send("ERROR");
    });
  });
});

app.post('/api/friends/friendHeroList', function (req, res) {
  let conSQL = new sql.Connection(dbConfig);
  let reqSQL = new sql.Request(conSQL);
  conSQL.connect(function(err) {
    if (err) {
      console.log(err);
    }

    reqSQL.query("SELECT * FROM AccountFriendHero WHERE AccountID=(" + calcSteamID(req.body.accountID) + ") AND FriendName='" + req.body.name + "'").then(function (recordset) {
      res.send(JSON.stringify(recordset));
    }).catch(function (err) {
      console.log('Request error: ' + err);
      res.send("ERROR");
    });
  });
});


// Opendota most played heroes
app.get('/api/accountHeroes', function (req, res) {
  let steamID = req.query.id;
  let accountID = new SteamID(steamID).accountid;
  let host = opendotaAPI + "players/" + accountID + "/heroes";

  request(host, function(err, apiRes, body)  {
    if (!err && apiRes.statusCode === 200) {
      res.send(body)
    } else {
      res.send('ERROR')
    }
  });
});




function calcSteamID(id){
  let sid = new SteamID(id);
  let playerID = sid.getSteam3RenderedID();
  playerID = playerID.substring(playerID.indexOf(':')+1);
  playerID = playerID.substring(playerID.indexOf(':')+1);
  playerID = playerID.substring(0, playerID.length - 1);
  return playerID;
}





var server = app.listen(80, function () {
  let host = server.address().address;
  let port = server.address().port;
  console.log("Server is running at http://", host, port);
});