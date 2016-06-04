(function() {
  'use strict';
  angular
    .module('DotAAnalyzerApp')
    .service('DALogin', function($cookies) {

      // Check if cookie exists
      this.loginFunction = function(){
        if ($cookies.get('user')){
          this.loggedIn = true;
        } else {
          this.loggedIn = false;
        }
      }

      // Read username from cookie
      this.getLoggedUsername = function() {
        return JSON.parse($cookies.get('user')).displayName;
      }

      // Read SteamID from Cookie (needs to be parsed)
      this.getSteamID = function() {
          if ($cookies.get('user')){
              return JSON.parse($cookies.get('user')).id;
          }
        return;
      }

      // Read User Avatar URL from Cookie
      this.getUserImageURL = function() {
          if ($cookies.get('user')){
              return JSON.parse($cookies.get('user'))._json.avatar;
          }
          return;
      }

      // Delete Cookie to logout
      this.logout = function() {
        this.loggedIn = false;
        $cookies.remove('user');
      }
    });
})();