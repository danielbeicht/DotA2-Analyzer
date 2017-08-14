(function () {
  'use strict';

  angular
    .module('DotAAnalyzerApp')
    .controller('managefriendsCtrl', managefriendsCtrl);

  managefriendsCtrl.$inject = ['$scope', '$http', '$mdToast', 'DALogin', 'DAAnalyzer'];


  function managefriendsCtrl($scope, $http, $mdToast, DALogin, DAAnalyzer) {
    $scope.loginService = DALogin;
    $scope.analyzerService = DAAnalyzer;
    $scope.loginService.loginFunction();
    $scope.friendList = [];
    $scope.selectedFriend = null;
    $scope.heroList = [];



    $scope.loadFriends = function () {
      var dataObj = {
        accountID: DALogin.getSteamID(),
      };
      $http({
        method: 'POST',
        url: 'api/friends/friendlist',
        data: dataObj
      }).then(function successCallback(response) {
        $scope.friendList = response.data;
        if ($scope.friendList.length > 0) {
          console.log($scope.friendList[0].FriendName)
          $scope.selectedFriend = $scope.friendList[0].FriendName;
          $scope.getHeroList();
        }
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

    $scope.friendSelected = function (friend) {
      $scope.selectedFriend = friend.FriendName;
      $scope.getHeroList();
    }

    $scope.getHeroList = function () {
      var dataObj = {
        accountID: DALogin.getSteamID(),
        name : $scope.selectedFriend
      };
      $http({
        method: 'POST',
        url: 'api/friends/friendHeroList',
        data: dataObj
      }).then(function successCallback(response) {
        $scope.heroList = response.data;
      }, function errorCallback(response) {
      });
    }

    $scope.deleteFriend = function (name) {
      console.log("DELETE FRIEND CALLED ")
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

    $scope.addHeroToFriend = function(){
      var heroID = $scope.analyzerService.heroesSortedByIndex[$scope.selectHeroAdd-1].heroValveIndex;
      console.log($scope.analyzerService.heroesValve[114].heroImageURL)
      var dataObj = {
        accountID: DALogin.getSteamID(),
        name : $scope.selectedFriend,
        heroID : heroID
      };

      $http({
        method: 'POST',
        url: 'api/friends/addHeroToFriend',
        data: dataObj
      }).then(function successCallback(response) {
        $scope.getHeroList();
        $mdToast.show(
          $mdToast.simple()
            .textContent("Hero successfully added.")
            .position('bottom right')
            .hideDelay(3000)
        );
      }, function errorCallback(response) {
      });
    }
    
    $scope.deleteFriendHero = function (hero) {
      var dataObj = {
        accountID: DALogin.getSteamID(),
        name : $scope.selectedFriend,
        heroID : hero.HeroID
      };

      $http({
        method: 'POST',
        url: 'api/friends/deleteFriendHero',
        data: dataObj
      }).then(function successCallback(response) {
        $scope.getHeroList();
        $mdToast.show(
          $mdToast.simple()
            .textContent("Hero successfully deleted.")
            .position('bottom right')
            .hideDelay(3000)
        );
      }, function errorCallback(response) {
      });
    }


  }
})();


