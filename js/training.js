// training_data_obj = [
// 	{
// 		parking_id : 0,
// 		free : 2,
// 		time : 36,
// 		day : 2,
// 		date : 4,
// 		month : 3,
// 		traffic : 0,
// 		is_event : 0,
// 		is_raining : 0,
// 		is_snowing : 0
// 	},
// 	{
// 		parking_id : 0,
// 		free : 3,
// 		time : 36,
// 		day : 2,
// 		date : 4,
// 		month : 3,
// 		traffic : 0,
// 		is_event : 0,
// 		is_raining : 0,
// 		is_snowing : 0
// 	},
// 	{
// 		parking_id : 1,
// 		free : 0,
// 		time : 36,
// 		day : 2,
// 		date : 4,
// 		month : 3,
// 		traffic : 1,
// 		is_event : 0,
// 		is_raining : 0,
// 		is_snowing : 0
// 	}
// ]

$(document).ready(function(){
	fetch("training_data.json")
	.then(response => response.json())
	.then(jsonResponse => processData(jsonResponse))
});

async function processData(jsonResponse){
	training_data = jsonResponse['training_data'];
	console.log(training_data[0]);
	input_data = [];
	output_data = [];
	for(var i = 0 ; i < training_data.length; i++){
		input_data.push(training_data[i].location_id);
		input_data.push(training_data[i].time);
		input_data.push(training_data[i].day);
		input_data.push(training_data[i].date);
		input_data.push(training_data[i].month);
		input_data.push(training_data[i].traffic);
		input_data.push(training_data[i].is_event);
		input_data.push(training_data[i].is_raining);
		input_data.push(training_data[i].is_snowing);
		
		var output_data_formatted = getOutputFormatted(training_data[i].free);
		for (var j = 0; j < output_data_formatted.length; j++) {
			output_data.push(output_data_formatted[j]);
		}
	}

	const descriptive_features = tf.tensor2d(training_data.map(item => [
		item.location_id, item.time, item.day, item.date, item.month, item.traffic, item.is_event, item.is_raining, item.is_snowing
	]));

	const target_features = tf.tensor2d(training_data.map(item => [
		(item.free == 0) ? 1 : 0,
		(item.free == 1) ? 1 : 0,
		(item.free == 2) ? 1 : 0,
		(item.free == 3) ? 1 : 0,
		(item.free == 4) ? 1 : 0,
	]));

	descriptive_features.print();
	target_features.print();

	const model = tf.sequential();
	model.add(tf.layers.dense({units: 25, activation: 'relu', inputShape: [9]}));
	model.add(tf.layers.dense({units: 5, activation: 'relu', inputShape : [25]}));
	model.add(tf.layers.dense({units: 5, activation: 'softmax'}));
	model.compile({
	  optimizer: tf.train.adam(.06),
	  loss: 'meanSquaredError',
	});

	// const xs = tf.tensor2d(input_data);
	// const ys = tf.tensor2d(output_data);
	console.log("Trainnig started");
	const history = await model.fit(descriptive_features, target_features, {epochs : 8});
	console.log(history);
	const saveResult = await model.save('localstorage://my-model-1');
	console.log("Trainnig complete");

	
}

function getOutputFormatted(free_space){
	if(free_space == 0)
		return [1,0,0,0,0];
	else if(free_space < 2)
		return [0,1,0,0,0];
	else if(free_space < 5)
		return [0,0,1,0,0];
	else if(free_space < 8)
		return [0,0,0,1,0];
	else
		return [0,0,0,0,1]
}


