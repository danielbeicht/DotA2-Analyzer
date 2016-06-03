(function () {
  'use strict';

  //noinspection JSUnresolvedFunction
  angular
    .module('DotAAnalyzerApp')
    .controller('homeCtrl', homeCtrl);

  homeCtrl.$inject = ['$scope', '$http', '$uibModal', '$timeout', '$location', 'datastorage', 'DAAnalyzer', 'DALogin'];


  function homeCtrl($scope, $http, $uibModal, $timeout, $location, datastorage, DAAnalyzer, DALogin) {
    // Import services to use them in HTML-File
    $scope.loginService = DALogin;
    $scope.datastorage = datastorage;
    $scope.analyzerService = DAAnalyzer;

    // // Check if user is logged in (to edit navbar)
    $scope.loginService.loginFunction();

    //console.log(DAAnalyzer.yourTeamPicks);

    if (typeof datastorage.heroes === "undefined"){   // if page home directly called redirect to loading page
      $location.path( "/" );
    }

    initHeroPickerModal();
    // Initialize Heropicker Modal
    function initHeroPickerModal () {
      $scope.animationsEnabled = true;
      $scope.open = function (pickSetting) {
        var modalInstance = $uibModal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'myModalContent',
          controller: 'ModalInstanceCtrl',
          windowClass: 'app-modal-window',
          scope: $scope,
          size: 'lg',
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
                $scope.analyzerService.yourTeamHeroPick($scope.heroesSortedByIndex[i].heroIndex);
                break;
              }
            }
          } else if (pick === 'enemyTeamPick'){
            for (i=0; i < $scope.heroesSortedByIndex.length; i++){
              if ($scope.heroesSortedByIndex[i].heroName.trim() === selectedHero){
                $scope.analyzerService.enemyTeamHeroPick($scope.heroesSortedByIndex[i].heroIndex);
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
    }





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
        var selectedHero = $scope.analyzerService.heroesSortedByIndex[heroIndexParameter];
        for (i = 0; i < 5; i++){
          if ($scope.analyzerService.yourTeamPicks[i] != null && $scope.analyzerService.yourTeamPicks[i].heroIndex === selectedHero.heroIndex){
            $scope.analyzerService.yourTeamPicks[i] = null;
            $scope.analyzerService.updateAdvantages();
            return;
          } else if ($scope.analyzerService.enemyTeamPicks[i] != null && $scope.analyzerService.enemyTeamPicks[i].heroIndex === selectedHero.heroIndex){
            $scope.analyzerService.enemyTeamPicks[i] = null;
            $scope.analyzerService.updateAdvantages();
            return;
          }
        }
        for (i = 0; i < 10; i++) {
          if ($scope.analyzerService.heroBans[i] != null && $scope.analyzerService.heroBans[i].heroIndex === selectedHero.heroIndex) {
            $scope.analyzerService.heroBans[i] = null;
            return;
          }
        }
        //DAAnalyzer.yourTeamHeroPick(heroIndexParameter);
      $scope.analyzerService.yourTeamHeroPick(heroIndexParameter);

    };

    $scope.enemyTeamHeroClickImage = function (heroIndexParameter) {
        var i;
        var selectedHero = $scope.analyzerService.heroesSortedByIndex[heroIndexParameter];
        for (i = 0; i < 5; i++){
          if ($scope.analyzerService.enemyTeamPicks[i] != null && $scope.analyzerService.enemyTeamPicks[i].heroIndex === selectedHero.heroIndex){
            $scope.analyzerService.enemyTeamPicks[i] = null;
            $scope.analyzerService.updateAdvantages();
            return;
          } else if ($scope.analyzerService.yourTeamPicks[i] != null && $scope.analyzerService.yourTeamPicks[i].heroIndex === selectedHero.heroIndex){
            $scope.analyzerService.yourTeamPicks[i] = null;
            $scope.analyzerService.updateAdvantages();
            return;
          }
        }
        for (i = 0; i < 10; i++) {
          if ($scope.analyzerService.heroBans[i] != null && $scope.analyzerService.heroBans[i].heroIndex === selectedHero.heroIndex) {
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
          if ($scope.yourTeamPicks[i] != null && $scope.yourTeamPicks[i].heroIndex == index) {
            alreadyPicked = true;
            break;
          }

          if ($scope.enemyTeamPicks[i] != null && $scope.enemyTeamPicks[i].heroIndex == index) {
            alreadyPicked = true;
            break;
          }
        }
        for (i = 0; i < 10; i++) {

          if ($scope.heroBans[i] != null && $scope.heroBans[i].heroIndex == index) {
            alreadyPicked = true;
            break;
          }
        }
        return alreadyPicked;
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


    // Function called when a hero is banned
    function banHero(heroIndexParameter) {
      if (heroIndexParameter != null && $scope.allowBanning) {
        var selectedHero = $scope.analyzerService.heroesSortedByIndex[heroIndexParameter];
        var heroAlreadyPicked = false;
        var i;
        for (i = 0; i < 5; i++) {
          if (($scope.analyzerService.yourTeamPicks[i] != null && $scope.analyzerService.yourTeamPicks[i].heroIndex === selectedHero.heroIndex) || ($scope.analyzerService.enemyTeamPicks[i] != null && $scope.analyzerService.enemyTeamPicks[i].heroIndex === selectedHero.heroIndex)) {
            heroAlreadyPicked = true;
            break;
            // TODO: POPUP Held wurde bereits gewählt
          }
        }
        for (i = 0; i < 10; i++) {
          if ($scope.analyzerService.heroBans[i] != null && $scope.analyzerService.heroBans[i].heroIndex === selectedHero.heroIndex) {
            heroAlreadyPicked = true;
            break;
          }
        }

        if (!heroAlreadyPicked) {
          var heroBanned = false;
          for (i = 0; i < 10; i++) {
            if ($scope.analyzerService.heroBans[i] == null) {
              $scope.analyzerService.heroBans[i] = $scope.analyzerService.heroesSortedByIndex[heroIndexParameter];
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
