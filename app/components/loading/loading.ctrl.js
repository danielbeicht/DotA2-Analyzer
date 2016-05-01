/**
 * Created by Daniel on 19.01.2016.
 */
(function () {
    'use strict';

    angular
        .module('DotAAnalyzerApp')
        .controller('loadingCtrl', loadingCtrl);

    loadingCtrl.$inject = ['$scope', '$log', '$http', '$location', 'datastorage'];



    function loadingCtrl($scope, $log, $http, $location, datastorage) {
        $scope.dataLoaded = false;
        datastorage.loaded = true;





        // Get all Matchup-data
        function matchupRequest(){
            $http({
                method: 'GET',
                url: 'api/matchups'
            }).then(function successCallback(response) {
                //$scope.matchupsTemp = response.data.matchup;
                var i, j;
                // Create 2 dim. Array
                $scope.matchups = new Array($scope.heroes.length);
                for (i = 0; i < $scope.heroes.length; i++) {
                    $scope.matchups[i] = new Array($scope.heroes.length);
                }

                for (i = 0; i < $scope.heroes.length; i++) {
                    for (j = 0; j < $scope.heroes.length; j++) {
                        //noinspection JSUnresolvedVariable
                        $scope.matchups[$scope.heroes[i].heroIndex][$scope.heroes[j].heroIndex] = response.data[i * $scope.heroes.length + j];
                    }
                }
                $log.info("Matchups Initialized");

                datastorage.matchups = $scope.matchups;

                $scope.dataLoaded = true;
                //$scope.updateAdvantages();
                $location.path( "/home" );
                // !!!!!!


                // this callback will be called asynchronously
                // when the response is available
            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        }




        // Get all heroes
        $http({
            method: 'GET',
            url: 'api/heroes'
        }).then(function successCallback(response) {

            var heroesTemp = response.data;
            var i;
            $scope.heroes = new Array(heroesTemp.length);
            for (i = 0; i < $scope.heroes.length; i++) {
                //noinspection JSUnresolvedVariable
                $scope.heroes[i] = {
                    heroIndex: heroesTemp[i].HeldIndex,
                    heroID: heroesTemp[i].HeldID,
                    heroFullName: heroesTemp[i].HeldFullName,
                    heroName: heroesTemp[i].HeldName,
                    heroImageURL: 'assets/images/heroes/' + heroesTemp[i].HeldFullName.trim().replace(/\s/gi, "_") + '.jpg',
                    yourTeamAdvantage: 0,
                    enemyTeamAdvantage: 0,
                    yourTeamWinrate: '0.00',
                    enemyTeamWinrate: '0.00'
                };
            }

            datastorage.heroes = $scope.heroes;
            matchupRequest();

            // this callback will be called asynchronously
            // when the response is available
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });


    }


})();