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
      .state('dev', {
        url: '/dev',
        templateUrl: 'app/components/dev/dev.tpl.html',
        controller: 'devCtrl'
      })
      .state('input', {
        url: '/input',
        templateUrl: 'app/components/input/input.html',
        controller: 'inputCtrl'
      })
      .state('wizard', {
        url: '/wizard',
        templateUrl: 'app/components/input2/input2.html',
        controller: 'wizardCtrl'
      })
      .state('input3', {
        url: '/input3',
        templateUrl: 'app/components/input3/input3.html',
        controller: 'input3Ctrl'
      })

      .state('form', {
        url: '/form',
        templateUrl: 'app/components/input4/form.html',
        controller: 'formCtrl'
      })
      // nested states
      // each of these sections will have their own view
      // url will be nested (/form/profile)
      .state('form.company', {
        url: '/company',
        templateUrl: 'app/components/input4/form-1-company.html'
      })

      // url will be /form/interests
      .state('form.transaction', {
        url: '/transaction',
        templateUrl: 'app/components/input4/form-2-transaction.html'
      })

      // url will be /form/payment
      .state('form.covenants', {
        url: '/covenants',
        templateUrl: 'app/components/input4/form-3-covenants.html'
      });
    ;

    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }

})();