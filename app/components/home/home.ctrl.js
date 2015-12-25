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

        $scope.testfunc = function(i){
            console.log(i);
        }

        $scope.yourTeamHeroPick = function(heroIndexParameter){
            if (heroIndexParameter != null){
                var selectedHero = $scope.heroesSortedByIndex[heroIndexParameter];
                var heroAlreadyPicked = false;

                for (var i=0; i<5; i++){
                    if (($scope.yourTeamPicks[i] != null && $scope.yourTeamPicks[i].heroIndex === selectedHero.heroIndex) || ($scope.enemyTeamPicks[i] != null && $scope.enemyTeamPicks[i].heroIndex === selectedHero.heroIndex)){
                        heroAlreadyPicked = true;
                        // TODO: POPUP Held wurde bereits gewählt
                    }
                }

                if (!heroAlreadyPicked){
                    var heroPicked = false;
                    for (var i=0; i<5; i++){
                        if ($scope.yourTeamPicks[i] == null){
                            $scope.yourTeamPicks[i] = $scope.heroesSortedByIndex[heroIndexParameter];
                            heroPicked = true;
                            break;
                        }
                    }
                    if (heroPicked == false){
                        // TODO: POPUP Alle 5 Helden bereits gewählt
                    }
                }
            }

        }

        $scope.enemyTeamHeroPick = function(heroIndexParameter){
            console.log(heroIndexParameter);
            if (heroIndexParameter != null) {
                console.log(heroIndexParameter);
                var selectedHero = $scope.heroesSortedByIndex[heroIndexParameter];
                var heroAlreadyPicked = false;
                for (var i=0; i<5; i++){
                    if (($scope.yourTeamPicks[i] != null && $scope.yourTeamPicks[i].heroIndex === selectedHero.heroIndex) || ($scope.enemyTeamPicks[i] != null && $scope.enemyTeamPicks[i].heroIndex === selectedHero.heroIndex)){
                        heroAlreadyPicked = true;
                        // TODO: POPUP Held wurde bereits gewählt
                    }
                }

                if (!heroAlreadyPicked) {
                    var heroPicked = false;
                    for (var i = 0; i < 5; i++) {
                        if ($scope.enemyTeamPicks[i] == null) {
                            $scope.enemyTeamPicks[i] = $scope.heroesSortedByIndex[heroIndexParameter];
                            heroPicked = true;
                            break;
                        }
                    }
                    if (heroPicked == false) {
                        // TODO: POPUP schon 5 Helden gewählt
                    }
                }
            }
        }
    }

    // Sort heroes by Index
    function compare(a,b) {
        if (parseInt(a.heroIndex) < parseInt(b.heroIndex))
            return -1;
        if (parseInt(a.heroIndex) > parseInt(b.heroIndex))
            return 1;
        //return 0;
    }



    function initHome($scope, $http) {
        $scope.showSpinner = true;



        var templateHero = {pic: 'h'}
        $scope.yourTeamPicks = new Array(5);
        $scope.enemyTeamPicks = new Array(5);
        // Get all heroes
        $http({
            method: 'GET',
            url: 'http://rest.mz-host.de:5015/DotAREST/webresources/heroes'
        }).then(function successCallback(response) {
            var heroesTemp = response.data.hero;

            $scope.heroes = new Array (heroesTemp.length);
            for (var i = 0; i < $scope.heroes.length; i++) {
                $scope.heroes[i] = {heroIndex: heroesTemp[i].heldIndex, heroID: heroesTemp[i].heldID, heroFullName:heroesTemp[i].heldFullName, heroName: heroesTemp[i].heldName,
                    heroImageURL: 'assets/images/heroes/' + heroesTemp[i].heldFullName.trim().replace(/\s/gi, "_") + '.jpg', yourTeamAdvantage: 0, enemyTeamAdvantage: 0, yourTeamWinrate: '-%', enemyTeamWinrate: '-%'};
            }


            $scope.sortTypeYourTeam = 'heroFullName'; // set the default sort type
            $scope.sortReverseYourTeam = false;  // set the default sort order

            $scope.sortTypeEnemyTeam = 'heroFullName'; // set the default sort type
            $scope.sortReverseEnemyTeam = false;  // set the default sort order

            $scope.searchHeroYourTeam = '';     // set the default search/filter term
            $scope.searchHeroEnemyTeam = '';


            // Create Array to select heroes by Index in O(1) (references)
            $scope.heroesSortedByIndex = new Array($scope.heroes.length);
            for (var i=0; i<$scope.heroes.length; i++){
                $scope.heroesSortedByIndex[i] = $scope.heroes[i];
            }
            $scope.heroesSortedByIndex.sort(compare);

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
            {text: "Standard Message"},
            {text: "Success Message!", type: "success"},
            {text: "Alert Message!", type: "alert"},
            {text: "secondary message...", type: "secondary"}
        ];
    }


})();