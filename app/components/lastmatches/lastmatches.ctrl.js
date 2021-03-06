(function () {
  'use strict';

  angular
    .module('DotAAnalyzerApp')
    .controller('lastmatchesCtrl', lastmatchesCtrl);

  lastmatchesCtrl.$inject = ['$scope', '$http', '$location', 'datastorage', '$q', 'DALogin', 'DAAnalyzer', '$log'];


  function lastmatchesCtrl($scope, $http, $location, datastorage, $q, DALogin, DAAnalyzer, $log) {
    $scope.matchesWon = 0;
    $scope.matchesLost = 0;
    // Import services to use them in HTML-File
    $scope.loginService = DALogin;
    $scope.analyzerService = DAAnalyzer;

    // Check if user is logged in (to edit navbar)
    $scope.loginService.loginFunction();

    $scope.tableMatches = [];
    $scope.heroes = datastorage.heroes;

    if (typeof datastorage.heroes === "undefined") {   // if page home directly called redirect to loading page
      $location.path("/");
      return;
    }

    // Get Account ID

    $q.all([
      $http({
        method: 'POST',
        url: 'api/getAccountID',
        data: {steamID: DALogin.getSteamID()}
      }).then(function successCallback(response) {
        $scope.accountID = response.data;
        $log.info("Account ID is: " + $scope.accountID);
      }, function errorCallback() {
        $log.error("Error getting Account ID in lastmatches");
      }),
    ]).then(function () {
      $http({
        method: 'POST',
        url: 'api/getPlayerMatches',
        data: {accountID: $scope.accountID}
      }).then(function successCallback(response) {
        if (response.data === "notfound") {

        } else if (response.data === "false") {
          $scope.showAPIError = true;
        } else {
          $scope.matches = response.data.result.matches;
          parseMatch();
        }
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      })
    });


    function parseMatch() {
      // Parse matches
      for (let i = 0; i < 20; i++) { // $scope.matches.length
        if ($scope.matches[i].lobby_type === 0 || $scope.matches[i].lobby_type === 7) { // Normal or ranked

          let data = {matchID: $scope.matches[i].match_id};
          $q.all([
            $http({
              method: 'POST',
              url: 'api/getPlayerMatch',
              data: data
            }).then(function successCallback(response) {
              DAAnalyzer.resetData();
              let singleMatch = {};
              for (let j = 0; j < (response.data.result.players.length); j++) {

                if (response.data.result.players[j].player_slot < 5) {
                  DAAnalyzer.yourTeamHeroPick(datastorage.heroes[(response.data.result.players[j].hero_id).toString()].heroID);
                } else {
                  DAAnalyzer.enemyTeamHeroPick(datastorage.heroes[(response.data.result.players[j].hero_id).toString()].heroID);
                }
                if (response.data.result.players[j].account_id.toString() === $scope.accountID) {
                  singleMatch.firstPlayerHero = $scope.heroes[(response.data.result.players[j].hero_id).toString()].heroFullName;
                  singleMatch.heroImageURL = $scope.heroes[(response.data.result.players[j].hero_id).toString()].heroImageURL;
                  singleMatch.matchID = response.data.result.match_id;
                  singleMatch.date = new Date(response.data.result.start_time * 1000).toLocaleString();
                  singleMatch.starttime = response.data.result.start_time;
                  if (response.data.result.radiant_win && response.data.result.players[j].player_slot < 5) {
                    singleMatch.firstPlayerWin = true;
                    $scope.matchesWon++;
                  } else if (!response.data.result.radiant_win && response.data.result.players[j].player_slot > 5) {
                    singleMatch.firstPlayerWin = true;
                    $scope.matchesWon++;
                  } else {
                    singleMatch.firstPlayerWin = false;
                    $scope.matchesLost++;
                  }

                  singleMatch.isRadiant = response.data.result.players[j].player_slot < 5;
                }

                if (j === response.data.result.players.length - 1) {
                  singleMatch.stacked = DAAnalyzer.getBarValues(singleMatch.isRadiant);
                  $scope.tableMatches.push(singleMatch);
                }
              }
            }, function errorCallback(response) {
              console.log(response);
            })
          ]).then(function () {

          })
        }
      }
    }
  }
})();


