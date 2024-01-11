var map = L.map('map').setView([-31.96173, 141.45998], 17);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

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
    var sensorSize = 6.4;    // mm diagional = 1/2.8"
    var focalLength = 2.8;   // mm
    var fov = Math.degrees(2 * Math.atan(sensorSize / (2.0 * focalLength)));
    var range = 30;          // metres

    var coords = buildPolyCoords(latlng, 0, fov, range);
    var polygon = L.polygon(coords).addTo(map);

    var circle = L.circle([latlng.lat, latlng.lng], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 0.5
    }).addTo(map);
}

map.on('click', (e) => addCamera(e.latlng));
