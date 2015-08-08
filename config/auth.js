// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '469932953183949', // your App ID
        'clientSecret'  : 'c9bbb318052185dfacfec7edf28da49f', // your App Secret
        'callbackURL'   : 'http://piechat-coaedi.rhcloud.com/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'gwcUZA6zrDZ09CDFeks0skJ2v',
        'consumerSecret'    : '0mPYguAmakn3MxHH74g50cSBl4URB35DgReM2ieCl37Haryyn5',
        'callbackURL'       : 'http://piechat-coaedi.rhcloud.com/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : '1039586851756-vqto6snncehkflsr91vkidn14a789hev.apps.googleusercontent.com',
        'clientSecret'  : 'OdNWPQ5Wr1vtqowM2XBJKcUJ',
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    }

};