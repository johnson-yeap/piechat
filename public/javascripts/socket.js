(function() {
	// Helper methods
	// Get HTML elements/nodes
	var getNode = function(s) {
		return document.querySelector(s);
	},

	// Set the status
	setStatus = function(s) {
		status.textContent = s;

		if(s !== statusDefault) {
			var delay = setTimeout(function() {
				setStatus(statusDefault);
				clearInterval(delay);
			}, 1000);
		}
	},

	// Get required nodes
	chatname = getNode('.chat-name'),
	messages = getNode('.chat-messages'),
	textarea = getNode('.chat textarea'),
	status = getNode('.chat-status'),
	postalcode = getNode('.postal-code'),
	userscount = getNode('.users-count'),

	// Retrieves value
	statusDefault = status.textContent;

	// Use ipinfo.io Geolocation API to detect current user postal code
	$.get("http://ipinfo.io", function(response) {
		postalcode.textContent = response.postal;
	}, "jsonp");

	try {
		// Development env
		// var socket = io.connect('http://localhost:8080/');

		// Production env
		var socket = io.connect('http://piechat-coaedi.rhcloud.com:8000/');
	} catch(e) {
		// Set status to warn user
		console.log("Socket.io connection failed");
	}

	if(socket !== undefined) {
		// Listen for users' location
		socket.on('users_location', function(data) {
			var latlong = new google.maps.LatLng(data.latitude, data.longitude);
			var marker_id = data.id
			addMarker(latlong, marker_id);
		});

		// Listen for remove_marker
		socket.on('remove_marker', function(data) {
			removeMarker(data);
		});

		// Listen for connected users count
		socket.on('users_count', function(counts) {
			userscount.textContent = counts;
		});

		// Listen for output
		socket.on('output', function(data) {
			// Check if data param is an array
			if(data.length) {
				// Loop through results
				for(var x = 0; x < data.length; x = x+ 1) {
					var message = document.createElement('div');
					message.setAttribute('class', 'chat-message');

					var content = document.createElement('div');
					content.setAttribute('class', 'message-content');
					content.textContent = data[x].name + ': ' + data[x].message;

					var date = new Date(parseInt(data[x]._id.substring(0, 8), 16) * 1000);

					var time = document.createElement('div');
					time.setAttribute('class', 'message-time');
					time.textContent = date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

					// Build a single message
					message.appendChild(content);
					message.appendChild(time);
					// Append the new message to the messages pool
					messages.appendChild(message);
					messages.insertBefore(message, messages.firstChild);
				}
			}
		});

		// Listen for a status
		socket.on('status', function(data) {
			setStatus((typeof data === 'object') ? data.message : data);

			if(data.clear === true) {
				textarea.value = '';
			}
		});

		// Listen for keydown for input
		textarea.addEventListener('keydown', function(event) {
			var self = this,
				name = chatname.value;

			if(event.which === 13 && event.shiftKey === false) {
				socket.emit('input', {
					name: name,
					message: self.value
				});
			}
		});

		// Note: This example requires that you consent to location sharing when
		// prompted by your browser. If you see a blank space instead of the map, this
		// is probably because you have denied permission for location sharing.

		var map;
		var markers = [];

		function initialize() {
		  var mapOptions = {
		    zoom: 17
		  };
		  map = new google.maps.Map(document.getElementById('map-canvas'),
		      mapOptions);

		  // Try HTML5 geolocation
		  if(navigator.geolocation) {
		    navigator.geolocation.getCurrentPosition(function(position) {
		      var pos = new google.maps.LatLng(position.coords.latitude,
		                                       position.coords.longitude);

		      // Listen for user location
		      socket.emit('user_location', {
		      		latitude: position.coords.latitude,
		      		longitude: position.coords.longitude,
		      });

		      map.setCenter(pos);
		    }, function() {
		      handleNoGeolocation(true);
		    });
		  } else {
		    // Browser doesn't support Geolocation
		    handleNoGeolocation(false);
		  }
		}

		function addMarker(location, marker_id) {
		  var image = 'images/connected_users.png'
		  var marker = new google.maps.Marker({
		  	id: marker_id,
		    position: location,
		    map: map,
		    icon: image
		  });
		  markers.push(marker);
		}

		function removeMarker(marker_id) {
		  for(i = 0; i < markers.length; i++) {
		  	if(markers[i].id === marker_id) {
		  		markers[i].setMap(null);
		  	}
		  }
		}

		function handleNoGeolocation(errorFlag) {
		  if (errorFlag) {
		    var content = 'Error: The Geolocation service failed.';
		  } else {
		    var content = 'Error: Your browser doesn\'t support geolocation.';
		  }

		  var options = {
		    map: map,
		    position: new google.maps.LatLng(60, 105),
		    content: content
		  };

		  var infowindow = new google.maps.InfoWindow(options);
		  map.setCenter(options.position);
		}

		google.maps.event.addDomListener(window, 'load', initialize);
	}
})();