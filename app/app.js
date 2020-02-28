var app = angular
  .module("compare", ["ngSanitize", "ui.ace", "leaflet-directive"])

// Routes
app.config(function($routeProvider) {
  $routeProvider.otherwise({
    controller: "FormController",
    templateUrl: "app/partials/form.html",
    reloadOnSearch: false,
    reloadOnUrl: false
  });
});

// set the AwesomeMarkers prefix to use fontawesome
L.AwesomeMarkers.Icon.prototype.options.prefix = "fa";
