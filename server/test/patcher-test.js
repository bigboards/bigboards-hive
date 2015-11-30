var fs = require('fs');
var should = require('should');
var uuid = require('node-uuid');

var Patcher = require('../storage/patcher');

describe('storage', function () {

    describe('patcher', function () {
        describe('setting a value on a field', function () {
            it('should set the value if the field does not exist yet', function () {
                var doc = { my_field: 15 };

                Patcher.patch(doc, [{op: 'set', fld: 'name', val: 'Daan'}]).should.eql({
                    my_field: 15,
                    name: ['Daan']
                });
            });

            it('should replace the value if the field is already set', function () {
                var doc = { name: 'Wim' };

                Patcher.patch(doc, [{op: 'set', fld: 'name', val: 'Daan'}]).should.eql({
                    name: ['Daan']
                });
            });

            it('should replace the value if an old value has been provided', function () {
                var doc = { name: [
                    { first: 'Daan', second: 'Gerits'},
                    { first: 'Wim', second: 'Van Leuven'}
                ]};

                Patcher.patch(doc, [{op: 'set', fld: 'name', old: { first: 'Daan', second: 'Gerits'}, val: { first: 'Daan', second: 'Barman'}}]).should.eql({
                    name: [
                        { first: 'Daan', second: 'Barman'},
                        { first: 'Wim', second: 'Van Leuven'}
                    ]
                });
            });
        });

        describe('adding a value to a field', function () {
            it('should set the value if the field does not exist yet', function () {
                var doc = { my_field: 15 };

                Patcher.patch(doc, [{op: 'add', fld: 'name', val: 'Daan'}]).should.eql({
                    my_field: 15,
                    name: ['Daan']
                });
            });

            it('should convert the field value to an array and add the new value', function () {
                var doc = { name: 'Wim' };

                Patcher.patch(doc, [{op: 'add', fld: 'name', val: 'Daan'}]).should.eql({
                    name: ['Wim', 'Daan']
                });
            });

            it('should add the value to the field value array', function () {
                var doc = { name: ['Wim', 'Sven'] };

                Patcher.patch(doc, [{op: 'add', fld: 'name', val: 'Daan'}]).should.eql({
                    name: ['Wim', 'Sven', 'Daan']
                });
            });

            it('should not add the value if the unique option is set and a duplicate is given', function () {
                var doc = { name: ['Wim', 'Sven'] };

                Patcher.patch(doc, [{op: 'add', fld: 'name', val: 'Sven', unq: true}]).should.eql({
                    name: ['Wim', 'Sven']
                });
            });
        });

        describe('removing a value from a field', function () {
            it('should do nothing if the field does not exist yet', function () {
                var doc = { my_field: 15 };

                Patcher.patch(doc, [{op: 'remove', fld: 'name', val: 'Daan'}]).should.eql({
                    my_field: 15
                });
            });

            it('should remove the value from the field array', function () {
                var doc = { name: ['Wim', 'Sven', 'Daan'] };

                Patcher.patch(doc, [{op: 'remove', fld: 'name', val: 'Daan'}]).should.eql({
                    name: ['Wim', 'Sven']
                });
            });

            it('should remove the value from the array and convert the array into a single field', function () {
                var doc = { name: ['Wim', 'Sven'] };

                Patcher.patch(doc, [{op: 'remove', fld: 'name', val: 'Sven'}]).should.eql({
                    name: ['Wim']
                });
            });
        });

        describe('removing a complex value from a field', function () {
            it('should do nothing if the field does not exist yet', function () {
                var doc = { users: [
                    { name: 'Wim', id: 'user-2' }
                ]};

                Patcher.patch(doc, [{op: 'remove', fld: 'users', val: { name: 'Daan', id: 'user-1' }}]).should.eql({
                    users: [
                        { name: 'Wim', id: 'user-2' }
                    ]
                });
            });

            it('should remove the value from the field array', function () {
                var doc = { users: [
                    { name: 'Wim', id: 'user-2' },
                    { name: 'Daan', id: 'user-1' }
                ]};

                Patcher.patch(doc, [{op: 'remove', fld: 'users', val: { name: 'Daan', id: 'user-1' }}]).should.eql({
                    users: [{ name: 'Wim', id: 'user-2' }]
                });
            });

            it('should remove the value from the array and convert the array into a single field', function () {
                var doc = { users: [
                    { name: 'Wim', id: 'user-2' },
                    { name: 'Daan', id: 'user-1' }
                ]};

                Patcher.patch(doc, [{op: 'remove', fld: 'users', val: { name: 'Daan', id: 'user-1' }}]).should.eql({
                    users: [{ name: 'Wim', id: 'user-2' }]
                });
            });
        });

        describe('purging a field', function () {
            it('should set it\'s value to null', function () {
                var doc = { my_field: 15 };

                Patcher.patch(doc, [{op: 'purge', fld: 'my_field'}]).should.eql({
                    my_field: null
                });
            });
        });
    });
});
