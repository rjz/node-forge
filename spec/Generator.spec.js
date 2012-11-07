Generator = require('../src/Generator')
  , async = require('async')
  , fs    = require('fs')
;

describe('Generator', function () {

    it('can be extended', function () {

        var child = new (Generator.extend({ 
            key: 'child'
        }));

        expect(child instanceof Generator).toBeTruthy();
    });

    describe('queue', function () {

		var a = 'a',
			b = 'b',
			c = 'c';

		var spy, child;

		beforeEach(function() {
			spy = jasmine.createSpy();

			child = new (Generator.extend({ 
				key: 'child',
				create: function () {
					this.foo(a, b, c);
					this.bar(c, b, a);
				},
				foo: function (a, b, c) {
					this.queue(function (result) {
					  spy(a, b, c);
					  result();
					});
				},
				bar: function (c, b, a) {
					this.queue(function (result) {
					  expect(spy).toHaveBeenCalledWith(a, b, c);
					  spy(c, b, a);
					  result();
					});
				}
			}));
		});

		it('queues methods', function () {
			child.create();
			expect(child.q.length).toEqual(2);

			child.run();
			expect(spy).toHaveBeenCalledWith(c, b, a);
			expect(spy.callCount).toEqual(2);
		});

		it('stops running on error', function () {
			child.foo = function (a, b, c) {
				this.queue(function (result) {
					spy(a, b, c);
					result('error!');
				});
			};

			child.create();
			expect(child.q.length).toEqual(2);

			child.run();
			expect(spy.callCount).toEqual(1);
		});
    });

    it('can invoke other generators', function () {

        var name = 'foobar',
            opts = { foo: 'bar' },
            spy = jasmine.createSpy();

        var childA = new (Generator.extend({
            key: 'childA',
            create: function () {
                this.invoke('create', 'childB', name, opts);
            }
        }));

        var childB = Generator.extend({
            key: 'childB',
            create: spy
        });

        childA.create();
        childA.run();

        expect(spy).toHaveBeenCalledWith(name, opts);
    });

    describe('built-in helpers', function () {

        describe('mkdir', function () {

            var generator;

            beforeEach(function () {
                generator = new (Generator.extend({
                    key: 'foobar',
                    create: function (name, options) {
                        this.mkdir(options.target);
                    }
                }));
            });

            it('creates directories', function () {

                var target = './spec/fixtures/up_test';

                generator.create('foo', { target: target });
                generator.run();

                waitsFor(function () {
                    if (fs.existsSync(target)) {
                        expect(fs.statSync(target).isDirectory());
                        fs.rmdirSync(target);
                        return true;
                    }
                });
            });

            it('can be reversed', function () {
                
                var target = './spec/fixtures/down_test';

                fs.mkdirSync(target);

                generator.destroy('foo', { target: target });
                generator.run();

                waitsFor(function () {
                    return !fs.existsSync(target);
                }, 1000);

            });
        });

        describe('template', function () {

            var generator;

            var options = {
                src: 'template.txt',
                dst: 'spec/fixtures/hello_world.txt',
                subject: { 
                    helloWorld: 'Hello, World!' 
                }
            };

            beforeEach(function () {
                generator = new (Generator.extend({
                    key: 'foobar',
                    create: function (name, opts) {
                        this.generatorDir = function () { 
                            return 'spec/fixtures';
                        };
                        this.template(opts.src, opts.dst, opts.subject);
                    }
                }));
            });

            it('populates templates', function () {
                generator.create('foobar', options);
                generator.run();

                waitsFor(function () {
                    var content;
                    if (fs.existsSync(options.dst)) {
                        content = fs.readFileSync(options.dst, 'utf8');
                        expect(content.trim()).toEqual(options.subject.helloWorld);
                        fs.unlinkSync(options.dst);
                        return true;
                    }
                }, 1000);
            });

            it('can be reversed', function () {
                options.dst = 'spec/fixtures/foobar.txt';
                fs.writeFileSync(options.dst, options.subject.helloWorld, 'utf8');
                generator.destroy('foobar', options);
                generator.run();
                
                waitsFor(function () {
                    return !fs.exists(options.dst);
                }, 1000);
            });
        });
    });

    describe('Extensions', function () {

        var a = 'a',
            b = 'b',
            c = 'c';

        it('accepts a create function', function () {

            var child = new (Generator.extend({
                key: 'child',
                create: function () {
                    this.mkdir(a);
                    this.template(a, b, c);
                }
            }));

            spyOn(child, 'mkdir');
            spyOn(child, 'template');

            child.create();

            expect(child.mkdir).toHaveBeenCalledWith(a);
            expect(child.template).toHaveBeenCalledWith(a, b, c);
        });

        it('reverses templating on destroy', function () {
            
            var generator;

            var methods = ['template', 'foobar'],
                spy = jasmine.createSpy(),
                stub = function () {};

            var props = {
                key: 'child',
                create: function () {
                    this.template(a, b, c);
                    this.foobar(a, b, c);
                }
            };

            methods.forEach(function (key) {
              props[key] = stub;
              props['un' + key] = spy;
            });

            generator = new (Generator.extend(props));
            generator.destroy();

            expect(spy.callCount).toEqual(methods.length);

            methods.forEach(function (key) {
                expect(generator[key]).toEqual(stub);
            });
        });
    });
});
