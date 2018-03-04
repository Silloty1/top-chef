const request = require('request');
const fs = require('fs');

let punctuation = ['\'', ' ', '-'];
let regExp = new RegExp('[' + punctuation.join('') + ']', 'g')
let similarTarget = {} //found restaurants

//Checking if file exists to clear
if (fs.existsSync('./data-fourchette.json')) {
    fs.truncate('data-fourchette.json', 0, function() {})
}

//Reading lines from scrapped data-michelin
var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('./data-michelin.json')
});

lineReader.on('line', function(line) {
    var restaurantToFind = JSON.parse(line);
    //Getting rid of special characters
    var fieldsAPI = restaurantToFind["title"].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/ - /g, '-').split(regExp);
    //console.log(fieldsAPI);
    let parametersForLinks = "";
    for (var i = 0; i < fieldsAPI.length - 1; i++) {
        parametersForLinks += fieldsAPI[i] + '+';
    }
    parametersForLinks += fieldsAPI[fieldsAPI.length - 1];
    console.log(parametersForLinks);
    request({
        //Using La Fourchette's API
        uri: "https://m.lafourchette.com/api/restaurant-prediction?name=" + parametersForLinks,
    }, function(error, response, body) {
        if (error) return console.log(error);
        if (body[0] != '<') {
            var listRests = JSON.parse(body);
            let restaurantFound = false;
            //console.log(listRests);
            if (listRests.length > 0) {
                for (var i = 0; i < listRests.length; i++) {
                    if (restaurantFound) {
                        //console.log(listRests);
                        break;
                    }
                    // make sure that this is the real restaurant by comparing their address/postCode
                    if (listRests[i]['address']['postal_code'] == restaurantToFind['postCode']) {
                        similarTarget = listRests[i]
                        restaurantFound = true
                        //console.log("true");
                        console.log(listRests[i]);

                        let tokensSearch = similarTarget["name"].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/ - /g, '-').split(regExp);
                        var searchLinkParameters = "";
                        for (var i = 0; i < tokensSearch.length - 1; i++) {
                            searchLinkParameters += tokensSearch[i] + '-';
                        }
                        searchLinkParameters += tokensSearch[tokensSearch.length - 1];
                        similarTarget['link'] = "https://www.lafourchette.com/restaurant/" + searchLinkParameters + "/" + similarTarget['id']
                        similarTarget['stars'] = restaurantToFind['stars']

                        //Adding existing restaurants from michelin and lafourchette
                        if (restaurantFound) {
                            try {
                                fs.appendFile("data-fourchette.json", JSON.stringify(similarTarget) + "\n");
                            } catch (err) {
                                console.log(err);
                            }
                        }
                    }
                }
            }
        }
    }).on('error', function(err) {
        console.log(err)
    }).end()
});
