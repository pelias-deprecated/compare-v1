
function MainController( $scope, $location, $http, $rootScope ){
  $scope.submit = function(){
    $scope.responses = {};
    $location.path( $scope.path );
    doQuery( $http, $rootScope, $scope.path, (responses) => {
      console.log('responses', responses);
      $scope.responses = responses;
    });
  };

  $scope.responses = {};
  $scope.endpoints = window.endpoints;

  var path = $location.path();
  if( !path ){
    $location.path( '/v1/search?text=london, uk' );
  }

  $scope.path = decodeURIComponent($location.path());
  document.getElementById("searchbox").focus();
  $scope.submit();
}
