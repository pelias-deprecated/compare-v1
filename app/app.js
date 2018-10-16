
var app = angular.module( 'compare', [ 'ngSanitize', 'ui.ace', 'leaflet-directive' ] );

// Routes
app.config( function( $routeProvider ) {
  $routeProvider
    .otherwise({
      controller: 'MainController',
      templateUrl: 'app/partials/main.html'
    });
});

// set the AwesomeMarkers prefix to use fontawesome
L.AwesomeMarkers.Icon.prototype.options.prefix = 'fa';
