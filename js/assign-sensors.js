$(document).ready(function(){
  tmplt_input_form = Handlebars.compile($("#osd-form").html());
  $main_panel = $('#osd-main');

  $main_panel.on("click", "#add-btn", addSensorClicked);

  fetch(api_host + "/locationInformation/")
  .then(res => {return res.json()})
  .then(resp => {
    data = {};
    
    data.locations = resp;

    // for(var i = 0 ; i < resp.length; i++){
    //   data.locationIds.push(resp[i].locationId);
    //   data.locationNames.push(resp[i].locationName);
    // }
    console.log(data);
    $main_panel.html(tmplt_input_form(data));
    
  });
});

function addSensorClicked(event){
  event.preventDefault();
  var locationId = $("#location-id").val();
  data = {};
  data.sensorId = $("#sensor-id").val();
  //console.log(locationId + " " + sensorId);

  $.ajax({
    url: api_host + "/locationInformation/" + locationId + "/parkingInformation",
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
     $("#sensor-id").val("");
     $("#info").html(res.message);
    }
  })
}