document.addEventListener('DOMContentLoaded', function ()
{
	chrome.tabs.getSelected(null, function(tab)
	{
		chrome.extension.sendMessage({name:'getRpki', url:tab.url}, function(response)
		{
			if(response.rpkiString != undefined) {
				var rpkiObject = JSON.parse(response.rpkiString);
				document.getElementById('asn').innerHTML = rpkiObject["asn"];
				document.getElementById('asName').innerHTML = rpkiObject["asName"];
				document.getElementById('ip').innerHTML = rpkiObject["ip"];
				document.getElementById('bgpPrefix').innerHTML = rpkiObject["prefix"];
				validityObject = JSON.parse(rpkiObject["validity"]);
				document.getElementById('validity').innerHTML = validityObject.message;
			}
			else {
				document.getElementById('asn').innerHTML = "N/A";
				document.getElementById('asName').innerHTML = "N/A";
				document.getElementById('ip').innerHTML = "N/A";
				document.getElementById('bgpPrefix').innerHTML = "N/A";
				document.getElementById('validity').innerHTML = "N/A";
			}
		});
	});
});