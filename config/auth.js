// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '469932953183949', // your App ID
        'clientSecret'  : 'c9bbb318052185dfacfec7edf28da49f', // your App Secret
        'callbackURL'   : 'http://localhost:8080/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'LOclVZfOvMaLeQBjHK8G5wAlK',
        'consumerSecret'    : 'fnacivmhbdGKFX6KIR6wM16Q2kapM6e0jnPX414ASA6S0edrPj',
        'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : '1039586851756-vqto6snncehkflsr91vkidn14a789hev.apps.googleusercontent.com',
        'clientSecret'  : 'OdNWPQ5Wr1vtqowM2XBJKcUJ',
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    }

};