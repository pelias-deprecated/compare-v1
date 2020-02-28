// TODO
// save query params in URL
// parse query params from URL
// build a map pick mode for focus

function FormController($scope, $http, $location, $rootScope) {
  $scope.endpoints = window.endpoints;
  $scope.responses = {};

  $scope.path = "";
  console.log($location.search()["text"]);
  console.log($location.search().autocomplete);
  $scope.autocomplete = $location.search().autocomplete === "1";
  console.log($scope.autocomplete);
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

    const params = getParams();

    $scope.path = endpoint + "?" + params.toString();

    if ($scope.autocomplete) {
      $location.search("autocomplete", 1);
      $scope.submit();
    } else {
      $location.search("autocomplete", null);
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
    console.log($scope.endpoints);
    doQuery({ $http, $rootScope, path: $scope.path, endpoints: $scope.endpoints, callback });
    console.log(document.getElementById("text"));
    document.getElementById("text").focus();
  };

  $scope.openFocusModal = () => {
    console.log("open focus modal");
    $("#focusModal").modal("show");
  };
  
  $rootScope.$on( 'focus-center-click', function( ev, {latlng} ){
    console.log(latlng);
    $scope.focus = latlng.lat + ',' + latlng.lng;
    change();
  })

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
