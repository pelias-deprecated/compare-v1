function FocusMapController($scope, $rootScope, leafletData) {
  angular.extend($scope, {
    defaults: {
      scrollWheelZoom: true,
      zoomControl: true,
      attributionControl: false,
      tileLayer: "//{s}.tiles.mapbox.com/v3/randyme.i0568680/{z}/{x}/{y}.png",
      center: {
        lat: 51.505,
        lng: -0.09,
        zoom: 8
      }
    }
  });

  let map = null;
  leafletData.getMap("focusMap").then(_map => {
    map = _map;
    var layerGroup = L.layerGroup().addTo(map);

    function onMapClick(e) {
      $rootScope.$emit("focus-center-click", {
        latlng: e.latlng
      });

      layerGroup.clearLayers();
      L.marker(e.latlng).addTo(layerGroup);
    }

    map.on("click", onMapClick);
  });

  $("#focusModal").on("shown.bs.modal", function() {
    setTimeout(function() {
      map.invalidateSize();
    }, 1);
  });
}
