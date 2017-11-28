/**
 * Created by Daniel on 19.01.2016.
 */
(function () {
    'use strict';

    angular
        .module('DotAAnalyzerApp')
        .controller('loadingCtrl', loadingCtrl);

    loadingCtrl.$inject = ['$scope', '$log', '$http', '$location', 'datastorage', 'DAAnalyzer'];



    function loadingCtrl($scope, $log, $http, $location, datastorage, DAAnalyzer) {
        $scope.dataLoaded = false;
        datastorage.loaded = true;

        datastorage.selectedFriends = [];



        function storeInWebStorage(key, arr) {
            localStorage.setItem(key, JSON.stringify(arr));
        }

        function retrieveFromWebStorage(key) {
            return JSON.parse(localStorage.getItem(key));
        }

        var loadData = false;

        if (retrieveFromWebStorage("offline") === null) {
            loadData = true
        } else {
            var d = new Date();
            var actualTime = Math.round(d.getTime() / 259200);  // reload every 3 days
            var offlineTime = localStorage.getItem("offline");

            var dif = actualTime - offlineTime;

            if (dif > 50) {
                loadData = true;
            }
        }


        if (loadData) {
            // Get all Matchup-data
            function matchupRequest(){
                $http({
                    method: 'GET',
                    url: 'api/matchups'
                }).then(function successCallback(response) {

                    var matchups = [];
                    for (var heroID in $scope.heroes) {
                        matchups[$scope.heroes[heroID.toString()].heroID.toString()] = {}
                        for (var heroID1 in $scope.heroes) {
                            matchups[$scope.heroes[heroID.toString()].heroID.toString()][$scope.heroes[heroID1.toString()].heroID.toString()] = {};
                        }
                    }


                    for (var i=0; i<response.data.length; i++) {
                        matchups[response.data[i].HeldID1.toString()][response.data[i].HeldID2.toString()] = response.data[i]
                    }

                    $log.info("Matchups Initialized");

                    datastorage.matchups = matchups;

                    storeInWebStorage("matchups", matchups);
                    var d = new Date();
                    localStorage.setItem("offline", Math.round(d.getTime() / 1000));

                    DAAnalyzer.init();

                    $scope.dataLoaded = true;

                    $location.path( "/home" );

                }, function errorCallback(response) {

                });
            }

            // Get all heroes
            $http({
                method: 'GET',
                url: 'api/heroes'
            }).then(function successCallback(response) {
                $scope.heroes = {}
                for (let i = 0; i < response.data.length; i++) {
                    $scope.heroes[response.data[i].HeldID.toString()] = {
                        heroID: response.data[i].HeldID,
                        heroFullName: response.data[i].HeldFullName,
                        heroImageURL: 'assets/images/heroes/' + response.data[i].HeldFullName.trim().replace(/\s/gi, "_") + '.jpg',
                        yourTeamAdvantage: 0,
                        enemyTeamAdvantage: 0,
                        yourTeamWinrate: '0.00',
                        enemyTeamWinrate: '0.00'
                    };

                }

                $log.info("Heroes Initialized");
                datastorage.heroes = $scope.heroes;
                storeInWebStorage("heroes", datastorage.heroes);
                datastorage.heroesArray = [];

                for (var heroID in $scope.heroes) {
                    datastorage.heroesArray.push($scope.heroes[heroID.toString()]);
                }

                storeInWebStorage("heroesArray", datastorage.heroesArray);

                matchupRequest();

            }, function errorCallback(response) {

            });
        } else {
            datastorage.heroes = retrieveFromWebStorage("heroes");
            datastorage.heroesArray = retrieveFromWebStorage("heroesArray");
            datastorage.matchups = retrieveFromWebStorage("matchups");

            DAAnalyzer.init();

            $scope.dataLoaded = true;

            $location.path( "/home" );

        }




    }





})();