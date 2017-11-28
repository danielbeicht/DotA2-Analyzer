(function () {
  'use strict';

  angular
    .module('DotAAnalyzerApp')
    .controller('managefriendsCtrl', managefriendsCtrl);

  managefriendsCtrl.$inject = ['$scope', '$http', '$mdToast', '$location', 'DALogin', 'DAAnalyzer', 'datastorage'];


  function managefriendsCtrl($scope, $http, $mdToast, $location, DALogin, DAAnalyzer, datastorage) {
    $scope.loginService = DALogin;
    $scope.analyzerService = DAAnalyzer;
    $scope.loginService.loginFunction();
    $scope.friendList = [];
    $scope.selectedFriend = null;
    $scope.heroList = [];

    $scope.spinnerFriendsLoaded = false;
    $scope.spinnerHeroListLoaded = false;
    $scope.heroesArray = datastorage.heroesArray;

    if (typeof datastorage.heroes === "undefined"){   // if page home directly called redirect to loading page
      $location.path( "/" );
      return;
    }



    $scope.loadFriends = function () {
      var dataObj = {
        accountID: DALogin.getSteamID(),
      };
      $http({
        method: 'POST',
        url: 'api/friends/friendlist',
        data: dataObj
      }).then(function successCallback(response) {
        $scope.spinnerFriendsLoaded = true;
        $scope.friendList = response.data;
        if ($scope.friendList.length > 0) {
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
        $scope.friendName = "";

      }, function errorCallback(response) {

      });
    }

    $scope.friendSelected = function (friend) {
      $scope.selectedFriend = friend.FriendName;
      $scope.spinnerHeroListLoaded = false;
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
        $scope.spinnerHeroListLoaded = true;
        $scope.heroList = response.data;
      }, function errorCallback(response) {
      });
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

    $scope.addHeroToFriend = function(){
      var heroID = $scope.analyzerService.heroes[($scope.selectHeroAdd).toString()].heroID;
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
            .textContent(response.data.text)
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


