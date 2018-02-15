var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

urlPage = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-';


for (var i = 1; i<36; i++){
    url = urlPage + String(i);
    console.log(url);
    request(url, function(error, response, html){
        if(!error){

            var $ = cheerio.load(html);
            var link;

            $('a.poi-card-link').filter(function(){
                var data = $(this);
                link = "https://restaurant.michelin.fr"+data.attr('href');
                console.log(link);
                request(link, function(error, response, body){
                    var $ = cheerio.load(body);
                    var json = { title : "", address:"", postCode:""};

                    $(".poi_intro-display-title").each(function() {
                        data = $(this);
                        var title = data.text().trim();
                        json.title = title;
                    });

                    $(".thoroughfare").each(function() {
                        data = $(this);
                        var address = data.text();
                        json.address = address;
                    });

                    $(".postal-code").each(function() {
                        data = $(this);
                        var postCode = data.text();
                        json.postCode = postCode;
                    });

                    fs.appendFile('output.json', JSON.stringify(json)+"\r\n", function(err){
                        console.log('copy in output.json' + ' page: ' +  String(json.title));

                    });
                });
            })
        }
    });
    console.log("It's over");
}
