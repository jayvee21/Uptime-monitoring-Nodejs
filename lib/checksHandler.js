/**
 * Handler for CHECKS related
 */

// Dependencies
var tokenService = require('./../middleware/tokenService')
var helpers = require('./../lib/helpers')
var _data = require('./../lib/data')
var conf = require('./../lib/conf')

// Container for the module (to be export)
var check = {}

/**
 * Check creation
 * required fields: protocol, url, method, successCodes, timoutSeconds
 * optional field: none
 */

check.create = function( req, callback ){

    // Check if required filds are filled out
    let protocol = typeof(req.body.protocol) != 'undefined' 
                && ['http', 'https'].indexOf( req.body.protocol.trim().toLowerCase() ) > -1
                ? req.body.protocol.trim().toLowerCase() : false
    let url = typeof(req.body.url) != 'undefined' 
                && req.body.url.trim().length > 0
                ? req.body.url.trim().toLowerCase() : false
    let method = typeof(req.body.method) != 'undefined' 
                && ['post', 'get', 'put', 'delete'].indexOf( req.body.method.trim().toLowerCase() ) > -1
                ? req.body.method.trim().toLowerCase() : false
    let successCodes = typeof( req.body.successCodes ) != 'undefined'
                        && typeof( req.body.successCodes ) == 'object' 
                        && req.body.successCodes instanceof Array
                        ? req.body.successCodes : false 

    let timeoutSeconds = typeof( req.body.timeoutSeconds ) != 'undefined' 
                        && typeof( req.body.timeoutSeconds ) == 'number'
                        && req.body.timeoutSeconds % 1 === 0
                        && req.body.timeoutSeconds >= 1
                        && req.body.timeoutSeconds <= 5
                        ? req.body.timeoutSeconds : false

    if( protocol && url && method && successCodes && timeoutSeconds){

        helpers.tokenDecode( req.headers, function(err, tokenData){
            if(!err && tokenData){
                let phone = tokenData.phone

                // look up user
                _data.read('users', phone, function(err, userData){
                    var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array 
                                    ? userData.checks : []
                    if( userChecks.length < conf.maxChecks ){
                        let checkId = helpers.createRandomString(20)

                        let checkObj = {
                            'id': checkId,
                            'userPhone': phone,
                            'protocol': protocol,
                            'url': url,
                            'method': method,
                            'successCodes': successCodes,
                            'timeoutSeconds' : timeoutSeconds
                        }

                        // Save the object
                        _data.create('checks', checkId, checkObj, function(err){
                            if(!err){
                                // add the checkId to the user's object
                                userData.checks = userChecks
                                userData.checks.push(checkId)

                                // Save the new user data
                                _data.update( 'users', phone, userData, function(err){
                                    if(!err){
                                        callback(200, checkObj)
                                    }else{
                                        callback(500, {'Error': 'Could not update the user with the new checks'})
                                    }
                                })

                            }else{
                                callback(500, {'Error': err})
                            }
                        })
                    }else{
                        callback(400, {'Error': 'The User has reached the maximum number of checks ('+ conf.maxChecks +')'})
                    }
                })


                
            }else{
                callback(500, {'Error': err})
            }
        })
    }else{
        callback(400, {'Error': 'Missing required fields'})
    }
}


/**
 * Get check data
 * required field: checkId
 */
check.get = function( req, callback ){
    var checkId = typeof( req.params.checkId ) != 'undefined' && req.params.checkId.trim().length > 0
                 ? req.params.checkId.trim() : false
    if(checkId){
        // Lookup the check record using the checkId
        _data.read('checks', checkId, function(err, checkData){
            if(!err && checkData){

                // TO prevent other accessing data that is not associated with them, check if a truthful request
                helpers.guardDataAccess(req.headers.jwt_token, checkData.userPhone, function( tokenObj ){
                    if(tokenObj){
                        callback(200, checkData)
                    }else{
                        callback(403, {'Error': 'Permission denied on accessing check'})
                    }
                })
        
            }else{
                callback(400, {'Error': 'Check does not exist'})
            }
        })
    }else{
        callback( 400, {'Error': 'Missing required fields'} )
    }
    
}

/**
 * Update the checkData
 * required fields: CheckId
 * Optional (atleast 1 must be present): protocol, url, method, successCodes, timoutSeconds
 */
check.update = function( req, callback ){
    // Check if required filds are filled out
    let protocol = typeof(req.body.protocol) != 'undefined' 
                && ['http', 'https'].indexOf( req.body.protocol.trim().toLowerCase() ) > -1
                ? req.body.protocol.trim().toLowerCase() : false
    let url = typeof(req.body.url) != 'undefined' 
                && req.body.url.trim().length > 0
                ? req.body.url.trim().toLowerCase() : false
    let method = typeof(req.body.method) != 'undefined' 
                && ['post', 'get', 'put', 'delete'].indexOf( req.body.method.trim().toLowerCase() ) > -1
                ? req.body.method.trim().toLowerCase() : false
    let successCodes = typeof( req.body.successCodes ) != 'undefined'
                        && typeof( req.body.successCodes ) == 'object' 
                        && req.body.successCodes instanceof Array
                        ? req.body.successCodes : false 

    let timeoutSeconds = typeof( req.body.timeoutSeconds ) != 'undefined' 
                        && typeof( req.body.timeoutSeconds ) == 'number'
                        && req.body.timeoutSeconds % 1 === 0
                        && req.body.timeoutSeconds >= 1
                        && req.body.timeoutSeconds <= 5
                        ? req.body.timeoutSeconds : false
    if( protocol && url && method && successCodes && timeoutSeconds){

        helpers.tokenDecode( req.headers, function(err, tokenData){
            if(!err && tokenData){
                let phone = tokenData.phone

                // look up user
                _data.read('users', phone, function(err, userData){
                    var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array 
                                    ? userData.checks : []
                    if( userChecks.length < conf.maxChecks ){
                        let checkId = helpers.createRandomString(20)

                        let checkObj = {
                            'id': checkId,
                            'userPhone': phone,
                            'protocol': protocol,
                            'url': url,
                            'method': method,
                            'successCodes': successCodes,
                            'timeoutSeconds' : timeoutSeconds
                        }

                        // Save the object
                        _data.create('checks', checkId, checkObj, function(err){
                            if(!err){
                                // add the checkId to the user's object
                                userData.checks = userChecks
                                userData.checks.push(checkId)

                                // Save the new user data
                                _data.update( 'users', phone, userData, function(err){
                                    if(!err){
                                        callback(200, checkObj)
                                    }else{
                                        callback(500, {'Error': 'Could not update the user with the new checks'})
                                    }
                                })

                            }else{
                                callback(500, {'Error': err})
                            }
                        })
                    }else{
                        callback(400, {'Error': 'The User has reached the maximum number of checks ('+ conf.maxChecks +')'})
                    }
                })


                
            }else{
                callback(500, {'Error': err})
            }
        })
    }else{
        callback(400, {'Error': 'Missing required fields'})
    }
    
}
// Export module
module.exports = check

