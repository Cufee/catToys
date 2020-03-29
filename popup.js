//Version
var scriptVersion = 'alpha-v0.1';
document.getElementById('app-version').innerHTML = scriptVersion;
//API
var apiUrl = 'https://mixer.com/api/v1/channels/';

function buildUrl(name) {
    console.log('Building URL')
    var url = apiUrl + name;
    return url
}

function Get(url) {
    console.log('Creating API dump for ' + url)
    //Return response as String
    var Httpreq = new XMLHttpRequest();
    Httpreq.open("GET", url, false);
    Httpreq.send(null);
    var response = Httpreq.responseText
    var statusCode = JSON.parse(response)['statusCode']
    console.log('Status Code ' + statusCode)
    if (statusCode == 404) {
        alert("User not found, API returned 404");
    }
    else {
        return response.toString();
    }   
}

function parseLightstream(channelId) {
    console.log('Parsing Lighstream')
    videoUrl = apiUrl + channelId.toString() + '/videoSettings';
    var rawData = JSON.parse(Get(videoUrl));
    var lightstream = rawData['isLSEnabled'];
    console.log(lightstream, rawData);
    return lightstream;
}

function parseApi(keys, rawData) {
    console.log('Parsing API dump')
    var allKeys = JSON.parse(Get(keys + '.json'));
    var apiName;
    for (apiName in allKeys) {
        //Parse String as JSON
        var status = rawData[apiName];
        var humanApiName =  allKeys[apiName];
        //Formatting date
        if (apiName == 'createdAt') {
            status = status.substr(0,10);
        }
        if (apiName == 'isLSEnabled') {
            status = parseLightstream(rawData['id']);
        }
        buildTable(humanApiName, status);
    }
}

function buildTable(name, status) {
    var template = $("#table-template").html();
    var tableRow = Mustache.render(template, {name: name, status: status});
    $("table").append(tableRow);
}

function resetHtml(htmlTag) {
    document.getElementById(htmlTag).innerHTML = '';
    console.log('Clearing old HTML');
}

function apiRunner() {
    var input = document.getElementById("api-search-box").value;
    if (input.length <= 2) {
        alert("Enter username or CID");
    }
    else {
        resetHtml('generated');
        var url = buildUrl(input);
        var rawData = JSON.parse(Get(url));
        var keys = 'apiList'
        parseApi(keys, rawData);
    }
}

// Get the input field
var input = document.getElementById("api-search-box");
// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    apiRunner();
  }
});