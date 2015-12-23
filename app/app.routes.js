/**
 * Created by s86370 on 27.10.2015.
 */
// general app js - route to url and render the template
(function () {
    'use strict';
    angular
        .module('IBApp')
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
            .state('details', {
                url: '/details/:id',
                templateUrl: 'app/components/detail/read/detail.read.html',
                controller: 'detailReadCtrl'
            })
            .state('about', {
                url: '/about',
                templateUrl: 'app/components/about/about.tpl.html',
                controller: 'aboutCtrl'
            })
        ;

        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }

})();