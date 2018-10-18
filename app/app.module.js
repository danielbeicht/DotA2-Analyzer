(function () {
    'use strict';
    //modules/services that the app uses/depends on
    angular
        .module('DotAAnalyzerApp', [
            'ui.router',
            'ngResource',
            'ui.bootstrap',
            'ngAnimate',
            'angular-loading-bar',
            'ngCookies',
            'ngMaterial',
            'ngMessages'
        ]).config(function($mdThemingProvider) {
      $mdThemingProvider.theme('default')
        .primaryPalette('blue-grey')
        .accentPalette('pink');
    });
})();

