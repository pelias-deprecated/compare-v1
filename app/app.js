
var app = angular.module( 'compare', [ 'ui.ace', 'leaflet-directive' ] );

// Routes
app.config( function( $routeProvider ) {
  $routeProvider
    .otherwise({
      controller: 'MainController',
      templateUrl: 'app/partials/main.html'
    });
});
