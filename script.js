var MY_SERVER_URL = "http://www.chuyang-571.us-east-2.elasticbeanstalk.com/user?"; 

// var MY_SERVER_URL = "http://localhost:8081/user?"

var awsUrl;  

$(document).ready(() => {

    $('#keyword').on('input', () => {
        if ($("#keyword").val() != "" && $.trim($("#keyword").val()) != "") {
            $("#errormessage1").html('');
            $("#keyword").css({
                'border-color': '#80BDFF'
            });
            keywordInput = true;
            if (haveZip && haveLocation) {
                $("#search-btn").attr('disabled', false);
            }
        } else {
            $("#errormessage1").html("Please enter a keyword.");
            $("#keyword").css({
                'border-color': 'red'
            });
            keywordInput = false;
            $("#search-btn").attr('disabled', true);
        }
    });

    $("#keyword").on('blur', () => {
        if ($("#keyword").val() != "" && $.trim($("#keyword").val()) != "") {
            $("#errormessage1").html('');
            $("#keyword").css({
                'border-color': '#80BDFF'
            });
            keywordInput = true;
            if (haveZip && haveLocation) {
                $("#search-btn").attr('disabled', false);
            }
        } else {
            $("#errormessage1").html("Please enter a keyword.");
            $("#keyword").css({
                'border-color': 'red'
            });
            keywordInput = false;
            $("#search-btn").attr('disabled', true);
        }
    });
});

