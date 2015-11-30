var fs = require('fs');
var should = require('should');
var assert = require('assert');
var FakeEntity = require('../storage/fake_entity');

var Device = require('../modules/device/service');
var entity = new FakeEntity();
//var deviceService = new Device(entity);
//
//describe('device', function () {
//    it('should add a device to the storage', function (done) {
//        var user = {
//            hive_id: 'my-id'
//        };
//
//        deviceService.addDevice(user, {
//            name: 'test'
//        });
//
//        entity.search({query: {filtered: {filter: {term: {name: 'test'}}}}}).then(function(res) {
//            assert(res != null);
//            assert(res[0].name == 'test');
//        }).done(function() {
//            done();
//        });
//    });
//
//    it('should return the device if looking for it by the secret_code', function(done) {
//        var user = {
//            hive_id: 'my-id'
//        };
//
//        deviceService.addDevice(user, {
//            name: 'test'
//        }).then(function(device) {
//            deviceService.getByCode(device.code).then(function(dev) {
//                assert(dev != null);
//                assert(dev.name != 'test');
//            });
//        }).done(function() { done(); });
//    });
//});