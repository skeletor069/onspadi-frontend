

// from api :  /parking (get)
parking_data ={
	parking_info : [
		{
			parking_id : 0,
			name : "Name 1",
			lng : 11.034922771803195,
			lat : 50.97425921864834,
			free_space : 3
		},
		{
			parking_id : 1,
			name : "Name 2",
			lng : 11.03747937655794,
			lat : 50.97473007957376,
			free_space : 0
		},
		{
			parking_id : 2,
			name : "Name 3",
			lng : 11.032400727497446,
			lat : 50.97426419894839,
			free_space : 5
		}
	]
} 

// import * as tf from '@tensorflow/tfjs';
// model = tf.loadModel('mlmodels/model.json');
// document.onload = async() => {
	
// };

$(document).ready(function(){
	//previous_location = [[11.034922771803195, 50.97425921864834],[11.03747937655794, 50.97473007957376], [11.032400727497446, 50.97426419894839]];
	user_location = [11.03283, 50.9787];
	
	selected_result = null;
	selected_route = null;
	Handlebars.registerHelper('castFloat', function(prob) {
    	return new Handlebars.SafeString( (prob * 100).toFixed(2) );
	});
	Handlebars.registerHelper('castBool', function(data) {
    	return new Handlebars.SafeString( (data)?"yes":"no" );
	});
	Handlebars.registerHelper('castTraffic', function(data) {
		if(data == 0)
			return "low";
		else if(data == 1)
			return "moderate";
		else if(data == 2)
			return "heavy";
		else
			return "severe";
	});
	tmplt_route_result = Handlebars.compile($("#route-result-template").html());
	tmplt_parking_info = Handlebars.compile($("#osd-initial-template").html());
	tmplt_search_result = Handlebars.compile($("#osd-search-template").html());
	tmplt_details = Handlebars.compile($("#osd-details-template").html());
	$main_panel = $('#osd-main');
	$results_panel = $("#route-result");
	$details_panel = $("#details-panel");

	
	showCurrentInformation();

	$main_panel.on("click", ".osd-btn-find", showRoutesList);
	$main_panel.on("click", ".osd-route-result", resultOnClick);
	$main_panel.on("click", ".osd-search-result", routeOnClick)
});

function showCurrentInformation(){
	fetch(api_host + "/locationInformation")
	.then(res => res.json())
	.then(resp => {
		console.log(resp);
		parking_data.parking_info = resp;
		previous_location = [];
		for(var i = 0 ; i < parking_data.parking_info.length; i++){
			previous_location.push([parking_data.parking_info[i].longitude,parking_data.parking_info[i].latitude]);
		}
		getFreeSpaceCount(parking_data);
	});
	
}

async function getFreeSpaceCount(parking_data){
	res = await fetch(api_host + "/countParkings");
	counts = await res.json();
	console.log(counts);
	for(var i = 0 ; i < parking_data.parking_info.length; i++){
		parking_data.parking_info[i].free_space = counts[i].free;
	}
	$results_panel.html(tmplt_parking_info(parking_data));
	initMap();
}

function resultOnClick(){
	if(selected_result != null){
		selected_result.removeClass("focus");
	}
	selected_result = $(this);
	selected_result.addClass("focus");
	console.log($(this).data("lng") + ", " + $(this).data("lat"));
	// 
}

function routeOnClick(){
	if(selected_route != null){
		selected_route.removeClass("focus-bg");
	}
	selected_route = $(this);
	selected_route.addClass("focus-bg");

	
	//data.info = JSON.parse(selected_route.data("info"));
	//data.features = JSON.parse(selected_route.data("features"));
	//data.free_percentages = selected_route.data("percentages");

	var id = selected_route.data("id");
	data = {}
	data.data = result.rows[id];

	console.log(features_list[id]);
	getRoute(user_location, result.rows[id].features.destination, function(resp){
		console.log(resp);
		$details_panel.html(tmplt_details(data));
	});
	
	
	
	// clear markers
	// draw route
}

