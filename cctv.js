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
        sensorSize: 6.4,    // mm diagional = 1/2.8"
        focalLength: 2.8,   // mm
        range: 30,          // metres
    };

    cam.fov = Math.degrees(2 * Math.atan(cam.sensorSize / (2.0 * cam.focalLength)));

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

/**
 * Set the current camera in the tools panel
 */
function setCurrent(cam) {
    toolsEl.innerHTML = `
        ${cam.position.lat}<br>${cam.position.lng}
        <br>
        Angle: <input type="range" min="1" max="359" id="fld-angle" value="${cam.angle}"> degrees
        <br>
        <br>Sensor: ${cam.sensorSize}mm
        <br>Focal Len: ${cam.focalLength}mm
        <br>
        <br>Range: <input type="range" min="1" max="100" id="fld-range" value="${cam.range}"> meters
        <br>FOV: <input type="range" min="1" max="359" id="fld-fov" value="${cam.fov}"> degrees
    `;

    document.getElementById('fld-angle').addEventListener('change', (e) => { cam.angle = parseFloat(e.target.value); renderCam(cam) });
    document.getElementById('fld-range').addEventListener('change', (e) => { cam.range = parseFloat(e.target.value); renderCam(cam) });
    document.getElementById('fld-fov').addEventListener('change', (e) => { cam.fov = parseFloat(e.target.value); renderCam(cam) });

    currentCam = cam;
}

function renderCam(cam) {
    console.log(cam);
    var coords = buildPolyCoords(cam.position, cam.angle, cam.fov, cam.range);
    cam.ndPolygon.setLatLngs(coords);
}


var map = L.map('map').setView([-31.96173, 141.45998], 17);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

map.on('click', (e) => addCamera(e.latlng));
