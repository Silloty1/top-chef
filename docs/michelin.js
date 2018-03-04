/*const fetch = require ('node-fetch');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

urlPage = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-'; //Api used

let HRefTab = new Array();
//Using async function for first finding the element and then write them on a JSON file
async function ScrapHRef()
{
  let page = 1;
  let anno = 0;
  let verif = true;
  while (verif)
  {
    let data = await fetch(urlPage+page.toString());
    let html = await data.text();
    let $ = await cheerio.load(html);
    anno--;
    if($ ('.srp-no-results-text').text().length > 10) //Checking if the number of results displayed on the page are over 10
    {
      verif = false;
    }
    else
    {
      $('.poi-card-link').each(
        function()
        {
          HRefTab[page-1+anno]=$(this).attr('href'); //Putting web addresses of restaurants on an array
          console.log(HRefTab[page-1+anno]);
          anno++;
        }
      )
      page++;
    }
  }
  console.log(HRefTab.length);
  WriteInsideJSON();
}

async function WriteInsideJSON() //Write data of the array on a json file
{
  var json = { title : "", address:"", postCode:""};

  for(var i=0; i<HRefTab.length; i++)
  {
    let data = await fetch("https://restaurant.michelin.fr"+HRefTab[i]);
    let html = await data.text();
    let $ = await cheerio.load(html);

    let title = $(".poi_intro-display-title").text().trim();
    json.title = title;

//Some bug is happening here, the postcode and the addresses are displayed twice

    let address = $(".thoroughfare").text().trim();
      if(address == "")
      {
        json.address = address;
      }


    let postCode = $(".postal-code").text().trim();
    json.postCode = postCode;

    fs.appendFile('output.json', JSON.stringify(json)+"\r\n", function(err){
        console.log('copy in output.json' + ' page: ' +  String(json.title));
      });
  }
}

ScrapHRef();
*/

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

                    fs.appendFile('data-michelin.json', JSON.stringify(json)+"\r\n", function(err){
                        console.log('copy in data-michelin.json' + ' Restaurant: ' +  String(json.title));

                    });
                });
            })
        }
    });
    console.log("Scrapping complete.");
}
