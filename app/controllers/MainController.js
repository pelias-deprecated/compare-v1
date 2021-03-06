
function MainController( $scope, $location, $http, $rootScope ){

  $scope.submit = function(){
    $location.path( $scope.path );
    $scope.request( $scope.path );
  };

  // get your own api key for free at https://geocode.earth/
  // to use your own key, open the browsr console and enter
  // the key in your browser localstorage and refresh the page:
  // > localStorage.setItem('api_key:geocode.earth', 'ge-aaaaaaaaaaaaaaaa');
  var getKey = function(domain){
    var sections = domain.split('.');
    for(var i=0; i<sections.length-1; i++){
      var host = sections.slice(i).join('.')
      var key = window.localStorage.getItem('api_key:' + host);
      if ('string' === typeof key && key.length) {
        console.info('loaded key for domain \'' + domain + '\' from localStorage: \'api_key:' + host + '\'');
        return key;
      }
    }

    // if no personal key is found, then
    // use the geocode.earth 'compare app' key
    // which has restrictive daily limits due to
    // frequent abuse.
    return 'ge-5673e2c135b93a30'
  };

  $scope.keys = {};
  $scope.endpoints = [];
  $scope.responses = {};

  $scope.request = function( path ){

    $scope.responses = {};
    $scope.endpoints.forEach( function( endpoint, i ){

      var uri = URI(endpoint + path);
      var target = uri.scheme() + '://' + uri.host() + uri.path();
      var params = uri.search(true);

      if (!$scope.endpoints.hasOwnProperty(uri.host())){
        $scope.keys[uri.host()] = getKey(uri.host());
      }

      if( !params.hasOwnProperty( 'api_key' ) ){
        var key = $scope.keys[ uri.host() ];
        if( key ){
          params.api_key = key;
        }
      }

      // console.log( 'target:', target );
      // console.log( 'params:', params );

      var responseParser = function(data, status, headers, config) {

        // error
        if( !data || !data.geocoding ){
          console.log( 'jsonp error', endpoint + path );
          console.log( status, data );

          // mock response to reuse the UI logic

          var message = 'failed to load json';
          if( data && data.error ){ message = data.error; }

          data = {
            geocoding: {
              errors: [ status + ' ' + message ]
            }
          };
        }

        $scope.responses[$scope.endpoints[i]] = {
          status: status,
          body: data,
          bodyString: JSON.stringify( data, null, 2 ) + '\n\n',
          summary: summaryFor( data )
        };

        // console.log( 'uri:', uri );
        // console.log( 'params:', params );
        // console.log( summaryFor( data ) );

        $rootScope.$emit( 'geojson', {
          data: data,
          endpoint: $scope.endpoints[i],
          endpoint_i: i
        });

      };

      $http({
          url: target,
          method: 'GET',
          params: params,
          headers: { 'Accept': 'application/json', 'X-Requested-With': '' }
        })
        .success(responseParser)
        .error(responseParser);
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
    window.saveEndpoints(['https://api.geocode.earth', 'https://api.dev.geocode.earth']);
    window.loadEndpoints();
  };
  window.saveEndpoints = function( endpoints ){
    window.localStorage.setItem( "endpoints", endpoints.join(',') );
    console.info( 'saved to localStorage:', endpoints.join(',') );
  };
  window.loadEndpoints = function(){
    var endpoints = window.localStorage.getItem( "endpoints" );
    console.info( 'loaded from localStorage:', endpoints.split(',').join(', ') );
    if( 'string' === typeof endpoints ){
      $scope.endpoints = endpoints.split(',');
    } else {
      window.resetEndpoints();
    }
  };
  console.info( 'funfact: you can use getEndpoints() and setEndpoints() to change which hosts are being queried, or use resetEndpoints() to reset to defaults');

  var currentVersion = 6;
  var version = window.localStorage.getItem('version');
  if( !version || parseInt( version, 10 ) < currentVersion ){
    window.resetEndpoints();
    window.localStorage.setItem('version',currentVersion);
  }

  window.loadEndpoints();
  // console.info( 'using endpoints:', $scope.endpoints );
  // end of endpoints //

  var path = $location.path();
  if( !path ){
    $location.path( '/v1/search?text=london, uk' );
  }

  $scope.path = decodeURIComponent($location.path());
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

function iconForLayer( layer ){
  switch( layer ){
    case 'locality': return 'fa fa-university';
    case 'localadmin': return 'fa fa-gavel';
    case 'neighbourhood': return 'fa fa-draw-polygon';
    case 'borough': return 'fa fa-map-pin';
    case 'county': return 'fab fa-cuttlefish';
    case 'macrocounty': return 'fa fa-globe';
    case 'region': return 'fa fa-vector-square';
    case 'macroregion': return 'fa fa-object-ungroup';
    case 'country': return 'fa fa-flag-checkered';
    case 'venue': return 'fas fa-map-marker';
    case 'address': return 'fa fa-envelope';
    case 'mixed': return 'fa fa-crosshairs';
    case 'street': return 'fa fa-road';
    default: return 'fa fa-question';
  }
}

function summaryFor( data ){
  var summary = [];

  if( data && Array.isArray( data.features ) && data.features.length ){
    var maxWidth = String(data.features.length).length;
    data.features.forEach( function( feat, i ){
      var icon = iconForLayer(feat.properties.layer);
      summary.push(
        '<span class="num">' + leftPad( i+1, maxWidth, ' ' ) + '<span class="hidden_brace">) </span></span>' +
        '<span class="icon"><i class="' + icon + '" title="' + feat.properties.layer + '"></i>' + '</span>' +
        feat.properties.label
      );
    });
  }

  else {
    return '<p class="error">no features</p>';
  }

  return '<ul>' + summary.map(function(s){
    return '<li>' + s + '</li>';
  }).join('') + '</ul>';
}
