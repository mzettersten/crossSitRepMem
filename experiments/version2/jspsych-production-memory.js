/**
 * crossSitRep - production-memory
 * Martin Zettersten
 */

jsPsych.plugins['production-memory'] = (function() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {
	  
      // default values
	  trial.button_html = trial.button_html || '<button class="jspsych-btn">%choice%</button>';
      trial.canvas_size = trial.canvas_size || [1024,210];
	  trial.targetLocation = trial.targetLocation || "top";
	  trial.sequence = trial.sequence;
	  trial.question = trial.question || "Type the number sequence in the correct order into the text box.";
	  trial.finishText = trial.finishText || "Click the ENTER button when you are finished.";
	  trial.timing_post_trial = typeof trial.timing_post_trial == 'undefined' ? 500 : trial.timing_post_trial;
	  trial.feedback = trial.feedback || "You entered an invalid response. Please enter your best guess for the number sequence.";
	  trial.correct_feedback = trial.correct_feedback || "CORRECT";
	  trial.incorrect_feedback = trial.incorrect_feedback || "INCORRECT";
	  
	  
      // if any trial variables are functions
      // this evaluates the function and replaces
      // it with the output of the function
      trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
	  
	  display_element.append($("<svg id='jspsych-test-canvas' width=" + trial.canvas_size[0] + " height=" + trial.canvas_size[1] + "></svg>"));

      var paper = Snap("#jspsych-test-canvas");

	  //add prompt text
	  //display_element.append(trial.question + trial.label + "?");
	  var text = paper.text(400, 55, trial.question);
	  var finishText = paper.text(400, 95, trial.finishText);
	  text.attr({
		  "text-anchor": "middle",
		  editable: true,
		  "font-weight": "bold"
	  });
	  finishText.attr({
		  "text-anchor": "middle",
		  editable: true
	  });
	  
	  
	  var boxID = ""

	  display_element.append($('<div>', {
        "id": 'jspsych-produce-4',
      }));
	  $("#jspsych-produce-4").append('<textarea id="jspsych-prodbox-4" cols="8" rows="1" autocorrect="off" autocapitalize="off" autocomplete="off" spellcheck="false"></textarea>');
	  boxID = "jspsych-prodbox-4";
	  // bottomCircle.attr({
	  // 		  fill: "#00ccff",
	  // });
	  

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
      display_element.append('<div id="jspsych-button-response-btngroup" class="center-content block-center"></div>')
      for (var i = 0; i < trial.choices.length; i++) {
        var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
        $('#jspsych-button-response-btngroup').append(
          $(str).attr('id', 'jspsych-button-response-button-' + i).data('choice', i).addClass('jspsych-button-response-button').on('click', function(e) {
            var choice = $('#' + this.id).data('choice');
            after_response(choice);
          })
        );
      };
	  
	  
	  
	  //create audio
	  //var audio = new Audio(trial.audio);
	  
	  var numIncorrectEntries = 0;
	  var rt = "NA";
	  
	  var start_time = (new Date()).getTime();
	    
	  var trial_data={};
	  
	  var feedbackText = paper.text(400, 190, trial.feedback);
	  feedbackText.attr({
		  "text-anchor": "middle",
		  editable: true,
		  fill: "#FF0000",
		  "font-weight": "bold",
		  opacity: 0
	  });
	  
	  function after_response(choice) {
		  var end_time = (new Date()).getTime();
		  rt = end_time - start_time;
		  
		  $("#jspsych-button-response-stimulus").addClass('responded');
		  // disable all the buttons after a response
	      //$('.jspsych-button-response-button').off('click').attr('disabled', 'disabled');
		  $('.jspsych-button-response-button').attr('disabled', 'disabled');
		  
		  var val = document.getElementById(boxID).value;
		  console.log(val);
		  
		  //give warning message if string is empty
		  if (val == "") {
			  console.log("No response.")
	  		feedbackText.attr({
				"opacity": 1
	  			})
			  numIncorrectEntries++;
			  $('.jspsych-button-response-button').removeAttr('disabled');
		  } else {
			  endTrial(val);
		  };
		  
	  };

	  
      function endTrial(rating) {
		//var audioFeedback = new Audio(trial.audioFeedback);
		//audioFeedback.play();
		var isRight=0
		
		feedbackText.attr({
				"opacity": 0
			});
	  
	  if (rating == trial.sequence) {
		  var correct_feedback = paper.text(400, 190, trial.correct_feedback);
		  correct_feedback.attr({
			  "text-anchor": "middle",
			  editable: true,
			  fill: "green",
			  "font-weight": "bold"
		  });
		  isRight=1
	  } else {
		  var incorrect_feedback = paper.text(400, 190, trial.incorrect_feedback);
		  incorrect_feedback.attr({
			  "text-anchor": "middle",
			  editable: true,
			  fill: "red",
			  "font-weight": "bold"
		  });
	  }
		
		
        var trial_data = {
			"correct_sequence": trial.sequence,
			"solution": rating,
			"isRight": isRight,
			"rt": rt,
			"numIncorrectEntries": numIncorrectEntries
		};
		
		
		setTimeout(function(){
			display_element.html('');
			jsPsych.finishTrial(trial_data);
		},1000);
		// display_element.html('');
// 		jsPsych.finishTrial(trial_data);
		
      };
  };	  
		
		return plugin;
})();