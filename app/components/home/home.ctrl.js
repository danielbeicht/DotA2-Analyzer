/**
 * Created by s86370 on 27.10.2015.
 */
(function () {
    'use strict';

    angular
        .module('IBApp')
        .controller('homeCtrl', homeCtrl);

    homeCtrl.$inject = ['$scope', '$http', 'TransactionsFactory', '$uibModal', '$log', '$state'];


    function homeCtrl($scope, $http, TransactionsFactory, $uibModal, $log, $state) {
        initHome($scope, $http);


    }

    function initHome($scope, $http) {


        $scope.showSpinner = true;

        $http.get("http://rest.mz-host.de:5015/DotAREST/webresources/heroes")
            //.then(function(response) {$scope.heroes = response.data.hero;});
            .success(function (result) {
                $scope.heroes = result.hero;
                $scope.showSpinner = false;
            })
            .error(function (result, status) {
                console.log(result + status);
            });


        // Von Li
        /*
         $scope.hero = TransactionsFactory.findAll({},
         function success() {
         $scope.showSpinner = false;
         console.log('GET Request for getting all Transactions successful');
         console.log($scope.hero);
         },
         function err() {
         $scope.serverErrRes = 'Failed to load data from server.';
         });
         testpush
         */
        $scope.realh = [
            {text: "Standard Message"},
            {text: "Success Message!", type: "success"},
            {text: "Alert Message!", type: "alert"},
            {text: "secondary message...", type: "secondary"}
        ];

        $scope.currentTransaction = null;
        $scope.sortType = 'signDate'; // set the default sort type
        $scope.sortDesc = true;  // set the default sort order
    }

    function openModal($uibModal, $scope, $log, tplUrl, ctrl) {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: tplUrl,
            controller: ctrl,
            scope: $scope,
            size: 'lg'
        });
        modalInstance.result.then(function (inputTransaction) {
            $scope.modalInput = inputTransaction;
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    }

    function getCurrentTransactionById(transactionId, TransactionFactory, $log) {
        return TransactionFactory.findById({id: transactionId},
            function success() {
                $log.info('GET transaction successful for id: ' + transactionId)
            },
            function err() {
                $log.error('Failed to GET for id: ' + transactionId);
            });
    }

})();