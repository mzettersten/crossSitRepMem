/**
 * crossSitRep - test
 * plugin for comprehension test trials in cross-situational word learning study 
 * Martin Zettersten
 */

jsPsych.plugins['comprehension-test'] = (function() {

  var plugin = {};
  
  jsPsych.pluginAPI.registerPreload('comprehension-test-prompt', 'image1', 'image');
  jsPsych.pluginAPI.registerPreload('comprehension-test-prompt', 'image2', 'image');
  jsPsych.pluginAPI.registerPreload('learning', 'audio', 'audio');

  plugin.trial = function(display_element, trial) {
	  
      // default values
	  trial.button_html = trial.button_html || '<button class="jspsych-btn">%choice%</button>';
      trial.canvas_size = trial.canvas_size || [1024,700];
      trial.image_size = trial.image_size || [150, 150];
	  trial.audio = trial.audio || "stimuli/apple.m4a";
	  //trial.label = trial.label || "kita";
	  trial.question = trial.question || "Click on the button to listen to the word. Then click on the object that goes with the word.";
	  trial.timing_post_trial = typeof trial.timing_post_trial == 'undefined' ? 500 : trial.timing_post_trial;
	  
	  
	  
      // if any trial variables are functions
      // this evaluates the function and replaces
      // it with the output of the function
      trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
	  
	  display_element.append($("<svg id='jspsych-test-canvas' width=" + trial.canvas_size[0] + " height=" + trial.canvas_size[1] + "></svg>"));

      var paper = Snap("#jspsych-test-canvas");
	  
	  var circle1 = paper.circle(200, 225, 110);
	  circle1.attr({
		  fill: "#ffffff",
		  stroke: "#000",
		  strokeWidth: 5
	  });
	  
	  var circle2 = paper.circle(600, 225, 110);
	  circle2.attr({
		  fill: "#ffffff",
		  stroke: "#000",
		  strokeWidth: 5
	  });

	  
	  var imageLocations = {
		  left: [125, 150],
		  right: [525, 150]
	  };
	  
	  var image1 = paper.image(trial.image1, imageLocations["left"][0], imageLocations["left"][1], trial.image_size[0],trial.image_size[1]);
	  var image2 = paper.image(trial.image2, imageLocations["right"][0], imageLocations["right"][1], trial.image_size[0],trial.image_size[1]);
	  
	  //add prompt text
	  //display_element.append(trial.question + trial.label + "?");
	  var text = paper.text(425, 50, trial.question);
	  //var labelText = paper.text(425, 150, trial.label);
	  text.attr({
		  "text-anchor": "middle",
		  editable: true,
		  "font-weight": "bold"
	  });
	  // labelText.attr({
	  // 		  "text-anchor": "middle",
	  // 		  editable: true,
	  // 		  "font-weight": "bold",
	  // 		  "font-size": "25px"
	  // });
	  //create audio
	  var audio = new Audio(trial.audio);
	  
	  //display buttons
      var buttons = [];
      if (Array.isArray(trial.button_html)) {
        if (trial.button_html.length == trial.choices.length) {
          buttons = trial.button_html;
        } else {
          console.error('Error in button-response plugin. The length of the button_html array does not equal the length of the choices array');
        }
      } else {
        for (var i = 0; i < trial.choices.length; i++) {
          buttons.push(trial.button_html);
        }
      }
	  console.log(buttons);
      display_element.append('<div id="jspsych-comp-test-prompt-btngroup" class="center-content block-center"></div>')
      for (var i = 0; i < trial.choices.length; i++) {
        var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
        $('#jspsych-comp-test-prompt-btngroup').append(
          $(str).attr('id', 'jspsych-button-response-button-' + i).data('choice', i).addClass('jspsych-button-response-button').on('click', function(e) {
            var choice = $('#' + this.id).data('choice');
			$('#jspsych-comp-test-prompt-btngroup').hide()
            play_audio();
          })
        );
      };
	  

	  
	  var start_time = (new Date()).getTime();
	  var isRight = "NA";
	  var choice = "NA";
	  var choiceIm = "NA";
	  var choiceType = "NA";
	  var rt = "NA";
	  var audio_start_time = "NA";
	  var end_time = "NA";
	    
	  var trial_data={};
	  
	  function play_audio() {
		  
		  audio_start_time = (new Date()).getTime();
		  
		  audio.play();
		  
		  image1.click(function() {
			  end_time = (new Date()).getTime();
			  rt = end_time - start_time;
			  circle1.attr({
				  fill: "#00ccff"
			  });
			  choice = trial.image1;
			  choiceLocation = "pos1";
			  save_response(choice,choiceLocation,rt);
		  });
	  
		  image2.click(function() {
			  end_time = (new Date()).getTime();
			  rt = end_time - audio_start_time;
			  circle2.attr({
				  fill: "#00ccff"
			  });
			  choice = trial.image2;
			  choiceLocation = "pos2";
			  save_response(choice,choiceLocation,rt);
		  });
	  	
	  }
	  
	  
	  function save_response(choice,choiceLocation,rt) {
		  image1.unclick();
		  image2.unclick();

		  
			if (choice==trial.targetImage) {
				choiceType="target";
				isRight=1
			} else {
				choiceType="foil";
				isRight=0;
			}
			endTrial();
	  };

	  
      function endTrial() {
		//var audioFeedback = new Audio(trial.audioFeedback);
		//audioFeedback.play();
        var trial_data = {
			//"label": trial.label,
			"start_time": start_time,
			"audio_start_time": audio_start_time,
			"end_time": end_time,
			"audio": trial.audio,
			"image1": trial.image1,
			"image2": trial.image2,
			"targetLocation": trial.targetLocation,
			"targetImage": trial.targetImage,
			"choiceLocation": choiceLocation,
			"choiceType": choiceType,
			"choiceImage": choice,
			"isRight": isRight,
			"rt": rt
			
		};
		

		setTimeout(function(){
			display_element.html('');
			jsPsych.finishTrial(trial_data);
		},500);
		
      };
  };	  
		
		return plugin;
})();