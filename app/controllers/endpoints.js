
// start of endpoints //
// export global function to get/set endpoints
window.getEndpoints = function() {
  return $scope.endpoints;
};
window.setEndpoints = function(endpoints) {
  if (!Array.isArray(endpoints)) {
    return console.error("invalid array, try again");
  }
  window.saveEndpoints(endpoints);
  window.loadEndpoints();
};
window.resetEndpoints = function() {
  window.saveEndpoints(["https://api.geocode.earth"]);
  window.loadEndpoints();
};
window.saveEndpoints = function(endpoints) {
  window.localStorage.setItem("endpoints", endpoints.join(","));
  console.info("saved to localStorage:", endpoints.join(","));
};
window.loadEndpoints = function() {
  var endpoints = window.localStorage.getItem("endpoints");
  console.info("loaded from localStorage:", endpoints.split(",").join(", "));
  if ("string" === typeof endpoints) {
    window.endpoints = endpoints.split(",");
  } else {
    window.resetEndpoints();
  }
};
console.info(
  "funfact: you can use getEndpoints() and setEndpoints() to change which hosts are being queried, or use resetEndpoints() to reset to defaults"
);

var currentVersion = 6;
var version = window.localStorage.getItem('version');
if( !version || parseInt( version, 10 ) < currentVersion ){
  window.resetEndpoints();
  window.localStorage.setItem('version',currentVersion);
}

window.loadEndpoints();
console.info( 'using endpoints:', window.endpoints );
// end of endpoints //