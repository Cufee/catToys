//Debug toggle for logger
const debug = true

//Version
const appVersion = '1.0.0';
const apiRunnerVersion = '2.0';
const infoButton = document.querySelector('#app-info');
const helpLink = '<a href="https://discordapp.com/invite/bf5hGgD" target="_blank">Help</a>';
//Display Version when info icon is clicked
infoButton.addEventListener("click", function () {
    const msg = `App ${appVersion} / Api Runner ${apiRunnerVersion} ${helpLink}`;
    showAlert(msg, 'primary');
})
logger({"App version": appVersion, "Api Runner version": apiRunnerVersion}, 'Version')

//API url
const apiUrl = 'https://mixer.com/api/v1/';
const apiList = Get('apiList_v2.json');


//ApiRunner
//Check if input is valid, fetch info from API and assemble a table
function apiRunner(input) {
    const channelUrl = `${apiUrl}channels/${input}`;
    let channelRawData = Get(channelUrl);
    const channelGetStatus = channelRawData.statusCode.status;
    channelRawData = flattenObject(channelRawData);
    logger(channelRawData);
    //Check if input was valid
    if (channelGetStatus != 200) {
        const msg = `User not found ${channelGetStatus}`;
        showAlert(msg);
    }
    else {
        logger(apiList)
        for (item in apiList) {
            const key = apiList.item
            logger(key)
        }
        
    }
}



// var pattern = pattern;
// var matchingKeys = Object.keys(channelRawData).filter(function(key) {
//   return pattern.test(key);
// });
// logger(matchingKeys);

//Single case functions
//Return Lightstream status from id(aka ChannelId)
function parseLightstream(channelId) {
    videoUrl = `${apiUrl}channels/${channelId}/videoSettings`;
    const rawData = Get(videoUrl);
    const statusCode = rawData.statusCode.status

    if (rawData['statusCode']  !== 200){
        const lightstream = `false ${rawData['statusCode']}`;
        return lightstream;
    }
    else {
        const lightstream = rawData.lighstream.status;
        return lightstream;
    }
}

//Return xuid from id(aka ChannelId)
function parseXuid(channelId) {
    const videoUrl = `${apiUrl}users/${channelId}/xuid`;
    const rawData = Get(videoUrl);
    const statusCode = rawData.statusCode.status;
    
    if (statusCode  !== 200){xuid = `failed ${statusCode}`;}
    else {
        const xuid = rawData.xuid;
    }
    return xuid;
}


//Core functions
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
        return {"statusCode": {"status": statusCode}};
    }
    else {
        var response = JSON.parse(Httpreq.responseText);
        response.statusCode = {"status": statusCode};
        console.log(response)
        return response
    }       
}

//Flatten Object
const flattenObject = (ob) => {
	let toReturn = {};
	for (var i in ob) {
		if (!ob.hasOwnProperty(i)) continue;
		
		if ((typeof ob[i]) == 'object') {
			let flatObject = flattenObject(ob[i]);
			for (let x in flatObject) {
				if (!flatObject.hasOwnProperty(x)) continue;
				toReturn[i + ':' + x] = flatObject[x];
			}
		} else {
			toReturn[i] = ob[i];
		}
	}
	return toReturn;
}

//Display error message with msg, type, timeout
function showAlert(msg, type='warning', timeout=3000) {
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

//Logger function
function logger(data, msg='') {
    if (debug == true) {
        console.log(msg, data)
    }
}

//Delede existing elements with id="generated"
function resetHtml(htmlTag) {
    document.getElementById(htmlTag).innerHTML = '';
}

//Search box event lsitener
const input = document.getElementById("api-search-box");
//Execute on ENTER key release
input.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    apiRunner(input.value); //ApiRunner
  }
});