Generator = require('../src/Generator')
  , async = require('async')
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
