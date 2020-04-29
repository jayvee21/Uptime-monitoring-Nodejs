/**
 * Handler for User related
 */
// Dependencies
var _data = require('./data')
var _helpers = require('./helpers')
var _tokenService = require('../middleware/tokenService')

var conf = require('./conf')
// Container for the module (to be export)
var users = {}

/**
 * Users - Post
 * required data: firstName, lastName, phone, password, tosAgreement
 * optional data: none
 */
users.create = function(data, headers, callback){

    /**
     * Header must have: JWT_CONSUMER and the consumer must be on CONF.audience
     * to preventing bypassing the allowed application
     */
    var consumer_key = typeof( headers.jwt_consumer ) != 'undefined'
                && typeof( conf.audience[ headers.jwt_consumer ] ) == 'object'
                ? conf.audience[ headers.jwt_consumer ].secretKey : false

    if( consumer_key ){

        // Check that all required fields are filled out
        var firstName = typeof(data.firstName) != 'undefined' && data.firstName.trim().length > 0 ? data.firstName.trim() : false
        var lastName = typeof(data.lastName) != 'undefined' && data.lastName.trim().length > 0 ? data.lastName.trim() : false
        var phone = typeof(data.phone) != 'undefined' && data.phone.length == 11 ? data.phone.trim() : false
        var password = typeof(data.password) != 'undefined' && data.password.trim().length > 0 ? data.password.trim() : false
        var tosAgreement = typeof(data.tosAgreement) == 'boolean' && data.tosAgreement == true ? true : false
        if( firstName && password && phone && tosAgreement){
            var objData = {
                'firstName': firstName,
                'lastName': lastName,
                'phone': phone,
                'password': _helpers.hash(password),
                'tosAgreement': tosAgreement
            }
            _data.create( 'users', phone,  objData, function( err ){
                if(!err){
                    delete objData.password
                    callback(200, objData)
                }else{
                    callback(406, {'Error': 'User already exist'})
                }
            })
            
        }else{
            callback(400, {'Error': 'Missing required fields'})
        }

    }else{
        callback(403, {'Error': 'Valid headers not present or Invalid header value given.'})
    }

    
    
}   



/**
 * Users - Get
 * required data: phone
 * optional: none
 * @todo only the owner user can only view the data
 */
users.get = function( req, callback ){
    var phone =  typeof(req.query.phone) != 'undefined' && req.query.phone.trim().length == 11 ? req.query.phone.trim() : false
    
    if( phone ){
        
        // TO prevent other accessing data that is not associated with them, check if a truthful request
        _helpers.guardDataAccess( req.headers.jwt_token, phone, function(tokenObj){
            if( tokenObj.payload.phone == phone ){
                // Lookup the user
                _data.read('users', phone, function(err, userData){
                    if(!err && userData){
                        // Delete the password before sending back the data
                        delete userData.password
                        callback(200, userData)
                    }else{
                        callback(500, {'Error': err})
                    }
                })
            }else{
                callback(404, {'Error': 'Not allowed to access others data'  })
            }
        })
       
    }else{
        callback(400, {'Error': 'Missing required field.'})
    }
}


/**
 * Users - Update
 * required data: phone
 * optional data: firstName, lastName, password
 */
users.update = function( req, callback ){
    // Check if required field is filled out
    var phone = typeof(req.body.phone) != 'undefined' && req.body.phone.trim().length == 11 ? req.body.phone.trim() : false

    if( phone ){

        // TO prevent other accessing data that is not associated with them, check if a truthful request
        _helpers.guardDataAccess( req.headers.jwt_token, phone, function(tokenObj){
            if( tokenObj.payload.phone == phone ){

                var firstName = typeof(req.body.firstName) != 'undefined' && typeof(req.body.firstName) == 'string' && req.body.firstName.trim().length > 0  ? req.body.firstName : false
                var lastName = typeof(req.body.lastName) != 'undefined' && typeof(req.body.lastName) == 'string' && req.body.lastName.trim().length > 0  ? req.body.lastName.trim() : false
                var password = typeof(req.body.password) != 'undefined' && typeof(req.body.password) == 'string' && req.body.password.trim().length > 0  ? req.body.password.trim() : false

                if( firstName || lastName || password ){
                    _data.read('users', phone, function(err, userData){
                        if(!err && userData){

                            if( firstName ){
                                userData.firstName  = firstName
                            }

                            if( lastName ){
                                userData.lastName  = lastName
                            }

                            if( password ){
                                userData.password  = _helpers.hash( password )
                            }

                            // Update user information
                            _data.update( 'users', phone, userData, function(err){
                                if(!err){
                                    callback(200)
                                }else{
                                    callback(400, {'Error': err})
                                }
                            })

                        }else{
                            callback(400, {'Error': 'User does not exist'})
                        }
                    })
                }else{
                    callback(400, {'Error' : 'Missing optional field to update'})
                }
                
            }else{
                callback(404, {'Error': 'Not allowed to access others data'  })
            }
        })

        

    }else{
        callback(400, {'Error' : 'Missing required field'})
    }
}

/**
 * Users - Delete
 * require: phone
 * @todo Delete the associated data for this user.
 */
users.delete = function( req, callback){

    var phone = typeof( req.body.phone ) != 'undefined' && typeof( req.body.phone ) == 'string' && req.body.phone.trim().length == 11 ? req.body.phone.trim() : false
    if( phone ){

        // TO prevent other accessing data that is not associated with them, check if a truthful request
        _helpers.guardDataAccess( req.headers.jwt_token, phone, function(tokenObj){
            if( tokenObj.payload.phone == phone ){
                _data.delete( 'users', phone, function(err){
                    if(!err){
                        callback(200)
                    }else{
                        callback(400, {"Error": "Could not delete"})
                    }
                })
            }else{
                callback(404, {'Error': 'Not allowed to access others data'  })
            }
        })

        
    }else{
        callback( 400, {'Error': 'Missing required fields'} )
    }
    
}



module.exports = users