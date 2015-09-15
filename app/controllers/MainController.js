
function MainController( $scope, $location, $http, $rootScope ){

  $scope.submit = function(){
    $location.path( $scope.path );
    $scope.request( $scope.path );
  };

  $scope.endpoints = [
    'http://pelias.mapzen.com'
    ,'http://pelias.bigdev.mapzen.com'
    // ,'http://pelias.dev.mapzen.com'
  ];

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

  var path = $location.path();
  if( !path ){
    $location.path( '/v1/search?api_key=pelias-D7WkrQc&size=20&text=london, uk' );
  }

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