// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"js/algorithm-test.js":[function(require,module,exports) {
// from api :  /parking (get)
parking_data = {
  parking_info: [{
    parking_id: 0,
    name: "Name 1",
    lng: 11.034922771803195,
    lat: 50.97425921864834,
    free_space: 3
  }, {
    parking_id: 1,
    name: "Name 2",
    lng: 11.03747937655794,
    lat: 50.97473007957376,
    free_space: 0
  }, {
    parking_id: 2,
    name: "Name 3",
    lng: 11.032400727497446,
    lat: 50.97426419894839,
    free_space: 5
  }] // import * as tf from '@tensorflow/tfjs';
  // model = tf.loadModel('mlmodels/model.json');
  // document.onload = async() => {
  // };

};
$(document).ready(function () {
  previous_location = [[11.034922771803195, 50.97425921864834], [11.03747937655794, 50.97473007957376], [11.032400727497446, 50.97426419894839]];
  user_location = [11.03283, 50.9787];
  selected_result = null;
  tmplt_route_result = Handlebars.compile($("#route-result-template").html());
  tmplt_parking_info = Handlebars.compile($("#osd-initial-template").html());
  tmplt_search_result = Handlebars.compile($("#osd-search-template").html());
  $main_panel = $('#osd-main');
  $results_panel = $("#route-result");
  initMap();
  showCurrentInformation();
  $main_panel.on("click", ".osd-btn-find", showRoutesList);
  $main_panel.on("click", ".osd-route-result", resultOnClick);
});

function showCurrentInformation() {
  $results_panel.html(tmplt_parking_info(parking_data));
}

function resultOnClick() {
  if (selected_result != null) {
    selected_result.removeClass("focus");
  }

  selected_result = $(this);
  selected_result.addClass("focus");
  console.log($(this).data("lng") + ", " + $(this).data("lat")); // 
}

function initMap() {
  mapboxgl.accessToken = 'pk.eyJ1IjoidGFudmVlcjY5IiwiYSI6ImNqcmgwdGdpeTA3M2g0M25uNWYwbjZ2a3EifQ.wRjnyEoPjV7eLzmAl0v9Kg';
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: user_location,
    zoom: 12
  });
  geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken
  });
  map.on('load', mapOnLoad);
  map.on('click', mapOnClick);
}

function mapOnLoad() {
  addMarker(user_location, 'load');
  add_markers(previous_location);
  document.getElementById("lat").value = user_location[1];
  document.getElementById("lng").value = user_location[0]; //console.log('lng: ' + user_location[0] + '<br />lat: ' + user_location[1]);

  $("#coordinates").css('display', 'block');
  $("#coordinates").html('lng: ' + user_location[0] + '<br />lat: ' + user_location[1]);
  geocoder.on('result', function (ev) {
    console.log(ev.result.center);
  });
}

function mapOnClick(e) {
  marker.remove();
  addMarker(e.lngLat, 'click'); //console.log(e.lngLat.lat);

  document.getElementById("lat").value = e.lngLat.lat;
  document.getElementById("lng").value = e.lngLat.lng;
  user_location[0] = e.lngLat.lat;
  user_location[1] = e.lngLat.lng;
  $("#coordinates").css('display', 'block');
  $("#coordinates").html('lng: ' + e.lngLat.lng + '<br />lat: ' + e.lngLat.lat);
}

function addMarker(ltlng, event) {
  if (event === 'click') {
    user_location = ltlng;
  }

  marker = new mapboxgl.Marker({
    draggable: true,
    color: "#d02922"
  }).setLngLat(user_location).addTo(map).on('dragend', onDragEnd);
}

function add_markers(coordinates) {
  var geojson = previous_location == coordinates ? previous_location : '';
  console.log(geojson);
  geojson.forEach(function (marker) {
    console.log(marker);
    new mapboxgl.Marker().setLngLat(marker).addTo(map);
  });
}

function onDragEnd() {
  var lngLat = marker.getLngLat();
  document.getElementById("lat").value = lngLat.lat;
  document.getElementById("lng").value = lngLat.lng;
  console.log('lng: ' + lngLat.lng + '<br />lat: ' + lngLat.lat);
  $("#coordinates").css('display', 'block');
  $("#coordinates").html('lng: ' + lngLat.lng + '<br />lat: ' + lngLat.lat);
}

