/**
 * Created by Daniel on 19.01.2016.
 */
(function () {
    'use strict';

    angular
        .module('DotAAnalyzerApp')
        .controller('lastmatchesCtrl', lastmatchesCtrl);

    lastmatchesCtrl.$inject = ['$scope', '$http', 'datastorage', '$q', 'DALogin', 'DAAnalyzer'];


    function lastmatchesCtrl($scope, $http, datastorage, $q, DALogin, DAAnalyzer) {
        $scope.testfunc = function() {
            //DAAnalyzer.yourTeamHeroPick(10);
            //DAAnalyzer.enemyTeamHeroPick(50);

            $scope.stacked = DAAnalyzer.getBarValues();



            alert(DAAnalyzer.yourTeamOverallAdvantage);
        }



        $scope.loginService = DALogin;
        $scope.loginService.loginFunction();

        $scope.analyzerService = DAAnalyzer;

        $scope.tableMatches = [];
        $scope.heroesValve = datastorage.heroesValve;
        $scope.getWinString = function (playerWin){
            if (playerWin){
                return "Won Match";
            } else {
                return "Lost Match";
            }
        }



        // Get Account ID
        var dataObj = {
            steamID : DALogin.getSteamID()
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



        function parseMatch(){
            // Parse matches
            for (var i = 0; i < $scope.matches.length; i++){
                if ($scope.matches[i].lobby_type == 0 || $scope.matches[i].lobby_type == 7){ // Normal or ranked

                    var data = {matchID: $scope.matches[i].match_id};
                    $q.all([
                        $http({
                            method: 'POST',
                            url: 'api/getPlayerMatch',
                            data: data
                        }).then(function successCallback(response) {
                            DAAnalyzer.resetData();
                            var singleMatch = new Object();
                            for (var j=0; j<(response.data.result.players.length); j++){
                                if (response.data.result.players[j].player_slot < 5){
                                    DAAnalyzer.yourTeamHeroPick(datastorage.heroesValve[response.data.result.players[j].hero_id].heroIndex);
                                } else {
                                    DAAnalyzer.enemyTeamHeroPick(datastorage.heroesValve[response.data.result.players[j].hero_id].heroIndex);
                                }

                                if (response.data.result.players[j].account_id == $scope.accountID){
                                    singleMatch.firstPlayerHero = $scope.heroesValve[response.data.result.players[j].hero_id].heroFullName;
                                    singleMatch.heroImageURL = $scope.heroesValve[response.data.result.players[j].hero_id].heroImageURL;
                                    singleMatch.matchID = response.data.result.match_id;
                                    singleMatch.date = new Date(response.data.result.start_time*1000).toLocaleString();
                                    if (response.data.result.radiant_win && response.data.result.players[j].player_slot < 5){
                                        singleMatch.firstPlayerWin = true;
                                    } else if (!response.data.result.radiant_win && response.data.result.players[j].player_slot > 5) {
                                        singleMatch.firstPlayerWin = true;
                                    } else {
                                        singleMatch.firstPlayerWin = false;
                                    }

                                    if (response.data.result.players[j].player_slot < 5){
                                        singleMatch.isRadiant = true;
                                    } else {
                                        singleMatch.isRadiant = false;
                                    }
                                }

                                if (j == response.data.result.players.length-1){
                                    singleMatch.stacked = DAAnalyzer.getBarValues(singleMatch.isRadiant);
                                    $scope.tableMatches.push(singleMatch);
                                }

                            }


                        }, function errorCallback(response) {
                            console.log(response);
                        })
                    ]).then(function(){

                        //console.log($scope.tableMatches);
                        //console.log("Länge ist " + $scope.tableMatches.length);
                    })
                }
            }
        }
    }
    })();


