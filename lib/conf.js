/**
 * Primary configuration of the API
 */

// Container for config
var environments = {}
environments.staging = {

    'port' : 5000,
    'secretKey': 'This is a sample key',
    'tokenService': {
        'issuer' : 'Uptime monitoring LTD',
        'subject' : 'Authentication Token'
    },
    'maxChecks': 5,
    'audience': {
        'web.uptime.com': {
            'secretKey': 'abc123'
        }
    }

}


// Production environment
environments.production = {

    'port' : 3000,
    'secretKey': 'This is a sample key',
    'tokenService': {
        'issuer' : 'Uptime monitoring LTD',
        'subject' : 'Authentication Token'
    },
    'maxChecks': 5,
    'audience': {
        'web.uptime.com': {
            'secret-key': 'abc123'
        }
    }

}

// Determine which env was passed a command-line argument
var currentEnvironment = typeof(environments[process.env.NODE_ENV] == 'string')
                        ? process.env.NODE_ENV : ''

// Check that the current environment is one of the environments above, if not, default to staging
var environmentToExport = typeof(currentEnvironment)== 'object' ? environments[currentEnvironment] : environments.staging



// Export config
module.exports = environmentToExport