function initMap(){
	mapboxgl.accessToken = 'pk.eyJ1IjoidGFudmVlcjY5IiwiYSI6ImNqcmgwdGdpeTA3M2g0M25uNWYwbjZ2a3EifQ.wRjnyEoPjV7eLzmAl0v9Kg';
    map = new mapboxgl.Map({container: 'map',style: 'mapbox://styles/mapbox/streets-v11',center : user_location,zoom : 12});
    geocoder = new MapboxGeocoder({accessToken: mapboxgl.accessToken});
    
    map.on('load', mapOnLoad);
    map.on('click', mapOnClick);
}

function mapOnLoad(){
	addMarker(user_location,'load');
    add_markers(previous_location);
            
	document.getElementById("lat").value = user_location[1];
	document.getElementById("lng").value = user_location[0];
	//console.log('lng: ' + user_location[0] + '<br />lat: ' + user_location[1]);
	$("#coordinates").css('display', 'block');
    $("#coordinates").html('lng: ' + user_location[0] + '<br />lat: ' + user_location[1]);

    geocoder.on('result', function(ev) {
        console.log(ev.result.center);

    });
}

function mapOnClick(e){
	marker.remove();
    addMarker(e.lngLat,'click');
    
    //console.log(e.lngLat.lat);
    document.getElementById("lat").value = e.lngLat.lat;
    document.getElementById("lng").value = e.lngLat.lng;
    user_location[1] = e.lngLat.lat;
    user_location[0] = e.lngLat.lng;
    $("#coordinates").css('display', 'block');
    $("#coordinates").html('lng: ' + e.lngLat.lng + '<br />lat: ' + e.lngLat.lat);
}

function addMarker(ltlng,event) {
    if(event === 'click'){
        user_location = ltlng;
    }
    marker = new mapboxgl.Marker({draggable: true,color:"#d02922"})
        .setLngLat(user_location)
        .addTo(map)
        .on('dragend', onDragEnd);
}

