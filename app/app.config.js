/**
 * Created by s86370 on 27.10.2015.
 */
// general app js - route to url and render the template
(function () {
    'use strict';
    angular
        .module('DotAAnalyzerApp')
        .config(['ngDialogProvider', function (ngDialogProvider) {
            ngDialogProvider.setDefaults({
                className: 'ngdialog-theme-default',
                plain: false,
                showClose: true,
                closeByDocument: true,
                closeByEscape: true,
                appendTo: false,
                preCloseCallback: function () {
                    console.log('default pre-close callback');
                }
            });
        }]);
})();