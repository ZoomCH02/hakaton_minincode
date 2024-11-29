//---------------------Piter section--------------------


const drawVector = new ol.layer.Vector({
    source: new ol.source.Vector({ wrapX: false }),
    style: {
        'circle-radius': 9,
        'circle-fill-color': 'red',
    },
});
var mymap = new ol.Map({
    target: 'mymap',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        }),
        drawVector
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([42, 56]),
        zoom: 6
    })
});



mymap.on('click', function (evt) {
    var coords = ol.proj.toLonLat(evt.coordinate);
    var lat = coords[1];
    var lon = coords[0];

    var inpLat = document.getElementById("lat")
    var inpLon = document.getElementById("lon")
    inpLat.value = lat
    inpLon.value = lon
    var feature = mymap.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature;
    });

    if (feature) {
        // Действия при нажатии на маркер
        console.log(feature.get("name"));
    } else {
        point = new ol.geom.Point(evt.coordinate);
        marker = new ol.Feature({
            type: "marker",
            geometry: point,
        });
        drawVector.getSource().clear()
        drawVector.getSource().addFeature(marker);
    }
});

function sendBid() {
    var inpLat = document.getElementById("lat");
    var inpLon = document.getElementById("lon");
    var name = document.getElementById('name');
    var categorNew = document.getElementById("categorNew");
    var subject = document.getElementById('subject');
    var neworgImg = document.getElementById('neworgImg');

    if (!inpLat.value || !inpLon.value || !name.value || !categorNew.value || !subject.value || !neworgImg.value) {
        return alert("Заполните все поля");
    }

    var data = {
        name: name.value,
        description: subject.value,
        category: categorNew.value,
        latetude: inpLat.value,
        longetude: inpLon.value,
        img: neworgImg.value
    };

    fetch("/api/admin/createOrg", {
        method: "POST",
        credentials: "same-origin", // Для того чтобы использовать сессии
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    })
        .then((response) => response.json())
        .then((data) => {
            // Проверяем, что ответ от сервера имеет статус "OK"
            if (data) {
                if (data.status === "OK") {
                    alert("Запрос успешно добавлен и ожидает модерации");
                } else if (data.message === "У вас уже есть привязанная организация") {
                    alert("Ошибка: У вас уже есть привязанная организация");
                } else if (data.message === "auth plz") {
                    alert("Ошибка: Войдите в аккаунт");
                } else {
                    alert("Ошибка данных или сервера");
                }
            } else {
                console.warn("Неизвестный ответ от сервера");
            }
        })
        .catch((error) => {
            console.error("Ошибка загрузки данных пользователя:", error);
            // Можно добавить отображение ошибки на странице
            alert("Ошибка соединения с сервером");
        });
}
