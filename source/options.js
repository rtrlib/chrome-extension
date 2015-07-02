// Save this script as `options.js`

// Saves options to localStorage.
function save_options() {
    localStorage.clear();
    var rest_input = document.getElementById("validationServerURL");
    var  rest =  rest_input.value;
    localStorage["validationServerURL"] =  rest;

    var host_input = document.getElementById("cacheServerHost");
    var host = host_input.value;
    localStorage["cacheServerHost"] = host;

    var port_input = document.getElementById("cacheServerPort");
    var port = port_input.value;
    localStorage["cacheServerPort"] = port;

    var cacheTimeToLive_input = document.getElementById("cacheTTL");
    var cacheTimeToLive = cacheTimeToLive_input.value;
    if (isNaN(parseInt(cacheTimeToLive)) || isNaN(parseInt(port))) {
        alert("Please provide an integer!")
    } else {
        localStorage["cacheTTL"] = cacheTimeToLive;
        // Update status to let user know options were saved.
        var status = document.getElementById("status");
        status.innerHTML = "Options Saved.";
        setTimeout(function() {
            status.innerHTML = "";
        }, 750);
    }

}

// Restores select box state to saved value from localStorage.
function restore_options() {
    if (localStorage["validationServerURL"] === undefined) {
        var rest = 'http://rpki-rbv.realmv6.org/api/v1/validity/';
    } else {
        var rest = localStorage["validationServerURL"];
    }

    if (localStorage["cacheServerHost"] === undefined) {
        var host = 'rpki-validator.realmv6.org';
    } else {
        var host = localStorage["cacheServerHost"];
    }

    if (localStorage["cacheServerPort"] === undefined) {
        var port = 8282;
    } else {
        var port = localStorage["cacheServerPort"];
    }

    if (localStorage["cacheTTL"] === undefined) {
        var cacheTimeToLive = 90;
    } else {
        var cacheTimeToLive = localStorage["cacheTTL"];
    }
    var rest_input = document.getElementById("validationServerURL");
    rest_input.value = rest;
    var host_input = document.getElementById("cacheServerHost");
    host_input.value = host;
    var port_input = document.getElementById("cacheServerPort");
    port_input.value = port;
    var cacheTimeToLive_input = document.getElementById("cacheTTL");
    cacheTimeToLive_input.value = cacheTimeToLive;
}

function default_options() {
    localStorage.clear();
    var rest = 'http://rpki-rbv.realmv6.org/api/v1/validity/';
    localStorage["validationServerURL"] = rest;
    var rest_input = document.getElementById("validationServerURL");
    rest_input.value = rest;

    var host = 'rpki-validator.realmv6.org';
    localStorage["cacheServerHost"] = host;
    var host_input = document.getElementById("cacheServerHost");
    host_input.value = host;

    var port = 8282;
    localStorage["cacheServerPort"] = port;
    var port_input = document.getElementById("cacheServerPort");
    port_input.value = port;

    var cacheTimeToLive = 90;
    localStorage["cacheTTL"] = cacheTimeToLive;
    var cacheTimeToLive_input = document.getElementById("cacheTTL");
    cacheTimeToLive_input.value = cacheTimeToLive;
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
document.querySelector('#default').addEventListener('click', default_options);
