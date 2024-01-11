var toolsEl = document.getElementById('tools');
var cameras = [];
var currentCam = null;

Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
}

/**
 * Build the coords for a polygon
 */
function buildPolyCoords(latlng, facingAngle, spanAngle, distMetres) {
    var pt1 = L.GeometryUtil.destination(latlng, facingAngle - (spanAngle / 2.0), distMetres);
    var pt2 = L.GeometryUtil.destination(latlng, facingAngle - (spanAngle / 4.0), distMetres);
    var pt3 = L.GeometryUtil.destination(latlng, facingAngle, distMetres);
    var pt4 = L.GeometryUtil.destination(latlng, facingAngle + (spanAngle / 4.0), distMetres);
    var pt5 = L.GeometryUtil.destination(latlng, facingAngle + (spanAngle / 2.0), distMetres);
    return [
        [latlng.lat, latlng.lng],
        [pt1.lat, pt1.lng],
        [pt2.lat, pt2.lng],
        [pt3.lat, pt3.lng],
        [pt4.lat, pt4.lng],
        [pt5.lat, pt5.lng],
    ];
}

/**
 * Add a camera at a given coordinate
 */
function addCamera(latlng) {
    var cam = {
        position: latlng,
        angle: 0,
        sensorSize: 6.43,   // mm diagional = 1/2.8"
        focalLength: 2.8,   // mm
        range: 30,          // metres
    };

    cam.fov = calcFov(cam.sensorSize, cam.focalLength);

    var coords = buildPolyCoords(cam.position, cam.angle, cam.fov, cam.range);
    var ndPolygon = L.polygon(coords).addTo(map);

    var ndCentre = L.circle([cam.position.lat, cam.position.lng], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 0.5
    }).addTo(map);

    ndPolygon.on('click', function(e) { L.DomEvent.stopPropagation(e); setCurrent(cam) });

    cam.ndPolygon = ndPolygon;
    cam.ndCentre = ndCentre;
    cameras.push(cam);

    setCurrent(cam);
}

function calcFov(sensorSize, focalLength) {
    return Math.degrees(2 * Math.atan(sensorSize / (2.0 * focalLength)));
}

/**
 * Set the current camera in the tools panel
 */
function setCurrent(cam) {
    toolsEl.innerHTML = `
        ${cam.position.lat}<br>${cam.position.lng}
        <br>
        Angle: <input type="range" min="-360" max="360" id="fld-angle" value="${cam.angle}"> degrees
        <br>
        <br>Sensor: ${cam.sensorSize}mm
        <br>Focal Len: ${cam.focalLength}mm
        <br>
        <br>Range: <input type="range" min="1" max="100" id="fld-range" value="${cam.range}"> meters
        <br>FOV: <input type="range" min="1" max="359" id="fld-fov" value="${cam.fov}"> degrees
    `;

    document.getElementById('fld-angle').addEventListener('input', (e) => { cam.angle = parseFloat(e.target.value); renderCam(cam) });
    document.getElementById('fld-range').addEventListener('input', (e) => { cam.range = parseFloat(e.target.value); renderCam(cam) });
    document.getElementById('fld-fov').addEventListener('input', (e) => { cam.fov = parseFloat(e.target.value); renderCam(cam) });

    currentCam = cam;
}

function renderCam(cam) {
    var coords = buildPolyCoords(cam.position, cam.angle, cam.fov, cam.range);
    cam.ndPolygon.setLatLngs(coords);
}


function startMapCoords() {
    var urlParams = new URLSearchParams(window.location.search);
    var lat = urlParams.get('lat');
    var lng = urlParams.get('lng');
    var z = urlParams.get('z');
    if (lat && lng && z) {
        return [lat, lng, z];
    } else {
        return [-34.9285, 138.6007, 12];
    }
}

function setUrlCoords(map) {
    var urlParams = new URLSearchParams(location.search);
    urlParams.set('lat', map.getCenter().lat);
    urlParams.set('lng', map.getCenter().lng);
    urlParams.set('z', map.getZoom());
    var newUrl = location.protocol + "//" + location.host + location.pathname + '?' + urlParams.toString();
    history.replaceState(null, '', newUrl);
}


function init() {
    // OpenStreetMap
    var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    // Google Satellite
    var sat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3'],
        attribution: '&copy; Google'
    });

    var coords = startMapCoords();
    var map = L.map('map', {
        center: [coords[0], coords[1]],
        zoom: coords[2],
        layers: [osm]
    });

    L.control.layers({
        "OpenStreetMap": osm,
        "Google Satellite": sat,
    }, {}).addTo(map);

    map.on('click', (e) => addCamera(e.latlng));
    map.on('moveend', (e) => setUrlCoords(map));

    window.map = map;
}


init();
