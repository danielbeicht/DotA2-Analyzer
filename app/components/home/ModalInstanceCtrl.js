angular.module('DotAAnalyzerApp').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, pickSetting) {
  $scope.ok = function (heroname) {
    var tempArray = [heroname, pickSetting];
    $uibModalInstance.close(tempArray);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});