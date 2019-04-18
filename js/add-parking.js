$(document).ready(function(){
    user_location = [11.03283, 50.9787];
    initMap();
    $("#add-btn").click(function(){
        if($("#name").val().length > 0){
            data = {};
            data["locationName"] = $("#name").val();
            data["longitude"] = user_location[0]+"";
            data["latitude"] = user_location[1]+"";
            console.log(data);


            $.ajax({
              url: api_host + "/locationInformation",
              type:"POST",
              data:JSON.stringify(data),
              contentType:"application/json; charset=utf-8",
              dataType:"json",
              responseType:'application/json',
              headers: {
                'Access-Control-Allow-Credentials' : true,
                'Access-Control-Allow-Origin':'*',
                'Access-Control-Allow-Headers':'application/json',
              },
              success: function(res){
                console.log(res);
               $("#name").val("");
               $("#info").html(res.message);
              }
            })
        }
    });
});

function initMap(){
	mapboxgl.accessToken = 'pk.eyJ1IjoidGFudmVlcjY5IiwiYSI6ImNqcmgwdGdpeTA3M2g0M25uNWYwbjZ2a3EifQ.wRjnyEoPjV7eLzmAl0v9Kg';
    map = new mapboxgl.Map({container: 'map',style: 'mapbox://styles/mapbox/streets-v11',center : user_location,zoom : 12});
    geocoder = new MapboxGeocoder({accessToken: mapboxgl.accessToken});
    
    map.on('load', mapOnLoad);
    map.on('click', mapOnClick);
}

function mapOnLoad(){
	addMarker(user_location,'load');
            
	
	//console.log('lng: ' + user_location[0] + '<br />lat: ' + user_location[1]);
	$("#coordinates").css('display', 'block');
    $("#coordinates").html('lng: ' + user_location[0] + '<br />lat: ' + user_location[1]);

    geocoder.on('result', function(ev) {
        console.log(ev.result.center);

    });
}

function mapOnClick(e){
    if(marker != null)
	   marker.remove();
    addMarker(e.lngLat,'click');
    
    //console.log(e.lngLat.lat);
    
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

function onDragEnd() {
    var lngLat = marker.getLngLat();
    
    console.log('lng: ' + lngLat.lng + '<br />lat: ' + lngLat.lat);
    $("#coordinates").css('display', 'block');
    $("#coordinates").html('lng: ' + lngLat.lng + '<br />lat: ' + lngLat.lat);
}  