var _          = require('underscore')
  , Generator  = require('./src/Generator')
;

var generators = require('./generators/all');

// CLI entry point
(function () {

 	var _error = _.bind(Generator.prototype.error, {key: 'Generator'})
	var generatorAction, 
      generatorName, 
      generator,
      objectName, 
      objectOptions, 
      argv;

	// extract command line arguments
	argv = process.argv.slice(2);

	// check for correct usage
	if (argv.length < 3) {
		_error('usage: node forge.js [create|destroy] [type] [name]');
	}

	// extract arguments
	generatorAction = argv.shift();
	generatorName = argv.shift();
	objectName = argv.shift();
	objectOptions = argv;

	if (_.include(['create','destroy'], generatorAction)) {
		if (_.has(generators, generatorName)) {
      generator = generators[generatorName]
      generator.verbose = true;
      generator[generatorAction](objectName, objectOptions);
      if (generatorAction == 'destroy') {
        generator.reverseQueue();
      }
      generator.run();
		} else {
			_error('unknown generator "' + generatorName + '"');
		}
	} else {
		_error('unknown generator action "' + generatorAction + '"'); 	
	}
})();
