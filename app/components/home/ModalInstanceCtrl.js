angular.module('DotAAnalyzerApp').controller('ModalInstanceCtrl', function ($scope, $mdDialog, pickSetting) {
  $scope.ok = function (heroname) {
    var tempArray = [heroname, pickSetting];
    //$uibModalInstance.close(tempArray);
  };

  $scope.cancel = function () {
    //$uibModalInstance.dismiss('cancel');
  };



  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };
});