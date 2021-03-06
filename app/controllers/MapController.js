
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
      icon: 'fa-dot-circle',
      markerColor: 'purple'
    }),
    geonames: L.AwesomeMarkers.icon({
      icon: 'fa-map-signs',
      markerColor: 'darkpurple'
    }),
    wof: L.AwesomeMarkers.icon({
      icon: 'x fa-weebly',
      prefix: 'fab',
      markerColor: 'green'
    }),
    openstreetmap: L.AwesomeMarkers.icon({
      icon: 'fa-map',
      markerColor: 'red'
    }),
    openaddresses: L.AwesomeMarkers.icon({
      icon: 'fa-language',
      markerColor: 'orange'
    }),
    quattroshapes: L.AwesomeMarkers.icon({
      icon: 'fa-object-ungroup',
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
              "icon": "crosshairs",
              "gid": "lat: " + geojson.focus_point.lat + ", lon: " + geojson.focus_point.lon,
              "label": "focus.point"
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

      $scope.addBoundingBoxes( geojson.endpoint_i, geojson );

    }

  });

  $scope.addBoundingBoxes = function( i, geojson ) {

    var style = {
      stroke: true,
      color: 'blue',
      opacity: 0.2,
      dashArray: '5, 5',
      fillColor: 'blue',
      fillOpacity: 0.0,
      weight: 1
    };

    leafletData.getMap( 'map'+i ).then( function(map){
      var bboxLayer = L.geoJson();
      (geojson.data.features || []).forEach( function( feat ){
        if( feat.hasOwnProperty('bbox') ){
          var bounds = [[feat.bbox[1], feat.bbox[0]], [feat.bbox[3], feat.bbox[2]]];
          var rect = L.rectangle(bounds, style);
          rect.addTo(bboxLayer);
        }
      });
      bboxLayer.addTo(map);
    });

  };

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
