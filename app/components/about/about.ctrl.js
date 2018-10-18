(function () {
    'use strict';

    angular
        .module('DotAAnalyzerApp')
        .controller('aboutCtrl', aboutCtrl);

    aboutCtrl.$inject = ['$scope', 'DALogin'];

    function aboutCtrl($scope, DALogin) {
        $scope.loginService = DALogin;
        $scope.loginService.loginFunction();
    }
    })();