mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10', 
    center: c1.geometry.coordinates, 
    zoom: 10 
});
map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
    .setLngLat(c1.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${c1.title}</h3><p>${c1.location}</p>`
            )
    )
    .addTo(map)
