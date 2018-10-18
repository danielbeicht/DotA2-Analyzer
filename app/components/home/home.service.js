/**
 * Created by s86370 on 27.10.2015.
 */

(function () {
    'use strict';
    var baseUrl = 'http://rest.mz-host.de:5015/DotAREST/webresources';
    angular
        .module('DotAAnalyzerApp')
        .config(['$resourceProvider', resourceConfig])
        .factory('TransactionsFactory', TransactionsFactory);

    TransactionsFactory.$inject = ['$resource'];

    function TransactionsFactory($resource) {
        return $resource(baseUrl + '/heroes', {}, {
            findAll: {method: 'GET'},
            create: {method: 'POST'}
        })
    }

    function resourceConfig($resourceProvider) {
        $resourceProvider.defaults.stripTrailingSlashes = false;
    }
})();