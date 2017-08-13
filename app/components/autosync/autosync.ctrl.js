(function () {
  'use strict';

  angular
    .module('DotAAnalyzerApp')
    .controller('autosyncCtrl', autosyncCtrl);

  autosyncCtrl.$inject = ['$scope', '$http', '$timeout', '$state', '$location', 'DALogin', 'DAAnalyzer', 'datastorage'];


  function autosyncCtrl($scope, $http, $timeout, $state, $location, DALogin, DAAnalyzer, datastorage) {
    $scope.loginService = DALogin;
    $scope.analyzerService = DAAnalyzer;

    $scope.sortTypeYourTeam = 'yourTeamAdvantage'; // set the default sort type
    $scope.sortReverseYourTeam = true;  // set the default sort order

    $scope.sortTypeEnemyTeam = 'enemyTeamAdvantage'; // set the default sort type
    $scope.sortReverseEnemyTeam = true;  // set the default sort order

    if (typeof datastorage.heroes === "undefined"){   // if page home directly called redirect to loading page
      $location.path( "/" );
      return;
    }

    var radiantAutosyncCounter = 0;
    var direAutosyncCounter = 0;

    (function tick() {
      console.log("Call");
      var dataObj = {
        accountID : $scope.loginService.getSteamID()
      };
      if ($scope.loginService.getSteamID() != null){
        $http({
          method: 'POST',
          url: 'api/autosync/getMatch',
          data: dataObj
        }).then(function successCallback(response) {
          console.log(response);
          if (response.data != ""){
            if (response.data.heroesRadiant.length == 0 && response.data.heroesDire.length == 0){
              $scope.analyzerService.resetData();
            }
            while (response.data.heroesRadiant.length > radiantAutosyncCounter){
              $scope.analyzerService.yourTeamHeroPick(response.data.heroesRadiant[radiantAutosyncCounter]);
              radiantAutosyncCounter++;
            }
            while (response.data.heroesDire.length > direAutosyncCounter){
              $scope.analyzerService.enemyTeamHeroPick(response.data.heroesDire[direAutosyncCounter]);
              direAutosyncCounter++;
            }
          }
        }, function errorCallback(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
        }).finally(function() {

        });
      }
      console.log($state.current.name)
      if ($state.current.name == "autosync"){
        $timeout(tick, 1000);
      }
    })();
  }
})();


