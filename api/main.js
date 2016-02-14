/**
 * Created by Daniel on 13.02.2016.
 */
var express = require('express');
var app = express();
var path = require('path');
var sql = require('mssql');
var fs = require("fs");

var dbConfig = {
  server: "192.168.2.202",
  database: "",
  user: "",
  password: "",
  port: 1433
};


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

var server = app.listen(1339, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Server is running at http://", host, port)

})
