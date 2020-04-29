/**
 * Handler for AUTH related
 */

// Dependencies
var conf = require('./conf')
var helpers = require('./helpers')
var _data = require('./data')
var tokenService = require('./../middleware/tokenService')
// Container for the module
var auth = {}


/**
 * Login auth
 * required fields : phone, password
 * optional parameters: none
 */
auth.login = function( req, callback ) {
    // callback(200, {'data': 'successfully logged in'})
    // Check if the required phone and password are supplied
    let phone = typeof(req.body.phone) != 'undefined' && typeof(req.body.phone) == 'string'
                && req.body.phone.trim().length == 11 
                ? req.body.phone.trim() : false

    let password = typeof(req.body.password) != 'undefined' && typeof(req.body.password) == 'string'
                && req.body.password.trim().length > 0 
                ? req.body.password.trim() : false

    

    if( phone && password ) {

        // Check if the required headers are supplied
        var consumer_key = typeof( req.headers.jwt_consumer ) != 'undefined'
                && typeof( conf.audience[ req.headers.jwt_consumer ] ) == 'object'
                ? conf.audience[ req.headers.jwt_consumer ].secretKey : false

        if( consumer_key ){
            // Hash the password
            let hashedPassword = helpers.hash(password)
            // Look up the user data
            _data.read( 'users', phone, function(err, userData){
                if(!err && userData){
                    if(userData.password == hashedPassword){
                        // Remove the password before signing the data as payload
                        delete userData.password
                        // Generate token
                        let token = tokenService.sign( userData, consumer_key)
                        callback(200, {'jwt_token': token})
                    }else{
                        callback(400, {'Error': 'User does not exist, or invalid password given.'})
                    }
                }else{
                    callback(400, {'Error': 'User does not exist'})
                }
            })
        }else{
            callback(403, {'Error': 'Valid headers not present or invalid header value given.'})
        }

        
    }else{
        callback(400, {'Error': 'Missing required fields'})
    }
                
}


// Export module
module.exports = auth