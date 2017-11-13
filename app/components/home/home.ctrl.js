(function () {



  'use strict';

  //noinspection JSUnresolvedFunction
  angular
    .module('DotAAnalyzerApp')
    .controller('homeCtrl', homeCtrl);

  homeCtrl.$inject = ['$scope', '$http', '$uibModal', '$timeout', '$location', '$mdDialog', '$mdToast', 'datastorage', 'DAAnalyzer', 'DALogin'];



  function homeCtrl($scope, $http, $uibModal, $timeout, $location, $mdDialog, $mdToast, datastorage, DAAnalyzer, DALogin) {
    // Import services to use them in HTML-File
    $scope.loginService = DALogin;
    $scope.datastorage = datastorage;
    $scope.analyzerService = DAAnalyzer;
    $scope.heroesArray = []

    for (var hero in datastorage.heroes) {
      $scope.heroesArray.push(datastorage.heroes[hero.toString()])

    }

    if (typeof datastorage.heroes === "undefined"){   // if page home directly called redirect to loading page
      $location.path( "/" );
      return;
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
      if ($scope.analyzerService.heroAlreadyPickedOrBanned(hero.heroID)){
        return 'blackTable'
      }

      for (let i=0; i<5; i++){
        if (typeof datastorage.selectedFriends[i] !== 'undefined'){
          if (typeof datastorage.selectedFriends[i].heroes !== 'undefined'){
            for (let j=0; j<datastorage.selectedFriends[i].heroes.length; j++){
              if (hero.heroID == datastorage.selectedFriends[i].heroes[j].HeroID){
                if (color == -1){
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

      switch (color){
        case -1:
          return '';
          break;
        case -2:
          return 'multiple'
          break;
        case 0:
          return 'green';
          break;
        case 1:
          return 'blue';
          break;
        case 2:
          return 'purple';
          break;
        case 3:
          return 'red';
          break;
        case 4:
          return 'orange';
          break;
      }
      return 'blackTable';
    }



    



    // Initialize Heropicker Modal
    $scope.ok = function(answer) {
      var result = [];
      result[0] = answer;
      result[1] = 'yourTeamPick';
      $mdDialog.hide(result);
    };

    // Toast Reset Heroes
    $scope.showToastResetHeroes = function() {
      $mdToast.show(
        $mdToast.simple()
          .textContent('Picks/Bans resetted.')
          .position('bottom right')
          .hideDelay(3000)
      );
    };


    function DialogController($scope, $mdDialog, data) {
      $scope.passeddata = data;
      console.log($scope.passeddata.pickedHeroName)

      $scope.hide = function() {
        $mdDialog.hide();
      };

      $scope.cancel = function() {
        $mdDialog.cancel();
      };

      $scope.answer = function(answer) {
        $mdDialog.hide(answer);
      };

      $scope.ok = function(answer) { // Funktion für neuen HeroPick
        var result = [];
        result[0] = answer;
        $mdDialog.hide(result);
      };

      $scope.parseMatchID = function () {
        console.log("Match ID: " + $scope.inputMatchID);

        DAAnalyzer.resetData();
        $scope.parsingMatch = true;
        var heroArray = [];
        var dataObj = {
          matchID : $scope.inputMatchID
        };
        $http({
          method: 'POST',
          url: 'api/matchid',
          data: dataObj
        }).then(function successCallback(response) {
          if (response.data == "notfound"){
          } else if (response.data == "false") {
            $scope.showAPIError = true;
          } else {
            for (var i=0; i<5; i++){
              for (var j=0; j<DAAnalyzer.heroes.length; j++){
                if (DAAnalyzer.heroes[j].heroValveIndex == response.data[i]){
                  heroArray[i] = DAAnalyzer.heroes[j].heroIndex;
                }
              }
            }
            for (var i=5; i<10; i++){
              for (var j=0; j<DAAnalyzer.heroes.length; j++){
                if (DAAnalyzer.heroes[j].heroValveIndex == response.data[i]){
                  heroArray[i] = DAAnalyzer.heroes[j].heroIndex;
                }
              }
            }
          }
          $mdDialog.hide(heroArray);
        }, function errorCallback(response) {
          $mdDialog.hide(null);
          // called asynchronously if an error occurs
          // or server returns response with an error status.
        }).finally(function() {
          $scope.parsingMatch = false;
        });
        $mdDialog.hide(heroArray);
      }
    }

    function initHeroPickerModal () {
      $scope.animationsEnabled = true;
      $scope.openHeroPickerDialog = function (ev, pickSetting) {
        $mdDialog.show({
          controller: DialogController,
          templateUrl: "heroPickerDialog",
          parent: angular.element(document.body),
          disableAnimation: true,
          targetEvent: ev,
          locals:{data: $scope},
          clickOutsideToClose:true,
          fullscreen: true // Only for -xs, -sm breakpoints.
        }).then(function(result) {
          var selectedHero = result[0];
          var pick = pickSetting;
          var i;
          if (pick === 'yourTeamPick'){
            for (i=0; i < $scope.analyzerService.heroesSortedByIndex.length; i++){
              if ($scope.analyzerService.heroesSortedByIndex[i].heroName.trim() === selectedHero){
                $scope.analyzerService.yourTeamHeroPick($scope.analyzerService.heroesSortedByIndex[i].heroIndex);
                break;
              }
            }
          } else if (pick === 'enemyTeamPick'){
            for (i=0; i < $scope.analyzerService.heroesSortedByIndex.length; i++){
              if ($scope.analyzerService.heroesSortedByIndex[i].heroName.trim() === selectedHero){
                $scope.analyzerService.enemyTeamHeroPick($scope.analyzerService.heroesSortedByIndex[i].heroIndex);
                break;
              }
            }
          } else if (pick === 'ban') {
            for (i = 0; i < $scope.analyzerService.heroesSortedByIndex.length; i++) {
              if ($scope.analyzerService.heroesSortedByIndex[i].heroName.trim() === selectedHero) {
                banHero($scope.analyzerService.heroesSortedByIndex[i].heroIndex);
                break;
              }
            }
          }
          }, function() {
            $scope.status = 'You cancelled the dialog.';
          });
      };
    }
    initHeroPickerModal();


    function initParseIDModal () {
      $scope.animationsEnabled = true;
      $scope.openParseIDDialog = function (ev, pickSetting) {
        $mdDialog.show({
          controller: DialogController,
          templateUrl: "parseIDDialog",
          parent: angular.element(document.body),
          disableAnimation: true,
          targetEvent: ev,
          locals:{data: $scope},
          clickOutsideToClose:true,
          fullscreen: true // Only for -xs, -sm breakpoints.
        }).then(function(result) {
          if (result != null){
            for (var i=0; i<5; i++){
              $scope.analyzerService.yourTeamHeroPick(result[i]);
            }
            for (var i=5; i<10; i++){
              $scope.analyzerService.enemyTeamHeroPick(result[i]);
            }
          }
        }, function() {
          $scope.status = 'You cancelled the dialog.';
        });
      };
    }
    initParseIDModal();







    $scope.parseMatch = function (pickSetting) {
      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'myModalContentt.html',
        controller: 'ParseMatchModalCtrl',
        windowClass: 'app-modal-window',
        size: 'sm',
        scope: $scope
      });
      modalInstance.result.then(function (result) {
        if (result != null){
          for (var i=0; i<5; i++){
            $scope.analyzerService.yourTeamHeroPick(result[i]);
          }
          for (var i=5; i<10; i++){
            $scope.analyzerService.enemyTeamHeroPick(result[i]);
          }
        }
      }, function () {
        //$log.info('Modal dismissed at: ' + new Date());
      });
    };


    $scope.toggleAnimation = function () {
      $scope.animationsEnabled = !$scope.animationsEnabled;
    };

    // APIs
    $scope.banHero = banHero;
    $scope.parseMatchID = parseMatchID;

    $scope.yourTeamHeroClickImage = function(heroIndexParameter) {
        var i;
        var selectedHero = $scope.analyzerService.heroes[heroIndexParameter.toString()];
        for (i = 0; i < 5; i++){
          if ($scope.analyzerService.yourTeamPicks[i] != null && $scope.analyzerService.yourTeamPicks[i].heroID === selectedHero.heroID){
            $scope.analyzerService.yourTeamPicks[i] = null;
            $scope.analyzerService.updateAdvantages();
            return;
          } else if ($scope.analyzerService.enemyTeamPicks[i] != null && $scope.analyzerService.enemyTeamPicks[i].heroID === selectedHero.heroID){
            $scope.analyzerService.enemyTeamPicks[i] = null;
            $scope.analyzerService.updateAdvantages();
            return;
          }
        }
        for (i = 0; i < 10; i++) {
          if ($scope.analyzerService.heroBans[i] != null && $scope.analyzerService.heroBans[i].heroID === selectedHero.heroID) {
            $scope.analyzerService.heroBans[i] = null;
            return;
          }
        }
        //DAAnalyzer.yourTeamHeroPick(heroIndexParameter);
      $scope.analyzerService.yourTeamHeroPick(heroIndexParameter);

    };

    $scope.enemyTeamHeroClickImage = function (heroIndexParameter) {
      var i;
      var selectedHero = $scope.analyzerService.heroes[heroIndexParameter.toString()];
        for (i = 0; i < 5; i++){
          if ($scope.analyzerService.enemyTeamPicks[i] != null && $scope.analyzerService.enemyTeamPicks[i].heroID === selectedHero.heroID){
            $scope.analyzerService.enemyTeamPicks[i] = null;
            $scope.analyzerService.updateAdvantages();
            return;
          } else if ($scope.analyzerService.yourTeamPicks[i] != null && $scope.analyzerService.yourTeamPicks[i].heroID === selectedHero.heroID){
            $scope.analyzerService.yourTeamPicks[i] = null;
            $scope.analyzerService.updateAdvantages();
            return;
          }
        }
        for (i = 0; i < 10; i++) {
          if ($scope.analyzerService.heroBans[i] != null && $scope.analyzerService.heroBans[i].heroID === selectedHero.heroID) {
            $scope.analyzerService.heroBans[i] = null;
            return;
          }
        }
        $scope.analyzerService.enemyTeamHeroPick(heroIndexParameter);

    }


    $scope.$watch('allowBanning', function (newValue) {
      if (newValue == false) {
        for (var i = 0; i < 10; i++) {
          $scope.analyzerService.heroBans[i] = null;
        }
      }
    });

    // Wait until 200 ms are over (ng-if/Loading screen complete disappear)

    $scope.$watch('dataLoaded', function (newValue) {
      if ($scope.dataLoaded == false) {
        $timeout(function(){
          $scope.loadingScreenDisappeared = true;
        }, 200);
      }
    });






    function initHome() {
      $scope.allowBanning = false;

      $scope.sortTypeYourTeam = 'yourTeamAdvantage'; // set the default sort type
      $scope.sortReverseYourTeam = true;  // set the default sort order

      $scope.sortTypeEnemyTeam = 'enemyTeamAdvantage'; // set the default sort type
      $scope.sortReverseEnemyTeam = true;  // set the default sort order

      $scope.searchHeroYourTeam = '';     // set the default search/filter term
      $scope.searchHeroEnemyTeam = '';

      $scope.yourTeamOverallAdvantage = 0.0;
      $scope.enemyTeamOverallAdvantage = 0.0;

      $scope.swapTables = false;
      $scope.parsingMatch = false;
      $scope.showAPIError = false;

      $scope.yourTeamTableInfo = "Counter picks to dire heroes.";
      $scope.enemyTeamTableInfo = "Counter picks to radiant heroes.";


      $scope.overallAdvantages = [];

      $scope.overallAdvantages.push({
        value: 0,
        type: 'success'
      });
      $scope.overallAdvantages.push({
        value: 0,
        type: 'alert'
      });

      $scope.analyzerService.resetData();
      $scope.analyzerService.updateAdvantages();

      $scope.picked = function (index) {

        var alreadyPicked = false;
        var i;
        for (i = 0; i < 5; i++) {
          if ($scope.analyzerService.yourTeamPicks[i] != null && $scope.analyzerService.yourTeamPicks[i].heroIndex == index) {
            alreadyPicked = true;
            break;
          }

          if ($scope.analyzerService.enemyTeamPicks[i] != null && $scope.analyzerService.enemyTeamPicks[i].heroIndex == index) {
            alreadyPicked = true;
            break;
          }
        }
        for (i = 0; i < 10; i++) {

          if ($scope.analyzerService.heroBans[i] != null && $scope.analyzerService.heroBans[i].heroIndex == index) {
            alreadyPicked = true;
            break;
          }
        }
        return alreadyPicked;
      };

    }

    $scope.resetPicks = function() {
      $scope.analyzerService.resetData()
      $scope.showToastResetHeroes();
    }


    $scope.pickedHeroName = function (heroIndex){
      var i;
      for (i=0; i<5; i++) {
        if ($scope.analyzerService.heroesSortedByIndex[heroIndex] == $scope.analyzerService.yourTeamPicks[i]){
          return "assets/images/heroes_gray/" + $scope.analyzerService.heroesSortedByIndex[heroIndex].heroFullName.trim().replace(/\s/gi, "_") + '.jpg';
        } else if ($scope.analyzerService.heroesSortedByIndex[heroIndex] == $scope.analyzerService.enemyTeamPicks[i]){
          return "assets/images/heroes_gray/" + $scope.analyzerService.heroesSortedByIndex[heroIndex].heroFullName.trim().replace(/\s/gi, "_") + '.jpg';
        }
      }
      for (i=0; i<10; i++) {
        if ($scope.analyzerService.heroesSortedByIndex[heroIndex] == $scope.analyzerService.heroBans[i]) {
          return "assets/images/heroes_gray/" + $scope.analyzerService.heroesSortedByIndex[heroIndex].heroFullName.trim().replace(/\s/gi, "_") + '.jpg';
        }
      }
      return "assets/images/heroes/" + $scope.analyzerService.heroesSortedByIndex[heroIndex].heroFullName.trim().replace(/\s/gi, "_") + '.jpg';
    };

    // call on 1st load + reload
    initHome();


    // Function called when a hero is banned
    function banHero(heroIndexParameter) {
      if (heroIndexParameter != null && $scope.allowBanning) {
        var selectedHero = $scope.analyzerService.heroes[heroIndexParameter.toString()];
        var heroAlreadyPicked = false;
        var i;
        for (i = 0; i < 5; i++) {
          if (($scope.analyzerService.yourTeamPicks[i] != null && $scope.analyzerService.yourTeamPicks[i].heroID === selectedHero.heroID) || ($scope.analyzerService.enemyTeamPicks[i] != null && $scope.analyzerService.enemyTeamPicks[i].heroID === selectedHero.heroID)) {
            heroAlreadyPicked = true;
            break;
            // TODO: POPUP Held wurde bereits gewählt
          }
        }
        for (i = 0; i < 10; i++) {
          if ($scope.analyzerService.heroBans[i] != null && $scope.analyzerService.heroBans[i].heroID === selectedHero.heroID) {
            heroAlreadyPicked = true;
            break;
          }
        }

        if (!heroAlreadyPicked) {
          var heroBanned = false;
          for (i = 0; i < 10; i++) {
            if ($scope.analyzerService.heroBans[i] == null) {
              $scope.analyzerService.heroBans[i] = $scope.analyzerService.heroes[heroIndexParameter.toString()];
              heroBanned = true;
              break;
            }
          }
          if (heroBanned == false) {
            // TODO: POPUP schon 5 Helden gewählt
          }
        }
      }
    }

    function parseMatchID (matchID) {

      $scope.analyzerService.resetData();
      $scope.parsingMatch = true;
      var dataObj = {
        matchID : matchID
      };
        $http({
          method: 'POST',
          url: 'api/matchid',
          data: dataObj
        }).then(function successCallback(response) {
          if (response.data == "notfound"){

          } else if (response.data == "false") {
            $scope.showAPIError = true;
          } else {
            for (var i=0; i<5; i++){
              for (var j=0; j<$scope.heroes.length; j++){
                if ($scope.heroes[j].heroValveIndex == response.data[i]){
                  //alert($scope.heroes[j].heroValveIndex + " is " + $scope.heroes[j].heroIndex);
                  $scope.analyzerService.yourTeamHeroPick($scope.heroes[j].heroIndex);
                }
              }
            }
            for (var i=5; i<10; i++){
              for (var j=0; j<$scope.heroes.length; j++){
                if ($scope.heroes[j].heroValveIndex == response.data[i]){
                  //alert($scope.heroes[j].heroValveIndex + " is " + $scope.heroes[j].heroIndex);
                  $scope.analyzerService.enemyTeamHeroPick($scope.heroes[j].heroIndex);
                }
              }
            }
          }
        }, function errorCallback(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
        }).finally(function() {
           $scope.parsingMatch = false;
        });
    }

    // Checks if element is Placeholder or Value; Return is color
    $scope.changeProgressbarColor = function(vari) {
      var cols = document.getElementById('progressValue');
      var greenValue = ((255/(1.5*(100/2)))*vari.value).toFixed(0);
      cols.style.background = 'rgba(' + (255-greenValue) + ', 255, 0, 1)';
    };


    $scope.reloadData = function() {
      $location.path( "/" );
    }

  }

})();

//noinspection JSUnresolvedFunction
angular
  .module('DotAAnalyzerApp')
  .directive('ngRightClick', function ($parse) {
    return function (scope, element, attrs) {
      //noinspection JSUnresolvedVariable
      var fn = $parse(attrs.ngRightClick);
      element.bind('contextmenu', function (event) {
        scope.$apply(function () {
          event.preventDefault();
          fn(scope, {$event: event});
        });
      });
    };
  });
