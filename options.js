// Save this script as `options.js`

// Saves options to localStorage.
function save_options()
{
	localStorage.clear();
	var host_input = document.getElementById("cache_server_host");
	var host = host_input.value;
	localStorage["cache_server_host"] = host;

	var port_input = document.getElementById("cache_server_port");
	var port = port_input.value;
	localStorage["cache_server_port"] = port;

	// Update status to let user know options were saved.
	var status = document.getElementById("status");
	status.innerHTML = "Options Saved.";
	setTimeout(function()
	{
		status.innerHTML = "";
	}, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options()
{
	if (localStorage["cache_server_host"] === undefined)
	{
		var host = 'rpki-validator.realmv6.org';
	}
	else
	{
		var host = localStorage["cache_server_host"];
	}
	if(localStorage["cache_server_port"] === undefined)
	{
		var port = '8282';
	}
	else
	{
		var port = localStorage["cache_server_port"];
	}
	var host_input = document.getElementById("cache_server_host");
	host_input.value = host;
	var port_input = document.getElementById("cache_server_port");
	port_input.value = port;
}

function default_options()
{
	localStorage.clear();
	var host = 'rpki-validator.realmv6.org';
	localStorage["cache_server_host"] = host;
	var host_input = document.getElementById("cache_server_host");
	host_input.value = host;
	
	var port = '8282';
	localStorage["cache_server_port"] = port;
	var port_input = document.getElementById("cache_server_port");
	port_input.value = port;
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
document.querySelector('#default').addEventListener('click', default_options);