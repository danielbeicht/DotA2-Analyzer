/**
 * Created by Daniel on 19.01.2016.
 */
(function () {
    'use strict';

    angular
        .module('DotAAnalyzerApp')
        .controller('lastmatchesCtrl', lastmatchesCtrl);

    lastmatchesCtrl.$inject = ['$scope', '$log', '$http', '$cookies'];


    function lastmatchesCtrl($scope, $log, $http, $cookies) {
        $scope.logout = function() {
            $cookies.remove('user');
            $scope.loginFunction();
        }

        $scope.loginFunction = function(){
            if ($cookies.get('user')){
                console.log($cookies.get('user'));
                var obj = JSON.parse($cookies.get('user'));
                console.log(obj);
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


