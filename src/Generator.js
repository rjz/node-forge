var _ = require('underscore')
  , fs = require('fs');

/**
 *  Generator base class
 */
var Generator = function () {

    // keep a list of child classes available
    var _children = {};

    // wear a nametag when performing logging
    var _prefix = function (g) {
        return '(' + g.key + '): ';
    };

    /**
     *  Not much happening here.
     *  @constructor
     */
    function Generator () {};

    /**
     *  Prints a notice to the command line
     *  @param  {String}    message the notice to print
     */
    Generator.prototype.notice = function (message) {
        console.log(_prefix(this) + (message || '[no message]'));
    };

    /**
     *  Prints an error message to the command line and exits.
     *  @param  {String}    message the error to print
     */
    Generator.prototype.error = function (message) {
        console.log('! ' + _prefix(this) + (message || '[no message]'));
        process.exit();
    };

    /**
     *  Invokes a new generator instance
     *  @param  {String}    action           the generator action to invoke (create|destroy)
     *  @param  {String}    generatorName    the name of the generator to invoke
     *  @param  {String}    name             the name of the object to create
     *  @param  {Object}    options          options (if any) to pass to the invoked generator
     */
    Generator.prototype.invoke = function (action, generatorName, name, options) {

        var generator = _children[generatorName];

        if (generator && generator.prototype[action]) {
            return (new generator)[action](name, options);
        }

        this.error('Failed invoking ' + name + ':' + action);
    };

    /**
     *  Returns the absolute path to the generator directory
     *  @return {String}
     */
    Generator.prototype.generatorDir = function () {
        var dir = __dirname.split('/');
        dir[dir.length - 1] = 'generators/' + this.key;
        return dir.join('/');
    };

    /**
     *  Returns the absolute path to the generator's template directory
     *  @return {String}
     */
    Generator.prototype.templateDir = function () {
        return this.generatorDir() + '/templates';
    };

    /**
     *  Populates template with object and copies to project
     *  @param  {String}    src the name of the source template
     *  @param  {String}    dst the destination for the template
     *  @param  {Object}    subject the object to use for populating template
     */
    Generator.prototype.template = function (src, dst, subject) {

        var obj = _.clone(subject || {}),
            self = this;

        if (!_.isObject(obj)) {
            this.error('Template subjects must be instances of [Object]');
        }

        fs.readFile(this.templateDir() + '/' + src, function (err, content) {

            if (err) {
                self.error('Failed reading template at ' + src);
            }

            content = content.toString();

            if (content != '') {
                content = _.template(content, obj);
            }

            fs.exists(dst, function (exists) {
                if (exists) {
                    self.error('Destination file ' + dst + ' exists. Please resolve conflict.');
                }

                fs.writeFile(dst, content);
                self.notice('Created ' + dst)
            });
            
        });
    };

    /**
     *  Anti-template (destroy files created by `template`)
     *  @param  {String}    src the name of the source template
     *  @param  {String}    dst the destination for the template
     *  @param  {Object}    subject the object to use for populating template
     */
    Generator.prototype.untemplate = function (src, dst, subject) {
        var self = this;
        fs.exists(dst, function (exists) {
            if (exists) {
                fs.unlink(dst);
                self.notice('Removed ' + dst)
            }
        });
    };

    /**
     *  Create a directory
     *  @param  {String}    path the path to the directory to create
     */
    Generator.prototype.mkdir = function (path) {
        var self = this;
        fs.exists(path, function (exists) {
            if (exists) {
                self.error(path + ' exists. Please resolve this manually.');
            } else {
                // FIXME: handle errors
                fs.mkdir(path);
                self.notice('Created directory ' + path)
            }
        });
    };

    /**
     *  Anti-mkdir (destroy directory created by mkdir)
     *  will FAIL unless specified directory is empty
     *
     *  @param  {String}    path the path to the directory to remove    
     */
    Generator.prototype.unmkdir = function (path) {
        fs.exists(path, function (exists) {
            if (exists) {
                fs.rmdir(path);
                self.notice('Removed ' + dst)
            }
        });
    };

    /**
     *  Override in generator to create new files
     *  @param  {String}    name    the name of the object being generated
     *  @param  {Object}    options a list of options being passed to the generator
     */
    Generator.prototype.create = function (name, options) {};

    /**
     *  Reverse actions taken by `create`. Override in generator for more control
     *  @param  {String}    name    the name of the object being un-generated
     *  @param  {Object}    options a list of options being passed to the un-generator
     */
    Generator.prototype.destroy = function (name, options) {

        var originals = {};

        // FIXME: this shouldn't be hard-coded
        ['template'].forEach(function (key) {
            originals[key] = this[key];
            this[key] = this['un' + key];
        }, this);

        this.create(name, options);

        for (key in originals) {
            this[key] = originals[key];
        }
    };

    /**
     *  Extend function for creating junior generators. Not self-propagating,
     *  but probably should be.
     *
     *  @static
     *  @param  {Object}    props   instance methods for extending Generator
     *  @return {Function}
     */
    Generator.extend = function (props) {

        var _child = function () {};

        function _ctor () {
            this.constructor = Generator.constructor;
        }

        if (!props.key) {
            throw('Generator key not set!');
        }

        _ctor.prototype = Generator.prototype;
        _child.prototype = new _ctor();
        _.extend(_child.prototype, props);

        _children[props.key] = _child;

        return _child;
    };

    return Generator;
}();

module.exports = Generator;
