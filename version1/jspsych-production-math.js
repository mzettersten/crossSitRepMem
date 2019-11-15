/**
 * crossSitRep - production-math
 * Martin Zettersten
 */

jsPsych.plugins['production-math'] = (function() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {
	  
      // default values
	  trial.button_html = trial.button_html || '<button class="jspsych-btn">%choice%</button>';
      trial.canvas_size = trial.canvas_size || [1024,315];
	  trial.targetLocation = trial.targetLocation || "top";
	  trial.question = trial.question || "What is the solution of the arithmetic problem below?";
	  trial.equation = trial.equation;
	  trial.question2 = trial.question2 || "Type the solution into the text box.";
	  trial.finishText = trial.finishText || "Click the ENTER button when you are finished.";
	  trial.timing_post_trial = typeof trial.timing_post_trial == 'undefined' ? 500 : trial.timing_post_trial;
	  trial.feedback = trial.feedback || "You entered an invalid response. Please enter your best guess for the solution."
	  
	  
      // if any trial variables are functions
      // this evaluates the function and replaces
      // it with the output of the function
      trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
	  
	  display_element.append($("<svg id='jspsych-test-canvas' width=" + trial.canvas_size[0] + " height=" + trial.canvas_size[1] + "></svg>"));

      var paper = Snap("#jspsych-test-canvas");
	  
	  
	  var equationRect = paper.rect(275, 95, 250,75, 10,10);
	  equationRect.attr({
		  fill: "#FFD3D6",
		  stroke: "#000",
		  strokeWidth: 5
	  });
	  
	  var targetEquation = paper.text(400, 150, trial.equation);
	  
	  targetEquation.attr({
		  "text-anchor": "middle",
		  editable: true,
		  "font-weight": "bold",
		  "font-size": 48
	  });

	  //add prompt text
	  //display_element.append(trial.question + trial.label + "?");
	  var text = paper.text(400, 30, trial.question);
	  var text2 = paper.text(400, 55, trial.question2);
	  var finishText = paper.text(400, 75, trial.finishText);
	  text.attr({
		  "text-anchor": "middle",
		  editable: true,
		  "font-weight": "bold"
	  });
	  text2.attr({
		  "text-anchor": "middle",
		  editable: true
	  });
	  finishText.attr({
		  "text-anchor": "middle",
		  editable: true
	  });
	  
	  
	  var boxID = ""

	  display_element.append($('<div>', {
        "id": 'jspsych-produce-3',
      }));
	  $("#jspsych-produce-3").append('<textarea id="jspsych-prodbox-3" cols="8" rows="1" autocorrect="off" autocapitalize="off" autocomplete="off" spellcheck="false"></textarea>');
	  boxID = "jspsych-prodbox-3";
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
			  var feedbackText = paper.text(400, 300, trial.feedback);
			  feedbackText.attr({
				  "text-anchor": "middle",
				  editable: true,
				  fill: "#FF0000",
				  "font-weight": "bold"
			  });
			  numIncorrectEntries++;
			  $('.jspsych-button-response-button').removeAttr('disabled');
		  } else {
			  endTrial(val);
		  };
	  };

	  
      function endTrial(rating) {
		//var audioFeedback = new Audio(trial.audioFeedback);
		//audioFeedback.play();
        var trial_data = {
			"equation": trial.equation,
			"solution": rating,
			"rt": rt,
			"numIncorrectEntries": numIncorrectEntries
			
		};
		
		
		// setTimeout(function(){
		// 	display_element.html('');
		// 	jsPsych.finishTrial(trial_data);
		// },500);
		display_element.html('');
		jsPsych.finishTrial(trial_data);
		
      };
  };	  
		
		return plugin;
})();