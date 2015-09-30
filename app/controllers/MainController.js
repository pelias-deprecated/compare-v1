
function MainController( $scope, $location, $http, $rootScope ){

  $scope.submit = function(){
    $location.path( $scope.path );
    $scope.request( $scope.path );
  };

  $scope.keys = {
    'https://search.mapzen.com': 'search-ahqsC9E',
    'http://pelias.mapzen.com': 'pelias-D7WkrQc',
    'http://pelias.bigdev.mapzen.com': ''
  };

  $scope.endpoints = [];
  $scope.responses = {};

  $scope.request = function( path ){

    // hack!? manually encode text to ensure that
    // ampersands and other reserved chars encode correctly
    var safePath = path.replace( /text=(.*)/i, function(i){
      return i.substr(0,6) + encodeURIComponent( i.substr(6) );
    });

    $scope.responses = {};
    $scope.endpoints.forEach( function( endpoint, i ){

      var uri = URI(endpoint + safePath);
      var target = uri.scheme() + '://' + uri.host() + uri.path();
      var params = uri.search(true);

      if( !params.hasOwnProperty( 'api_key' ) ){
        var key = $scope.keys[ uri.scheme() + '://' + uri.host() ];
        if( key ){
          params.api_key = key;
        }
      }

      console.log( 'target:', target );
      console.log( 'params:', params );

      $http({
          url: target,
          method: 'GET',
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

  // start of endpoints //
  // export global function to get/set endpoints
  window.getEndpoints = function(){
    return $scope.endpoints;
  };
  window.setEndpoints = function( endpoints ){
    if( !Array.isArray( endpoints ) ){
      return console.error( 'invalid array, try again' );
    }
    window.saveEndpoints( endpoints );
    window.loadEndpoints();
    $scope.submit();
  };
  window.resetEndpoints = function(){
    window.saveEndpoints(['https://search.mapzen.com','http://pelias.mapzen.com','http://pelias.bigdev.mapzen.com']);
    window.loadEndpoints();
  };
  window.saveEndpoints = function( endpoints ){
    window.localStorage.setItem( "endpoints", endpoints.join(',') );
    console.info( 'saved to localStorage:', endpoints.join(',') );
  };
  window.loadEndpoints = function(){
    var endpoints = window.localStorage.getItem( "endpoints" );
    console.info( 'loaded from localStorage:', endpoints );
    if( 'string' === typeof endpoints ){
      $scope.endpoints = endpoints.split(',');
    } else {
      window.resetEndpoints();
    }
  };
  console.info( 'funfact: you can use getEndpoints() and setEndpoints() to change which hosts are being queried, or use resetEndpoints() to reset to defaults');
  window.loadEndpoints();
  console.info( 'using endpoints:', $scope.endpoints );
  // end of endpoints //

  var path = $location.path();
  if( !path ){
    $location.path( '/v1/search?text=london, uk' );
  }

  $scope.path = decodeURIComponent($location.url());
  document.getElementById("searchbox").focus();
  $scope.submit();

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
      summary += leftPad( i+1, maxWidth, ' ' ) + ')\t' + feat.properties.label + '\n';
    });
  }

  if( !summary ){
    summary = '\n';
  }

  return summary;
}
