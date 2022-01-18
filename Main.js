const output = document.querySelector("#output");
$("body").on("focus", ".searchTextField", function () {
  $(this).select();
  output.innerHTML = "";
});

//set map options
var myLatLng = { lat: 50.48690456123504, lng: 30.521461232723393 };
var mapOptions = {
  center: myLatLng,
  zoom: 15,
  mapTypeId: google.maps.MapTypeId.ROADMAP,
};

//create map
var map = new google.maps.Map(document.getElementById("googleMap"), mapOptions);

//create a DirectionsService object to use the route method and get a result for our request
var directionsService = new google.maps.DirectionsService();

//create a DirectionsRenderer object which we will use to display the route
var directionsDisplay = new google.maps.DirectionsRenderer({
  preserveViewport: true,
  suppressMarkers: false,
  map: map,
});

//bind the DirectionsRenderer to the map
directionsDisplay.setMap(map);

function centerMap( map ) {

    // Create map boundaries from all map markers.
    var bounds = new google.maps.LatLngBounds();
    map.markers.forEach(function( marker ){
        bounds.extend({
            lat: marker.position.lat(),
            lng: marker.position.lng()
        });
    });

    // Case: Single marker.
    if( map.markers.length == 1 ){
        map.setCenter( bounds.getCenter() );

    // Case: Multiple markers.
    } else{
        map.fitBounds( bounds );
    }
}
function fn(arr, num) {
  return arr.map(function(a) {
    return a % num ? a + num - a % num : a
  })
};
//create autocomplete objects for all inputs

let findDistrictQuery;
function autocompleteInput() {
  var options = {
  fields: ["place_id,formatted_address,geometry,name"],
  types: ["geocode"],
  componentRestrictions: {
    country: "ua",
  },
};

  var inputItems = document.querySelectorAll(".searchTextField");
  inputItems.forEach(function (userItem) {
    var autocomplete = new google.maps.places.Autocomplete(userItem, options);
    autocomplete.bindTo("bounds", map);
    autocomplete.addListener("place_changed", function () {
      var place = autocomplete.getPlace();
      const checkInputTo =userItem;
        console.log("userItem :", userItem);
      userItem = place.formatted_address;
      const latNew = place.geometry.location.lat();
      console.log("latNew :", latNew);
      const lngNew = place.geometry.location.lng();
      console.log("lngNew :", lngNew);
      console.log(`🚀  ~ checkInputTo.id`, checkInputTo.id);
      if (checkInputTo.id === "to"){
      findDistrictQuery = `${latNew},  ${lngNew}`;
      }
      
      console.log("userItem :", userItem);
      console.log(`🚀  ~ findDistrictQuery`, findDistrictQuery);

      calcRoute();
    });
  });
}
google.maps.event.addDomListener(window, "load", autocompleteInput);

  var fromInput = document.getElementById("from");
  var toInput = document.getElementById("to");
