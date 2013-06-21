/************************/
/* 		URL PARSER 		*/
/************************/
var cacheTimeToLive = 90*1000;
// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};

// Set the item in the local storage
function setItem(key, value) {
	window.localStorage.removeItem(key);
	window.localStorage.setItem(key, value);
}

// Get the item from local storage with the specified key
function getItem(key) {
	var value;
	try {
		value = window.localStorage.getItem(key);
	} catch (e) {
		value = "null";
	}
	return value;
}

/********************/
/* Get cache server */
/********************/
function getCacheServer() {
	if (localStorage["cache_server_host"] === undefined) {
		var host = 'rpki-validator.realmv6.org';
		localStorage["cache_server_host"] = host;
	} else {
		var host = localStorage["cache_server_host"];
	}
	if (localStorage["cache_server_port"] === undefined) {
		var port = '8282';
		localStorage["cache_server_port"] = port;
	} else {
		var port = localStorage["cache_server_port"];
	}
	var hostAndPort = host + ":" + port;
	return hostAndPort;
}

/***************** STEP 1 ********************/
/*    Fired when a request is completed. 	 */
/*********************************************/
localStorage.clear();
chrome.webRequest.onResponseStarted.addListener(function(info) {
	/* if ip is not in the local storage */
	parsedURL=parseUri(info.url);
	protocolAndDomain = parsedURL.protocol + '://' + parsedURL.authority;
	localStorage.setItem(protocolAndDomain, info.ip);
	if(localStorage[info.ip] === undefined)
	{
		cymruRequest(info.ip,info.tabId);
	}
	else
	{
		var rpkiObject = JSON.parse(localStorage[info.ip]);
		elapsedTime = new Date() - new Date(rpkiObject["timestamp"]);
		if (elapsedTime > cacheTimeToLive) {
			localStorage.removeItem(info.ip);
			cymruRequest(info.ip,info.tabId);
		} else {
			changeIcon(rpkiObject["validity"],info.tabId);
		}
	}
	return;
}, {
	urls : ["http://*/*", "https://*/*"],
	types : ["main_frame"]
}, []);

/***************  STEP 2 *********************/
/*  	Map IP to ASN and BGP Prefix         */
/* 	    (https://www.team-cymru.org/)        */
/*********************************************/
function cymruRequest(ip,tabID)
{
	$.ajax({
		type : "POST",
		url : "http://whois.cymru.com/cgi-bin/whois.cgi",
		data : {
			action : 'do_whois',
			bulk_paste : ip,
			// family:'ipv4',
			method_whois : 'whois',
			flag_prefix : 'prefix',
			submit_paste : 'Submit'
		}
	})
	.done(function(cymruResponse) {
		parseAsData(cymruResponse,tabID,ip);
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log("Failed cymru request. Repeating...");
		cymruRequest(ip, tabID);
	});
}

/***************  STEP 3 *********************/
/* 		  Parse Cymru response 				 */
/*********************************************/
function parseAsData(cymruResponse,tabID,ip) {
	try {
		var splitHTML = cymruResponse.split('<PRE>');
		var requestResult = splitHTML[1].split('</PRE>');
		requestResult = requestResult[0];
		
		// Cutting unnecessary parts.
		var split1 = requestResult.split("AS Name");
		var split2 = split1[1].split("|");
		
		// The extracted data
		var info = new Object();
		info["asn"] = split2[0].trim();
		info["asName"] = split2[3].trim();
		info["ip"] = split2[1].trim();
		info["prefix"] = split2[2].trim();
		getValidity(info,tabID);
	// Repeat cymru request
	} catch (err) {
		console.log("Repeating cymru request.");
		cymruRequest(ip, tabID);
	}

}

/**************** STEP 4 *********************/
/* Validate the prefix through a web service */
/*********************************************/
function getValidity(info,tabID) {
	var cacheServer = getCacheServer();
	$.ajax({
		type : "POST",
		url : "http://rpki-validator.realmv6.org/validator/v1.1",
		//url : "http://127.0.0.1:5000/validator/v1.1",
		data : {
			cache_server : cacheServer,
			ip : info["ip"],
			prefix : info["prefix"],
			asn : info["asn"]
		}
	})
	.done(function(result) {
		info["validity"] = result;
		info["timestamp"] = new Date();
		localStorage[info["ip"]] = JSON.stringify(info);
		changeIcon(info["validity"],tabID);
	});
}

/**************** STEP 5 *********************/
/* 		Change the extension icon            */
/*********************************************/
function changeIcon(validity,tabID)
{
	// Valid
	validityObj = JSON.parse(validity);
	if (validityObj.code == "1") {
		chrome.pageAction.setIcon({
			'tabId' : tabID,
			'path' : '/images/valid.png'
		});
	// Invalid
	} else if (validityObj.code == "0") {
		chrome.pageAction.setIcon({
			'tabId' : tabID,
			'path' : '/images/invalid.png'
		});
	// Not found
	} else if (validityObj.code == "-1") {
		chrome.pageAction.setIcon({
			'tabId' : tabID,
			'path' : '/images/notFound.png'
		});
	} else {
		chrome.pageAction.setIcon({
			'tabId' : tabID,
			'path' : '/images/notAvailable.png'
		});
	}
	chrome.pageAction.show(tabID);
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab)
{
	if(changeInfo.status == "complete")
	{
		var parsedURL=parseUri(tab.url);
		var protocolAndDomain = parsedURL.protocol + '://' + parsedURL.authority;
		if(localStorage[protocolAndDomain] != undefined && localStorage[localStorage[protocolAndDomain]] != undefined)
		{
			var rpkiObject = JSON.parse(localStorage[localStorage[protocolAndDomain]]);
			changeIcon(rpkiObject["validity"], tabId);
		}
	}
});

/**************** STEP 6 *********************/
/* 		       Show result            		 */
/*********************************************/
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	switch (request.name) {
	case "getRpki":
		var parsedURL=parseUri(request.url);
		var protocolAndDomain = parsedURL.protocol + '://' + parsedURL.authority;
		sendResponse( {
			rpkiString: localStorage[localStorage[protocolAndDomain]]
		});
		break;
	}
});