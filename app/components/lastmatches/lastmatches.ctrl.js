/**
 * Created by Daniel on 19.01.2016.
 */
(function () {
    'use strict';

    angular
        .module('DotAAnalyzerApp')
        .controller('lastmatchesCtrl', lastmatchesCtrl);

    lastmatchesCtrl.$inject = ['$scope', '$log', '$http', '$cookies', 'datastorage', '$q'];


    function lastmatchesCtrl($scope, $log, $http, $cookies, datastorage, $q) {
        $scope.loggedIn = false;
        $scope.tableMatches = [];
        $scope.heroesValve = datastorage.heroesValve;

        $scope.getWinString = function (playerWin){
            if (playerWin){
                return "Won Match";
            } else {
                return "Lost Match";
            }
        }


        $scope.logout = function() {
            $cookies.remove('user');
            $scope.loginFunction();
        }

        $scope.loginFunction = function(){
            if ($cookies.get('user')){
                //console.log($cookies.get('user'));
                var obj = JSON.parse($cookies.get('user'));
                //console.log(obj);
                $scope.username = obj.displayName;
                $scope.loggedIn = true;
                $scope.steamID = obj.id;
            } else {
                $scope.message = "Not logged in";
                $scope.loggedIn = false;
            }
        }
        $scope.loginFunction();

        // Get Account ID
        var dataObj = {
            steamID : $scope.steamID
        };

        $q.all([
            $http({
                method: 'POST',
                url: 'api/getAccountID',
                data: dataObj
            }).then(function successCallback(response) {
                $scope.accountID = response.data;
                console.log("ACID is" + $scope.accountID);

            }, function errorCallback(response) {
                console.log("Get AccountID failed.")
            }),









          ]).then(function(){
            dataObj = {
                accountID : $scope.accountID
            };

            $http({
                method: 'POST',
                url: 'api/getPlayerMatches',
                data: dataObj
            }).then(function successCallback(response) {
                if (response.data == "notfound"){

                } else if (response.data == "false") {
                    $scope.showAPIError = true;
                } else {
                    $scope.matches = response.data.result.matches;
                    console.log(response.data.result.matches);
                    parseMatch();
                }
            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            })

        })
/*
        $http({
            method: 'POST',
            url: 'api/getAccountID',
            data: dataObj
        }).then(function successCallback(response) {
            $scope.accountID = response.data;
            console.log("ACID is" + $scope.accountID);
        }, function errorCallback(response) {
            console.log("Get AccountID failed.")
        });

        // Get latest matches
        var dataObj = {
            accountID : $scope.accountID
        };
        $http({
            method: 'POST',
            url: 'api/getPlayerMatches',
            data: dataObj
        }).then(function successCallback(response) {
            if (response.data == "notfound"){

            } else if (response.data == "false") {
                $scope.showAPIError = true;
            } else {
                $scope.matches = response.data.result.matches;
                console.log(response.data.result.matches);
                parseMatch();
            }
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        }).finally(function() {
            $scope.parsingMatch = false;
        });

*/



        function parseMatch(){
            var counter = 0;
            // Parse matches
            for (var i = 0; i < $scope.matches.length; i++){
                if ($scope.matches[i].lobby_type == 0){

                    var data = {matchID: $scope.matches[i].match_id};
                    $q.all([
                        $http({
                            method: 'POST',
                            url: 'api/getPlayerMatch',
                            data: data
                        }).then(function successCallback(response) {
                            console.log (response.data);

                            for (var j=0; i<response.data.result.players.length; j++){
                                if (response.data.result.players[j].account_id == $scope.accountID){
                                    var singleMatch = new Object();
                                    singleMatch.firstPlayerHero = $scope.heroesValve[response.data.result.players[j].hero_id].heroFullName;
                                    singleMatch.matchID = response.data.result.match_id;
                                    console.log("Name " + $scope.heroesValve[response.data.result.players[j].hero_id].heroFullName);
                                    if (response.data.result.radiant_win && response.data.result.players[j].player_slot < 5){
                                        singleMatch.firstPlayerWin = true;
                                    } else {
                                        singleMatch.firstPlayerWin = false;
                                    }
                                    console.log ("ES IST NAME " + singleMatch.firstPlayerHero);
                                    console.log (singleMatch);
                                    $scope.tableMatches.push(singleMatch);
                                    //$scope.tableMatches[counter] = singleMatch;
                                    counter++;
                                    break;
                                }
                            }

                        }, function errorCallback(response) {
                            console.log(response);
                        })
                    ]).then(function(){
                        console.log($scope.tableMatches);
                        console.log("Länge ist " + $scope.tableMatches.length);
                    })
                }
            }
        }
    }
    })();


