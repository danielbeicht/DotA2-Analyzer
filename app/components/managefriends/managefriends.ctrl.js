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
    $scope.datastorage = datastorage

    $scope.steamFriendHeroes = [];

    $scope.opendotaFriendRequestCounter = 0;

    $scope.spinnerFriendsLoaded = false;
    $scope.spinnerHeroListLoaded = false;
    $scope.heroesArray = datastorage.heroesArray;

    if (typeof datastorage.heroes === "undefined"){   // if page home directly called redirect to loading page
      $location.path( "/" );
      return;
    }


    $scope.getHeightPercentage = function(percentage){
      console.log(window.innerHeight*percentage + 'px')
      return (window.innerHeight*percentage + 'px')
    };

    $scope.getLastMatchDate = function(dateInSeconds){
      var utcSeconds = dateInSeconds;
      var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
      d.setUTCSeconds(utcSeconds);
      return d.toLocaleDateString();
    };

    $scope.addSteamHeroToFriend = function(heroID) {
      let dataObj = {
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
    };





    $scope.loadSteamFriends = function() {
      let requestsFinished = 0;
      let opendotaRequest = [];


      if (typeof datastorage.steamFriends == 'undefined'){
        let dataObj = {
          accountID: DALogin.getSteamID(),
        };
        $http({
          method: 'POST',
          url: 'api/friends/steamfriendlist',
          data: dataObj
        }).then(function successCallback(steamfriendlistResponse) {

          datastorage.steamFriends = [];
          for (let i in steamfriendlistResponse.data){

            //opendotaRequest.push('https://api.opendota.com/api/players/' + steamfriendlistResponse.data[i]);
            $scope.opendotaFriendRequestCounter++;
            GetRequestWithRetry('https://api.opendota.com/api/players/' + steamfriendlistResponse.data[i], loadSteamFriendsCallback);
          }

        }, function errorCallback(response) {

        });
      } else {
        console.log(datastorage.steamFriends)
      }

    };
    $scope.loadSteamFriends();

    function loadSteamFriendsCallback(opendotaplayersResponse){
      if (typeof opendotaplayersResponse.data.profile != 'undefined'){
        let player = {
          accountID: opendotaplayersResponse.data.profile.account_id,
          steamID: opendotaplayersResponse.data.profile.steamid,
          avatar: opendotaplayersResponse.data.profile.avatarmedium,
          name: opendotaplayersResponse.data.profile.personaname
        };
        datastorage.steamFriends.push(player);
      }
      $scope.opendotaFriendRequestCounter--;
    }


    function GetRequestWithRetry(url, callback){
      $http({
        method: 'GET',
        url: url ,
      }).then(callback, async function errorCallback(response) {
        await sleep (60000);
        GetRequestWithRetry(response.config.url, callback);
        console.log(response);
      });
    }


    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }










    $scope.steamFriendSelected = function(steamFriend){
      function compareMatchCount( a, b ) {
        if ( a.games > b.games ){
          return -1;
        }
        if ( a.games < b.games ){
          return 1;
        }
        return 0;
      }

      GetRequestWithRetry('https://api.opendota.com/api/players/' + steamFriend.accountID + '/heroes', function(response){
        $scope.steamFriendHeroes = response.data;
        $scope.steamFriendHeroes.sort(compareMatchCount);
        for (let i=$scope.steamFriendHeroes.length-1; i>0; i--){
          if ($scope.steamFriendHeroes[i].games === 0){
            $scope.steamFriendHeroes.pop();
          }
        }
        $scope.selectedSteamFriend = steamFriend;
      });


    };





    $scope.loadFriends = function () {
      let dataObj = {
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
      let dataObj = {
        accountID: DALogin.getSteamID(),
        name : $scope.friendName
      };

      $http({
        method: 'POST',
        url: 'api/friends/addFriend',
        data: dataObj
      }).then(function successCallback(response) {
        if (response.data === "OK"){
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
    };

    $scope.friendSelected = function (friend) {
      console.log($scope.opendotaFriendRequestCounter);
      $scope.selectedFriend = friend.FriendName;
      $scope.spinnerHeroListLoaded = false;
      $scope.getHeroList();
    };

    $scope.getHeroList = function () {
      let dataObj = {
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
    };

    $scope.deleteFriend = function (name) {
      let dataObj = {
        accountID: DALogin.getSteamID(),
        name : name
      };

      $http({
        method: 'POST',
        url: 'api/friends/deleteFriend',
        data: dataObj
      }).then(function successCallback() {
        $scope.loadFriends();
        $mdToast.show(
          $mdToast.simple()
            .textContent("Friend '" + dataObj.name + "' successfully deleted.")
            .position('bottom right')
            .hideDelay(3000)
        );
      }, function errorCallback(response) {
      });
    };

    $scope.addHeroToFriend = function(){
      let heroID = $scope.analyzerService.heroes[($scope.selectHeroAdd).toString()].heroID;
      let dataObj = {
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
    };
    
    $scope.deleteFriendHero = function (hero) {
      let dataObj = {
        accountID: DALogin.getSteamID(),
        name : $scope.selectedFriend,
        heroID : hero.HeroID
      };



      $http({
        method: 'POST',
        url: 'api/friends/deleteFriendHero',
        data: dataObj
      }).then(function successCallback() {
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