function add_markers(coordinates) {
    var geojson = (previous_location == coordinates ? previous_location : '');
    console.log(geojson);
    geojson.forEach(function (marker) {
      console.log(marker);
      new mapboxgl.Marker()
          .setLngLat(marker)
          .addTo(map);
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

function showRoutesList(){
	fetch(getMatrixUri(user_location, previous_location))
	  .then(data=>{return data.json()})
	  .then(res=>{
	    console.log(res)

	    // $("route-result").html(resultsTmpl(res.destinations))
	    processResult(res)
	    predictFreeSpaces();
	    
	    // for(var i = 0 ; i < res.destinations.length; i++)
	    //   $("#route-result").append(tmplt_route_result(res.destinations[i]))

	  });
}

function predictFreeSpaces(){
	tf.loadLayersModel('./mlmodels/model.json')
	.then( model => modelLoaded(model))
	.catch(function (err) {
    	// This will fix your error since you are now handling the error thrown by your first catch block
    	console.log(err.message)
	});
	
}

async function modelLoaded(model){
	console.log("model paise");
	result = {};
	result["rows"] = [];
	for(var i = 0 ; i < features_list.length; i++){
		

		var tensor = tf.tensor([[features_list[i].location_id,features_list[i].time,features_list[i].day,  
		features_list[i].date,features_list[i].month,features_list[i].traffic, features_list[i].is_event, features_list[i].is_raining, features_list[i].is_snowing]]);
		tensor.print();
		
		var raw = await model.predict(tensor).data();
		
		temp = {};
		temp["features"] = features_list[i];
		temp["free_percentages"] = raw;
		temp["info"] = parking_data.parking_info[i];
		

		best = -1;
		best_prob = -1;
		for(var j = 0 ; j < raw.length; j++){
			if(raw[j] > best_prob){
				best_prob = raw[j];
				best = j;
			}
		}

		temp["best_prob"] = best_prob;
		temp["free_space"] = GetFreeSpaceString(best);


		result["rows"].push(temp);

		
	}
	$results_panel.html(tmplt_search_result(result));
}

function GetFreeSpaceString(label){
	if(label == 0)
		return "0";
	else if(label == 1)
		return "> 1";
	else if(label == 2)
		return "> 4";
	else if(label == 3)
		return "> 7";
	else
		return "> 10";
}

function processResult(res){
	console.log(res);
	features_list = [];
	for(var i = 0 ; i < res.destinations.length; i++){
		now = new Date();
		now.setMinutes(now.getMinutes() + Math.ceil(res.durations[0][i]/60))
		data = {};
		console.log(now);
		data.location_id = parking_data.parking_info[i].locationId;
		data.time = now.getHours() * 2 + ((now.getMinutes() > 30) ? 1 : 0);
		data.month = now.getMonth();
		data.date = now.getDate();
		data.day = now.getDay();
		data.traffic = Math.floor(Math.random() * 4);
		data.is_event = Math.floor(Math.random() * 2);
		data.is_snowing = Math.floor(Math.random() * 2);
		data.is_raining = Math.floor(Math.random() * 2);
		data.duration = Math.ceil(res.durations[0][i]/60);
		data.destination = res.destinations[i].location;
		data.reaching_time = now.getHours() + ":" + ((now.getMinutes() < 10)?"0":"") + now.getMinutes();
		features_list.push(data);
		// predict here
		// save result
	}

	console.log(res);
}

function getUriString(source, destination){
    var path = "https://api.mapbox.com/directions/v5/mapbox/driving-traffic/";
    path += source[0] + "%2C" + source[1] + "%2B" + destination[0] + "%2C" + destination[1];
    path += ".json&access_token=pk.eyJ1IjoidGFudmVlcjY5IiwiYSI6ImNqcmgwdGdpeTA3M2g0M25uNWYwbjZ2a3EifQ.wRjnyEoPjV7eLzmAl0v9Kg";
    return path;
  } 

function getMatrixUri(source, destinations){
	var path = "https://api.mapbox.com/directions-matrix/v1/mapbox/driving/";
	path += source[0] + "," + source[1];
	for(var i = 0 ; i < destinations.length; i++){
	  path += ";" + destinations[i][0] + "," + destinations[i][1];
	}
	path += "?sources=0&destinations=1";
	for(var i = 1; i < destinations.length; i++)
	  path += ";" + (i+1);
	path += "&access_token=pk.eyJ1IjoidGFudmVlcjY5IiwiYSI6ImNqcmgwdGdpeTA3M2g0M25uNWYwbjZ2a3EifQ.wRjnyEoPjV7eLzmAl0v9Kg";

	return path;
}

function drawRoute(data){
	var route = data.geometry.coordinates;
	var geojson = {
		type: 'Feature',
		properties: {},
		geometry: {
		  type: 'LineString',
		  coordinates: route
		}
	};
	// if the route already exists on the map, reset it using setData
	if (false) {
		map.getSource('route').setData(geojson);
	} else { // otherwise, make a new request
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

function getRoute(start, end, callback) {
// make a directions request using cycling profile
// an arbitrary start will always be the same
// only the end or destination will change
var url = 'https://api.mapbox.com/directions/v5/mapbox/cycling/' + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;

// make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
var req = new XMLHttpRequest();
req.responseType = 'json';
req.open('GET', url, true);
req.onload = function() {
  var data = req.response.routes[0];
  var route = data.geometry.coordinates;
  var geojson = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: route
    }
  };
  // if the route already exists on the map, reset it using setData
  if (map.getSource('route')) {
    map.getSource('route').setData(geojson);
  }else { // otherwise, make a new request
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
		map.getSource('route').setData(geojson);
  }
  callback(data);
  // add turn instructions here at the end
};
req.send();
}

