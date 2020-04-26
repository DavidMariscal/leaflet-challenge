// MAPBOX 23 Abril 2020

// Store our API endpoint inside queryUrl

var queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson';

var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  var earthquakes = L.geoJson(earthquakeData, {
    onEachFeature: function (feature, layer){
      layer.bindPopup("<h5>" + feature.properties.place + "<br> Magnitude: " + feature.properties.mag +
      "</h5><p>" + new Date(feature.properties.time) + "</p>");
    },
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: getRadius(feature.properties.mag),
          fillColor: getColor(feature.properties.mag),
          color: "#000",
          weight: .5,
          fillOpacity: .5,
          stroke: true
      })
    }
  });
  createMap(earthquakes) 
}

function createMap(earthquakes) {

var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiZGF2aWRtYXJpc2NhbCIsImEiOiJjazljeXhsMncwOThvM2xzMGtxM3FpbjFvIn0.Puyk-9DpwtiG-DHzT2ZnDA");
var outdoorMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiZGF2aWRtYXJpc2NhbCIsImEiOiJjazljeXhsMncwOThvM2xzMGtxM3FpbjFvIn0.Puyk-9DpwtiG-DHzT2ZnDA");
var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiZGF2aWRtYXJpc2NhbCIsImEiOiJjazljeXhsMncwOThvM2xzMGtxM3FpbjFvIn0.Puyk-9DpwtiG-DHzT2ZnDA");


  // Options that users can select
  var baseMaps = {
    "Satellite Map": satelliteMap,
    "Outdoor Map": outdoorMap,
    "Light Map": lightMap
  };


  // Tectonic layer
  var tectonicPlates = new L.LayerGroup();

  // Overlay layer
  var overlayMaps = {
      "Earthquakes": earthquakes,
      "Tectonic Plates": tectonicPlates
  };

  // Create the map
  var myMap = L.map("map", {
      center: [40.7, -94.5],
      zoom: 3,
      layers: [lightMap, earthquakes, tectonicPlates]
  });

  // Add tectonic plates 
  d3.json(tectonicPlatesURL, function(tectonicData) {
      L.geoJson(tectonicData, {
          color: "yellow",
          weight: 2
      })
      .addTo(tectonicPlates);
  });

  //Add layer control to map
  L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
  }).addTo(myMap);

  
  var legend = L.control({
      position: "bottomright"
  });

  legend.onAdd = function(myMap) {
      var div = L.DomUtil.create("div", "info legend"),
      grades = [0, 1, 2, 3, 4, 5],
      labels = [];

  // Create legend
  for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
          '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }
  return div;
  };
  legend.addTo(myMap);
}

// Create color function
function getColor(magnitude) {
  if (magnitude > 5) {
      return 'red'
  } else if (magnitude > 4) {
      return 'orange'
  } else if (magnitude > 3) {
      return 'yellow'
  } else if (magnitude > 2) {
      return 'lightgreen'
  } else if (magnitude > 1) {
      return 'green'
  } else {
      return '#58C9CB'
  }
};

//Create radius function
function getRadius(magnitude) {
  return magnitude * 25000;
};
