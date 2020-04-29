/**
 * Lib file verifying token from the user
 */

 // Depemdemcies
 var conf = require('./../lib/conf')
 const tokenService = require('./tokenService')
 module.exports = {
     checkToken : function( req, res, next ){
        // Check if token and consumer is present in headers
        let token = typeof( req.headers.jwt_token ) != 'undefined' && typeof(req.headers.jwt_token) == 'string' && req.headers.jwt_token.trim().length > 0 ? req.headers.jwt_token.trim() : false
        var consumer_key = typeof( req.headers.jwt_consumer ) != 'undefined'
                        && typeof( conf.audience[ req.headers.jwt_consumer ] ) == 'object'
                        ? conf.audience[ req.headers.jwt_consumer ].secretKey : false
        
        if(token && consumer_key ){
            tokenService.verify( token, consumer_key, function(err, isValidToken){
                
                if(!err && isValidToken){
                    next()
                }else{
                    return res.status(403).json({ 'Error': 'Not a valid client.' });
                }
            })
        }else{
            return res.status(403).json({'Error': 'Valid headers not present or invalid header value given.'});
        }
     }
 }