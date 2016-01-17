/**
 * Created by Daniel on 14.01.2016.
 */
/*
console.log("AUSGEFÜHRT");
(function () {
  'use strict';

  angular
    .module('IBApp')
    .controller('ModalInstanceCtrl', ModalInstanceCtrl);

  ModalInstanceCtrl.$inject = ['$scope', '$uibModalInstance', 'items'];


  function ModalInstanceCtrl($scope, $uibModalInstance, items) {
    $scope.items = items;
    $scope.selected = {
      item: $scope.items[0]
    };

    $scope.ok = function () {
      $uibModalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }

})();*/

angular.module('IBApp').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, pickSetting) {




  $scope.ok = function (heroname) {
    console.log("OK fired");
    var tempArray = new Array(heroname, pickSetting);
    $uibModalInstance.close(tempArray);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});