function pacSelectFirst(input) {
  // store the original event binding function
  var _addEventListener = input.addEventListener
    ? input.addEventListener
    : input.attachEvent;

  function addEventListenerWrapper(type, listener) {
    // Simulate a 'down arrow' keypress on hitting 'return' when no pac suggestion is selected,
    // and then trigger the original listener.
    if (type == "keydown" || type === "click") {
      console.log("START");
      var orig_listener = listener;
      listener = function (event) {
        var suggestion_selected = $(".pac-item-selected").length > 0;
        if ((event.which == 13 && !suggestion_selected)||(event.which == 9 && !suggestion_selected)) {
          var simulated_downarrow = $.Event("keydown", {
            keyCode: 40,
            which: 40,
          });
          orig_listener.apply(input, [simulated_downarrow]);
          console.log("autocomplete : 1 ");
          console.log("input after Enter press : ", input);
          
        }
        console.log("autocomplete : 2 ");
        orig_listener.apply(input, [event]);
      };
      console.log("autocomplete : 3 ");
    }
    console.log("autocomplete : 4 ");
    _addEventListener.apply(input, [type, listener]);
  }
  console.log("autocomplete : 5 ");
  input.addEventListener = addEventListenerWrapper;
  input.attachEvent = addEventListenerWrapper;
}
pacSelectFirst(fromInput);
pacSelectFirst(toInput);
//define calcRoute function
function calcRoute() {
  //create request
  var request = {
    origin: document.getElementById("from").value,
    destination: document.getElementById("to").value,
    travelMode: google.maps.TravelMode.DRIVING, //WALKING, BYCYCLING, TRANSIT
    unitSystem: google.maps.UnitSystem.METRIC,
    provideRouteAlternatives: true,
    drivingOptions: {
      departureTime: new Date(/* now, or future date */),
      trafficModel: "pessimistic",
    },
    region: "UA",
  };
  console.log("Request.destination after calcRoute : ", request.destination);
  //pass the request to the route method
  directionsService.route(request, function (result, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      //Get distance and time
       
       const distance = Math.round(
        result.routes[0].legs[0].distance.value / 1000
      );
      let Tarif =Math.round(
        300 + distance * 18
      );
      Tarif=fn([Tarif],10)
      
     
      const distance2 =
        Math.round(result.routes[0].legs[0].distance.value / 1000) + 5;
      let Tarif2 = Math.round(distance2 * 40 + 720);
      let Tarif3 = Math.round(distance2 * 60 + 1200);
      async function findDistrict() {
        console.log(findDistrictQuery);

        const query = findDistrictQuery;

        console.log(query);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&addressdetails=4&countrycodes=UA`
        );

        const { display_name, lat, lon, address } = (await response.json())[0];
        console.log(address);
        var arr = ['district', 'borough','shop','amenity','building','neighbourhood','quarter', 'suburb','postcode','residential'];
        hash = {};
    
       arr.forEach(function(itemArray){
       Object.keys(address).some(function(itemObject){
       if (itemArray == itemObject) {
        hash[itemArray] = address[itemObject] 
            }
          });
        });
        console.log("!!!!! HASH!!!!",hash);
       const district = Object.values(hash).join(', ')+", ";
        return district;
        
      }
      findDistrict()
        .then((district) => {
          // got value district
          console.log(district);

          output.innerHTML =
            "<div><b>Адрес доставки : </b>" +
            district  +
            document.getElementById("to").value +
            ". <br /> Растояние <i class='fas fa-road'></i> : " +
            distance +
            " км. <br />Растояние 3,5-12т <i class='fas fa-road'></i> : " +
            distance2 +
            " км. <br />Время пути <i class='fas fa-hourglass-start'></i> : " +
            result.routes[0].legs[0].duration.text +
            "<br /> <br /><b>Тариф до 1,5т <i class='fas fa-dollar-sign'></i> :</b> " +
            new Intl.NumberFormat("ru-RU").format(Tarif) +
            " грн. <b>Экспресс <i class='fas fa-dollar-sign'></i> :</b> " +
          new Intl.NumberFormat("ru-RU").format(Tarif+150)) +
            " грн.<br /> <b>Тариф до 3,5т <i class='fas fa-dollar-sign'></i> :</b> " +
            new Intl.NumberFormat("ru-RU").format(Tarif2) +
            " грн. <b>Экспресс <i class='fas fa-dollar-sign'></i> :</b> " +
            new Intl.NumberFormat("ru-RU").format(Tarif2 + 150) +
            " грн.<br /> <b>Тариф до 12т с манипулятором <i class='fas fa-dollar-sign'></i> :</b> " +
            new Intl.NumberFormat("ru-RU").format(Tarif3) +
            " грн. <b>Экспресс <i class='fas fa-dollar-sign'></i> :</b> " +
            new Intl.NumberFormat("ru-RU").format(Tarif3 + 150) +
            " грн.</div>";
        })
        .catch((e) => {
          // error
          output.innerHTML =
            "<div><b>Адрес доставки : </b>" +
            document.getElementById("to").value +
            ". <br /> Растояние <i class='fas fa-road'></i> : " +
            distance +
            " км. <br />Растояние 3,5-12т <i class='fas fa-road'></i> : " +
            distance2 +
            " км. <br />Время пути <i class='fas fa-hourglass-start'></i> : " +
            result.routes[0].legs[0].duration.text +
            "<br /> <br /><b>Тариф до 1,5т <i class='fas fa-dollar-sign'></i> :</b> " +
            new Intl.NumberFormat("ru-RU").format(Tarif) +
            " грн. <b>Экспресс <i class='fas fa-dollar-sign'></i> :</b> " +
            new Intl.NumberFormat("ru-RU").format(Tarif + 150) +
            " грн.<br /> <b>Тариф до 3,5т <i class='fas fa-dollar-sign'></i> :</b> " +
            new Intl.NumberFormat("ru-RU").format(Tarif2) +
            " грн. <b>Экспресс <i class='fas fa-dollar-sign'></i> :</b> " +
            new Intl.NumberFormat("ru-RU").format(Tarif2 + 150) +
            " грн.<br /> <b>Тариф до 12т с манипулятором <i class='fas fa-dollar-sign'></i> :</b> " +
            new Intl.NumberFormat("ru-RU").format(Tarif3) +
            " грн. <b>Экспресс <i class='fas fa-dollar-sign'></i> :</b> " +
            new Intl.NumberFormat("ru-RU").format(Tarif3 + 150) +
            " грн.</div>";
        });
      //display route
      console.log(result);
      directionsDisplay.setDirections(result);
      map.fitBounds(directionsDisplay.getDirections().routes[0].bounds);
      

    } else {
      //delete route from map
      directionsDisplay.setDirections({ routes: [] });
      //center map
      //map.setCenter(myLatLng);

      //show error message
      output.innerHTML =
        "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i> Не удалось получить расстояние за рулем.</div>";
    }
  });
}

const voiceTriggerOrigin = document.querySelector(".voiceSearchButtonOrigin");
const searchFormOrigin = document.querySelector(".origin");
const searchInputOrigin = document.querySelector(".inputOrigin");

const voiceTriggerDestination = document.querySelector(
  ".voiceSearchButtonDestination"
);
const searchFormDestination = document.querySelector(".destination");
const searchInputDestination = document.querySelector(".inputDestination");

function speechRecognitionForInput(voiceTrigger, searchInput) {
  window.SpeechRecognition = window.webkitSpeechRecognition;

  if (window.SpeechRecognition) {
    let speechRecognition = new SpeechRecognition();

    let speechRecognitionActive;

    speechRecognition.onstart = () => {
      searchInput.placeholder = "Говорите...";
      searchInput.value = "";
      voiceTrigger.classList.add("voiceSearchButtonAnimate");
      speechRecognitionActive = true;
    };
    speechRecognition.onerror = () => {
      searchInput.placeholder = "Error...";
      speechRecognitionActive = false;
      voiceTrigger.classList.remove("voiceSearchButtonAnimate");
      console.log("Speech Recognition Error");
    };
    speechRecognition.onend = () => {
      searchInput.placeholder = "Адрес доставки";
      speechRecognitionActive = false;
      voiceTrigger.classList.remove("voiceSearchButtonAnimate");
      console.log("Speech Recognition Ended");
    };

    speechRecognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const final_transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          let mobileRepeatBug =
            i == 1 && final_transcript == event.results[0][0].transcript;
          if (!mobileRepeatBug) {
            searchInput.value = final_transcript;
            searchInput.focus();
          }
        }
      }
    };

    voiceTrigger.onclick = () => {
      if (speechRecognitionActive) {
        speechRecognition.stop();
      } else {
        speechRecognition.start();
      }
    };
  } else {
    alert("Speech Recognition Not Available ");
  }
}
speechRecognitionForInput(voiceTriggerOrigin, searchInputOrigin);
speechRecognitionForInput(voiceTriggerDestination, searchInputDestination);