function showRoutesList() {
  fetch(getMatrixUri(user_location, previous_location)).then(function (data) {
    return data.json();
  }).then(function (res) {
    console.log(res); // $("route-result").html(resultsTmpl(res.destinations))

    processResult(res);
    predictFreeSpaces();
    $results_panel.html(tmplt_search_result(res)); // for(var i = 0 ; i < res.destinations.length; i++)
    //   $("#route-result").append(tmplt_route_result(res.destinations[i]))
  });
}

function predictFreeSpaces() {
  tf.loadLayersModel('./mlmodels/model.json').then(function (model) {
    console.log("model paise");

    for (var i = 0; i < features_list.length; i++) {
      var tensor = tf.tensor([features_list[i].day, features_list[i].time, features_list[i].parking_id, features_list[i].is_raining, features_list[i].traffic]);
      tensor.print();
    }
  }).catch(function (err) {
    // This will fix your error since you are now handling the error thrown by your first catch block
    console.log(err.message);
  });
}

function processResult(res) {
  features_list = [];

  for (var i = 0; i < res.destinations.length; i++) {
    now = new Date();
    now.setMinutes(now.getMinutes() + Math.ceil(res.durations[0][i] / 60));
    data = {};
    console.log(now);
    data.parking_id = parking_data.parking_info[i].parking_id;
    data.time = now.getHours() * 2 + (now.getMinutes() > 30 ? 1 : 0);
    data.month = now.getMonth();
    data.date = now.getDate();
    data.day = now.getDay();
    data.traffic = Math.floor(Math.random() * 4);
    data.is_snowing = Math.floor(Math.random() * 2);
    data.is_raining = Math.floor(Math.random() * 2);
    features_list.push(data); // predict here
    // save result
  }

  console.log(features_list);
}

function getUriString(source, destination) {
  var path = "https://api.mapbox.com/directions/v5/mapbox/driving-traffic/";
  path += source[0] + "%2C" + source[1] + "%2B" + destination[0] + "%2C" + destination[1];
  path += ".json&access_token=pk.eyJ1IjoidGFudmVlcjY5IiwiYSI6ImNqcmgwdGdpeTA3M2g0M25uNWYwbjZ2a3EifQ.wRjnyEoPjV7eLzmAl0v9Kg";
  return path;
}

function getMatrixUri(source, destinations) {
  var path = "https://api.mapbox.com/directions-matrix/v1/mapbox/driving/";
  path += source[0] + "," + source[1];

  for (var i = 0; i < destinations.length; i++) {
    path += ";" + destinations[i][0] + "," + destinations[i][1];
  }

  path += "?sources=0&destinations=1";

  for (var i = 1; i < destinations.length; i++) {
    path += ";" + (i + 1);
  }

  path += "&access_token=pk.eyJ1IjoidGFudmVlcjY5IiwiYSI6ImNqcmgwdGdpeTA3M2g0M25uNWYwbjZ2a3EifQ.wRjnyEoPjV7eLzmAl0v9Kg";
  return path;
}

function drawRoute(data) {
  var route = data.geometry.coordinates;
  var geojson = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: route
    }
  }; // if the route already exists on the map, reset it using setData

  if (false) {
    map.getSource('route').setData(geojson);
  } else {
    // otherwise, make a new request
    map.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: geojson
          }
        }
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3887be',
        'line-width': 5,
        'line-opacity': 0.75
      }
    });
  }
}

function getRoute(start, end) {
  // make a directions request using cycling profile
  // an arbitrary start will always be the same
  // only the end or destination will change
  var url = 'https://api.mapbox.com/directions/v5/mapbox/cycling/' + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken; // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest

  var req = new XMLHttpRequest();
  req.responseType = 'json';
  req.open('GET', url, true);

  req.onload = function () {
    var data = req.response.routes[0];
    var route = data.geometry.coordinates;
    var geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route
      }
    }; // if the route already exists on the map, reset it using setData

    if (map.getSource('route')) {
      map.getSource('route').setData(geojson);
    } else {
      // otherwise, make a new request
      map.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: geojson
            }
          }
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });
    } // add turn instructions here at the end

  };

  req.send();
}
},{}],"../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "51409" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js/algorithm-test.js"], null)
//# sourceMappingURL=/algorithm-test.f914e299.js.map