const request2 = require('request');
const fs = require('fs');

//Checking if file exists to clear
if (fs.existsSync('./promotions.json')) {
    fs.truncate('./promotions.json', 0, function() {
    })
}

//Reading lines from scrapped data-fourchette
var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('./data-fourchette.json')
});

lineReader.on('line', function(line) {
    var content = JSON.parse(line)
    request2({
        uri: "https://m.lafourchette.com/api/restaurant/" + content['id'] + "/sale-type",
    }, function(error, response, body) {

        var index = 0;
        var result = JSON.parse(body);
        var rest = {};
        var proms = [];
        var promoFound = false;

        for (var i = 0; i < result.length; i++) {

            if (result[i].hasOwnProperty('exclusions')
                && result[i]['exclusions'] != ""
                && result[i]['is_special_offer']) {

                promoFound = true;
                proms[index] = {};
                proms[index]['title'] = result[i]['title'];
                proms[index]['exclusions'] = result[i]['exclusions'];
                index += 1;
            }
        }
        if (promoFound) {
            rest['name'] = content['name']
            rest['address'] = content['address']
            rest['stars'] = content['stars']
            rest['promotions'] = proms
            rest['link'] = content['link']

            try {
                fs.appendFile("./promotions.json", JSON.stringify(rest) + ",\n", function() {});
                console.log('copy in promotions.json' + ' Restaurant: ' +  String(rest.name));
            } catch (err) {
                console.log(err);
            }
        }
    }).on('error', function(err) {
        console.log(err)
    }).end()
});
