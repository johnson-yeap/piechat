// Default to a 'localhost' configuration:
var mongodb_connection_string = "mongodb://127.0.0.1:27017/piechat";
// If OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
    mongodb_connection_string = "mongodb://" + process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
    process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
    process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
    process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
    process.env.OPENSHIFT_APP_NAME;
}

module.exports = {
	'url': mongodb_connection_string
};
