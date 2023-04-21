// * BRAND RACE
var jsonObject = null;
$(document).ready(function (){
    // TODO - CUSTOMIZE THE REQUESTS TO FIT YOU CLIENT SIDE FORMS
    function element(id) {
        return document.getElementById(id);
    }
    function resetDiv(id){
        element(id).innerHTML = '';
    }
    function PopulateDiv_POST(JsonObject1){
        if(JsonObject1 == undefined){
            jsonObject = {
                "limit":9
            }
            console.log("Please enter a valid request with at least one parameter");
            alert('Please enter a valid request with at least one parameter');
        }
        else{
            jsonObject = JsonObject1;
        }
        var json = JSON.stringify(jsonObject);
        // console.log(json);
        $.ajax({
            url: "http://localhost/API_MYSQL_DATABSE/php/api.php",
            method: "POST",
            data: json,
            success: function(response) {
                var dataArray = response.data;
                // console.log(dataArray);
                for(let k = 0; k < dataArray.length; k++) {
                    var brandName = dataArray[k].image_name;
                    var carImage = dataArray[k].image_url;
                    // DOM Manipulation
                    element("brands-listing").innerHTML += `<div class="class-brands-listing">
                        <h3 class="brand-name">${brandName}</h3>
                        <img class="brand-image" src=${carImage} alt="Brand Picture"/>
                    </div>`;
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    }
    function PopulateDiv_GET() {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                var brandName = data.image_name;
                var carImage = data.image_url;
                // DOM Manipulation
                element("brands-listing").innerHTML += `<div class="class-brands-listing">
                    <h3 class="brand-name">${brandName}</h3>
                    <img class="brand-image" src=${carImage} alt="Brand Picture"/>
                </div>`;
            }
            else {
                console.log("An Error Occurred: " + xhr.message);
            }
        };
        xhr.open("GET", `http://localhost/API_MYSQL_DATABSE/php/api.php`, true);
        xhr.send();
    }
    // * SENDING A POST REQUEST TO THE API
    $('#send_post_request').click(function (event) {
        event.preventDefault();
        var limitEntered = $('#limit_number').val(); // Make Val();
        if(limitEntered != "" && limitEntered != '' && limitEntered.length != 0){
            jsonObject = {
                "limit":`${limitEntered}`
            }
            try{
                resetDiv("brands-listing");
                PopulateDiv_POST(jsonObject);
            }
            catch(err){
                alert("Please Enter Valid Limit Data, Withing the Range: [1:33]");
                console.log("An Error Occurred: " + err);
            }
        }
    });
    // * SENDING A GET REQUEST TO THE API
    $('#send_get_request').click(function (event) {
        event.preventDefault();
        try{
            resetDiv("brands-listing");
            PopulateDiv_GET();
        }
        catch(err){
            alert("Some Error Occurred");
            console.log("An Error Occurred: " + err);
        }
    });
    // Clear Div
    $('#clear_data').click(function (event) {
        event.preventDefault();
        resetDiv("brands-listing");
        element("limit_number").value = "";
    });
    if(jsonObject === null){
        firstLoad();
    }
    function firstLoad(){
        jsonObject = {
            "limit":"9"
        }
        PopulateDiv_POST(jsonObject);
    }
});