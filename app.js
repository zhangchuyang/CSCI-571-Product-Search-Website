var http = require('http');
var url = require('url');
var https = require('https');
var ebayAPI = "ChuyangZ-productS-PRD-516de56dc-16fe0077";
var googleAPI = "AIzaSyDinYKKVsWy-idVxpjN1TQTSbkdgDuPxmc";
var search_engine = "000603508938733878112:crt1-zbmyks";
var express = require('express');
var app = express();

app.use(express.static('./'));

// app.get('/', function(req, res){
// 	res.send("Please go to hw8.html");
	
// });

app.get('/user', function(req, res){
    res.writeHead(200, {
        'Content-type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    });
    var params = url.parse(req.url, true).query;
    var place_chosen = params.placechosen;
    var keyword = params.placekeyword;
    var location = params.placelocation;
    var distance = params.placedistance;
    var new_check = params.new_check;
    var used_check = params.used_check;
    var unspecified = params.unspecified_check;
    var pickup = params.pickup_check;
    var free = params.free_check;
    console.log(distance, location, new_check, used_check, unspecified);


    var spec_item_id = params.itemID;
    console.log(params.itemID);

    var zipcode = params.zip;

    var photo_title = params.title;

    var similaritem_id = params.itemId;
    console.log(params.itemId);



    if (isNaN(distance) || distance == undefined || distance == 0) distance = 10;

    if (place_chosen == 'option2' || place_chosen == 'option1' || place_chosen == "option3") {
        if (place_chosen == "option3"){
            distance = undefined;
            location = undefined;
        } 
        var url1 = "http://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=" + ebayAPI +
            "&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&paginationInput.entriesPerPage=50&keywords=" + encodeURI(keyword);

        i_index = 1;
        filter_index = 1;

        if (location != undefined){
            url1 += "&buyerPostalCode=" + location;
        }

        url1 += "&itemFilter(0).name=HideDuplicateItems&itemFilter(0).value=true";

        if (distance != undefined){
            url1 += "&itemFilter(" + filter_index + ").name=MaxDistance&itemFilter(" + filter_index + ").value=" + distance;
            filter_index += 1;

        }

        if (free !== "undefined" && free !== undefined) {
            url1 += "&itemFilter(" + filter_index + ").name=FreeShippingOnly&itemFilter(" + filter_index + ").value=true";
            filter_index += 1;
        }
        if (pickup !== "undefined" && pickup !== undefined) {
            url1 += "&itemFilter(" + filter_index + ").name=LocalPickupOnly&itemFilter(" + filter_index + ").value=true";
            filter_index += 1;
        }
        if ((new_check !== "undefined" && new_check !== undefined) || (used_check !== "undefined" && used_check !== undefined) || (unspecified !== "undefined" && unspecified !== undefined)) {
            url1 += "&itemFilter(" + filter_index + ").name=Condition";
            if (new_check !== "undefined" && new_check !== undefined) {
                url1 += '&itemFilter(' + filter_index + ').value(' + i_index + ')=New';
                i_index += 1;
            }
            if (used_check !== "undefined" && used_check !== undefined) {
                url1 += '&itemFilter(' + filter_index + ').value(' + i_index + ')=Used';
                i_index += 1;
            }
            if (unspecified !== "undefined" && unspecified !== undefined) {
                url1 += '&itemFilter(' + filter_index + ').value(' + i_index + ')=Unspecified';
                i_index += 1;
            }
            filter_index += 1;
        }

        url1 += '&outputSelector(0)=SellerInfo&outputSelector(1)=StoreInfo';

        console.log('url1,', url1);

        http.get(url1, (response) => {
            var json = "";
            response.on('data', (d) => {
                json += d;
            })
            response.on('end', () => {
                json = JSON.parse(json);
                console.log(json);
                res.end(JSON.stringify(json));
            });
        }).on('error', function (e) {
            console.error(e);
        });
    } else if (zipcode) {
        var url_complete = "http://api.geonames.org/postalCodeSearchJSON?postalcode_startsWith=" +
            zipcode + "&username=" + "zhangchuyang" + "&country=US&maxRows=5";
        console.log(url_complete);
        http.get(url_complete, (response) => {
            var json = "";
            response.on('data', (d) => {
                json += d;
            });
            response.on('end', () => {
                json = JSON.parse(json);
                console.log(json);
                res.end(JSON.stringify(json));
            });
        }).on('error', (e) => {
            console.error(e);
        });
    } else if (spec_item_id) {
        var url2 = "http://open.api.ebay.com/shopping?callname=GetSingleItem&responseencoding=JSON&appid=" +
            ebayAPI + "&siteid=0&version=967&ItemID=" + spec_item_id + "&IncludeSelector=Description,Details,ItemSpecifics";
        console.log('url2', url2);
        http.get(url2, (response) => {
            var json = "";
            response.on('data', (d) => {
                json += d;
            });
            response.on('end', () => {
                json = JSON.parse(json);
                console.log(json);
                res.end(JSON.stringify(json));
            });
        }).on('error', (e) => {
            console.error(e);
        });
    } else if (photo_title) {
        var url3 = "https://www.googleapis.com/customsearch/v1?q=" + photo_title + "&cx=" + search_engine +
            "&imgSize=huge&imgType=news&num=8&searchType=image&key=" + googleAPI;
        url3 = encodeURI(url3);
        console.log('url3', url3);
        https.get(url3, (response) => {
            var json = "";
            response.on('data', (d) => {
                json += d;
            });
            response.on('end', () => {
                json = JSON.parse(json);
                console.log(json);
                res.end(JSON.stringify(json));
            });
        }).on('error', (e) => {
            console.error(e);
        });
    } else if (similaritem_id) {
        var url4 = "http://svcs.ebay.com/MerchandisingService?OPERATION-NAME=getSimilarItems&SERVICE-NAME=MerchandisingService&SERVICE-VERSION=1.1.0&CONSUMER-ID=" +
            ebayAPI + "&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&itemId=" + similaritem_id + "&maxResults=20";
        console.log('url4', url4);
        http.get(url4, (response) => {
            var json = "";
            response.on('data', (d) => {
                json += d;
            });
            response.on('end', () => {
                json = JSON.parse(json);
                console.log(json);
                res.end(JSON.stringify(json));
            });
        }).on('error', (e) => {
            console.log(e);
        });
    }
})


var server = app.listen(8081);


// http.createServer(function (req, res) {

//     res.writeHead(200, {
//         'Content-type': 'application/json',
//         'Access-Control-Allow-Origin': '*'
//     });
//     // var params = url.parse(req.url, true).query;
//     // var place_chosen = params.placechosen;
//     // var keyword = params.placekeyword;
//     // var location = params.placelocation;
//     // var distance = params.placedistance;
//     // var new_check = params.new_check;
//     // var used_check = params.used_check;
//     // var unspecified = params.unspecified_check;
//     // var pickup = params.pickup_check;
//     // var free = params.free_check;

//     // var spec_item_id = params.itemID;
//     // console.log(params.itemID);

//     // var zipcode = params.zip;

//     // var photo_title = params.title;

//     // var similaritem_id = params.itemId;
//     // console.log(params.itemId);



//     // if (isNaN(distance) || distance == undefined || distance == 0) distance = 10;

//     // if (place_chosen == 'option2' || place_chosen == 'option1') {
//     //     var url1 = "http://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=" + ebayAPI +
//     //         "&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&paginationInput.entriesPerPage=50&keywords=" + keyword + '&buyerPostalCode=' + location +
//     //         '&itemFilter(0).name=MaxDistance&itemFilter(0).value=' + distance + '&itemFilter(1).name=HideDuplicateItems&itemFilter(1).value=true';
//     //     i_index = 0;
//     //     filter_index = 2;
//     //     if (free !== "undefined") {
//     //         url1 += "&itemFilter(" + filter_index + ").name=FreeShippingOnly&itemFilter(" + filter_index + ").value=true";
//     //         filter_index += 1;
//     //     }
//     //     if (pickup !== "undefined") {
//     //         url1 += "&itemFilter(" + filter_index + ").name=LocalPickupOnly&itemFilter(" + filter_index + ").value=true";
//     //         filter_index += 1;
//     //     }
//     //     if (new_check !== "undefined" || used_check !== "undefined" || unspecified !== "undefined") {
//     //         url1 += "&itemFilter(" + filter_index + ").name=Condition";
//     //         if (new_check !== "undefined") {
//     //             url1 += '&itemFilter(' + filter_index + ').value(' + i_index + ')=New';
//     //             i_index += 1;
//     //         }
//     //         if (used_check !== "undefined") {
//     //             url1 += '&itemFilter(' + filter_index + ').value(' + i_index + ')=Used';
//     //             i_index += 1;
//     //         }
//     //         if (unspecified !== "undefined") {
//     //             url1 += '&itemFilter(' + filter_index + ').value(' + i_index + ')=Unspecified';
//     //             i_index += 1;
//     //         }
//     //         filter_index += 1;
//     //     }

//     //     url1 += '&outputSelector(0)=SellerInfo&outputSelector(1)=StoreInfo';

//     //     console.log(url1);

//     //     http.get(url1, (response) => {
//     //         var json = "";
//     //         response.on('data', (d) => {
//     //             json += d;
//     //         })
//     //         response.on('end', () => {
//     //             json = JSON.parse(json);
//     //             console.log(json);
//     //             res.end(JSON.stringify(json));
//     //         });
//     //     }).on('error', function (e) {
//     //         console.error(e);
//     //     });
//     // } else if (zipcode) {
//     //     var url_complete = "http://api.geonames.org/postalCodeSearchJSON?postalcode_startsWith=" +
//     //         zipcode + "&username=" + "zhangchuyang" + "&country=US&maxRows=5";
//     //     console.log(url_complete);
//     //     http.get(url_complete, (response) => {
//     //         var json = "";
//     //         response.on('data', (d) => {
//     //             json += d;
//     //         });
//     //         response.on('end', () => {
//     //             json = JSON.parse(json);
//     //             console.log(json);
//     //             res.end(JSON.stringify(json));
//     //         });
//     //     }).on('error', (e) => {
//     //         console.error(e);
//     //     });
//     // } else if (spec_item_id) {
//     //     var url2 = "http://open.api.ebay.com/shopping?callname=GetSingleItem&responseencoding=JSON&appid=" +
//     //         ebayAPI + "&siteid=0&version=967&ItemID=" + spec_item_id + "&IncludeSelector=Description,Details,ItemSpecifics";
//     //     console.log('url2', url2);
//     //     http.get(url2, (response) => {
//     //         var json = "";
//     //         response.on('data', (d) => {
//     //             json += d;
//     //         });
//     //         response.on('end', () => {
//     //             json = JSON.parse(json);
//     //             console.log(json);
//     //             res.end(JSON.stringify(json));
//     //         });
//     //     }).on('error', (e) => {
//     //         console.error(e);
//     //     });
//     // } else if (photo_title) {
//     //     var url3 = "https://www.googleapis.com/customsearch/v1?q=" + photo_title + "&cx=" + search_engine +
//     //         "&imgSize=huge&imgType=news&num=8&searchType=image&key=" + googleAPI;
//     //     url3 = encodeURI(url3);
//     //     console.log('url3', url3);
//     //     https.get(url3, (response) => {
//     //         var json = "";
//     //         response.on('data', (d) => {
//     //             json += d;
//     //         });
//     //         response.on('end', () => {
//     //             json = JSON.parse(json);
//     //             console.log(json);
//     //             res.end(JSON.stringify(json));
//     //         });
//     //     }).on('error', (e) => {
//     //         console.error(e);
//     //     });
//     // } else if (similaritem_id) {
//     //     var url4 = "http://svcs.ebay.com/MerchandisingService?OPERATION-NAME=getSimilarItems&SERVICE-NAME=MerchandisingService&SERVICE-VERSION=1.1.0&CONSUMER-ID=" +
//     //         ebayAPI + "&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&itemId=" + similaritem_id + "&maxResults=20";
//     //     console.log('url4', url4);
//     //     http.get(url4, (response) => {
//     //         var json = "";
//     //         response.on('data', (d) => {
//     //             json += d;
//     //         });
//     //         response.on('end', () => {
//     //             json = JSON.parse(json);
//     //             console.log(json);
//     //             res.end(JSON.stringify(json));
//     //         });
//     //     }).on('error', (e) => {
//     //         console.log(e);
//     //     });
//     // }




// }).listen(process.env.port || 8081);