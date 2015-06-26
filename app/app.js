
var app = angular.module( 'compare', [ 'restangular', 'ui.ace', 'ngProgress', 'leaflet-directive'/*,'prettifyDirective','ngSanitize'*/ ] );

// ['ui.ace', 'prettifyDirective']

// Routes
app.config( function( $routeProvider ) {
  $routeProvider
    .otherwise({
      controller: 'MainController',
      templateUrl: '/app/partials/main.html'
    });
});

// Restangular
app.config( function( RestangularProvider ) {
  RestangularProvider.setBaseUrl( '/' );
  // RestangularProvider.setRequestSuffix( '.json' );
});

// Services
// app.factory( 'CiaoService', function( Restangular ) {
//   return Restangular.withConfig( function( RestangularConfigurer ) {
//     RestangularConfigurer.setBaseUrl( '/' );
//   });
// });