(() => {
    var app = angular.module('myapp', ['ngAnimate', 'ngMaterial', 'ngMessages', 'angular-svg-round-progressbar']);

    app.controller('mainController', ['$scope', '$window', '$http', function ($scope, $window, $http) {
        $scope.PROCESSING = false;
        $scope.showResults = false;
        $scope.showWish = false;
        $scope.showDetails = false;
        $scope.FAILING = false;
        $scope.NORECORDS = false;
        $scope.data = [undefined, undefined, undefined, undefined, undefined];
        $scope.nextPage = [undefined, undefined, undefined];
        $scope.showingAllData = [];
        $scope.wishData = [];
        $scope.wishList = [];
        $scope.totalPay = 0.0;

        $scope.detailsBtnEnabled0 = true;
        $scope.detailsBtnEnabled1 = true;
        $scope.show1 = false;
        $scope.show2 = false;
        $scope.show3 = false;
        $scope.show4 = false;
        $scope.show5 = false;
        $scope.fburl = undefined;
        $scope.detailsData = undefined;
        $scope.previousDetail = undefined;

        $scope.screenSize = $window.screen.availWidth;

        $(window).resize(() => {
            $scope.screenSize = $window.screen.availWidth;
        })




        $scope.mainSearch = function (placekeyword, placedistance, new_check, used_check, unspecified_check, pickup_check, free_check, placechosen, placelocation) {

            $scope.details_button = true;
            $scope.PROCESSING = true;
            $scope.NORECORDS = false;
            $scope.S_NORECORDS = false;
            $scope.FAILING = false;
            $scope.detailsBtnEnabled0 = true;
            $scope.detailsBtnEnabled1 = true;
            console.log("MAIN_SEARCH");
            var placecategory = document.getElementById('category').value;
            console.log(placekeyword, placecategory, placedistance, placelocation);
            var placelocation = document.getElementById('input-0').value;

            if (placelocation == "" || placelocation == undefined) {
                placelocation = zipcode;
                console.log("Here", placelocation);
            }
            console.log(zipcode);
            Url = MY_SERVER_URL;

            // change the url at the end
            awsUrl += 'placechosen=' + placechosen;
            awsUrl += '&placekeyword=' + placekeyword;
            awsUrl += '&placelocation=' + placelocation;
            awsUrl += '&placecategory=' + placecategory;
            awsUrl += '&placedistance=' + placedistance;
            awsUrl += '&new_check=' + new_check;
            awsUrl += '&used_check=' + used_check;
            awsUrl += '&unspecified_check=' + unspecified_check;
            awsUrl += '&pickup_check=' + pickup_check;
            awsUrl += '&free_check=' + free_check;

            console.log('awsurl,', awsUrl);

            $http({
                method: 'GET',
                url: awsUrl
            }).then((res) => {
                $scope.PROCESSING = false;
                $scope.showWish = false;
                if (res.data.findItemsAdvancedResponse.errorMessage != undefined) {
                    alert(res.data.findItemsAdvancedResponse.errorMessage.error.message);
                }
                $scope.data[0] = res.data.findItemsAdvancedResponse[0].searchResult;
                if (res.data.findItemsAdvancedResponse[0].searchResult[0]['@count'] == 0 || res.data.findItemsAdvancedResponse[0].searchResult == undefined) {
                    $scope.NORECORDS = true;
                } else {
                    $scope.showResults = true;
                }

                $scope.totalEntries = res.data.findItemsAdvancedResponse[0].paginationOutput[0].entriesPerPage;
                $scope.totalPageNumber = Math.ceil($scope.totalEntries / 10);
                $scope.pageNumberList = [];
                for (var i = 0; i < $scope.totalPageNumber; i++) {
                    $scope.pageNumberList.push(i + 1);
                }
                $scope.showingAllData = res.data.findItemsAdvancedResponse[0].searchResult[0].item;
                console.log('showingData,', $scope.showingAllData);
                wishList = JSON.parse(localStorage.getItem("LocalStorageWishList"));
                console.log(wishList);
                for (var i = 0; i < $scope.showingAllData.length; i++) {
                    $scope.showingAllData[i].highlightstyle = "";
                    var title_maxlength = 35;
                    if ($scope.showingAllData[i].title[0].length >= title_maxlength) {
                        while ($scope.showingAllData[i].title[0][title_maxlength] != " ") {
                            title_maxlength -= 1;
                        }
                        $scope.showingAllData[i].title['shortenData'] = $scope.showingAllData[i].title[0].substring(0, title_maxlength) + "...";
                    }
                    if ($scope.showingAllData[i].shippingInfo[0].shippingServiceCost[0].__value__ == 0.0) {
                        $scope.showingAllData[i].shippingInfo[0].shippingServiceCost[0].__value__ = 'Free Shipping';
                    } else {
                        $scope.showingAllData[i].shippingInfo[0].shippingServiceCost[0].__value__ = "$" + $scope.showingAllData[i].shippingInfo[0].shippingServiceCost[0].__value__;
                    }
                    if ($scope.checkWish($scope.showingAllData[i].itemId)) {
                        $scope.showingAllData[i].isWish = true;
                        $scope.showingAllData[i].wishStyle = "glyphicon-star";
                    } else {
                        $scope.showingAllData[i].isWish = false;
                        $scope.showingAllData[i].wishStyle = "glyphicon-star-empty";
                    }
                }

                $scope.pageNumber = 0;
                $scope.disabled_prev_style = "disabled";
                $scope.showNthData = $scope.showingNthData($scope.showingAllData, $scope.pageNumber);

                if ($scope.pageNumber < $scope.totalPageNumber) {
                    $scope.disabled_next_style = "";
                } else {
                    $scope.disabled_next_style = "disabled";
                }
            }, (res) => {
                $scope.PROCESSING = false;
                $scope.FAILING = true;
            });
        }

        
        $scope.initAutoComplete = (searchText) => {
            var input = searchText;
            if (document.getElementById('input-0').value == ""){
                $scope.containElement = false;
            }
            console.log(input);
            if (input == undefined || input == ""){
                $scope.containElement = false;
            }  else $scope.containElement = true;
            $("#errormessage2").html("");
            var zipURL = MY_SERVER_URL;
            zipURL += "zip=" + input;
            console.log(zipURL);

            return $http({
                method: 'GET',
                url: zipURL
            }).then(function successcb(res) {
                $scope.zipList = res.data.postalCodes;
                console.log($scope.zipList);
                if ($scope.zipList == undefined) $scope.showAuto = false;
                else {
                    $scope.showAuto = true;
                }
                console.log(input);
                var zip_pattern = /^\d{5}$/;
                if (zip_pattern.test(input)){
                    $("#search-btn").attr('disabled', false);
                } else {
                    $("#search-btn").attr('disabled', true);

                }
                return $scope.zipList;
            }, function (e) {
                console.log('autocomplete not working!');
            });

        }


        $scope.onChangeKeyword = () => {
            console.log('...');
            if ($('#keyword').val() != "") {
                if ($("#current_location").is(':checked')) {
                    $("#search-btn").attr('disabled', false);
                } else if ($("#zip-code").is(':checked')) {
                    $("#search-btn").attr('disabled', true);

                }
            }

        }
        $scope.checkCurrLocation = () => {
            if ($("#current_location").is(':checked')) {
                console.log('true', );
                $scope.autoDisabled = true;
                selectedItem = "";
                if ($('#keyword').val() != "") {
                    $("#search-btn").attr('disabled', false);
                }
                document.getElementById('input-0').value = "";
            }

        }

        $scope.errordisplay = () => {
            if ($scope.containElement != true){
                $("#errormessage2").html("Please enter a zip code.");
            }
        }

        $scope.correct_input = () => {
            $scope.correct = true;
            console.log('correct!');
            $("#errormessage2").html("");
            if ($('#keyword').val() != "") {
                $("#search-btn").attr('disabled', false);
            }
        }

        $scope.checkZipCode = () => {
            console.log($("#zip-code").is(':checked'));
            if ($("#zip-code").is(':checked')) {
                $scope.autoDisabled = false;
                console.log('true', $scope.autoDisabled);
                $("#search-btn").attr('disabled', true);
            }
        }

        $scope.ToPrevious = () => {
            $scope.pageNumber = $scope.pageNumber - 1;
            $scope.disabled_next_style = "";
            $scope.showNthData = $scope.showingNthData($scope.showingAllData, $scope.pageNumber);
            if ($scope.pageNumber == 1) {
                $scope.disabled_prev_style = "";
            } else if ($scope.pageNumber == 0) {
                $scope.disabled_prev_style = "disabled";
            }
        }

        $scope.ToNext = () => {
            $scope.pageNumber = $scope.pageNumber + 1;
            $scope.disabled_prev_style = "";
            $scope.showNthData = $scope.showingNthData($scope.showingAllData, $scope.pageNumber);
            if ($scope.pageNumber == 4) {
                $scope.disabled_next_style = "disabled";
            } else {
                $scope.disabled_prev_style = "";
            }
        }

        $scope.showingNthData = (showingAllData, pageNumber) => {
            var i = 0;
            $scope.NthData = [];
            while (i < 10 && i < showingAllData.length) {
                $scope.NthData.push(showingAllData[pageNumber * 10 + i]);
                i += 1;
            }
            console.log('Nthdata', $scope.NthData);
            return $scope.NthData;
        }

        $scope.clear = () => {
            console.log("Clear");
            $scope.showResults = false;
            $scope.showDetails = false;
            $scope.placekeyword = undefined;
            $scope.placelocation = undefined;
            $scope.placedistance = undefined;
            $scope.new_check = undefined;
            $scope.used_check = undefined;
            $scope.unspecified_check = undefined;
            $scope.pickup_check = undefined;
            $scope.free_check = undefined;
            $scope.showWish = false;
            $("#showLeftBtnid").attr("class", "btn btn-dark");
            $("#showRighBtntid").attr("class", "btn btn-default");
            $("#current_location").click();
            $("#search-btn").attr('disabled', true);
            $("#errormessage2").html("");
            $("#errormessage1").html("");

            $scope.NORECORDS = false;
            $scope.FAILING = false;
        }

        $scope.showthisPage = (p) => {
            $scope.pageNumber = p - 1;
            $scope.showNthData = $scope.showingNthData($scope.showingAllData, $scope.pageNumber);
            if ($scope.pageNumber == 0) {
                $scope.disabled_prev_style = "disabled";
                $scope.disabled_next_style = "";
            } else if ($scope.pageNumber == 4) {
                $scope.disabled_next_style = "disabled";
                $scope.disabled_prev_style = "";
            } else {
                $scope.disabled_next_style = "";
                $scope.disabled_prev_style = "";
            }
            console.log(p);
        }

        $scope.showback = () => {
            $scope.showDetails = false;
            if ($scope.previous == 0) {
                $scope.showLeft();
            } else {
                $scope.showRight();
            }
        }

        $scope.showLeft = () => {
            $("#showLeftBtnid").attr("class", "btn btn-dark");
            $("#showRighBtntid").attr("class", "btn btn-default");
            $scope.showDetails = false;
            $scope.showWish = false;
            $scope.details_button = true;
            $scope.details_button1 = false;

            var tempshowingData = $scope.showingAllData;
            console.log($scope.showingAllData);
            if (tempshowingData.length == 0) {
                $scope.NORECORDS = true;
            } else {
                $scope.NORECORDS = false;
                $scope.showResults = true;
            }
        }

        $scope.showRight = () => {
            $("#showRighBtntid").attr("class", "btn btn-dark");
            $("#showLeftBtnid").attr("class", "btn btn-default");
            $scope.details_button = false;
            $scope.details_button1 = true;
            $scope.showResults = false;
            $scope.showDetails = false;
            if (wishList.length == 0) {
                $scope.NORECORDS = true;
                $scope.showWish = false;
            } else {
                $scope.NORECORDS = false;
                $scope.showWish = true;
                console.log('showright', wishList);
                $scope.wishData = wishList;
                var title_maxlength = 35;
                $scope.totalPay = 0.0;
                for (var i = 0; i < $scope.wishData.length; i++) {
                    $scope.wishData[i].title['shortenData'] = $scope.wishData[i].title['shortenData'] = $scope.wishData[i].title[0].substring(0, title_maxlength) + "...";
                    $scope.totalPay += parseFloat($scope.wishData[i].sellingStatus[0].currentPrice[0].__value__);
                    $scope.totalPay = Number(Math.round($scope.totalPay + 'e' + 2) + 'e-' + 2);

                    console.log(wishList, "here", $scope.totalPay);
                }
            }
        }

        $scope.goToDetails = (x) => {
            item = $scope.detail_prev_data;
            console.log('gotoDetails,', item);
            $scope.ToshowDetails(item, x);
        }

        $scope.ToshowDetails = (item, x) => {
            console.log('item', item);
            $scope.showResults = false;
            $scope.showWish = false;
            $scope.showDetails = true;
            $scope.detail_prev_data = item;
            $scope.PROCESSING = true;
            console.log('herre is detail prev data', $scope.detail_prev_data);
            if (x == 0) $scope.previous = 0;
            else $scope.previous = 1;

            $scope.changeHighLightStyle(item);


            var ebaySearchURL = MY_SERVER_URL;
            ebaySearchURL += "itemID=" + item.itemId;

            //changed at the end!!!!!!!!!!!1

            $http({
                method: 'GET',
                url: ebaySearchURL
            }).then(function sucesscb(res) {
                $scope.PROCESSING = false;
                var searchData = res.data;
                $scope.detailsData = searchData;
                console.log('detailsData:, ', $scope.detailsData);
                $scope.previousDetail = $scope.detailsData;
                console.log($scope.detail_prev_data.isWish);
                if ($scope.detail_prev_data.isWish) {
                    $scope.detail_prev_data.addOrRemove = 'remove_shopping_cart';
                } else {
                    $scope.detail_prev_data.addOrRemove = 'add_shopping_cart';
                }
                $scope.fburl = 'https://www.facebook.com/sharer/sharer.php?u=' + $scope.detailsData.Item.ViewItemURLForNaturalSearch +
                    "&quote=Buy " + $scope.detail_prev_data.title[0] + " at " + $scope.detail_prev_data.sellingStatus[0].currentPrice[0].__value__ + " from " + $scope.detail_prev_data.viewItemURL[0] + " below.";

                $scope.fburl = encodeURI($scope.fburl);

                $scope.details_button = false;
                if ($scope.detailsData.Item.ItemSpecifics != undefined)
                    $scope.valueList = $scope.detailsData.Item.ItemSpecifics.NameValueList;
                console.log('valueList,', $scope.valueList);

                $scope.showProduct();

            }, function errorcb(res) {
                $scope.PROCESSING = false;
                $scope.FAILING = true;
            });


        }



        $scope.changeHighLightStyle = (item) => {
            if ($scope.previous == 1) {
                $scope.detailsBtnEnabled1 = false;
                for (var i = 0; i < $scope.wishData.length; i++) {
                    if ($scope.wishData[i].itemId == item.itemId) {
                        console.log('here, check the right highlight');
                        $scope.wishData[i].wish_highlightstyle = 'highlight_style';
                    } else {
                        $scope.wishData[i].wish_highlightstyle = '';
                    }
                }
                for (var i = 0; i < $scope.showingAllData.length; i++) {
                    $scope.showingAllData[i].highlightstyle = '';

                }
            } else {
                $scope.detailsBtnEnabled0 = false;
                for (var i = 0; i < $scope.showingAllData.length; i++) {
                    if ($scope.showingAllData[i].itemId == item.itemId) {
                        console.log('here, check the left highlight', i);
                        $scope.showingAllData[i].highlightstyle = 'highlight_style';
                    } else {
                        $scope.showingAllData[i].highlightstyle = '';
                    }
                }
                for (var i = 0; i < $scope.wishData.length; i++) {
                    $scope.wishData[i].wish_highlightstyle = '';
                }
            }

        }

        $scope.AddOrRemoveFavoriteList = (item) => {
            console.log('add_item', item);
            if (item.isWish == false) {
                item.isWish = true;
                item.addOrRemove = "remove_shopping_cart";
                wishList = JSON.parse(localStorage.getItem("LocalStorageWishList"));
                wishList.push(item);
                wishList[wishList.length - 1].isWish = true;
                // $scope.totalPay += parseFloat(item.sellingStatus[0].currentPrice[0].__value__);
                // $scope.totalPay = Number(Math.round($scope.totalPay+'e'+ 2)+'e-'+ 2);

                console.log(wishList, "here", $scope.totalPay);
                $scope.wishData = wishList;
                localStorage.setItem("LocalStorageWishList", JSON.stringify($scope.wishData));

                if ($scope.detail_prev_data != undefined) {
                    for (var i = 0; i < $scope.wishData.length; i++) {
                        if ($scope.wishData.itemId == $scope.detail_prev_data.itemId) {
                            $scope.wishData[i].wish_highlightstyle = 'highlightstyle';
                        }
                    }
                }

            } else {
                $scope.deleteWish(item);
            }
        }

        $scope.deleteWish = (item) => {
            console.log('item', item);
            wishList = JSON.parse(localStorage.getItem("LocalStorageWishList"));
            console.log(wishList);
            item.isWish = false;
            item.addOrRemove = "add_shopping_cart";

            $scope.totalPay -= parseFloat(item.sellingStatus[0].currentPrice[0].__value__);
            $scope.totalPay = Number(Math.round($scope.totalPay + 'e' + 2) + 'e-' + 2);
            console.log($scope.totalPay);
            var newWishList = new Array();
            for (var i = 0; i < wishList.length; i++) {
                if (wishList[i].itemId[0] != item.itemId[0]) {
                    newWishList.push(wishList[i]);
                }
            }
            wishList = newWishList;
            $scope.wishData = wishList;
            console.log('newwishList', wishList);
            localStorage.setItem("LocalStorageWishList", JSON.stringify(wishList));

            $scope.showRight();

            for (var i = 0; i < $scope.showingAllData.length; i++) {
                if ($scope.showingAllData[i].itemId == item.itemId[0]) {
                    $scope.showingAllData[i].addOrRemove = 'add_shopping_cart';
                }
            }
        }

        $scope.checkWish = (itemId) => {
            for (var i = 0; i < wishList.length; i++) {
                if (wishList[i]['itemId'] == itemId) return true;
            }
            return false;
        }

        $scope.showProduct = () => {
            $scope.show1 = true;
            $scope.show2 = false;
            $scope.show3 = false;
            $scope.show4 = false;
            $scope.show5 = false;
            $scope.product_active = "active";
            $scope.photo_active = "";
            $scope.similar_active = "";
            $scope.seller_active = "";
            $scope.shipping_active = "";

            $('#Product').attr('style', 'color: white; background-color: black');
            $('#Similar').attr('style', 'color: black');
            $('#Photos').attr('style', 'color: black');
            $('#Shipping').attr('style', 'color: black');
            $('#Seller').attr('style', 'color: black');

            console.log('showProduct', $scope.detailsData.Item.PictureURL);
            if ($scope.detailsData.Item.PictureURL.length == 1) {
                $scope.hideImage = true
            } else {
                $scope.hideImage = false;
            }
            $scope.restURL = $scope.detailsData.Item.PictureURL.slice(1, $scope.detailsData.Item.PictureURL.length);
            if ($scope.detailsData.Item.PictureURL[0] == undefined) $scope.hide_image = true;
            if ($scope.detailsData.Item.CurrentPrice.Value == undefined) $scope.hide_price = true;
            if ($scope.detailsData.Item.Location == undefined) $scope.hide_location = true;
            if ($scope.detailsData.Item.ReturnPolicy.ReturnsAccepted == undefined) $scope.hide_return = true;
            if ($scope.detailsData.Item.Subtitle == undefined) $scope.hide_subtitle = true;
            if ($scope.valueList == undefined || $scope.valueList.length == 0) $scope.hide_spec = true;
        }

        $scope.showPhotos = () => {
            $scope.show2 = true;
            $scope.show1 = false;
            $scope.show3 = false;
            $scope.show4 = false;
            $scope.show5 = false;
            $scope.product_active = "";
            $scope.photo_active = "active";
            $scope.similar_active = "";
            $scope.seller_active = "";
            $scope.shipping_active = "";

            $('#Photos').attr('style', 'color: white; background-color: black');
            $('#Product').attr('style', 'color: black');
            $('#Similar').attr('style', 'color: black');
            $('#Shipping').attr('style', 'color: black');
            $('#Seller').attr('style', 'color: black');

            var photoSearchURL = MY_SERVER_URL;
            photoSearchURL += "&title=" + $scope.detailsData.Item.Title;
            $scope.imageURL = [];
            $scope.imageURL1 = [];
            $scope.imageURL2 = [];
            $scope.imageURL3 = [];

            $http({
                method: 'GET',
                url: photoSearchURL
            }).then(function successcb(res) {
                var imageData = res.data.items;
                for (var i = 0; i < imageData.length; i++) {
                    $scope.imageURL.push(imageData[i].link);
                    // console.log($scope.imageURL);
                }
                $scope.createPhotos();
                console.log('???', $scope.imageURL1, $scope.imageURL2, $scope.imageURL3);


            }, function errorcb(response) {
                $scope.PROCESSING = false;
                $scope.FAILING = true;
            })
        }

        $scope.createPhotos = () => {
            var photo_list = $scope.imageURL;
            if (photo_list == undefined || photo_list.length == 0) {
                $scope.NORECORDS = true;
            } else {
                $scope.NORECORDS = false;
                for (var i = 0; i < photo_list.length; i++) {
                    if (i < 3) {
                        $scope.imageURL1.push(photo_list[i]);
                    } else if (i >= 3 && i < 6) {
                        $scope.imageURL2.push(photo_list[i]);
                    } else {
                        $scope.imageURL3.push(photo_list[i]);

                    }
                }
            }
        }


        $scope.showShipping = () => {
            $scope.show1 = false;
            $scope.show2 = false;
            $scope.show3 = true;
            $scope.show4 = false;
            $scope.show5 = false;
            $scope.product_active = "";
            $scope.photo_active = "";
            $scope.similar_active = "";
            $scope.seller_active = "";
            $scope.shipping_active = "active";

            $('#Shipping').attr('style', 'color: white; background-color: black');
            $('#Product').attr('style', 'color: black');
            $('#Photos').attr('style', 'color: black');
            $('#Similar').attr('style', 'color: black');
            $('#Seller').attr('style', 'color: black');

            console.log("detail_prev", $scope.detail_prev_data)
            if ($scope.detail_prev_data.shippingInfo[0].shippingServiceCost[0].__value__ == undefined) {
                $scope.hide_cost = true;
            }
            if ($scope.detail_prev_data.shippingInfo[0].shipToLocations[0]) $scope.hide_shipping_location = true;
            if ($scope.detail_prev_data.shippingInfo[0].handlingTime[0] == undefined) {
                $scope.hide_handling_time = true;
            } else {
                if ($scope.detail_prev_data.shippingInfo[0].handlingTime[0] <= 1) {
                    $scope.final_handlingTime = $scope.detail_prev_data.shippingInfo[0].handlingTime[0] + " Day";
                } else {
                    $scope.final_handlingTime = $scope.detail_prev_data.shippingInfo[0].handlingTime[0] + " Days";
                }
            }

            if ($scope.detail_prev_data.shippingInfo[0].expeditedShipping[0] == undefined) $scope.hide_expedited_shipping = true;
            else {
                if ($scope.detail_prev_data.shippingInfo[0].expeditedShipping[0]) {
                    $scope.style_expedited = "check";
                    $('#expedited').attr('style', 'color: green');
                } else {
                    $scope.style_expedited = "close";
                    $('#expedited').attr('style', 'color: red');

                }

            }

            if ($scope.detail_prev_data.shippingInfo[0].oneDayShippingAvailable[0] == undefined) $scope.hide_oneDay_shipping = true;
            else {
                if ($scope.detail_prev_data.shippingInfo[0].handlingTime[0]) {
                    $scope.style_oneDay = "check";
                    $('#oneDay').attr('style', 'color: green');
                } else {
                    $scope.style_oneDay = "close";
                    $('#oneDay').attr('style', 'color: red');
                }
            }

            if ($scope.detail_prev_data.returnsAccepted[0] == undefined) $scope.hide_return_accepted = true;
            else {
                if ($scope.detail_prev_data.returnsAccepted[0]) {
                    $scope.style_returnAccepted = "check";
                    $('#returnAccepted').attr('style', 'color: green');
                } else {
                    $scope.style_returnAccepted = "close";
                    $('#returnAccepted').attr('style', 'color: red');
                }
            }



        }
        $scope.showSeller = () => {
            $scope.show1 = false;
            $scope.show2 = false;
            $scope.show3 = false;
            $scope.show4 = true;
            $scope.show5 = false;
            $scope.product_active = "";
            $scope.photo_active = "";
            $scope.similar_active = "";
            $scope.seller_active = "active";
            $scope.shipping_active = "";

            $('#Seller').attr('style', 'color: white; background-color: black');
            $('#Product').attr('style', 'color: black');
            $('#Photos').attr('style', 'color: black');
            $('#Shipping').attr('style', 'color: black');
            $('#Similar').attr('style', 'color: black');

            if ($scope.detailsData.Item.Seller.FeedbackScore != undefined) $scope.hide_feedback = false;
            else $scope.hide_feedback = true;
            if ($scope.detailsData.Item.Seller.PositiveFeedbackPercent != undefined) $scope.hide_popularity = false;
            else $scope.hide_popularity = true;
            if ($scope.detailsData.Item.Seller.FeedbackRatingStar != undefined) $scope.hide_star = false;
            else $scope.hide_star = true;

            if ($scope.detailsData.Item.Storefront == undefined) {
                $scope.hide_storeName = true;
                $scope.hide_productplace = true;
            } else {
                if ($scope.detailsData.Item.Storefront.StoreName != undefined) $scope.hide_storeName = false;
                else $scope.hide_storeName = true;
                if ($scope.detailsData.Item.Storefront.StoreURL != undefined) $scope.hide_productplace = false;
                else $scope.hide_productplace = true;
            }

            if ($scope.detailsData.Item.Seller.TopRatedSeller == undefined) $scope.hide_rated = true;
            else {
                if ($scope.detailsData.Item.Seller.TopRatedSeller) {
                    $scope.style_rated = "check";
                    $('#top_rated').attr('style', 'color: green');
                } else {
                    $scope.style_rated = "close";
                    $('#top_rated').attr('style', 'color: red');

                }

            }

            if ($scope.detailsData.Item.Seller.FeedbackScore >= 10000) {
                $scope.style_star = 'stars';
                if ($scope.detailsData.Item.Seller.FeedbackRatingStar) {
                    color = $scope.detailsData.Item.Seller.FeedbackRatingStar;
                    color = color.substring(0, color.length - 8);
                    $("#star").attr('style', 'color:' + color);
                }
            } else {
                $scope.style_star = 'star_border';
                color = $scope.detailsData.Item.Seller.FeedbackRatingStar;
                $("#star").attr('style', 'color:' + color);
            }
        }

        $scope.showSimilar = () => {
            $scope.show1 = false;
            $scope.show2 = false;
            $scope.show3 = false;
            $scope.show4 = false;
            $scope.show5 = true;
            $scope.product_active = "";
            $scope.photo_active = "";
            $scope.similar_active = "active";
            $scope.seller_active = "";
            $scope.shipping_active = "";

            $('#Similar').attr('style', 'color: white; background-color: black');
            $('#Product').attr('style', 'color: black');
            $('#Photos').attr('style', 'color: black');
            $('#Shipping').attr('style', 'color: black');
            $('#Seller').attr('style', 'color: black');

            var getSimilarUrl = MY_SERVER_URL;
            getSimilarUrl += 'itemId=' + $scope.detailsData.Item.ItemID;

            $http({
                method: 'GET',
                url: getSimilarUrl
            }).then(function sucesscb(res) {
                $scope.similarItem = res.data.getSimilarItemsResponse.itemRecommendations.item;
                if ($scope.similarItem == undefined) {
                    $scope.S_NORECORDS = true;
                }
                console.log('similar', $scope.similarItem);
                if ($scope.similarItem.length <= 5){
                    $scope.showMore = false;
                    $scope.showLess = false;
                } else {
                    $scope.showMore = true;
                    $scope.showLess = false;
                }
                
                for (var k = 0; k < $scope.similarItem.length; k++) {
                    $scope.similarItem[k].timeLeft = $scope.similarItem[k].timeLeft.substring($scope.similarItem[k].timeLeft.indexOf('P') + 1, $scope.similarItem[k].timeLeft.indexOf('D'));
                }
                $scope.check_value();

            }, function errorcb(res) {
                $scope.PROCESSING = false;
                $scope.FAILING = true;
            });

        }

        $scope.check_value = () => {
            $scope.similar_cat = document.getElementById('similar_category').value;
            $scope.from_cat = document.getElementById('from_category').value;
            console.log($scope.similar_cat, $scope.from_cat);

            $scope.similarShowingItem = [];
            for (var i = 0; i < $scope.similarItem.length; i++) {
                $scope.similarShowingItem.push($scope.similarItem[i]);
            }

            if ($scope.similar_cat == 'default') {
                $scope.from = true;
                console.log($scope.showMore);
                if ($scope.showMore) {
                    $scope.defaultItem = $scope.similarShowingItem.slice(0, 5);
                } else {
                    $scope.defaultItem = $scope.similarShowingItem;
                }
                $scope.showingItem = $scope.defaultItem;

                console.log($scope.defaultItem);
            } else {
                $scope.from = false;
                if ($scope.similar_cat == 'product_name') {
                    if ($scope.from_cat == "ascending") {
                        $scope.similarShowingItem = $scope.similarShowingItem;
                    } else $scope.similarShowingItem = $scope.similarShowingItem.reverse();
                    $scope.productItem = $scope.similarShowingItem.sort($scope.dynamicSort('title'));
                    if ($scope.showMore) {
                        $scope.productItem = $scope.productItem.slice(0, 5);
                    }

                    $scope.showingItem = $scope.productItem;
                    console.log('sorted', $scope.productItem);

                } else if ($scope.similar_cat == 'price') {

                    buy_value = [];

                    for (var i = 0; i < $scope.similarShowingItem.length; i++) {
                        buy_value.push({
                            value: $scope.similarShowingItem[i].buyItNowPrice.__value__,
                            index: i
                        });
                    }
                    buy_value.sort($scope.dynamicSort('value'));
                    $scope.priceItem = [];
                    for (var j = 0; j < buy_value.length; j++) {
                        $scope.priceItem.push($scope.similarShowingItem[buy_value[j].index]);
                    }
                    if ($scope.from_cat == "ascending") {
                        $scope.priceItem = $scope.priceItem;
                    } else $scope.priceItem = $scope.priceItem.reverse();
                    if ($scope.showMore) {
                        $scope.priceItem = $scope.priceItem.slice(0, 5);
                    }
                    $scope.showingItem = $scope.priceItem;

                    console.log($scope.priceItem);


                } else if ($scope.similar_cat == 'shipping_cost') {

                    shipping_value = [];
                    for (var i = 0; i < $scope.similarShowingItem.length; i++) {
                        shipping_value.push({
                            value: $scope.similarShowingItem[i].shippingCost.__value__,
                            index: i
                        });
                    }
                    shipping_value.sort($scope.dynamicSort('value'));
                    $scope.shippingItem = [];
                    for (var j = 0; j < shipping_value.length; j++) {
                        $scope.shippingItem.push($scope.similarShowingItem[shipping_value[j].index]);
                    }
                    if ($scope.from_cat == "ascending") {
                        $scope.shippingItem = $scope.shippingItem;
                    } else $scope.shippingItem = $scope.shippingItem.reverse();
                    if ($scope.showMore) {
                        $scope.shippingItem = $scope.shippingItem.slice(0, 5);
                    }
                    $scope.showingItem = $scope.shippingItem;
                    console.log($scope.shippingItem);



                } else if ($scope.similar_cat == 'days_left') {

                    days_value = [];
                    for (var i = 0; i < $scope.similarShowingItem.length; i++) {
                        days_value.push({
                            value: parseInt($scope.similarShowingItem[i].timeLeft),
                            index: i
                        });
                    }
                    days_value.sort($scope.dynamicSort('value'));
                    console.log('day,', days_value);

                    $scope.daysItem = [];
                    for (var j = 0; j < days_value.length; j++) {
                        $scope.daysItem.push($scope.similarShowingItem[days_value[j].index]);
                    }
                    if ($scope.from_cat == "ascending") {
                        $scope.daysItem = $scope.daysItem;
                    } else $scope.daysItem = $scope.daysItem.reverse();
                    if ($scope.showMore) {
                        $scope.daysItem = $scope.daysItem.slice(0, 5);
                    }
                    $scope.showingItem = $scope.daysItem;

                    console.log($scope.daysItem);


                }
            }
        }

        $scope.dynamicSort = (property) => {
            var sortOrder = 1;
            if (property[0] === "-") {
                sortOrder = -1;
                property = property.substr(1);
            }
            return (a, b) => {
                var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
                return result * sortOrder;
            }
        }

        $scope.show_More = () => {
            $scope.showMore = false;
            $scope.showLess = true;
            $scope.check_value();
        }


        $scope.show_Less = () => {
            $scope.showMore = true;
            $scope.showLess = false;
            $scope.check_value();
        }


    }]);

})();