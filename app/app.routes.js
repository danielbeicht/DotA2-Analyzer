/**
 * Created by s86370 on 27.10.2015.
 */
// general app js - route to url and render the template
(function () {
    'use strict';
    //noinspection JSUnresolvedFunction
  angular
        .module('DotAAnalyzerApp')
        .config(uiRouterConfig);

    uiRouterConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$httpProvider'];

    function uiRouterConfig($stateProvider, $urlRouterProvider, $httpProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'app/components/home/home.tpl.html',
                controller: 'homeCtrl'
            })
            .state('about', {
                url: '/about',
                templateUrl: 'app/components/about/about.html',
                controller: 'aboutCtrl'
            })
          .state('cards', {
              url: '/cards',
              templateUrl: 'app/components/cards/cards.html',
              controller: 'cardsCtrl'
          })
        ;

        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }

})();