(function () {
  'use strict';

  angular
    .module('DotAAnalyzerApp')
    .controller('autosyncCtrl', autosyncCtrl);

  autosyncCtrl.$inject = ['$scope', '$http', '$timeout', '$state', '$location', 'DALogin', 'DAAnalyzer', 'datastorage'];


  function autosyncCtrl($scope, $http, $timeout, $state, $location, DALogin, DAAnalyzer, datastorage) {
    $scope.loginService = DALogin;
    $scope.analyzerService = DAAnalyzer;
    $scope.datastorage = datastorage;

    $scope.sortTypeYourTeam = 'yourTeamAdvantage'; // set the default sort type
    $scope.sortReverseYourTeam = true;  // set the default sort order

    $scope.sortTypeEnemyTeam = 'enemyTeamAdvantage'; // set the default sort type
    $scope.sortReverseEnemyTeam = true;  // set the default sort order

    $scope.heroesArray = [];

    if (typeof datastorage.heroes === "undefined"){   // if page home directly called redirect to loading page
      $location.path( "/" );
      return;
    }

    // TODO: dataStorage.heroes has a bad format; maybe change to array
    for (let hero in datastorage.heroes) {
      $scope.heroesArray.push(datastorage.heroes[hero.toString()])
    }

    if ($scope.loginService.loggedIn){
      var dataObj = {
        accountID: DALogin.getSteamID(),
      };
      $http({
        method: 'POST',
        url: 'api/friends/friendlist',
        data: dataObj
      }).then(function successCallback(response) {
        $scope.friendList = response.data;

        for (var i=0; i<$scope.friendList.length; i++){
          let temp = i;
          dataObj = {
            accountID: DALogin.getSteamID(),
            name: $scope.friendList[i].FriendName
          };

          $http({
            method: 'POST',
            url: 'api/friends/friendHeroList',
            data: dataObj
          }).then(function successCallback(response) {
            $scope.friendList[temp].heroes = response.data;

          }, function errorCallback(response) {

          });
        }
      }, function errorCallback(response) {
      });
    }

    $scope.preselect = function (friend, index) {
      if (typeof datastorage.selectedFriends[index] !== 'undefined'){
        if (datastorage.selectedFriends[index].FriendName == friend.FriendName){
          return true;
        }
      }
      return false;
    }


    $scope.testngclass = function (hero) {
      //console.log(datastorage.selectedFriends[1])
      // -1 no color
      // -2 multiple -> gold
      // 0-4 Player colors
      var color = -1;

      // Check if already picked
      if ($scope.analyzerService.heroAlreadyPickedOrBanned(hero.heroID)) {
        return 'blackTable'
      }

      for (let i = 0; i < 5; i++) {
        if (typeof datastorage.selectedFriends[i] !== 'undefined') {
          if (typeof datastorage.selectedFriends[i].heroes !== 'undefined') {
            for (let j = 0; j < datastorage.selectedFriends[i].heroes.length; j++) {
              if (hero.heroID === datastorage.selectedFriends[i].heroes[j].HeroID) {
                if (color === -1) {
                  color = i;
                } else {
                  color = -2;
                }
                break;
              }
            }
          }
        }
      }

      switch (color) {
        case -1:
          return '';
        case -2:
          return 'multiple';
        case 0:
          return 'green';
        case 1:
          return 'blue';
        case 2:
          return 'purple';
        case 3:
          return 'red';
        case 4:
          return 'orange';
      }
      return 'blackTable';
    };














    var radiantAutosyncCounter = 0;
    var direAutosyncCounter = 0;

    (function tick() {
      var dataObj = {
        accountID : $scope.loginService.getSteamID()
      };
      if ($scope.loginService.getSteamID() != null){
        console.log("Get Match Data");
        $http({
          method: 'POST',
          url: 'api/autosync/getMatch',
          data: dataObj
        }).then(function successCallback(response) {
          console.log(response.data);
          if (response.data != ""){
            if (response.data.heroesRadiant.length == 0 && response.data.heroesDire.length == 0){
              radiantAutosyncCounter = 0;
              direAutosyncCounter = 0;
              $scope.analyzerService.resetData();
            }
            while (response.data.heroesRadiant.length > radiantAutosyncCounter){
              console.log("Added Rad");
              $scope.analyzerService.yourTeamHeroPick(response.data.heroesRadiant[radiantAutosyncCounter]);
              radiantAutosyncCounter++;
            }
            while (response.data.heroesDire.length > direAutosyncCounter){
              console.log("Added Dire");
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
      if ($state.current.name == "autosync"){
        $timeout(tick, 1000);
      }
    })();
  }
})();


