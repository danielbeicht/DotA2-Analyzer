/**
 * Created by s86370 on 27.10.2015.
 */
(function () {
  'use strict';
  //modules/services that the app uses/depends on
  angular
    .module('IBApp', [
      'ui.router',
      'ngResource',
      'ngAnimate',
      'ui.bootstrap',
      'angularSpinner',
      'checklist-model',
      'ngDialog',
      'mgo-angular-wizard',
      'sx.wizard'
    ]);

})();