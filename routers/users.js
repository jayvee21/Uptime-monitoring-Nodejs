/**
 * Router that will handle all users request
 */

// Dependencies
let express = require('express')
let router = express.Router()
var userHandler = require('../lib/usersHandler')
var tokenVerifier = require('./../middleware/tokenVerifier')
var helpers = require('./../lib/helpers')




/**
 * Creating a new user
 */
router.post('/', function(req, res){

    userHandler.create( req.body, req.headers, function(statusCode, payload){
        helpers.handleServerResponse(res, statusCode, payload)
    })  

})

// Get the user
router.get('/', tokenVerifier.checkToken, function(req, res){
    userHandler.get(req, function(statusCode, payload){
        helpers.handleServerResponse(res, statusCode, payload)
    })
})

/**
 * Update the user information
 */

router.put('/', tokenVerifier.checkToken, function(req, res){
    userHandler.update(req, function(statusCode, payload){
        helpers.handleServerResponse(res, statusCode, payload)
    })
})

/**
 * Delete the user
 * 
 */
router.delete('/', tokenVerifier.checkToken, function(req, res){
    userHandler.delete(req, function(statusCode, payload){
        helpers.handleServerResponse(res, statusCode, payload)
    })
})

// Export the Router module
module.exports = router