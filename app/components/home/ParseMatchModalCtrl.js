
angular.module('DotAAnalyzerApp').controller('ParseMatchModalCtrl', function ($scope, $uibModalInstance, $http) {



  function parseMatchID (matchID) {

  }





  $scope.ok = function (matchID) {
    $scope.resetData();
    $scope.parsingMatch = true;
    var heroArray = [];
    console.log("DRIN1");
    var dataObj = {
      matchID : matchID
    };
    $http({
      method: 'POST',
      url: 'api/matchid',
      data: dataObj
    }).then(function successCallback(response) {
      if (response.data == "notfound"){
      } else if (response.data == "false") {
        $scope.showAPIError = true;
      } else {
        for (var i=0; i<5; i++){
          for (var j=0; j<$scope.heroes.length; j++){
            if ($scope.heroes[j].heroValveIndex == response.data[i]){
              heroArray[i] = $scope.heroes[j].heroIndex;
            }
          }
        }
        for (var i=5; i<10; i++){
          for (var j=0; j<$scope.heroes.length; j++){
            if ($scope.heroes[j].heroValveIndex == response.data[i]){
              heroArray[i] = $scope.heroes[j].heroIndex;
            }
          }
        }
      }
      $uibModalInstance.close(heroArray);
    }, function errorCallback(response) {
      $uibModalInstance.close(null);
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    }).finally(function() {
      $scope.parsingMatch = false;
    });
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss(null);
  };
});