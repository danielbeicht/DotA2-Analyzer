/**
 * Created by Daniel on 19.01.2016.
 */
(function () {
    'use strict';

    angular
        .module('DotAAnalyzerApp')
        .controller('aboutCtrl', aboutCtrl);

    aboutCtrl.$inject = ['$scope', '$log', '$http', '$cookies'];


    function aboutCtrl($scope, $log, $http, $cookies) {


        $scope.loginFunction = function(){
            if ($cookies.get('user')){
                console.log($cookies.get('user'));
                var obj = JSON.parse($cookies.get('user'));
                $scope.username = obj.displayName;
                $scope.loggedIn = true;
            } else {
                $scope.message = "Not logged in";
                $scope.loggedIn = false;
            }
        }
        $scope.loginFunction();
    }
    })();


