document.addEventListener('DOMContentLoaded', function ()
{
    chrome.tabs.getSelected(null, function(tab)
    {
        chrome.extension.sendMessage({name:'getRpki', url:tab.url}, function(response)
        {
            if(response.rpkiString != undefined) {
                var rpkiObject = JSON.parse(response.rpkiString);
                document.getElementById('asn').innerHTML = rpkiObject["asn"];
                document.getElementById('asname').innerHTML = rpkiObject["asName"];
                document.getElementById('ip').innerHTML = rpkiObject["ip"];
                document.getElementById('prefix').innerHTML = rpkiObject["prefix"];
                document.getElementById('validity').innerHTML = rpkiObject["validity"].state;
            }
            else {
                document.getElementById('asn').innerHTML = "N/A";
                document.getElementById('asname').innerHTML = "N/A";
                document.getElementById('ip').innerHTML = "N/A";
                document.getElementById('prefix').innerHTML = "N/A";
                document.getElementById('validity').innerHTML = "N/A";
            }
        });
    });
});
