(function() {
  'use strict';
  angular
    .module('DotAAnalyzerApp')
    .service('DALogin', function($cookies, datastorage) {

      this.loginFunction = function(){
        if ($cookies.get('user')){
          var obj = JSON.parse($cookies.get('user'));
          this.loggedIn = true;
          //return true;
        } else {
          this.loggedIn = false;
          //return false;
        }
      }

      this.getLoggedUsername = function() {
        return JSON.parse($cookies.get('user')).displayName;
      }

      this.getSteamID = function() {
        return JSON.parse($cookies.get('user')).id;
      }

      this.getUserImageURL = function() {
        return JSON.parse($cookies.get('user'))._json.avatar;
      }

      this.logout = function() {
        this.loggedIn = false;
        $cookies.remove('user');
      }
    });
})();