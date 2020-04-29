/**
 * Router that will handle auth functionality
 */
// Dependencies
let express = require('express')
let router = express.Router()

var authHandler = require('./../lib/authHandler')


/**
 * User login
 * required fields : phone, password
 * optional parameters: none
 */
router.post('/login', function(req, res){
    
    authHandler.login( req, function( statusCode, payload ){
        handleServerResponse( res, statusCode, payload )
    })

})

handleServerResponse = function(response, statusCode, payload ){
    statusCode = typeof(statusCode) == 'number' ? statusCode : 200
    payload = typeof(payload) == 'object' ? payload : {}
    var payloadString = JSON.stringify( payload )
    // Return the response
    response.setHeader('Content-type','application/json')
    response.writeHead(statusCode)
    response.end(payloadString)
}



// Export auth router
module.exports = router