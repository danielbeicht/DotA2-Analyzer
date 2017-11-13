/**
 * Created by Daniel on 19.01.2016.
 */
(function () {
    'use strict';

    angular
        .module('DotAAnalyzerApp')
        .controller('loadingCtrl', loadingCtrl);

    loadingCtrl.$inject = ['$scope', '$q', '$log', '$http', '$location', 'datastorage', 'DAAnalyzer'];



    function loadingCtrl($scope, $q, $log, $http, $location, datastorage, DAAnalyzer) {
        $scope.dataLoaded = false;
        datastorage.loaded = true;

        datastorage.selectedFriends = [];


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
            /*
            $scope.heroes = new Array(response.data.length);
            for (let i = 0; i < $scope.heroes.length; i++) {
                $scope.heroes[i] = {
                    heroID: response.data[i].HeldID,
                    heroFullName: response.data[i].HeldFullName,
                    heroImageURL: 'assets/images/heroes/' + response.data[i].HeldFullName.trim().replace(/\s/gi, "_") + '.jpg',
                    yourTeamAdvantage: 0,
                    enemyTeamAdvantage: 0,
                    yourTeamWinrate: '0.00',
                    enemyTeamWinrate: '0.00'
                };
            }*/
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

            matchupRequest();

        }, function errorCallback(response) {

        });


    }




})();