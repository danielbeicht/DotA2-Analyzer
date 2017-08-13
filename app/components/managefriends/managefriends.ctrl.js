(function () {
  'use strict';

  angular
    .module('DotAAnalyzerApp')
    .controller('managefriendsCtrl', managefriendsCtrl);

  managefriendsCtrl.$inject = ['$scope', 'DALogin'];


  function managefriendsCtrl($scope, DALogin) {
    $scope.loginService = DALogin;
    $scope.loginService.loginFunction();


  }
})();


