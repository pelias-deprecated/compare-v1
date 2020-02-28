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

  $scope.path = "";
  $scope.autocomplete = $location.path === '/v1/autocomplete';
  $scope.text = $location.search().text;
  $scope.focus = $location.search()["focus.point.lat"]
    ? $location.search()["focus.point.lat"] + "," + $location.search()["focus.point.lon"]
    : "";

  $("#endpoints").tagEditor({
    initialTags: $scope.endpoints,
    maxLength: 1000,
    onChange: function(field, editor, tags) {
      $scope.endpoints = tags;
      $scope.change();
      saveEndpoints($scope.endpoints);
    }
  });

  getParams = () => {
    const params = new URLSearchParams();

    if ($scope.focus) {
      const focusParts = $scope.focus.split(",");
      // TODO(blackmad): do something here if it's invalid
      const lat = focusParts[0];
      const lon = focusParts[1];
      params.set("focus.point.lat", lat);
      params.set("focus.point.lon", lon);
    }

    if ($scope.text) {
      params.set("text", $scope.text);
    }
    return params;
  };

  $scope.change = () => {
    let endpoint = "/v1/search";
    if ($scope.autocomplete) {
      endpoint = "/v1/autocomplete";
    }

    $location.path(endpoint).replace();

    const params = getParams();

    $scope.path = endpoint + "?" + params.toString();

    if ($scope.autocomplete) {
      $scope.submit();
    }
  };

  $scope.submit = function() {
    const params = getParams();
    for (var key of params.keys()) {
      const value = params.get(key);
      if (value) {
        $location.search(key, value);
      }
    }

    const callback = responses => {
      $scope.responses = responses;
    };
    doQuery({ $http, $rootScope, path: $scope.path, endpoints: $scope.endpoints, callback });
    document.getElementById("text").focus();
  };

  $scope.openFocusModal = () => {
    $("#focusModal").modal("show");
  };
  
  $rootScope.$on( 'focus-center-click', function( ev, {latlng} ){
    $scope.focus = latlng.lat + ',' + latlng.lng;
    change();
  })

  $scope.change();
  if ($scope.text) {
    $scope.submit();
  }

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
