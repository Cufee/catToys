//Version
const appVersion = '1.0.0';
const apiRunnerVersion = '1.0';
const infoButton = document.querySelector('#app-info');
const helpLink = '<a href="https://discordapp.com/invite/bf5hGgD" target="_blank">Help</a>'

//Display Version when info icon is clicked
infoButton.addEventListener("click", function () {
    const msg = `App ${appVersion} / Api Runner ${apiRunnerVersion} ${helpLink}`
    showAlert(msg, 'primary')
})

//API url
var apiUrl = 'https://mixer.com/api/v1/';

//Return URL from apiUrl and user input
function buildUrl(name) {
    console.log('Building URL')
    var url = `${apiUrl}channels/${name}`;
    return url
}

//Return JSON object from url
function Get(url) {
    console.log('Creating API dump for ' + url);
    //Get JSON from URL and check status code
    var Httpreq = new XMLHttpRequest();
    Httpreq.open("GET", url, false);
    Httpreq.send(null);
    var statusCode = Httpreq.status;
    if (statusCode !== 200) {
        console.log(response)
        return {"statusCode": statusCode};
    }
    else {
        var response = JSON.parse(Httpreq.responseText);
        response.statusCode = statusCode;
        console.log(response)
        return response
    }       
}

//Return Lightstream status from id(aka ChannelId)
function parseLightstream(channelId) {
    console.log('Parsing Lighstream')
    videoUrl = `${apiUrl}channels/${channelId}/videoSettings`;
    var rawData = Get(videoUrl);
    if (rawData['statusCode']  !== 200){
        var lightstream = `false ${rawData['statusCode']}`;
        return lightstream;
    }
    else {
        var lightstream = rawData['isLSEnabled'];
        console.log(lightstream);
        return lightstream;
    }
}

//Return xuid from id(aka ChannelId)
function parseXuid(channelId) {
    console.log('Parsing Lighstream')
    videoUrl = `${apiUrl}users/${channelId}/xuid`;
    var rawData = Get(videoUrl);
    console.log(rawData)
    if (rawData['statusCode']  !== 200){xuid = `failed ${rawData['statusCode']}`;}
    else {
        var xuid = rawData['xuid'];
    }
    console.log(xuid);
    return xuid;
}

//Parse JSON Object for keys defined in keys variable
function parseApi(keys, rawData) {
    console.log('Parsing API dump')
    var allKeys = Get(keys + '.json');
    var apiName;
    var parseResult = new Object();
    for (apiName in allKeys) {
        //Parse String as JSON
        var status = rawData[apiName];
        //Custom rules below
        var humanApiName =  allKeys[apiName];
        //Save statusCode
        if (apiName == 'statusCode') {
            humanApiName = apiName;
        }
        //Getting xuid
        if (apiName == 'xuid') {
            status = parseXuid(rawData['userId']);
        }
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
    return parseResult
}

//Build final table and append to html doc
function buildTable(parseResult) {
    for (var name in parseResult) {
        status = parseResult[name]
        console.log(name, status)
        if (status == 'undefined') {console.log(`Skipping ${name}`)}
        else if (name === 'statusCode') {console.log(`Skipping ${name}`)}
        else {
            var template = $("#table-template").html();
            var tableRow = Mustache.render(template, {class: name, name: name, status: status});
            $("table").append(tableRow);
        }
    }    
}

//Delede existing elements with id="generated"
function resetHtml(htmlTag) {
    document.getElementById(htmlTag).innerHTML = '';
    console.log('Clearing old HTML');
}

//Display error message with msg, type
function showAlert(msg, type, timeout=3000) {
    resetHtml('generated');
    const alert = document.querySelector('#alert');
    type = `alert-${type}`

    alert.innerHTML = msg;
    alert.classList.add('alert');
    alert.classList.add(type);

    const clearAlert = () => {
        alert.classList.remove('alert');
        alert.classList.remove(type);
        alert.innerHTML = '';
    }

    setTimeout(() => clearAlert(), timeout);
}

//Check if input is valid and call functions
function apiRunner() {
    var input = document.getElementById("api-search-box").value;
    if (input.length <= 2) {
        showAlert('Invalid username or CID', 'warning');
    }
    else {
        resetHtml('generated');
        var url = buildUrl(input);
        var rawData = Get(url);
        var statusCode = rawData["statusCode"]
        console.log(`Raw data status ${statusCode}`)
        if (statusCode !== 200) {
            showAlert(`User not found ${statusCode}`, 'danger')
        }
        else {
            var keys = 'apiList' 
            var parseResult = parseApi(keys, rawData);
            buildTable(parseResult)
        }    
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