var Generator = require('./../../src/Generator');

/**
 *	A generator
 */
module.exports = Generator.extend({
	
    // set the generator name
	key: '<%= name %>',

    /**
	 *	What to do on setup (will be reversed for teardown)
	 *	@param	{String}	name	the name of the object being generated
	 *	@param	{Object}	options	a list of options being passed to the generator
	 */
	create: function () {
             
        console.log('hello from <%= name %>');
    }
});
