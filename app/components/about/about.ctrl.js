/**
 * Created by Daniel on 19.01.2016.
 */
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


