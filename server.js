#!/bin/env node
//  OpenShift sample Node application
var express         = require('express');
var fs              = require('fs');
var path            = require('path');
var favicon         = require('serve-favicon');
var logger          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var mongoClient     = require('mongodb').MongoClient;
var http            = require('http');
var io              = require('socket.io');

var app             = express();
var server          = require('http').createServer(app);
var client          = require('socket.io').listen(server);
    
// MongoDB connection string
// default to a 'localhost' configuration:
var connection_string = "mongodb://127.0.0.1:27017/piechat";
// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
    connection_string = "mongodb://" + process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
    process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
    process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
    process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
    process.env.OPENSHIFT_APP_NAME;
}

/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Establish mongodb connection
     */
    // mongoClient.connect(connection_string, function(err, db) {
    //     if(err) throw err;
    //     client.on('connection', function(socket) {
    //         var col = db.collection('messages'),
    //         sendStatus = function(s) {
    //             socket.emit('status', s);
    //         };

    //         // Emit all messages
    //         col.find().limit(100).sort({_id: 1}).toArray(function(err, res) {
    //             if(err) throw err;

    //             socket.emit('output', res);
    //         });

    //         // Wait for input
    //         socket.on('input', function(data) {
    //             var name = data.name,
    //                 message = data.message,
    //                 whitespacePattern = /^\s*$/;

    //             if(whitespacePattern.test(name) || whitespacePattern.test(message)) {
    //                 sendStatus('Name and message is required.');
    //             } else {
    //                 col.insert({name: name, message: message}, function() {
                  
    //                     // Emit latest message to all clients
    //                     // Use client.emit instead of socket.emit
    //                     client.emit('output', [data]);

    //                     sendStatus({
    //                         message: "Message sent",
    //                         clear: true
    //                     });
    //                 });
    //             }
    //         });
    //     });
    // }); 


    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }

        self.server = http.createServer(self.app);
        self.client = io.listen(self.server);

        self.server.listen(process.env.OPENSHIFT_NODEJS_PORT, process.env.OPENSHIFT_NODEJS_IP);

        // view engine setup
        self.app.set('views', path.join(__dirname, 'views'));
        self.app.set('view engine', 'ejs');

        // uncomment after placing your favicon in /public
        // app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        self.app.use(logger('dev'));
        self.app.use(bodyParser.json());
        self.app.use(bodyParser.urlencoded({ extended: false }));
        self.app.use(cookieParser());
        self.app.use(express.static(path.join(__dirname, 'public')));
    };

    
    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
// zapp.start();

