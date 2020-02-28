// get your own api key for free at https://geocode.earth/
// to use your own key, open the browsr console and enter
// the key in your browser localstorage and refresh the page:
// > localStorage.setItem('api_key:geocode.earth', 'ge-aaaaaaaaaaaaaaaa');
var getKey = function(domain) {
  var sections = domain.split(".");
  for (var i = 0; i < sections.length - 1; i++) {
    var host = sections.slice(i).join(".");
    var key = window.localStorage.getItem("api_key:" + host);
    if ("string" === typeof key && key.length) {
      console.info(
        "loaded key for domain '" + domain + "' from localStorage: 'api_key:" + host + "'"
      );
      return key;
    }
  }
  // if no personal key is found, then
  // use the geocode.earth 'compare app' key
  // which has restrictive daily limits due to
  // frequent abuse.
  return "ge-5673e2c135b93a30";
};

function leftPad(text, width, pad) {
  var t = String(text);
  for (var i = t.length; i < width; i++) {
    t = pad + t;
  }
  return t;
}

function iconForLayer(layer) {
  switch (layer) {
    case "locality":
      return "fa fa-university";
    case "localadmin":
      return "fa fa-gavel";
    case "neighbourhood":
      return "fa fa-draw-polygon";
    case "borough":
      return "fa fa-map-pin";
    case "county":
      return "fab fa-cuttlefish";
    case "macrocounty":
      return "fa fa-globe";
    case "region":
      return "fa fa-vector-square";
    case "macroregion":
      return "fa fa-object-ungroup";
    case "country":
      return "fa fa-flag-checkered";
    case "venue":
      return "fas fa-map-marker";
    case "address":
      return "fa fa-envelope";
    case "mixed":
      return "fa fa-crosshairs";
    case "street":
      return "fa fa-road";
    default:
      return "fa fa-question";
  }
}

function summaryFor(data) {
  var summary = [];

  if (data && Array.isArray(data.features) && data.features.length) {
    var maxWidth = String(data.features.length).length;
    data.features.forEach(function(feat, i) {
      var icon = iconForLayer(feat.properties.layer);
      summary.push(
        '<span class="num">' +
          leftPad(i + 1, maxWidth, " ") +
          '<span class="hidden_brace">) </span></span>' +
          '<span class="icon"><i class="' +
          icon +
          '" title="' +
          feat.properties.layer +
          '"></i>' +
          "</span>" +
          feat.properties.label
      );
    });
  } else {
    return '<p class="error">no features</p>';
  }

  return (
    "<ul>" +
    summary
      .map(function(s) {
        return "<li>" + s + "</li>";
      })
      .join("") +
    "</ul>"
  );
}

function doQuery({$http, $rootScope, path, callback, endpoints}) {
  console.log(endpoints);
  endpoints.forEach(function(endpoint, i) {
    if (endpoint.endsWith('/')) {
      endpoint = endpoint.substring(0, endpoint.length - 1);
    }
    var uri = URI(endpoint + path);
    var target = uri.scheme() + "://" + uri.host() + uri.path();
    var params = uri.search(true);
    const keys = {};
    const responses = {};

    if (!endpoints.includes(uri.host())) {
      keys[uri.host()] = getKey(uri.host());
    }

    if (!params.hasOwnProperty("api_key")) {
      var key = keys[uri.host()];
      if (key) {
        params.api_key = key;
      }
    }

    // console.log( 'target:', target );
    // console.log( 'params:', params );

    var responseParser = function(data, status, headers, config) {
      // error
      if (!data || !data.geocoding) {
        console.log("jsonp error", endpoint + path);
        console.log(status, data);

        // mock response to reuse the UI logic

        var message = "failed to load json";
        if (data && data.error) {
          message = data.error;
        }

        data = {
          geocoding: {
            errors: [status + " " + message]
          }
        };
      }

      responses[endpoints[i]] = {
        status: status,
        body: data,
        bodyString: JSON.stringify(data, null, 2) + "\n\n",
        summary: summaryFor(data)
      };

      if (Object.keys(responses).length == endpoints.length) {
        callback(responses);
      }

      // console.log( 'uri:', uri );
      // console.log( 'params:', params );
      // console.log( summaryFor( data ) );

      $rootScope.$emit("geojson", {
        data: data,
        endpoint: window.endpoints[i],
        endpoint_i: i
      });
    };

    $http({
      url: target,
      method: "GET",
      params: params,
      headers: { Accept: "application/json", "X-Requested-With": "" }
    })
      .success(responseParser)
      .error(responseParser);
  });
}
