/**
 * Created by Daniel on 27.10.2015.
 */
// general app js - route to url and render the template
(function () {
    'use strict';
    //noinspection JSUnresolvedFunction
  angular
        .module('DotAAnalyzerApp')
        .config(uiRouterConfig)
      .service("datastorage", function Greeting(){
          var greeting = this;
          greeting.message = "Default";
      });

    uiRouterConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$httpProvider'];

    function uiRouterConfig($stateProvider, $urlRouterProvider, $httpProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'app/components/home/home.tpl.html',
                controller: 'homeCtrl'
            })
            .state('about', {
                url: '/about',
                templateUrl: 'app/components/about/about.html',
                controller: 'aboutCtrl'
            })
          .state('loading', {
              url: '/',
              templateUrl: 'app/components/loading/loading.html',
              controller: 'loadingCtrl'
          })
        ;

        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }

})();