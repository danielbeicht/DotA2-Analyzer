

(function () {
  'use strict';

  angular
    .module('DotAAnalyzerApp')
    .controller('menuCtrl', menuCtrl);

  menuCtrl.$inject = ['$scope', '$mdDialog', '$rootScope', '$state', 'DALogin'];


  function menuCtrl($scope, $mdDialog, $rootScope, $state, DALogin) {
    $rootScope.$state = $state;
    $scope.loginService = DALogin;
    $scope.loginService.loginFunction();

    $scope.currentNavItem = 'home';
    $scope.goto = function(page){
      $scope.currNavItem = page;
    };


  }
})();


