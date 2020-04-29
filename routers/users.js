/**
 * Router that will handle all users request
 */

// Dependencies
let express = require('express')
let router = express.Router()
var userHandler = require('../lib/usersHandler')
var tokenVerifier = require('./../middleware/tokenVerifier')





/**
 * Creating a new user
 */
router.post('/', function(req, res){

    userHandler.create( req.body, req.headers, function(statusCode, payload){
        statusCode = typeof(statusCode) == 'number' ? statusCode : 200
        payload = typeof(payload) == 'object' ? payload : {}
        var payloadString = JSON.stringify( payload )
        // Return the response
        res.setHeader('Content-type','application/json')
        res.writeHead(statusCode)
        res.end(payloadString)
    })  

})

// Get the user
router.get('/', tokenVerifier.checkToken, function(req, res){
    userHandler.get(req, function(statusCode, payload){
        statusCode = typeof(statusCode) == 'number' ? statusCode : 200
        payload = typeof(payload) == 'object' ? payload : {}
        var payloadString = JSON.stringify( payload )
        // Return the response
        res.setHeader('Content-type','application/json')
        res.writeHead(statusCode)
        res.end(payloadString)
    })
})

/**
 * Update the user information
 */

router.put('/', tokenVerifier.checkToken, function(req, res){
    userHandler.update(req, function(statusCode, payload){
        statusCode = typeof(statusCode) == 'number' ? statusCode : 200
        payload = typeof(payload) == 'object' ? payload : {}
        var payloadString = JSON.stringify( payload )
        // Return the response
        res.setHeader('Content-type','application/json')
        res.writeHead(statusCode)
        res.end(payloadString)
    })
})

/**
 * Delete the user
 * 
 */
router.delete('/', tokenVerifier.checkToken, function(req, res){
    userHandler.delete(req, function(statusCode, payload){
        statusCode = typeof(statusCode) == 'number' ? statusCode : 200
        payload = typeof(payload) == 'object' ? payload : {}
        var payloadString = JSON.stringify( payload )
        // Return the response
        res.setHeader('Content-type','application/json')
        res.writeHead(statusCode)
        res.end(payloadString)
    })
})

// Export the Router module
module.exports = router