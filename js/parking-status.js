// parking_data ={
// 	parking_info : [
// 		{
// 			parking_id : 0,
// 			name : "UG parking - A",
// 			lng : 11.034922771803195,
// 			lat : 50.97425921864834,
// 			free_space : 2,
// 			sensors : [
// 				{
// 					sensor_id : 0,
// 					last_communication : "timestamp",
// 					status : 1
// 				},
// 				{
// 					sensor_id : 1,
// 					last_communication : "timestamp",
// 					status : 1
// 				},
// 				{
// 					sensor_id : 2,
// 					last_communication : "timestamp",
// 					status : 1
// 				}
// 			]
// 		},
// 		{
// 			parking_id : 1,
// 			name : "UG parking - B",
// 			lng : 11.03747937655794,
// 			lat : 50.97473007957376,
// 			free_space : 1,
// 			sensors : [
// 				{
// 					sensor_id : 3,
// 					last_communication : "timestamp",
// 					status : 1
// 				},
// 				{
// 					sensor_id : 4,
// 					last_communication : "timestamp",
// 					status : 0
// 				},
// 				{
// 					sensor_id : 5,
// 					last_communication : "timestamp",
// 					status : 1
// 				}
// 			]
// 		},
// 		{
// 			parking_id : 2,
// 			name : "Name 3",
// 			lng : 11.032400727497446,
// 			lat : 50.97426419894839,
// 			free_space : 2,
// 			sensors : [
// 				{
// 					sensor_id : 6,
// 					last_communication : "timestamp",
// 					status : 1
// 				},
// 				{
// 					sensor_id : 7,
// 					last_communication : "timestamp",
// 					status : 1
// 				},
// 				{
// 					sensor_id : 8,
// 					last_communication : "timestamp",
// 					status : 0
// 				},
// 				{
// 					sensor_id : 9,
// 					last_communication : "timestamp",
// 					status : 1
// 				},
// 				{
// 					sensor_id : 10,
// 					last_communication : "timestamp",
// 					status : 0
// 				}
// 			]
// 		}
// 	]
// };

$(document).ready(function(){
	map_loaded = false;
	user_location = [11.03283, 50.9787];
	tmplt_parking_info = Handlebars.compile($("#osd-parking-template").html());
	Handlebars.registerPartial("osd-parking-row-template", $("#osd-parking-row-template").html());
	Handlebars.registerHelper('castState', function(prob) {
		if(prob == 1){
			return new Handlebars.SafeString( '<span class="text-danger">booked</span>' );
		}else
    		return new Handlebars.SafeString( '<span class="text-success">Free</span>' );
	});
	$main_panel = $('#osd-main');
	$results_panel = $("#osd-parking-info");
	marker = null;
	selected_parking = null;
	loadData();
	
	$results_panel.on("click", ".osd-parking", parkingClicked);
	// $main_panel.on("click", ".osd-route-result", resultOnClick)
});

function loadData(){
	// get parking data, then
	fetch(api_host + "/locationInformation")
	.then(res => res.json())
	.then(parking_data => {
		console.log(parking_data);
		getFreeSpaceCount(parking_data);
		
	});
	
	setTimeout(function(){ loadData(); }, 8000);
}

async function getFreeSpaceCount(parking_data){
	res = await fetch(api_host + "/countParkings");
	counts = await res.json();
	console.log(counts);
	for(var i = 0 ; i < parking_data.length; i++){
		parking_data[i].free_space = counts[i].free;
	}
	data = {};
	data.parking_info = parking_data;
	$results_panel.html(tmplt_parking_info(data));
	if(!map_loaded)
		initMap();
}

function parkingClicked(){
	if(marker != null)
		marker.remove();
	if(selected_parking != null)
		selected_parking.removeClass("focus");
	selected_parking = $(this);
	selected_parking.addClass("focus");
	addMarker([$(this).data('lng'),$(this).data('lat')]);
}

function initMap(){
	map_loaded = true;
	mapboxgl.accessToken = 'pk.eyJ1IjoidGFudmVlcjY5IiwiYSI6ImNqcmgwdGdpeTA3M2g0M25uNWYwbjZ2a3EifQ.wRjnyEoPjV7eLzmAl0v9Kg';
    map = new mapboxgl.Map({container: 'map',style: 'mapbox://styles/mapbox/streets-v11',center : user_location,zoom : 12});
    geocoder = new MapboxGeocoder({accessToken: mapboxgl.accessToken});
    
    map.on('load', mapOnLoad);
}

function mapOnLoad(){
    //add_markers(previous_location);

    geocoder.on('result', function(ev) {
        console.log(ev.result.center);

    });
}

function addMarker(ltlng,event) {
    marker = new mapboxgl.Marker({draggable: false,color:"#d02922"})
        .setLngLat(ltlng)
        .addTo(map);
}