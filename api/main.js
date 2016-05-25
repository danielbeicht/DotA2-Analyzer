/**
 * Created by Daniel on 13.02.2016.
 */
var express = require('express');
var app = express();
var path = require('path');
var sql = require('mssql');
var fs = require("fs");
var http = require("http");
var bodyParser = require('body-parser');

var dbConfig = {

};

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use('/assets', express.static(path.join(process.cwd(), '..', 'assets')));
app.use('/app', express.static(path.join(process.cwd(), '..', 'app')));
app.use('/api', express.static(path.join(process.cwd(), '..', 'api')));

app.get('/', function (req, res) {
  res.sendFile(path.join(process.cwd(), '..', 'index.html'));
})

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
    })
  })
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
    })
  })
});

app.post('/api/matchid', function (req, res){
  console.log (req.body.matchID);

  var counter = 0;
  var options = {
    host: 'api.steampowered.com',
    path: "/IDOTA2Match_570/GetMatchDetails/V001/?match_id=" + req.body.matchID + "&key=A24667A333B3C275113B6FB6B3401403"
  };

  callback = function(response) {
    var str = '';

    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function (chunk) {
      str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
      if (response.statusCode == 200){
        var obj = JSON.parse(str);
        //console.log(obj.result.players.length);
        if (obj && obj.result && obj.result.players){
          var array = [];
          for (var i=0; i<10; i++){
            array.push(obj.result.players[i].hero_id);
          }
          res.send(array);
        } else {
          res.send("notfound");
        }
      } else {
        console.log ("DotA API has problems");
        if (counter < 10){
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



var server = app.listen(80, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Server is running at http://", host, port)

})
