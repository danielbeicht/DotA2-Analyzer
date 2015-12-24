/**
 * Created by s86370 on 27.10.2015.
 */
(function () {
    'use strict';

    angular
        .module('IBApp')
        .controller('homeCtrl', homeCtrl);

    homeCtrl.$inject = ['$scope', '$http', 'TransactionsFactory', '$uibModal', '$log', '$state'];


    function homeCtrl($scope, $http, TransactionsFactory,  $uibModal, $log, $state) {
        initHome($scope, $http);

    }

    function initHome($scope, $http) {
        $scope.showSpinner = true;

        $http({
            method: 'GET',
            url: 'http://rest.mz-host.de:5015/DotAREST/webresources/heroes'
        }).then(function successCallback(response) {
            $scope.heroes = response.data.hero;                     // Mal sehen ob man das braucht; ansonsten in lokale Variable speichern

            // Erstelle zwei Arrays für beide Tabellen (initialisiere anfangs mit 0)
            $scope.yourTeamHeroData = new Array($scope.heroes.length);
            $scope.enemyTeamHeroData = new Array($scope.heroes.length);

            for (var i=0; i<$scope.heroes.length; i++){
                $scope.yourTeamHeroData[i] = {hero:$scope.heroes[i], winrate: 0, advantage: 0, normalizedAdvantage: 0, rank: 0};
                //
                //console.log($scope.yourTeamHeroData[i].hero.heldFullName + "/end")
                $scope.enemyTeamHeroData[i] = {hero:$scope.heroes[i], winrate: 0, advantage: 0, normalizedAdvantage: 0};
            }
            $scope.showSpinner = false;


            $scope.sortTypeYourTeam     = 'heldFullName'; // set the default sort type
            $scope.sortReverseYourTeam  = false;  // set the default sort order

            $scope.sortTypeEnemyTeam     = 'heldFullName'; // set the default sort type
            $scope.sortReverseEnemyTeam  = false;  // set the default sort order

            $scope.searchHeroYourTeam   = '';     // set the default search/filter term
            $scope.searchHeroEnemyTeam   = '';




            // this callback will be called asynchronously
            // when the response is available
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

        $scope.realh = [
            {text:"Standard Message"},
            {text:"Success Message!", type:"success"},
            {text:"Alert Message!", type : "alert"},
            {text:"secondary message...", type : "secondary"}
        ];
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

    function getCurrentTransactionById(transactionId, TransactionFactory, $log){
        return TransactionFactory.findById({id: transactionId},
            function success(){
                $log.info('GET transaction successful for id: ' + transactionId)
            },
            function err(){
                $log.error('Failed to GET for id: ' + transactionId);
            });
    }

})();