var map, trailHeadsSearch = [], citiesSearch = [];

$(document).ready(function() {
  getViewport();
});

function getViewport() {
  if (sidebar.isVisible()) {
    map.setActiveArea({
      position: "absolute",
      top: "0px",
      left: $(".leaflet-sidebar").css("width"),
      right: "0px",
      height: $("#map").css("height")
    });
  } else {
    map.setActiveArea({
      position: "absolute",
      top: "0px",
      left: "0px",
      right: "0px",
      height: $("#map").css("height")
    });
  }
  if (document.body.clientWidth <= 767) {
    $(".leaflet-sidebar .close").css("top", "8px");
  } else {
    $(".leaflet-sidebar .close").css("top", "15px");
  }
}

function sidebarClick(id) {
  /* If sidebar takes up entire screen, hide it and go to the map */
  if (document.body.clientWidth <= 767) {
    sidebar.hide();
    getViewport();
  }
  map.addLayer(trailHeadsLayer).addLayer(citiesLayer);
  var layer = markerClusters.getLayer(id);
  markerClusters.zoomToShowLayer(layer, function() {
    map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 18);
    layer.fire("click");
  });
}

/* Basemap Layers */
// https://a.tiles.mapbox.com/v4/maptastik.j354k5k8/page.html?access_token=pk.eyJ1IjoibWFwdGFzdGlrIiwiYSI6IjNPMkREV1kifQ.2KGPFZD0QaGfvYzXYotTXQ#15/38.2082/-84.5610
var mbSTD = L.tileLayer("https://c.tiles.mapbox.com/v3/maptastik.j354k5k8/{z}/{x}/{y}.png", {
  minZoom: 10,
  maxZoom: 16,
  // subdomains: ["a", "b", "c"],
  attribution: 'Map tiles and data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
});
var stamenTER = L.tileLayer("http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg", {
  minZoom: 10,
  maxZoom: 16,
  // subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
});
var mapquestHYB = L.layerGroup([L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  minZoom: 10,
  maxZoom: 16,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"]
}), L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png", {
  minZoom: 11,
  maxZoom: 16,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Labels courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
})]);

var scottCo = L.geoJson(null, {
  style: function(feature) {
    return {
      color: "#454545",
      weight: 2,
      opacity: 1,
      fillColor: "#fff",
      fillOpacity: 0,
      clickable: false
    };
  },
});
$.getJSON("data/scottCo.geojson", function (data) {
  scottCo.addData(data);
});


/* Overlay Layers */
var highlight = L.geoJson(null);

// Add Hike layer
var hike = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "#ff5500",
      weight: 4,
      opacity: 1,
      clickable: false
    };
  },
});
$.getJSON("data/hike.geojson", function (data) {
  hike.addData(data);
});

// Add Bike layer
var bike = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "#FFAA00",
      weight: 4,
      opacity: 1,
      clickable: false
    };
  },
});
$.getJSON("data/bike.geojson", function (data) {
  bike.addData(data);
});

// Add Horse layer
var horse = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "#55FA00",
      weight: 4,
      opacity: 1,
      clickable: false
    };
  },
});
$.getJSON("data/horse.geojson", function (data) {
  horse.addData(data);
});

// Add Multi layer
var multi = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "#FF00C5",
      weight: 4,
      opacity: 1,
      clickable: false
    };
  },
});
$.getJSON("data/multi.geojson", function (data) {
  multi.addData(data);
});

// Add Blueway layer
var blueway = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "#005CE6",
      weight: 4,
      opacity: 1,
      clickable: false
    };
  },
});
$.getJSON("data/blueway.geojson", function (data) {
  blueway.addData(data);
});

// Add Legacy Trail Layer
var legacy = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "#A900E6",
      weight: 4,
      opacity: 1,
      clickable: false
    };
  },
});
$.getJSON("data/legacy.geojson", function (data) {
  legacy.addData(data);
});

/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16
});

/* Empty layer placeholder to add to layer control for listening when to add/remove trailHead to markerClusters layer NOT SURE I NEED THIS */
var trailHeadsLayer = L.geoJson(null);
var trailHeads = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/trailHead-icon-12.svg",
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.Trail_Head,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.Trail_Head + "</td></tr><table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.Trail_Head);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            stroke: false,
            fillColor: "#00FFFF",
            fillOpacity: 0.7,
            radius: 10
          }));
        }
      });
      $("#trailHeads-table tbody").append('<tr style="cursor: pointer;" onclick="sidebarClick('+L.stamp(layer)+'); return false;"><td class="trailHeads-name">'+layer.feature.properties.Trail_Head+'<i class="fa fa-chevron-right pull-right"></td></tr>');
      trailHeadsSearch.push({
        name: layer.feature.properties.Trail_Head,
        source: "Heads",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/trailHeads.geojson", function (data) {
  trailHeads.addData(data);
  map.addLayer(trailHeadsLayer);
});

