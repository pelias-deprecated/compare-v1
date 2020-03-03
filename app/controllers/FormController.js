// TODO
// fix url path changing
// ability to edit query
// extra query params

function FormController($scope, $http, $location, $rootScope) {
  $scope.endpoints = window.endpoints;
  $scope.responses = {};
  // window.endpoints.forEach((endpoint) => {
  //   $scope.responses[endpoint] = {
  //     summary: 'No response (yet)'
  //   };
  // })


  $scope.submit = function () {
    const params = getParams();
    for (const key of params.keys()) {
      const value = params.get(key);
      if (value) {
        $location.search(key, value);
      }
    }

    const callback = (responses) => {
      $scope.responses = responses;
    };
    doQuery({
      $http, $rootScope, path: $scope.path, endpoints: $scope.endpoints, callback,
    });
    document.getElementById('text').focus();
  };


  // Ugh, html5 geoloc only works on https
  // const updatePosition = (position) => {
  //   const centerStr = position.coords.latitude + ',' + position.coords.longitude;
  //   console.log(centerStr);
  //   $scope.focus = centerStr;
  // }

  // $scope.currentLocation = function() {
  //   console.log('current location')
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(updatePosition);
  //   } else {
  //     // x.innerHTML = "Geolocation is not supported by this browser.";
  //   }
  // };
}
