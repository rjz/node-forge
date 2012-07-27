var Generator = require('./../../src/Generator');

/**
 *	A generator for creating other generators
 *
 *	Invoke from command line in project directory:
 *
 *	    $ node forge/forge.js create generator foobar
 *
 *	@extends	{Generator}
 */
module.exports = Generator.extend({
	
    // set the generator name
    key: 'generator',

    /**
     *	What to do on setup (will be reversed for teardown)
     *	@param	{String}	name	the name of the object being generated
     *	@param	{Object}	options	a list of options being passed to the generator
     */
    create: function (name, options) {

        var self = this;

        var dirName, subject, templates;

        // normalize name format to lowercase
        name = name.toLowerCase();

        // path to the directory that will contain the new generator
        // FIXME: this shouldn't be hard-coded
        dirName = './node-forge/generators/' + name;

        // set up a subject to use for templating. In this case, the only
        // variables being used are variations on the view's name:
        subject = {
            name: name,
            objectName:	name.charAt(0).toUpperCase() + name.slice(1),
            pluralName: name + 's'
        };

        this.mkdir(dirName);
        this.mkdir(dirName + '/templates');
        this.template('generator.js',  dirName + '/' + name + '.js', subject);
    }
});
