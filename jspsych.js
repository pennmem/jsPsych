// jspsych.js
// 
//	Josh de Leeuw and Drew Hendrickson
//	Percepts and Concepts Lab, Indiana University
//
(function( $ ) {
	jsPsych = (function() {
	
		//
		// public object
		//
		var core = {};
	
		//
		// private class variables
		//
	
		// options
		var opts = {};
		// exp structure
		var exp_blocks = [];
		// flow control
		var curr_block = 0;
		// everything loaded?
		var initialized = false;
		// target DOM element
		var DOM_target;
		
		//
		// public methods
		//
		
		core.init = function($this, options){
			// import options
			opts = $.extend({}, jsPsych.defaults, options);
			// set target
			DOM_target = $this;
			
			// load plugin script files
			var scripts_loaded = 0;
			// load all of the plugins that are defined in the opts["plugins"]
			for(var j = 0; j < opts["plugins"].length; j++)
			{
				$.getScript(opts["plugins"][j]["src"], function(){
					scripts_loaded++; 
					if(scripts_loaded==opts["plugins"].length) {
						intialized = true;
						run();
					}
				});
			}
		}
		
		//
		// private functions //
		//
		function run()
		{
			// take the experiment structure and dynamically create a set of blocks
			exp_blocks = new Array(opts["experiment_structure"].length);
			
			// iterate through block list to create trials
			for(var i = exp_blocks.length-1; i>=0; i--)
			{
				var trials = "undefined";
				
				for(var j = 0; j < opts["plugins"].length; j++)
				{
					if(opts["experiment_structure"][i]["type"] == opts["plugins"][j]["type"])
					{
						trials = jsPsych[opts["plugins"][j]["type"]]["create"].call(null, opts["experiment_structure"][i]);
					}
				}
				
				exp_blocks[i] = createBlock(trials);
			}

			// run the first block
			exp_blocks[0].next();
		}
		
		function nextBlock()
		{
			curr_block += 1;
			if(curr_block == exp_blocks.length)
			{
				finishExperiment();
			} else {
				exp_blocks[curr_block].next();
			}
		}
		
		function createBlock(trial_list)
		{
			var block = {
				trial_idx: -1,
			
				trials: trial_list,
				
				data: [],
				
				next: function() {
					this.trial_idx = this.trial_idx+1;
				
					curr_trial = trial_list[this.trial_idx];
					
					if ( typeof curr_trial == "undefined"){
						return this.done();
					}
					
					do_trial(this, curr_trial);
				},
				
				done: nextBlock
			}
			
			return block;
		}
		
		function finishExperiment()
		{
			var all_data = [];
			for(var i=0;i<exp_blocks.length;i++)
			{
				all_data[i] = exp_blocks[i].data;
			}
			
			opts["finish"].apply((new Object()), [all_data]); 
		}
		
		function do_trial(block, trial)
		{
			for(var j = 0; j < opts["plugins"].length; j++)
			{
				if(trial.type == opts["plugins"][j]["type"])
				{
					jsPsych[opts["plugins"][j]["type"]]["trial"].call(this, DOM_target, block, trial, 1);
				}
			}
		}
		
		return core;
	})();
}) (jQuery);



