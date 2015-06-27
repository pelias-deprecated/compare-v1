
function MainController( $scope, $location, $http, $rootScope ){

  // console.log('load');

  $scope.submit = function(){
    $location.path( $scope.path );
    $scope.request( $scope.path );
  };

  // $scope.$watch( 'path', function(){
  //   $scope.request( $scope.path );
  // });

  $scope.endpoints = [
    'http://pelias.mapzen.com'
    ,'http://pelias.stage.mapzen.com'
    // ,'http://pelias.dev.mapzen.com'
  ];

  $scope.responses = {};

  function getUrlVars(url){
    var vars = {};
    var hashes = url.slice(url.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++){
      var hash = hashes[i].split('=');
      vars[hash[0]] = hash[1];
    }
    return vars;
  }

  $scope.request = function( path ){

    $scope.responses = {};
    $scope.endpoints.forEach( function( endpoint, i ){

      var fullpath = endpoint + path;
      var uri = fullpath.slice(0, fullpath.indexOf('?'));
      var params = getUrlVars( endpoint + path );
      params['callback'] = 'JSON_CALLBACK';

      $http
        .jsonp( uri, {
          params: params,
          headers: { 'Accept': 'application/json' }
        })
        .success(function(data, status, headers, config) {
          // console.log( 'res', data, status );
          $scope.responses[$scope.endpoints[i]] = {
            status: status,
            body: JSON.stringify( data, null, 2 ) + '\n\n',
            summary: summaryFor( data )
          };

          console.log( 'uri:', uri );
          console.log( 'params:', params );
          console.log( summaryFor( data ) );

          $rootScope.$emit( 'geojson', {
            data: data,
            endpoint: $scope.endpoints[i],
            endpoint_i: i
          });

        })
        .error(function(data, status, headers, config) {
          console.log( 'jsonp error', endpoint + path );
          console.log( status, headers, data );
          $scope.responses[$scope.endpoints[i]] = {
            error: 'jsonp request failed'
          };
        });
    });
  };

  var path = $location.path();
  if( !path ){
    $location.path( '/search?size=20&input=london, uk' );
  }

  // $scope.path = decodeURIComponent($location.url());
  $scope.path = decodeURIComponent($location.url());
  document.getElementById("searchbox").focus();
  $scope.submit();

  // export global function to get/set endpoints
  window.getEndpoints = function(){
    return $scope.endpoints;
  };
  window.setEndpoints = function( endpoints ){
    if( !Array.isArray( endpoints ) ){
      return console.error( 'invalid array, try again' );
    }
    $scope.endpoints = endpoints;
    $scope.submit();
  };
  console.info( 'funfact: you can use getEndpoints() and setEndpoints() to change which hosts are being queried.');

  // $scope.$on('$viewContentLoaded', function() {
  //   createMaps();
  // });
}

function leftPad( text, width, pad ){
  var t = String(text);
  for( var i=t.length; i<width; i++ ){
    t = pad + t;
  }
  return t;
}

function summaryFor( data ){
  var summary = '';

  if( data && Array.isArray( data.features ) ){
    var maxWidth = String(data.features.length).length;
    data.features.forEach( function( feat, i ){
      summary += leftPad( i+1, maxWidth, ' ' ) + ')\t' + feat.properties.text + '\n';
    });
  }

  if( !summary ){
    summary = '\n';
  }

  return summary;
}

// function createMaps(){
//   var map = L.map('map0', {
//       // zoom: $rootScope.geobase.zoom,
//       zoomControl: false,
//       // center: [$rootScope.geobase.lat, $rootScope.geobase.lon],
//       maxBounds: L.latLngBounds(L.latLng(-80, -180), L.latLng(82, 180))
//   });

//   L.tileLayer('//{s}.tiles.mapbox.com/v3/randyme.i0568680/{z}/{x}/{y}.png', {
//       attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
//       maxZoom: 18,
//       minZoom: 3,
//       noWrap: true
//   }).addTo(map);
// }