/**
 * Created by Daniel on 27.10.2015.
 */
(function () {
  'use strict';

  //noinspection JSUnresolvedFunction
  angular
    .module('DotAAnalyzerApp')
    .controller('homeCtrl', homeCtrl);

  homeCtrl.$inject = ['$scope', '$http', '$log', '$uibModal'];


  function homeCtrl($scope, $http, $log, $uibModal) {
  $scope.debugFunction = function (){
    for (var i=0; i<$scope.heroes.length; i++){
    }
  };

    // Initialize Heropicker Modal
    $scope.animationsEnabled = true;
    $scope.open = function (pickSetting) {
      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'myModalContent.html',
        controller: 'ModalInstanceCtrl',
        windowClass: 'app-modal-window',
        scope: $scope,
        resolve: {
          pickSetting: function() {
            return pickSetting;
          }
        }
      });
      modalInstance.result.then(function (result) {
        var selectedHero = result[0];
        var pick = result[1];
        var i;
        if (pick === 'yourTeamPick'){
          for (i=0; i < $scope.heroesSortedByIndex.length; i++){
            if ($scope.heroesSortedByIndex[i].heroName.trim() === selectedHero){
              yourTeamHeroPick($scope.heroesSortedByIndex[i].heroIndex);
              break;
            }
          }
        } else if (pick === 'enemyTeamPick'){
          for (i=0; i < $scope.heroesSortedByIndex.length; i++){
            if ($scope.heroesSortedByIndex[i].heroName.trim() === selectedHero){
              enemyTeamHeroPick($scope.heroesSortedByIndex[i].heroIndex);
              break;
            }
          }
        } else if (pick === 'ban') {
          for (i=0; i < $scope.heroesSortedByIndex.length; i++){
            if ($scope.heroesSortedByIndex[i].heroName.trim() === selectedHero){
              banHero($scope.heroesSortedByIndex[i].heroIndex);
              break;
            }
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
    $scope.yourTeamHeroPick = yourTeamHeroPick;
    $scope.enemyTeamHeroPick = enemyTeamHeroPick;
    $scope.banHero = banHero;
    $scope.updateAdvantages = updateAdvantages;


    $scope.$watch('allowBanning', function (newValue) {
      if (newValue == false) {
        for (var i = 0; i < 10; i++) {
          $scope.heroBans[i] = null;
        }
      }
    });

    function initHome() {
      $scope.dataLoaded = false;
      $scope.yourTeamPicks = new Array(5);
      $scope.enemyTeamPicks = new Array(5);
      $scope.heroBans = new Array(10);
      $scope.allowBanning = false;

      $scope.sortTypeYourTeam = 'yourTeamAdvantage'; // set the default sort type
      $scope.sortReverseYourTeam = true;  // set the default sort order

      $scope.sortTypeEnemyTeam = 'enemyTeamAdvantage'; // set the default sort type
      $scope.sortReverseEnemyTeam = true;  // set the default sort order

      $scope.searchHeroYourTeam = '';     // set the default search/filter term
      $scope.searchHeroEnemyTeam = '';

      $scope.yourTeamOverallAdvantage = 0.0;
      $scope.enemyTeamOverallAdvantage = 0.0;


      $scope.overallAdvantages = [];
      $scope.overallAdvantages.push({
        value: 0,
        type: 'success'
      });
      $scope.overallAdvantages.push({
        value: 0,
        type: 'alert'
      });



      // Get all heroes
      $http({
        method: 'GET',
        url: 'http://rest.mz-host.de:5016/DotAREST/webresources/heroes'
      }).then(function successCallback(response) {
        var heroesTemp = response.data.hero;
        var i;
        $scope.heroes = new Array(heroesTemp.length);
        for (i = 0; i < $scope.heroes.length; i++) {
          //noinspection JSUnresolvedVariable
          $scope.heroes[i] = {
            heroIndex: heroesTemp[i].heldIndex,
            heroID: heroesTemp[i].heldID,
            heroFullName: heroesTemp[i].heldFullName,
            heroName: heroesTemp[i].heldName,
            heroImageURL: 'assets/images/heroes/' + heroesTemp[i].heldFullName.trim().replace(/\s/gi, "_") + '.jpg',
            yourTeamAdvantage: 0,
            enemyTeamAdvantage: 0,
            yourTeamWinrate: '0.00',
            enemyTeamWinrate: '0.00'
          };
        }

        // Create Array to select heroes by Index in O(1) (references)
        $scope.heroesSortedByIndex = new Array($scope.heroes.length);
        for (i = 0; i < $scope.heroes.length; i++) {
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
        url: 'http://rest.mz-host.de:5016/DotAREST/webresources/matchups'
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
            $scope.matchups[$scope.heroes[i].heroIndex][$scope.heroes[j].heroIndex] = response.data.matchup[i * $scope.heroes.length + j];
          }
        }
        $log.info("Matchups Initialized");
        $scope.dataLoaded = true;
        // this callback will be called asynchronously
        // when the response is available
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      });

      $scope.picked = function (index) {
        var exists = false;
        var i;
        for (i = 0; i < 5; i++) {
          if ($scope.yourTeamPicks[i] != null && $scope.yourTeamPicks[i].heroIndex == index) {
            exists = true;
            break;
          }

          if ($scope.enemyTeamPicks[i] != null && $scope.enemyTeamPicks[i].heroIndex == index) {
            exists = true;
            break;
          }
        }
        for (i = 0; i < 10; i++) {

          if ($scope.heroBans[i] != null && $scope.heroBans[i].heroIndex == index) {
            exists = true;
            break;
          }
        }

        return !exists;
      };

      $scope.realh = [
        {text: 'Standard Message'},
        {text: 'Success Message!', type: "success"},
        {text: 'Alert Message!', type: "alert"},
        {text: 'secondary message...', type: 'secondary'}
      ];
    }

    // return image URL (gray when picked; with color when unpicked)
    $scope.pickedHeroName = function (heroIndex){
      var i;
      for (i=0; i<5; i++) {
        if ($scope.heroesSortedByIndex[heroIndex] == $scope.yourTeamPicks[i]){
          return "assets/images/heroes_gray/" + $scope.heroesSortedByIndex[heroIndex].heroFullName.trim().replace(/\s/gi, "_") + '.jpg';
        } else if ($scope.heroesSortedByIndex[heroIndex] == $scope.enemyTeamPicks[i]){
          return "assets/images/heroes_gray/" + $scope.heroesSortedByIndex[heroIndex].heroFullName.trim().replace(/\s/gi, "_") + '.jpg';
        }
      }
      for (i=0; i<10; i++) {
        if ($scope.heroesSortedByIndex[heroIndex] == $scope.heroBans[i]) {
          return "assets/images/heroes_gray/" + $scope.heroesSortedByIndex[heroIndex].heroFullName.trim().replace(/\s/gi, "_") + '.jpg';
        }
      }
      return "assets/images/heroes/" + $scope.heroesSortedByIndex[heroIndex].heroFullName.trim().replace(/\s/gi, "_") + '.jpg';
    };

    // call on 1st load + reload
    initHome();

    // Function called when a hero is picked for you team; Adds hero to yourTeamPicks-Array
    function yourTeamHeroPick(heroIndexParameter) {
      if (heroIndexParameter != null) {
        var selectedHero = $scope.heroesSortedByIndex[heroIndexParameter];
        var heroAlreadyPicked = false;
        var i;
        for (i = 0; i < 5; i++) {
          if (($scope.yourTeamPicks[i] != null && $scope.yourTeamPicks[i].heroIndex === selectedHero.heroIndex) || ($scope.enemyTeamPicks[i] != null && $scope.enemyTeamPicks[i].heroIndex === selectedHero.heroIndex)) {
            heroAlreadyPicked = true;
            // TODO: POPUP Held wurde bereits gewählt
          }
        }
        for (i = 0; i < 10; i++) {
          if ($scope.heroBans[i] != null && $scope.heroBans[i].heroIndex === selectedHero.heroIndex) {
            heroAlreadyPicked = true;
          }
        }

        if (!heroAlreadyPicked) {
          var heroPicked = false;
          for (i = 0; i < 5; i++) {
            if ($scope.yourTeamPicks[i] == null) {
              $scope.yourTeamPicks[i] = $scope.heroesSortedByIndex[heroIndexParameter];
              heroPicked = true;

              break;
            }
          }
          if (heroPicked == false) {
            // TODO: POPUP Alle 5 Helden bereits gewählt
          }
        }
      }
      $scope.updateAdvantages();
    }

    // Function called when a hero is picked for enemy team; Adds hero to enemyTeamPicks-Array
    function enemyTeamHeroPick(heroIndexParameter) {
      if (heroIndexParameter != null) {
        var selectedHero = $scope.heroesSortedByIndex[heroIndexParameter];
        var heroAlreadyPicked = false;
        var i;
        for (i = 0; i < 5; i++) {
          if (($scope.yourTeamPicks[i] != null && $scope.yourTeamPicks[i].heroIndex === selectedHero.heroIndex) || ($scope.enemyTeamPicks[i] != null && $scope.enemyTeamPicks[i].heroIndex === selectedHero.heroIndex)) {
            heroAlreadyPicked = true;
            break;
            // TODO: POPUP Held wurde bereits gewählt
          }
        }
        for (i = 0; i < 10; i++) {
          if ($scope.heroBans[i] != null && $scope.heroBans[i].heroIndex === selectedHero.heroIndex) {
            heroAlreadyPicked = true;
            break;
          }
        }

        if (!heroAlreadyPicked) {
          var heroPicked = false;
          for (i = 0; i < 5; i++) {
            if ($scope.enemyTeamPicks[i] == null) {
              $scope.enemyTeamPicks[i] = $scope.heroesSortedByIndex[heroIndexParameter];
              heroPicked = true;
              $scope.enemyTeamOverallAdvantage += $scope.heroesSortedByIndex[heroIndexParameter].enemyTeamAdvantage;
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

    // Function called when a hero is banned
    function banHero(heroIndexParameter) {
      if (heroIndexParameter != null && $scope.allowBanning) {
        var selectedHero = $scope.heroesSortedByIndex[heroIndexParameter];
        var heroAlreadyPicked = false;
        var i;
        for (i = 0; i < 5; i++) {
          if (($scope.yourTeamPicks[i] != null && $scope.yourTeamPicks[i].heroIndex === selectedHero.heroIndex) || ($scope.enemyTeamPicks[i] != null && $scope.enemyTeamPicks[i].heroIndex === selectedHero.heroIndex)) {
            heroAlreadyPicked = true;
            break;
            // TODO: POPUP Held wurde bereits gewählt
          }
        }
        for (i = 0; i < 10; i++) {
          if ($scope.heroBans[i] != null && $scope.heroBans[i].heroIndex === selectedHero.heroIndex) {
            heroAlreadyPicked = true;
            break;
          }
        }

        if (!heroAlreadyPicked) {
          var heroBanned = false;
          for (i = 0; i < 10; i++) {
            if ($scope.heroBans[i] == null) {
              $scope.heroBans[i] = $scope.heroesSortedByIndex[heroIndexParameter];
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

    // Update hero Advantages
    function updateAdvantages() {
      // TODO: Get Info about partaking players

      var i, j;
      for (i = 0; i < $scope.heroesSortedByIndex.length; i++) {
        var exit = false;
        for (j = 0; j < 5; j++) {
          if ($scope.yourTeamPicks[j] != null && $scope.yourTeamPicks[j].heroIndex == i) {
            exit = true;
            break;
          } else if ($scope.enemyTeamPicks[j] != null && $scope.enemyTeamPicks[j].heroIndex == i) {
            exit = true;
            break;
          }
        }
        if (!exit) {
          for (j = 0; j < 10; j++) {
            if ($scope.heroBans[j] != null && $scope.heroBans[j].heroIndex == i) {
              exit = true;
              break;
            }
          }
        }

        if (exit) {
          $scope.heroesSortedByIndex[i].yourTeamWinrate = '0.00';
          $scope.heroesSortedByIndex[i].enemyTeamWinrate = '0.00';
          //continue;
        }
        var teamAdvantage = 0.0;
        var enemyAdvantage = 0.0;
        var teamWinrate = 0.0;
        var enemyWinrate = 0.0;
        var teamHeroCount = 0;
        var enemyHeroCount = 0;

        for (j = 0; j < 5; j++) {
          if ($scope.enemyTeamPicks[j] != null) {
            teamAdvantage += parseFloat($scope.matchups[i][$scope.enemyTeamPicks[j].heroIndex].advantage);
            teamWinrate += parseFloat($scope.matchups[i][$scope.enemyTeamPicks[j].heroIndex].winrate);
            enemyHeroCount++;
          }
        }
        for (j = 0; j < 5; j++) {
          if ($scope.yourTeamPicks[j] != null) {
            enemyAdvantage += parseFloat($scope.matchups[i][$scope.yourTeamPicks[j].heroIndex].advantage);
            enemyWinrate += parseFloat($scope.matchups[i][$scope.yourTeamPicks[j].heroIndex].winrate);
            teamHeroCount++;
          }
        }
        if (teamHeroCount == 0) {
          teamHeroCount = 1;
        }
        if (enemyHeroCount == 0) {
          enemyHeroCount = 1;
        }

        $scope.heroesSortedByIndex[i].yourTeamAdvantage = parseFloat(teamAdvantage.toFixed(2));
        $scope.heroesSortedByIndex[i].enemyTeamAdvantage = parseFloat(enemyAdvantage.toFixed(2));
        $scope.heroesSortedByIndex[i].yourTeamWinrate = (parseFloat(teamWinrate) / parseFloat(enemyHeroCount)).toFixed(2);
        $scope.heroesSortedByIndex[i].enemyTeamWinrate = (parseFloat(enemyWinrate) / parseFloat(teamHeroCount)).toFixed(2);
      }

      $scope.yourTeamOverallAdvantage = 0;
      $scope.enemyTeamOverallAdvantage = 0;
      for (i=0; i < 5; i++) {
        if ($scope.yourTeamPicks[i] != null) {
          $scope.yourTeamOverallAdvantage += $scope.yourTeamPicks[i].yourTeamAdvantage;
        }
        if ($scope.enemyTeamPicks[i] != null) {
          $scope.enemyTeamOverallAdvantage += $scope.enemyTeamPicks[i].enemyTeamAdvantage;
        }
      }

      /* Array stacked stores all ui-bar objects
      yourTeamValue and enemyTeamValue are the calculated values which are needed to display them on a 0-100 ui-bar
      */
      $scope.stacked = [];
      $scope.maxAdvantage = 100;
      var multiplier = 100/$scope.maxAdvantage;
      var yourTeamValue = $scope.yourTeamOverallAdvantage/$scope.maxAdvantage*50;
      var enemyTeamValue = $scope.enemyTeamOverallAdvantage/$scope.maxAdvantage*50;
      var difference;
      if (yourTeamValue >= enemyTeamValue) {
        difference = yourTeamValue - enemyTeamValue;
        $scope.stacked.push({
          value: ($scope.maxAdvantage/2 - difference)*multiplier.toFixed(2),
          adv: '',
          isPlaceholder: true
        });
        $scope.stacked.push({
          value: (difference*multiplier).toFixed(2),
          adv: (difference).toFixed(2),
          isPlaceholder: false
        });
      } else {
        difference = enemyTeamValue - yourTeamValue;
        $scope.stacked.push({
          value: (50),
          adv: '',
          isPlaceholder: true,
          isValue: false
        });
        $scope.stacked.push({
          value: (difference*multiplier).toFixed(2),
          adv: (difference).toFixed(2),
          isPlaceholder: false,
          isValue: true
        });
      }
    }


    // Checks if element is Placeholder or Value; Return is color
    $scope.changeProgressbarColor = function(vari) {
      var cols = document.getElementById('progressValue');
      var greenValue = ((255/(1.5*($scope.maxAdvantage/2)))*vari.value).toFixed(0);
      cols.style.background = 'rgba(' + (255-greenValue) + ', 255, 0, 1)';
    };



    // Sort heroes by Index
    function compare(a, b) {
      if (parseInt(a.heroIndex) < parseInt(b.heroIndex))
        return -1;
      if (parseInt(a.heroIndex) > parseInt(b.heroIndex))
        return 1;
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
