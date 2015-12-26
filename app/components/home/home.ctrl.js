/**
 * Created by s86370 on 27.10.2015.
 */
(function () {
    'use strict';

    angular
        .module('IBApp')
        .controller('homeCtrl', homeCtrl);

    homeCtrl.$inject = ['$scope', '$http', '$log'];


    function homeCtrl($scope, $http, $log) {
        initHome($scope, $http, $log);




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
            $scope.updateAdvantages();
        }

        $scope.isPicked = function(index){
            var exists = false;
            for (var i=0; i<5; i++){
                if ($scope.yourTeamPicks[i].heroIndex == index || $scope.enemyTeamPicks[i].heroIndex == index){
                    console.log("true");
                    exists = true;
                }
            }
            return exists;
        }

        $scope.enemyTeamHeroPick = function(heroIndexParameter){
            if (heroIndexParameter != null) {
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
            $scope.updateAdvantages();
        }


        $scope.updateAdvantages = function() {
            // TODO: Get Info about partaking players


            for (var i=0; i<$scope.heroesSortedByIndex.length; i++){
                // TODO: Check if hero is banned; continue if hero is banned

                // Reset advantage data
                $scope.heroesSortedByIndex[i].yourTeamWinrate = 0.0;
                $scope.heroesSortedByIndex[i].yourTeamAdvantage = 0.0;
                $scope.heroesSortedByIndex[i].enemyTeamWinrate = 0.0;
                $scope.heroesSortedByIndex[i].enemyTeamAdvantage = 0.0;

                // Check if hero has already been selected; if yes: ignore hero
                var exit = false;
                for (var j=0; j<5; j++){
                    if ($scope.yourTeamPicks[j]!=null){
                        if ($scope.yourTeamPicks[j].heroIndex == i){
                            exit = true;
                            break;
                        }
                    }
                }
                if (!exit){
                    for (var j=0; j<5; j++){
                        if ($scope.enemyTeamPicks[j]!=null){
                            if ($scope.enemyTeamPicks[j].heroIndex == i){
                                exit = true;
                                break;
                            }
                        }
                    }
                }
                if (exit) {
                    $scope.heroesSortedByIndex[i].yourTeamWinrate = '0.00';
                    $scope.heroesSortedByIndex[i].enemyTeamWinrate = '0.00';
                    continue;
                }



                var teamAdvantage = 0.0;
                var enemyAdvantage = 0.0;
                var teamWinrate = 0.0;
                var enemyWinrate = 0.0;

                var teamHeroCount = 0;
                var enemyHeroCount = 0;

                for (var j=0; j<5; j++){
                    if ($scope.enemyTeamPicks[j] != null){
                        teamAdvantage += parseFloat($scope.matchups[i][$scope.enemyTeamPicks[j].heroIndex].advantage);
                        teamWinrate += parseFloat($scope.matchups[i][$scope.enemyTeamPicks[j].heroIndex].winrate);
                        enemyHeroCount++;
                    }
                }
                for (var j=0; j<5; j++){
                    if ($scope.yourTeamPicks[j] != null){
                        enemyAdvantage += parseFloat($scope.matchups[i][$scope.yourTeamPicks[j].heroIndex].advantage);
                        enemyWinrate += parseFloat($scope.matchups[i][$scope.yourTeamPicks[j].heroIndex].winrate);
                        teamHeroCount++;
                    }
                }
                if (teamHeroCount == 0){
                    teamHeroCount = 1;
                }
                if (enemyHeroCount == 0){
                    enemyHeroCount = 1;
                }

                $scope.heroesSortedByIndex[i].yourTeamAdvantage = parseFloat(teamAdvantage.toFixed(2));
                $scope.heroesSortedByIndex[i].enemyTeamAdvantage = parseFloat(enemyAdvantage.toFixed(2));
                $scope.heroesSortedByIndex[i].yourTeamWinrate = (parseFloat(teamWinrate) / parseFloat(enemyHeroCount)).toFixed(2);
                $scope.heroesSortedByIndex[i].enemyTeamWinrate = (parseFloat(enemyWinrate) / parseFloat(teamHeroCount)).toFixed(2);
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



    function initHome($scope, $http, $log) {
        $scope.showSpinner = true;

        $scope.yourTeamPicks = new Array(5);
        $scope.enemyTeamPicks = new Array(5);
/*
        for (var i=0; i<5; i++){
            if ($scope.yourTeamPicks[i] == null){
                console.log("ES IST NULL");
            } else {
                console.log($scope.yourTeamPicks[i]);
            }
        }
*/

        $scope.gameMode = 2;       // 1=All Pick; 2=Captains Mode
        // Get all heroes
        $http({
            method: 'GET',
            url: 'http://rest.mz-host.de:5015/DotAREST/webresources/heroes'
        }).then(function successCallback(response) {
            var heroesTemp = response.data.hero;

            $scope.heroes = new Array (heroesTemp.length);
            for (var i = 0; i < $scope.heroes.length; i++) {
                $scope.heroes[i] = {heroIndex: heroesTemp[i].heldIndex, heroID: heroesTemp[i].heldID, heroFullName:heroesTemp[i].heldFullName, heroName: heroesTemp[i].heldName,
                    heroImageURL: 'assets/images/heroes/' + heroesTemp[i].heldFullName.trim().replace(/\s/gi, "_") + '.jpg', yourTeamAdvantage: 0, enemyTeamAdvantage: 0, yourTeamWinrate: '0.00', enemyTeamWinrate: '0.00'};
            }


            $scope.sortTypeYourTeam = 'yourTeamAdvantage'; // set the default sort type
            $scope.sortReverseYourTeam = true;  // set the default sort order

            $scope.sortTypeEnemyTeam = 'enemyTeamAdvantage'; // set the default sort type
            $scope.sortReverseEnemyTeam = true;  // set the default sort order

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
            //$scope.matchupsTemp = response.data.matchup;

            // Create 2 dim. Array
            $scope.matchups = new Array($scope.heroes.length);
            for (var i = 0; i < $scope.heroes.length; i++) {
                $scope.matchups[i] = new Array($scope.heroes.length);
            }

            for (var i=0; i<$scope.heroes.length; i++){
                for (var j=0; j<$scope.heroes.length; j++){
                    $scope.matchups[$scope.heroes[i].heroIndex][$scope.heroes[j].heroIndex] = response.data.matchup[i*$scope.heroes.length+j];
                }
            }
            $log.info("Matchups Initialized");

            // this callback will be called asynchronously
            // when the response is available
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

        $scope.picked = function(index){
            var exists = false;

            for (var i=0; i<5; i++){
                if ($scope.yourTeamPicks[i]!=null && $scope.yourTeamPicks[i].heroIndex == index){
                    exists = true;
                }

                if ($scope.enemyTeamPicks[i]!=null && $scope.enemyTeamPicks[i].heroIndex == index){
                    exists = true;
                }
            }
            if (exists == false){
                return true;
            } else {
                return false;
            }
        }




        $scope.realh = [
            {text: "Standard Message"},
            {text: "Success Message!", type: "success"},
            {text: "Alert Message!", type: "alert"},
            {text: "secondary message...", type: "secondary"}
        ];
    }


})();