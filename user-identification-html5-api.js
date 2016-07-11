/* The scripts purpose is to identify internal traffic but it might be used to verify if a user has visited a certain website.
* By assuming a user visited website A, resources or connection information like DNS or SSL get's cached.
* Leveraging the HTML5 Resource Timing API (https://www.w3.org/TR/resource-timing/) a known resources get's attached to the DOM.
* If the resource or it's connection information was already cached the following metrics should be zero:
* domainLookupStart, domainLookupEnd, connectStart, connectEnd, requestStart, responseStart
*
* This script is extended with Google Tag Manager events to track the findings. Later I will elaborate to implement the userID.
*/

var imageCheck = document.createElement("img");
imageCheck.src = "YOUR-FULL-RESOURCE-PATH";
imageCheck.style = "display: block; visibility: hidden;";
imageCheck.id = "imageCheck";
document.body.appendChild(imageCheck);

document.getElementById("imageCheck").addEventListener("load", function() {
  console.log("Resource loaded");
  console.log(document.getElementById("imageCheck"));
  console.log("Resources complete: " + document.getElementById("imageCheck").complete);
  console.log("Natural width: " + document.getElementById("imageCheck").naturalWidth);

  var resourceList = !(/MSIE (\d.\d+);/.test(navigator.userAgent) || window.performance.getEntriesByType == undefined) ? window.performance.getEntriesByType("resource") : "undefined",
  resuorceUrl = document.getElementById("imageCheck").src,
  found = resourceList.filter(function(item) { return item.name === resuorceUrl; }),
  foundTiming = [
    found[0].domainLookupEnd - found[0].domainLookupStart,
    found[0].connectEnd - found[0].connectStart,
    found[0].requestStart,
    found[0].responseStart
  ];

  console.log("domainLookupStart: " + found[0].domainLookupStart);
  console.log("domainLookupEnd: " + found[0].domainLookupEnd);

  console.log("connectStart: " + found[0].connectStart);
  console.log("connectEnd: " + found[0].connectEnd);

  console.log("requestStart: " + found[0].requestStart);
  console.log("responseStart: " + found[0].responseStart);

  if(found[0].name.indexOf("https") !== -1) {
    console.log("secureConnectionStart: " + found[0].secureConnectionStart);
    foundTiming[foundTiming.length] = found[0].secureConnectionStart;
  }

  if (foundTiming.join("|").indexOf("0") !== -1) {
    //console.log("Zero's baby: " + foundTiming.reduce((a, b) => a + b, 0) === 0);
    console.log("foundTiming: " + foundTiming.join("|"));
    dataLayer.push ({ 'event': 'internalTraffic', 'eventCategory': 'Internal traffic', 'eventAction': foundTiming.join("|"), 'eventLabel': undefined, 'eventValue': undefined, 'nonInteractive': 1});
  } else {
    //console.log("Zeor's baby: " + foundTiming.reduce((a, b) => a + b, 0) === 0);
    console.log("foundTiming: " + foundTiming.join("|"));
    dataLayer.push ({ 'event': 'internalTraffic', 'eventCategory': 'External traffic', 'eventAction': foundTiming.join("|"), 'eventLabel': undefined, 'eventValue': undefined, 'nonInteractive': 1});
  }
}, false);
document.getElementById("imageCheck").addEventListener("error", function() {
  console.log("Resource didn't load");
  dataLayer.push ({ 'event': 'internalTraffic', 'eventCategory': 'Resource not found', 'eventAction': undefined, 'eventLabel': undefined, 'eventValue': undefined, 'nonInteractive': 1});
}, false);
