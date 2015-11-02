
function MapController( $scope, $rootScope, leafletData ){

  angular.extend($scope, {
    defaults: {
      // scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: false,
      tileLayer: "//{s}.tiles.mapbox.com/v3/randyme.i0568680/{z}/{x}/{y}.png"
    }
  });

  $rootScope.$on( 'geojson', function( ev, geojson ){

    if( geojson.endpoint == $scope.endpoint ){
      // console.log( 'on', geojson );

      geojson.style = {
        fillColor: "green",
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
      };

      angular.extend( $scope, {
        geojson: geojson
      });

      $scope.centerJSON( geojson.endpoint_i, geojson );

    }

  });

  $scope.centerJSON = function( i, geojson ) {

    // console.log( 'centerJSON', leafletData.getMap.toString(), Object.keys(leafletData) );
    leafletData.getMap( 'map'+i ).then( function(map) {

      // map.dragging.disable();
      // map.touchZoom.disable();
      // map.doubleClickZoom.disable();
      // map.scrollWheelZoom.disable();

      var geoJsonLayer = L.geoJson( geojson.data );
      var bounds = geoJsonLayer.getBounds();

      // pad bounds to the marker fit on screen
      try {
        bounds = bounds.pad(0.5);
        map.fitBounds( bounds );
      } catch( e ) {}

    });
  };
}
