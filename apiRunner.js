//Version
var scriptVersion = 'v0.2.2';
document.getElementById('app-version').innerHTML = scriptVersion;
//API url
var apiUrl = 'https://mixer.com/api/v1/channels/';

//Return URL from apiUrl and user input
function buildUrl(name) {
    console.log('Building URL')
    var url = apiUrl + name;
    return url
}

//Return JSON object from url
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
        var badResponse = '{"statusCode":404}';
        console.log(badResponse)
        return badResponse;
    }
    else {
        console.log(typeof(response))
        return response.toString();
    }   
}

//Return Lightstream status from id(aka ChannelId)
function parseLightstream(channelId) {
    console.log('Parsing Lighstream')
    videoUrl = apiUrl + channelId.toString() + '/videoSettings';
    var rawData = JSON.parse(Get(videoUrl));
    if (rawData['statusCode']  === 404){rawData['isLSEnabled'] = 'not a Pro';}
    console.log(rawData)
    var lightstream = rawData['isLSEnabled'];
    console.log(lightstream, rawData);
    return lightstream;
}

//Parse JSON Object for keys defined in keys variable
function parseApi(keys, rawData) {
    console.log('Parsing API dump')
    var allKeys = JSON.parse(Get(keys + '.json'));
    var apiName;
    var parseResult = new Object();
    for (apiName in allKeys) {
        //Parse String as JSON
        var status = rawData[apiName];
        var humanApiName =  allKeys[apiName];
        //Formatting date
        if (apiName == 'createdAt') {
            status = status.substr(0,10);
        }
        //Gettings groups
        if (apiName == 'groups') {
            var allGroups = new Array()
            groupData = rawData.user['groups'];
            for (group in groupData) {
                allGroups.push(groupData[parseInt(group)].name)
            }
            console.log(allGroups.toString())
            status = allGroups.toString()
        }
        //Gettings Sparks
        if (apiName == 'sparks') {
            status = rawData.user.sparks;
        }
        //Parsing Lighstream
        if (apiName == 'isLSEnabled') {
            status = parseLightstream(rawData['id']);
        }
        parseResult[humanApiName] = status
    }
    buildTable(parseResult)
}


function buildTable(parseResult) {
    for (var name in parseResult) {
        status = parseResult[name]
        if (status === 'undefined') {break; console.log('Break')}
        var template = $("#table-template").html();
        var tableRow = Mustache.render(template, {name: name, status: status});
        $("table").append(tableRow);
    }    
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
        if (rawData["statusCode"] === 404) {alert("User not found, API returned 404");}
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