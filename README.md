# RPKI Validator - Chrome Extension

## install

Start Chrome and open a tab with ```chrome://extensions```, activate checkbox
for developer mode (top right corner), see also [here](https://developer.chrome.com/extensions/getstarted). Click on *Load
unpacked extension* and browse to the source directory of the extension to
install it. You may also pack the extension for deployment.

## configure

The following parameters can be configured within the addon:
- **validation server URL**: URL of the validation server offering a RESTful API
  verify origin AS of an IP prefix
- **cache server host**: hostname of a RPKI cache server
- **cache server port**: port number of the RPKI cache service
- **cache time to live**: live time (TTL) of cached validation entries
