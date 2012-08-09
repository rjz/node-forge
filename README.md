Forge
=====

Put a smile on your workflow with template-based generators for node. [Why?](http://blog.rjzaworski.com/2012/07/forge-template-generators-for-node-js/)

Using Forge
----------------

Clone this repository into your project directory and create a new generator:

    $ git clone git@github.com:rjz/node-forge.git
    $ node ./node-forge/forge.js create generator foo

*Note: if underscore.js isn't available in the project directory, you may need to run `npm update` to bring dependencies in line.*

The new generator will land in in `forge/generators`. Invoke the new generator from the command line to create a new `foo` named `bar`:

    $ node ./node-forge/forge.js create foo bar

Besides `create`, an additional `destroy` method may be overridden to help with tearing things down. By default, a generator invoked to `destroy` will try to reverse the steps taken by `create`:

    $ node ./node-forge/forge.js destroy foo bar

#### Authoring

In its simplest form, a generator will extend the `Generator` class with a `key` and a `create` method:

    // generators/foo/foo.js
    var Generator = require('./../../src/Generator');

    //	A generator for creating other generators
    module.exports = Generator.extend({
        key: 'foo',
        create: function (name, options) {
            // implement me
        }
    });

#### Methods

Three basic methods are provided by the `Generator` class for use within action methods:

* `mkdir (path:String)` - creates a new directory within the project
* `template (filename:String, path:String, data:Object)` - populates a template in `templates/` and copyies it to the project
* `invoke (action:String, generator:String, name:String, options:Object)` - invokes a generator action with `name` and `options` as arguments

A simple `create` method for creating a model might set up a model directory, copy a templated model to it, and invoke another generator to create a model view:

    create: function (name, options) {
        this.mkdir('./models');
        this.template('model.js',  './models/' + name + '.js', {});
        this.invoke = function ('create', 'view', name + 'View', {}); 
    }

Tests
-----

A basic test suite is included for testing with jasmine-node.

    cd node-forge && npm test

Author
------

RJ Zaworski <rj@rjzaworski.com>

License
-------

This code is released under the JSON License. You can read the license [here](http://www.json.org/license.html).