/* Empty layer placeholder to add to layer control for listening when to add/remove cities to markerClusters layer */
var citiesLayer = L.geoJson(null);
var cities = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/circle-12.svg",

        iconSize: [18, 18],
        iconAnchor: [9, 9],

        popupAnchor: [0, 0]
      }),
      title: feature.properties.NAME,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.NAME + "</td></tr>" + "<tr><th>Phone</th><td>" + feature.properties.TEL + "</td></tr>" + "<tr><th>Address</th><td>" + feature.properties.ADRESS1 + "</td></tr>" + "<tr><th>Website</th><td><a class='url-break' href='" + feature.properties.URL + "' target='_blank'>" + feature.properties.URL + "</a></td></tr>" + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.NAME);
          $("#feature-info").html(content);

          // $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            stroke: false,
            fillColor: "#00FFFF",
            fillOpacity: 0.7,
            radius: 10
          }));
        }
      });
      $("#cities-table tbody").append('<tr style="cursor: pointer;" onclick="sidebarClick('+L.stamp(layer)+'); return false;"><td class="cities-name">'+layer.feature.properties.NAME+'<i class="fa fa-chevron-right pull-right"></td></tr>');
      citiesSearch.push({
        name: layer.feature.properties.NAME,
        address: layer.feature.properties.ADRESS1,
        source: "Cities",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/scottCities-pt.geojson", function (data) {
  cities.addData(data);
  map.addLayer(citiesLayer);
});

map = L.map("map", {
  zoom: 11,
  center: [38.2926,-84.5769],
  layers: [mbSTD, scottCo, hike, bike, horse, multi, blueway, legacy, markerClusters, highlight],
  zoomControl: false,
  attributionControl: false
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  if (e.layer === trailHeadsLayer) {
    markerClusters.addLayer(trailHeads);
  }
  if (e.layer === citiesLayer) {
    markerClusters.addLayer(cities);
  }
});

map.on("overlayremove", function(e) {
  if (e.layer === trailHeadsLayer) {
    markerClusters.removeLayer(trailHeads);
  }
  if (e.layer === citiesLayer) {
    markerClusters.removeLayer(cities);
  }
});

/* Clear feature highlight when featureModal is closed */
$("#featureModal").on("hide.bs.modal", function (e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "Developed by <a href='http://www.gscplanning.com/gis.htm'>Georgetown Scott County Planning Commission GIS</a> | <a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "icon-direction",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 17,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

var sidebar = L.control.sidebar("sidebar", {
  closeButton: true,
  position: "left"
}).on("shown", function () {
  getViewport();
}).on("hidden", function () {
  getViewport();
}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
  sidebar.show();
}

var baseLayers = {
  "Street Map": mbSTD,
  "Terrain": stamenTER,
  "Imagery with Streets": mapquestHYB
};

var groupedOverlays = {
  "Points of Interest": {
    "<img src='assets/img/trailHead-icon-12.svg' width='24' height='28'>&nbsp;Trail Heads": trailHeadsLayer,
    "<img src='assets/img/circle-12.svg' width='18' height='18'>&nbsp;Cities": citiesLayer
  },
  "Trails": {
    "Hike": hike,
    "Bike": bike,
    "Horseback": horse,
    "Multi-Use": multi,
    "Blueway": blueway,
    "Legacy Trail": legacy
  }
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  /* Fit map to hike bounds */
  // map.fitBounds(hike.getBounds());
  $("#loading").hide();

  var trailHeadsBH = new Bloodhound({
    name: "Heads",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: trailHeadsSearch,
    limit: 10
  });
  var trailHeadsList = new List("trailHeads", {valueNames: ["trailHeads-name"]}).sort("trailHeads-name", false);

  var citiesBH = new Bloodhound({
    name: "Cities",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: citiesSearch,
    limit: 10
  });
  var citiesList = new List("cities", {valueNames: ["cities-name"]}).sort("cities-name", {order:"asc"});

  trailHeadsBH.initialize();
  citiesBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  }, {
    name: "Heads",
    displayKey: "name",
    source: trailHeadsBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/trailHead-icon-12.svg' width='24' height='28'>&nbsp;Heads</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  }, {
    name: "Cities",
    displayKey: "name",
    source: citiesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/circle-12.svg' width='18' height='18'>&nbsp;Cities</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  }).on("typeahead:selected", function (obj, datum) {
    if (datum.source === "Heads") {
      if (!map.hasLayer(trailHeadsLayer)) {
        map.addLayer(trailHeadsLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "Cities") {
      if (!map.hasLayer(citiesLayer)) {
        map.addLayer(citiesLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function () {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");
});

/* Placeholder hack for IE */
if (navigator.appName == "Microsoft Internet Explorer") {
  $("input").each(function () {
    if ($(this).val() === "" && $(this).attr("placeholder") !== "") {
      $(this).val($(this).attr("placeholder"));
      $(this).focus(function () {
        if ($(this).val() === $(this).attr("placeholder")) $(this).val("");
      });
      $(this).blur(function () {
        if ($(this).val() === "") $(this).val($(this).attr("placeholder"));
      });
    }
  });
}
// blank