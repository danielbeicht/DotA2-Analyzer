(function () {

  'use strict';

  //noinspection JSUnresolvedFunction
  angular
    .module('DotAAnalyzerApp')
    .controller('homeCtrl', homeCtrl);

  homeCtrl.$inject = ['$scope', '$http', '$uibModal', '$timeout', '$location', '$mdDialog', '$mdToast', 'datastorage',
    'DAAnalyzer', 'DALogin'];


  function homeCtrl($scope, $http, $uibModal, $timeout, $location, $mdDialog, $mdToast, dataStorage, DAAnalyzer,
                    DALogin) {
    // Import services to use them in HTML-File
    $scope.loginService = DALogin;
    $scope.datastorage = dataStorage;
    $scope.analyzerService = DAAnalyzer;
    $scope.heroesArray = [];
    $scope.personalizedHeroes = [];
    $scope.personalizedHeroesSliced = [];
    $scope.personalizedOpenDotaTest = "Loading data from Opendota.";

    // If page home directly called redirect to loading page
    if (typeof dataStorage.heroes === "undefined") {
      $location.path("/");
      return;
    }

    // TODO: dataStorage.heroes has a bad format; maybe change to array
    for (let hero in dataStorage.heroes) {
      $scope.heroesArray.push(dataStorage.heroes[hero.toString()])
    }


    if ($scope.loginService.loggedIn) {
      let dataObj = {
        accountID: DALogin.getSteamID(),
      };
      $http({
        method: 'POST',
        url: 'api/friends/friendlist',
        data: dataObj
      }).then(function successCallback(response) {
        $scope.friendList = response.data;

        for (var i = 0; i < $scope.friendList.length; i++) {
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
      return typeof dataStorage.selectedFriends[index] !== 'undefined' &&
        dataStorage.selectedFriends[index].FriendName === friend.FriendName;
    };


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
        if (typeof dataStorage.selectedFriends[i] !== 'undefined') {
          if (typeof dataStorage.selectedFriends[i].heroes !== 'undefined') {
            for (let j = 0; j < dataStorage.selectedFriends[i].heroes.length; j++) {
              if (hero.heroID === dataStorage.selectedFriends[i].heroes[j].HeroID) {
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


    // Initialize Hero Picker Modal
    $scope.ok = function (answer) {
      let result = [];
      result[0] = answer;
      result[1] = 'yourTeamPick';
      $mdDialog.hide(result);
    };

    // Toast Reset Heroes
    $scope.showToastResetHeroes = function () {
      $mdToast.show(
        $mdToast.simple()
          .textContent('Picks/Bans resetted.')
          .position('bottom right')
          .hideDelay(3000)
      );
    };


    function DialogController($scope, $mdDialog, data) {
      $scope.passeddata = data;

      $scope.hide = function () {
        $mdDialog.hide();
      };

      $scope.cancel = function () {
        $mdDialog.cancel();
      };

      $scope.answer = function (answer) {
        $mdDialog.hide(answer);
      };

      // Function for new modal picker
      $scope.ok = function (answer, id) {
        let result = [];
        result[0] = answer;
        result[1] = id;
        $mdDialog.hide(result);
      };

      $scope.heroPick = function (heroID) {
        let result = [];
        result[0] = heroID;
        $mdDialog.hide(result);
      };

      $scope.parseMatchID = function () {
        DAAnalyzer.resetData();
        $scope.parsingMatch = true;
        let heroArray = [];
        let dataObj = {
          matchID: $scope.inputMatchID
        };
        $http({
          method: 'POST',
          url: 'api/matchid',
          data: dataObj
        }).then(function successCallback(response) {
          if (response.data === "notfound") {
          } else if (response.data === "false") {
            $scope.showAPIError = true;
          } else {
            for (let i = 0; i < 5; i++) {
              for (let j = 0; j < DAAnalyzer.heroes.length; j++) {
                if (DAAnalyzer.heroes[j].heroID === response.data[i]) {
                  heroArray[i] = DAAnalyzer.heroes[j].heroID;
                }
              }
            }
            for (let i = 5; i < 10; i++) {
              for (let j = 0; j < DAAnalyzer.heroes.length; j++) {
                if (DAAnalyzer.heroes[j].heroID === response.data[i]) {
                  heroArray[i] = DAAnalyzer.heroes[j].heroID;
                }
              }
            }
          }
          $mdDialog.hide(heroArray);
        }, function errorCallback() {
          $mdDialog.hide(null);
          // called asynchronously if an error occurs
          // or server returns response with an error status.
        }).finally(function () {
          $scope.parsingMatch = false;
        });
        $mdDialog.hide(heroArray);
      }
    }

    function initHeroPickerModal() {
      $scope.animationsEnabled = true;
      $scope.openHeroPickerDialog = function (ev, pickSetting) {
        $mdDialog.show({
          controller: DialogController,
          templateUrl: "heroPickerDialog",
          parent: angular.element(document.body),
          disableAnimation: true,
          targetEvent: ev,
          locals: {data: $scope},
          clickOutsideToClose: true,
          fullscreen: true // Only for -xs, -sm breakpoints.
        }).then(function (result) {
          var pick = pickSetting;
          console.log(result);
          if (pick === 'yourTeamPick') {
            $scope.analyzerService.yourTeamHeroPick(result[0]);
          } else if (pick === 'enemyTeamPick') {
            $scope.analyzerService.enemyTeamHeroPick(result[0]);
          } else if (pick === 'ban') {
            banHero(result[0]);
          }
        }, function () {
          $scope.status = 'You cancelled the dialog.';
        });
      };
    }

    initHeroPickerModal();


    function initParseIDModal() {
      $scope.animationsEnabled = true;
      $scope.openParseIDDialog = function (ev) {
        $mdDialog.show({
          controller: DialogController,
          templateUrl: "parseIDDialog",
          parent: angular.element(document.body),
          disableAnimation: true,
          targetEvent: ev,
          locals: {data: $scope},
          clickOutsideToClose: true,
          fullscreen: true // Only for -xs, -sm breakpoints.
        }).then(function (result) {
          if (result != null) {
            for (let i = 0; i < 5; i++) {
              $scope.analyzerService.yourTeamHeroPick(result[i]);
            }
            for (let i = 5; i < 10; i++) {
              $scope.analyzerService.enemyTeamHeroPick(result[i]);
            }
          }
        }, function () {
          $scope.status = 'You cancelled the dialog.';
        });
      };
    }

    initParseIDModal();


    $scope.parseMatch = function () {
      let modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'myModalContentt.html',
        controller: 'ParseMatchModalCtrl',
        windowClass: 'app-modal-window',
        size: 'sm',
        scope: $scope
      });
      modalInstance.result.then(function (result) {
        if (result != null) {
          for (let i = 0; i < 5; i++) {
            $scope.analyzerService.yourTeamHeroPick(result[i]);
          }
          for (let i = 5; i < 10; i++) {
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

    $scope.yourTeamHeroClickImage = function (heroIndexParameter) {
      let i;
      let selectedHero = $scope.analyzerService.heroes[heroIndexParameter.toString()];
      for (i = 0; i < 5; i++) {
        if ($scope.analyzerService.yourTeamPicks[i] != null && $scope.analyzerService.yourTeamPicks[i].heroID === selectedHero.heroID) {
          $scope.analyzerService.yourTeamPicks[i] = null;
          $scope.analyzerService.updateAdvantages();
          return;
        } else if ($scope.analyzerService.enemyTeamPicks[i] != null && $scope.analyzerService.enemyTeamPicks[i].heroID === selectedHero.heroID) {
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
      $scope.analyzerService.yourTeamHeroPick(heroIndexParameter);

    };

    $scope.enemyTeamHeroClickImage = function (heroIndexParameter) {
      let i;
      let selectedHero = $scope.analyzerService.heroes[heroIndexParameter.toString()];
      for (i = 0; i < 5; i++) {
        if ($scope.analyzerService.enemyTeamPicks[i] != null && $scope.analyzerService.enemyTeamPicks[i].heroID === selectedHero.heroID) {
          $scope.analyzerService.enemyTeamPicks[i] = null;
          $scope.analyzerService.updateAdvantages();
          return;
        } else if ($scope.analyzerService.yourTeamPicks[i] != null && $scope.analyzerService.yourTeamPicks[i].heroID === selectedHero.heroID) {
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
    };


    $scope.$watch('allowBanning', function (newValue) {
      if (newValue === false) {
        for (let i = 0; i < 10; i++) {
          $scope.analyzerService.heroBans[i] = null;
        }
      }
    });

    $scope.$watch('personalization', function (newValue) {
      if (newValue === true) {
        if ($scope.personalizedHeroes.length === 0) {
          $http({
            method: 'GET',
            url: 'api/accountHeroes?id=' + DALogin.getSteamID(),
          }).then(function successCallback(response) {
            $scope.personalizedHeroes = response.data;
            $scope.personalizedHeroesCount = 10

          }, function errorCallback() {
            $scope.personalizedOpenDotaTest = "Error loading data from Opendota.";
          });
        }
      }
    });

    $scope.$watch('personalizedHeroesCount', function (newValue) {
      console.log(newValue)
      $scope.personalizedHeroesSliced = $scope.personalizedHeroes.slice(0, newValue);
    });

    $scope.personalizedHeroesContains = function(id) {
      for (let i=0; i<$scope.personalizedHeroesSliced.length; i++) {
        let hero = $scope.personalizedHeroesSliced[i];
        if (parseInt(hero.hero_id) === id) {
          return true;
        }
      }
      return false;
    };


    // Wait until 200 ms are over (ng-if/Loading screen complete disappear)
    $scope.$watch('dataLoaded', function () {
      if ($scope.dataLoaded === false) {
        $timeout(function () {
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

        let alreadyPicked = false;
        let i;
        for (i = 0; i < 5; i++) {
          if ($scope.analyzerService.yourTeamPicks[i] != null && $scope.analyzerService.yourTeamPicks[i].heroIndex === index) {
            alreadyPicked = true;
            break;
          }

          if ($scope.analyzerService.enemyTeamPicks[i] != null && $scope.analyzerService.enemyTeamPicks[i].heroIndex === index) {
            alreadyPicked = true;
            break;
          }
        }
        for (i = 0; i < 10; i++) {

          if ($scope.analyzerService.heroBans[i] != null && $scope.analyzerService.heroBans[i].heroIndex === index) {
            alreadyPicked = true;
            break;
          }
        }
        return alreadyPicked;
      };

    }

    $scope.resetPicks = function () {
      $scope.analyzerService.resetData();
      $scope.showToastResetHeroes();
    };


    $scope.pickedHeroName = function (heroIndex) {
      var i;
      for (i = 0; i < 5; i++) {
        if ($scope.analyzerService.heroes[heroIndex] === $scope.analyzerService.yourTeamPicks[i]) {
          return "assets/images/heroes_gray/" + $scope.analyzerService.heroes[heroIndex].heroFullName.trim().replace(/\s/gi, "_") + '.jpg';
        } else if ($scope.analyzerService.heroes[heroIndex] === $scope.analyzerService.enemyTeamPicks[i]) {
          return "assets/images/heroes_gray/" + $scope.analyzerService.heroes[heroIndex].heroFullName.trim().replace(/\s/gi, "_") + '.jpg';
        }
      }
      for (i = 0; i < 10; i++) {
        if ($scope.analyzerService.heroes[heroIndex] === $scope.analyzerService.heroBans[i]) {
          return "assets/images/heroes_gray/" + $scope.analyzerService.heroes[heroIndex].heroFullName.trim().replace(/\s/gi, "_") + '.jpg';
        }
      }
      return "assets/images/heroes/" + $scope.analyzerService.heroes[heroIndex].heroFullName.trim().replace(/\s/gi, "_") + '.jpg';
    };

    // call on 1st load + reload
    initHome();


    // Function called when a hero is banned
    function banHero(heroIndexParameter) {
      if (heroIndexParameter != null && $scope.allowBanning) {
        let selectedHero = $scope.analyzerService.heroes[heroIndexParameter.toString()];
        let heroAlreadyPicked = false;
        for (let i = 0; i < 5; i++) {
          if (($scope.analyzerService.yourTeamPicks[i] != null && $scope.analyzerService.yourTeamPicks[i].heroID === selectedHero.heroID) || ($scope.analyzerService.enemyTeamPicks[i] != null && $scope.analyzerService.enemyTeamPicks[i].heroID === selectedHero.heroID)) {
            heroAlreadyPicked = true;
            break;
            // TODO: POPUP Held wurde bereits gewählt
          }
        }
        for (let i = 0; i < 10; i++) {
          if ($scope.analyzerService.heroBans[i] != null && $scope.analyzerService.heroBans[i].heroID === selectedHero.heroID) {
            heroAlreadyPicked = true;
            break;
          }
        }

        if (!heroAlreadyPicked) {
          let heroBanned = false;
          for (let i = 0; i < 10; i++) {
            if ($scope.analyzerService.heroBans[i] == null) {
              $scope.analyzerService.heroBans[i] = $scope.analyzerService.heroes[heroIndexParameter.toString()];
              heroBanned = true;
              break;
            }
          }
          if (heroBanned === false) {
            // TODO: POPUP schon 5 Helden gewählt
          }
        }
      }
    }

    function parseMatchID(matchID) {

      $scope.analyzerService.resetData();
      $scope.parsingMatch = true;
      var dataObj = {
        matchID: matchID
      };
      $http({
        method: 'POST',
        url: 'api/matchid',
        data: dataObj
      }).then(function successCallback(response) {
        if (response.data === "notfound") {

        } else if (response.data === "false") {
          $scope.showAPIError = true;
        } else {
          for (let i = 0; i < 5; i++) {
            for (let j = 0; j < $scope.heroes.length; j++) {
              if ($scope.heroes[j].heroValveIndex === response.data[i]) {
                //alert($scope.heroes[j].heroValveIndex + " is " + $scope.heroes[j].heroIndex);
                $scope.analyzerService.yourTeamHeroPick($scope.heroes[j].heroIndex);
              }
            }
          }
          for (let i = 5; i < 10; i++) {
            for (let j = 0; j < $scope.heroes.length; j++) {
              if ($scope.heroes[j].heroValveIndex === response.data[i]) {
                //alert($scope.heroes[j].heroValveIndex + " is " + $scope.heroes[j].heroIndex);
                $scope.analyzerService.enemyTeamHeroPick($scope.heroes[j].heroIndex);
              }
            }
          }
        }
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      }).finally(function () {
        $scope.parsingMatch = false;
      });
    }

    // Checks if element is Placeholder or Value; Return is color
    $scope.changeProgressbarColor = function (vari) {
      var cols = document.getElementById('progressValue');
      var greenValue = ((255 / (1.5 * (100 / 2))) * vari.value).toFixed(0);
      cols.style.background = 'rgba(' + (255 - greenValue) + ', 255, 0, 1)';
    };


    $scope.reloadData = function () {
      localStorage.setItem("offline", false);
      localStorage.removeItem("offline");
      $location.path("/");
    }

  }

})();

//noinspection JSUnresolvedFunction
angular
  .module('DotAAnalyzerApp')
  .directive('ngRightClick', function ($parse) {
    return function (scope, element, attrs) {
      //noinspection JSUnresolvedVariable
      let fn = $parse(attrs.ngRightClick);
      element.bind('contextmenu', function (event) {
        scope.$apply(function () {
          event.preventDefault();
          fn(scope, {$event: event});
        });
      });
    };
  });
