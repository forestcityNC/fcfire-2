var map, ghSearch = [], addrSearch = [];

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
$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});

if ( !("ontouchstart" in window) ) {
  $(document).on("mouseover", ".feature-row", function(e) {
    highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
  });
}

$(document).on("mouseout", ".feature-row", clearHighlight);

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
  map.fitBounds(boroughs.getBounds());
  $(".navbar-collapse.in").collapse("hide");
  return false;
});


$("#list-btn").click(function() {
  animateSidebar();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  animateSidebar();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  animateSidebar();
  return false;
});

function animateSidebar() {
  $("#sidebar").animate({
    width: "toggle"
  }, 350, function() {
    map.invalidateSize();
  });
}

function sizeLayerControl() {
  $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}
function sidebarClick(id) {
  /* If sidebar takes up entire screen, hide it and go to the map */
  if (document.body.clientWidth <= 767) {
    sidebar.hide();
    getViewport();
  }
  map.addLayer(ghLayer);
  var layer = markerClusters.getLayer(id);
  markerClusters.zoomToShowLayer(layer, function() {
    map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 18);
    layer.fire("click");
  });
}

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

/* Basemap Layers */
var ortho2019 = L.tileLayer.wms('https://services.nconemap.gov/secure/services/Imagery/Orthoimagery_2019/ImageServer/WMSServer?', {
      maxZoom: 22,
      layers: '0'
    });

var esritopo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
});

var googleHybrid = L.tileLayer('http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}&s=Ga',{
      maxZoom: 22,
      subdomains:['mt0','mt1','mt2','mt3']
});

/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};

/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 19
});

/* Map Center */
map = L.map("map", {
  zoom: 13,
  center: [35.339744, -81.872195],
  layers: [ortho2019, markerClusters, highlight],
  zoomControl: false,
  attributionControl: false
});

var fireDistrict = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "red",
      fill: false,
      opacity: 1,
      interactive: false
    };
  },
});
$.getJSON("data/fireDistrict.geojson", function (data) {
  fireDistrict.addData(data);
  map.addLayer(fireDistrict);
});

var townLimits = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "green",
      fill: false,
      opacity: 1,
      interactive: false
    };
  },
});
$.getJSON("data/fcLimits.geojson", function (data) {
  townLimits.addData(data);
});

function getZoneColor(zone)
  {
    return zone == 'C-1' ? '#fccde5'
    : zone == 'C-2' ? '#FDB462'
    : zone == 'C-3' ? '#fb8072'
    : zone == 'M-1' ? '#d9d9d9'
    : zone == 'OI' ? '#80b1d3'
    : zone == 'R-6' ? '#ffffb3'
    : zone == 'R-8' ? '#ffed6f'
    : zone == 'R-15' ? '#ccebc5'
    : zone == 'R-20' ? '#b3de69'
    : zone == 'PRD' ? '#bc80bd' : '#fff';
  }


var ETJ = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "none",
      fillOpacity: 0.5,
      fillColor: getZoneColor(feature.properties.BASE_DISTR),
      opacity: 1,
      interactive: true
    };
  },
  onEachFeature: function (feature, layer) {
      layer.bindPopup(feature.properties.BASE_DISTR)
  }
});
$.getJSON("data/fcZoning.geojson", function (data) {
  ETJ.addData(data);
});

function getTravelCost(cost)
  {
    return cost == '2400' ? '#fde725'
    : cost == '4000' ? '#5dc962'
    : cost == '4800' ? '#20908d'
    : cost == '6400' ? '#3a528b'
    : '#fff';
  }

var travelCost = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "none",
      fillOpacity: 0.5,
      fillColor: getTravelCost(feature.properties.cost_level),
      opacity: 1,
      interactive: true
    };
  },
  onEachFeature: function (feature, layer) {
      layer.bindPopup(feature.properties.layer)
  }
});
$.getJSON("data/travelCost.geojson", function (data) {
  travelCost.addData(data);
});

/* Empty layer placeholder to add to layer control for listening when to add/remove groupHomes to markerClusters layer */
var ghLayer = L.geoJson(null);
var groupHomes = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/gh.png",
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.fulladdres,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var dBook = feature.properties.Deed_Book;
      var dPage = feature.properties.Deed_Page;
      var deedLink = "http://cottweb.rutherfordcountync.gov/External/LandRecords/protected/v4/SrchBookPage.aspx?bAutoSearch=true&bk=" + dBook +  "&bks=&pg=" + dPage + "&pgs=&idx=CRP";
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Owner</th><td>" + feature.properties.Property_O + "</td></tr>" + "<tr><th>Zoning</th><td>" + feature.properties.BASE_DISTR + "</td></tr>" + "<tr><th>Closest Group Home</th><td>" + feature.properties.TargetID + "</td></tr>" + "<tr><th>Distance (miles)</th><td>" + feature.properties.Distance + "</td></tr>" + "<tr><th>" +'<a href="'+ deedLink + '" target="_blank">Deed Search</a>' + "</td></tr>" + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.fulladdres);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      $("#groupHomes-table tbody").append('<tr style="cursor: pointer;" onclick="sidebarClick('+L.stamp(layer)+'); return false;"><td class="groupHomes-name">'+layer.feature.properties.fulladdres+'<i class="fa fa-chevron-right pull-right"></td></tr>');
      ghSearch.push({
        name: layer.feature.properties.fulladdres,
        source: "GroupHomes",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/groupHomes.geojson", function (data) {
  groupHomes.addData(data);
  map.addLayer(ghLayer);
});


