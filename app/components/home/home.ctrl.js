/**
 * Created by s86370 on 27.10.2015.
 */
(function () {
    'use strict';

    angular
        .module('IBApp')
        .controller('homeCtrl', homeCtrl);

    homeCtrl.$inject = ['$scope', '$http', 'TransactionsFactory', '$uibModal', '$log', '$state'];


    function homeCtrl($scope, $http) {
        initHome($scope, $http);

    }

    function initHome($scope, $http) {
        $scope.showSpinner = true;

        // Get all heroes
        $http({
            method: 'GET',
            url: 'http://rest.mz-host.de:5015/DotAREST/webresources/heroes'
        }).then(function successCallback(response) {
            $scope.heroes = response.data.hero;

            // Erstelle zwei Arrays für beide Tabellen (initialisiere anfangs mit 0)
            $scope.yourTeamHeroData = new Array($scope.heroes.length);
            $scope.enemyTeamHeroData = new Array($scope.heroes.length);

            for (var i=0; i<$scope.heroes.length; i++){
                $scope.yourTeamHeroData[i] = {hero:$scope.heroes[i], winrate: 0, advantage: 0, normalizedAdvantage: 0, rank: 0};
                //
                //console.log($scope.yourTeamHeroData[i].hero.heldFullName + "/end")
                $scope.enemyTeamHeroData[i] = {hero:$scope.heroes[i], winrate: 0, advantage: 0, normalizedAdvantage: 0};
            }
            $scope.showSpinner = false;


            $scope.sortTypeYourTeam     = 'hero.heldFullName'; // set the default sort type
            $scope.sortReverseYourTeam  = false;  // set the default sort order

            $scope.sortTypeEnemyTeam     = 'hero.heldFullName'; // set the default sort type
            $scope.sortReverseEnemyTeam  = false;  // set the default sort order

            $scope.searchHeroYourTeam   = '';     // set the default search/filter term
            $scope.searchHeroEnemyTeam   = '';

            // this callback will be called asynchronously
            // when the response is available
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

        // Get all Matchup-data
        $http({
            method: 'GET',
            url: 'http://rest.mz-host.de:5015/DotAREST/webresources/matchups'
        }).then(function successCallback(response) {
            $scope.matchups = response.data.matchup;                     // Mal sehen ob man das braucht; ansonsten in lokale Variable speichern
            // this callback will be called asynchronously
            // when the response is available
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });




        $scope.realh = [
            {text:"Standard Message"},
            {text:"Success Message!", type:"success"},
            {text:"Alert Message!", type : "alert"},
            {text:"secondary message...", type : "secondary"}
        ];
    }
})();