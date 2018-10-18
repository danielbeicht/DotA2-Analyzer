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
        // Set to true if data is fully loaded
        $scope.dataLoaded = false;

        datastorage.selectedFriends = [];

        // Helper function to store data in web storage
        function storeInWebStorage(key, arr) {
            localStorage.setItem(key, JSON.stringify(arr));
        }

        // Helper function to retrieve data from web storage
        function retrieveFromWebStorage(key) {
            return JSON.parse(localStorage.getItem(key));
        }

        // Check if data is already stored in web storage and if it's too old reload the data
        if (retrieveFromWebStorage("offline") !== null) {
            let d = new Date();
            let actualTime = Math.round(d.getTime() / 1000);  // reload every 3 days
            let offlineTime = localStorage.getItem("offline");
            let dif = actualTime - offlineTime;

            if (dif < 4320) {
                datastorage.heroes = retrieveFromWebStorage("heroes");
                datastorage.heroesArray = retrieveFromWebStorage("heroesArray");
                datastorage.matchups = retrieveFromWebStorage("matchups");
                DAAnalyzer.init();
                $scope.dataLoaded = true;
                $location.path( "/home" );
            }
        }


        // Get all Matchup-data
        function matchupRequest(){
            $http({
                method: 'GET',
                url: 'api/matchups'
            }).then(function successCallback(response) {

                let matchups = [];
                for (let heroID in $scope.heroes) {
                    matchups[$scope.heroes[heroID.toString()].heroID.toString()] = {}
                    for (let heroID1 in $scope.heroes) {
                        matchups[$scope.heroes[heroID.toString()].heroID.toString()][$scope.heroes[heroID1.toString()].heroID.toString()] = {};
                    }
                }


                for (let i=0; i<response.data.length; i++) {
                    matchups[response.data[i].HeldID1.toString()][response.data[i].HeldID2.toString()] = response.data[i]
                }

                $log.info("Matchups Initialized");

                datastorage.matchups = matchups;

                storeInWebStorage("matchups", matchups);
                let d = new Date();

                localStorage.setItem("offline", Math.round(d.getTime() / 1000));


                DAAnalyzer.init();

                $scope.dataLoaded = true;

                $location.path( "/home" );

            }, function errorCallback(response) {
                $log.warn("Error loading matchups.");
            });
        }


        if (!$scope.dataLoaded) {
            // Get all heroes
            $http({
                method: 'GET',
                url: 'api/heroes'
            }).then(function successCallback(response) {
                $scope.heroes = {};
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

                for (let heroID in $scope.heroes) {
                    datastorage.heroesArray.push($scope.heroes[heroID.toString()]);
                }

                storeInWebStorage("heroesArray", datastorage.heroesArray);

                matchupRequest();

            }, function errorCallback(response) {
                $log.warn("Error loading heroes.");
            });
        }
    }
})();