/* Empty layer placeholder to add to layer control for listening when to add/remove addrs to markerClusters layer */
var addrLayer = L.geoJson(null);
var addrs = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, {
      radius: 4,
      fillColor: "#FFFFFF",
      color: "#000000",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.7,
      title: feature.properties.fulladdres,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var dBook = feature.properties.Deed_Book;
      var dPage = feature.properties.Deed_Page;
      var deedLink = "http://cottweb.rutherfordcountync.gov/External/LandRecords/protected/v4/SrchBookPage.aspx?bAutoSearch=true&bk=" + dBook +  "&bks=&pg=" + dPage + "&pgs=&idx=CRP";
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Owner</th><td>" + feature.properties.Property_O + "</td></tr>" + "<tr><th>Zoning</th><td>" + feature.properties.BASE_DISTR + "</td></tr>" + "<tr><th>Closest Group Home</th><td>" + feature.properties.TargetID + "</td></tr>" + "<tr><th>Distance (miles)</th><td>" + feature.properties.Distance + "</td></tr>" + "<tr><th>" +'<a href="'+ deedLink + '" target="_blank">Deed Search</a>' + "</td></tr>" + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.fulladdres);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      $("#cities-table tbody").append('<tr style="cursor: pointer;" onclick="sidebarClick('+L.stamp(layer)+'); return false;"><td class="cities-name">'+layer.feature.properties.fulladdres+'<i class="fa fa-chevron-right pull-right"></td></tr>');
      addrSearch.push({
        name: layer.feature.properties.fulladdres,
        source: "Addresses",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/addrs.geojson", function (data) {
  addrs.addData(data);
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  if (e.layer === ghLayer) {
    markerClusters.addLayer(groupHomes);
  }
  if (e.layer === addrLayer) {
    markerClusters.addLayer(addrs);
  }
});

map.on("overlayremove", function(e) {
  if (e.layer === ghLayer) {
    markerClusters.removeLayer(groupHomes);
  }
  if (e.layer === addrLayer) {
    markerClusters.removeLayer(addrs);
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
  div.innerHTML = "<span class='hidden-xs'>Developed by <a href='http://townofforestcity.com'>Town of Forest City</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
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
    interactive: false
  },
  icon: "fa fa-location-arrow",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
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

if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
  sidebar.show();
}

var baseLayers = {
  "2019 Imagery": ortho2019,
  "Terrain": esritopo,
  "Imagery with Streets": googleHybrid
};

var groupedOverlays = {
  "Points of Interest": {
    "<img src='assets/img/gh.png' width='16' height='20'>&nbsp;Group Homes": ghLayer,
    "<i class ='fa fa-circle-o'></i>&nbsp;911 Addresses": addrLayer
  },
  "Other": {
    "Fire District": fireDistrict,
    "Town Limits": townLimits,
    "ETJ & Zoning": ETJ,
    "Fire Response": travelCost
  }
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});


/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  $("#loading").hide();

  var groupHomesBH = new Bloodhound({
    name: "GroupHomes",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: ghSearch,
    limit: 10
  });
  var groupHomesList = new List("groupHomes", {valueNames: ["groupHomes-name"]}).sort("groupHomes-name", false);

  var addrBH = new Bloodhound({
    name: "Addresses",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: addrSearch,
    limit: 10
  });
  // var addrList = new List("cities", {valueNames: ["cities-name"]}).sort("cities-name", {order:"asc"});

  groupHomesBH.initialize();
  addrBH.initialize();
  

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  }, {
    name: "GroupHomes",
    displayKey: "name",
    source: groupHomesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/gh.png' width='24' height='28'>&nbsp;GroupHomes</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  }, {
    name: "Addresses",
    displayKey: "name",
    source: addrBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/ls.png' width='24' height='28'>&nbsp;Addresses</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  }).on("typeahead:selected", function (obj, datum) {
    if (datum.source === "GroupHomes") {
      if (!map.hasLayer(ghLayer)) {
        map.addLayer(ghLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "Addresses") {
      if (!map.hasLayer(addrLayer)) {
        map.addLayer(addrLayer);
      }
      map.setView([datum.lat, datum.lng], 19);
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

// Leaflet patch to make layer control scrollable on touch browsers
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
  L.DomEvent
  .disableClickPropagation(container)
  .disableScrollPropagation(container);
} else {
  L.DomEvent.disableClickPropagation(container);
}
