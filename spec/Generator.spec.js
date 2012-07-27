Generator = require('../src/Generator');

describe('Generator', function () {

    it('can be extended', function () {

        var child = new (Generator.extend({ 
            key: 'child'
        }));

        expect(child instanceof Generator).toBeTruthy();
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
            
            var child = new (Generator.extend({
                key: 'child',
                create: function () {
                    this.template(a, b, c);
                }
            }));

            spyOn(child, 'untemplate');

            child.destroy();

            expect(child.untemplate).toHaveBeenCalledWith(a, b, c)
        });
    });
});
