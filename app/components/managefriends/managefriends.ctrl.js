(function () {
  'use strict';

  angular
    .module('DotAAnalyzerApp')
    .controller('managefriendsCtrl', managefriendsCtrl);

  managefriendsCtrl.$inject = ['$scope', '$http', '$mdToast', 'DALogin'];


  function managefriendsCtrl($scope, $http, $mdToast, DALogin) {
    $scope.loginService = DALogin;
    $scope.loginService.loginFunction();
    $scope.friendList = [];

    $scope.loadFriends = function () {
      var dataObj = {
        accountID: DALogin.getSteamID(),
      };
      $http({
        method: 'POST',
        url: 'api/friends/friendlist',
        data: dataObj
      }).then(function successCallback(response) {
        console.log(response);
        $scope.friendList = [];
        $scope.friendList = response.data;
      }, function errorCallback(response) {

      });
    };
    $scope.loadFriends();



    $scope.saveFriend = function () {
      var dataObj = {
        accountID: DALogin.getSteamID(),
        name : $scope.friendName
      };

      $http({
        method: 'POST',
        url: 'api/friends/addFriend',
        data: dataObj
      }).then(function successCallback(response) {
        if (response.data == "OK"){
          $mdToast.show(
            $mdToast.simple()
              .textContent('Friend successfully created.')
              .position('bottom right')
              .hideDelay(3000)
          );
          $scope.loadFriends();
        } else {
          $mdToast.show(
            $mdToast.simple()
              .textContent('Error creating new friend. Please check your input.')
              .position('bottom right')
              .hideDelay(3000)
          );
        }
        console.log(response);

      }, function errorCallback(response) {

      });
    }

    $scope.friendSelected = function () {
      console.log("Friend selected")
    }

    $scope.deleteFriend = function (name) {
      var dataObj = {
        accountID: DALogin.getSteamID(),
        name : name
      };

      $http({
        method: 'POST',
        url: 'api/friends/deleteFriend',
        data: dataObj
      }).then(function successCallback(response) {
        $scope.loadFriends();
        $mdToast.show(
          $mdToast.simple()
            .textContent("Friend '" + dataObj.name + "' successfully deleted.")
            .position('bottom right')
            .hideDelay(3000)
        );
      }, function errorCallback(response) {

      });
    }


  }
})();


