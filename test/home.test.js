const assert = require('assert');
const expect = require('chai').expect
const request = require('supertest');
const app = require('../app')

describe('Functional testing the /repos route', function() {
    it('should return OK status', () => {
      return request(app)
        .post('/repos') 
        .send({org: 'verloop'})
        .then(function(response){
            assert.equal(response.status, 200)
        })
    })

    it('should return results on passing correct values', () => {
        return request(app)
            .post('/repos') 
            .send({org: 'verloop'})
            .then(function(response){
                expect(response.text).to.contain('[{"name":"fidelius","stars":11},{"name":"nsync","stars":7},{"name":"android-sdk","stars":1}]')
            })
    });

    it('should return Oganization name not found on rendering with empty values', () => {
        return request(app)
            .post('/repos') 
            .then(function(response){
                expect(response.text).to.contain('Oganization name not found')
            })
    });

    it('should return No organization found on rendering with invalid organization name', () => {
        return request(app)
            .post('/repos') 
            .send({org: 'harshitsinghai77'})
            .then(function(response){
                expect(response.text).to.contain('No such organization found!')
            })
    });
});

