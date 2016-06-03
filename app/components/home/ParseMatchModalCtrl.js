
angular.module('DotAAnalyzerApp').controller('ParseMatchModalCtrl', function ($scope, $uibModalInstance, $http, DAAnalyzer) {



  function parseMatchID (matchID) {

  }


  $scope.ok = function (matchID) {
    DAAnalyzer.resetData();
    $scope.parsingMatch = true;
    var heroArray = [];
    var dataObj = {
      matchID : matchID
    };
    $http({
      method: 'POST',
      url: 'api/matchid',
      data: dataObj
    }).then(function successCallback(response) {
      console.log(response);
      if (response.data == "notfound"){
      } else if (response.data == "false") {
        $scope.showAPIError = true;
      } else {
        for (var i=0; i<5; i++){
          for (var j=0; j<DAAnalyzer.heroes.length; j++){
            if (DAAnalyzer.heroes[j].heroValveIndex == response.data[i]){
              heroArray[i] = DAAnalyzer.heroes[j].heroIndex;
            }
          }
        }
        for (var i=5; i<10; i++){
          for (var j=0; j<DAAnalyzer.heroes.length; j++){
            if (DAAnalyzer.heroes[j].heroValveIndex == response.data[i]){
              heroArray[i] = DAAnalyzer.heroes[j].heroIndex;
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