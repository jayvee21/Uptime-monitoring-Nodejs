/**
 * Router that will handle auth functionality
 */
// Dependencies
let express = require('express')
let router = express.Router()
let helpers = require('./../lib/helpers')

var authHandler = require('./../lib/authHandler')


/**
 * User login
 * required fields : phone, password
 * optional parameters: none
 */
router.post('/login', function(req, res){
    
    authHandler.login( req, function( statusCode, payload ){
        helpers.handleServerResponse( res, statusCode, payload )
    })

})



// Export auth router
module.exports = router