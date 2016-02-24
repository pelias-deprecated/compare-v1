
function MapController( $scope, $rootScope, leafletData ){

  angular.extend($scope, {
    defaults: {
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: false,
      tileLayer: "//{s}.tiles.mapbox.com/v3/randyme.i0568680/{z}/{x}/{y}.png"
    }
  });

  // 'red', 'darkred', 'orange', 'green', 'darkgreen', 'blue', 'purple', 'darkpuple', 'cadetblue'

  var markers = {
    default: L.AwesomeMarkers.icon({
      icon: 'dot-circle-o',
      markerColor: 'purple'
    }),
    geonames: L.AwesomeMarkers.icon({
      icon: 'map-signs',
      markerColor: 'darkpurple'
    }),
    wof: L.AwesomeMarkers.icon({
      icon: 'globe',
      markerColor: 'green'
    }),
    openstreetmap: L.AwesomeMarkers.icon({
      icon: 'map-o',
      markerColor: 'red'
    }),
    openaddresses: L.AwesomeMarkers.icon({
      icon: 'language',
      markerColor: 'orange'
    }),
    quattroshapes: L.AwesomeMarkers.icon({
      icon: 'object-ungroup',
      markerColor: 'darkgreen'
    }),
  };

  $rootScope.$on( 'geojson', function( ev, geojson ){

    if( geojson.endpoint == $scope.endpoint ){
      // console.log( 'on', geojson );

      // add a red marker to map to indicate the focus centre point.
      geojson.focus_point = null;
      if( geojson.data.hasOwnProperty('geocoding') && geojson.data.geocoding.hasOwnProperty('query') ){
        var query = geojson.data.geocoding.query;
        if( query.hasOwnProperty('focus.point.lat') && query.hasOwnProperty('focus.point.lon') ){
          geojson.focus_point = { lon: query['focus.point.lon'], lat: query['focus.point.lat'] };
        }
      }

      // geojson.style = {
      //   fillColor: "green",
      //   weight: 2,
      //   opacity: 1,
      //   color: 'white',
      //   dashArray: '3',
      //   fillOpacity: 0.7
      // };

      // all custom icon logic
      geojson.pointToLayer = function style(f, latlon, options) {

        var i = markers.default;

        // custom icon created from geojson properties
        if( f.properties.hasOwnProperty('icon') ){
          i = L.AwesomeMarkers.icon({
            icon: f.properties.icon,
            markerColor: f.properties['marker-color'] || 'red'
          });
        }

        else {
          switch( f.properties.source ){
            case "openstreetmap":
            case "osm":
              i = markers.openstreetmap;
              break;
            case "whosonfirst":
            case "wof":
              i = markers.wof;
              break;
            case "geonames":
            case "gn":
              i = markers.geonames;
              break;
            case "quattroshapes":
            case "qs":
              i = markers.quattroshapes;
              break;
            case "openaddresses":
            case "oa":
              i = markers.openaddresses;
              break;
          }
        }

        return L.marker(latlon, {
          title: (f.properties.gid + " - " + f.properties.label),
          icon: i
        }).bindPopup('<p><strong style="font-size:14px">' + f.properties.label + '</strong><br />' + f.properties.gid + '</p>');
      };

      geojson.style = function(f) { return f.properties; };

      if( geojson.data.hasOwnProperty('features') ){

        if( geojson.focus_point ){
          geojson.data.features.push({
            "type": "Feature",
            "properties": {
              "marker-color": "blue",
              "icon": "crosshairs"
            },
            "geometry": {
              "type": "Point",
              "coordinates": [ geojson.focus_point.lon, geojson.focus_point.lat ]
            }
          });
        }

        angular.extend( $scope, {
          geojson: geojson
        });

        $scope.centerJSON( geojson.endpoint_i, geojson );
      }

    }

  });

  $scope.centerJSON = function( i, geojson ) {

    // console.log( 'centerJSON', leafletData.getMap.toString(), Object.keys(leafletData) );
    leafletData.getMap( 'map'+i ).then( function(map) {

      // map.dragging.disable();
      // map.touchZoom.disable();
      // map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();

      // calculate result bounds
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
