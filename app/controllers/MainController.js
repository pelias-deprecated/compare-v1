function MainController($scope, $location, $http, $rootScope) {
  $scope.submit = function() {
    $scope.responses = {};
    $location.path($scope.path);
    const callback = responses => {
      $scope.responses = responses;
    };
    doQuery({ $http, $rootScope, path: $scope.path, endpoints: $scope.endpoints, callback });
  };

  $scope.responses = {};
  $scope.endpoints = window.endpoints;

  var path = $location.path();
  if (!path) {
    $location.path("/v1/search?text=london, uk");
  }

  $scope.path = decodeURIComponent($location.path());
  document.getElementById("searchbox").focus();
  $scope.submit();
}
