/**
 * Created by s86370 on 27.10.2015.
 */
(function () {
  'use strict';

  angular
    .module('IBApp')
    .controller('cardsCtrl', cardsCtrl);

  cardsCtrl.$inject = ['$scope', '$http', '$timeout'];

  function cardsCtrl($scope, $http, $timeout) {
    $http({
      method: 'GET',
      url: 'http://rest.mz-host.de:5015/DotAREST/webresources/heroes'
    }).then(function successCallback(response) {
      var heroes = response.data.hero;

      $scope.yourTeamHeroData = new Array(heroes.length);
      $scope.enemyTeamHeroData = new Array(heroes.length);

      // need deep copy here else pointing to same object later
      for (var i = 0; i < heroes.length; i++) {
        var heroYourTeam = angular.copy(heroes[i]);
        var heroEnemyTeam = angular.copy(heroes[i]);
        var pic = 'assets/images/heroes/' + heroes[i].heldFullName.trim().replace(/\s/gi, "_") + '.jpg';
        $scope.yourTeamHeroData[i] = {hero: heroYourTeam, winrate: 9, advantage: 7, normalizedAdvantage: 0, pic: pic};
        $scope.enemyTeamHeroData[i] = {hero: heroEnemyTeam, winrate: 0, advantage: 0, normalizedAdvantage: 0, pic: pic};
      }



      $timeout(function(){
        for (var i = 0; i < heroes.length; i++) {
          var c = document.getElementById("myHeroWin_" + i);
          c.height = 10;
          var ctx = c.getContext("2d");
          ctx.beginPath();
          ctx.moveTo(0, 5);
          ctx.lineTo(80, 5);
          ctx.lineWidth = 3;
          ctx.strokeStyle = 'green';
          ctx.stroke();

          c = document.getElementById("myHeroAdv_" + i);
          c.height = 10;
          ctx = c.getContext("2d");
          ctx.beginPath();
          ctx.moveTo(0, 5);
          ctx.lineTo(50, 5);
          ctx.lineWidth = 3;
          ctx.strokeStyle = 'blue';
          ctx.stroke();
        }

      },0);

    }, function errorCallback(response) {
    });
  }

})();