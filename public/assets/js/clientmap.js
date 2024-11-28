let map; // Карта
let placemarks = []; // Массив меток
let organizations = []; // Данные из JSON

// Инициализация карты
ymaps.ready(init);

function init() {
  map = new ymaps.Map("map", {
    center: [56.18, 43.52],
    zoom: 10,
    controls: ["zoomControl", "typeSelector", "fullscreenControl"],
  });

  // Загрузка данных
  fetch("/api/organizations")
    .then((response) => response.json())
    .then((data) => {
      organizations = data.organizations;
      renderPlacemarks(organizations); // Отрисовка всех меток
    })
    .catch((error) => console.error("Ошибка загрузки JSON:", error));

  // Обработчики событий для поиска и фильтра
  document
    .getElementById("search-input")
    .addEventListener("input", filterAndSearch);
  document
    .getElementById("category-filter")
    .addEventListener("change", filterAndSearch);
}

// Функция для отрисовки меток
function renderPlacemarks(data) {
  // Удаляем старые метки
  placemarks.forEach((placemark) => map.geoObjects.remove(placemark));
  placemarks = [];

  // Добавляем новые метки
  data.forEach((item) => {
    const placemark = new ymaps.Placemark(
      [parseFloat(item.latetude), parseFloat(item.longetude)],
      {
        balloonContentHeader: item.name,
        balloonContentBody: `<p>${item.description}</p><p>${item.address}</p>`,
        balloonContentFooter: `<img src="${item.img}" alt="${item.name}" width="150">`,
      },
      {
        preset: "islands#dotIcon",
        iconColor: "#0099FF",
      }
    );

    placemarks.push(placemark);
    map.geoObjects.add(placemark);
  });
}

// Функция для фильтрации и поиска
function filterAndSearch() {
  const searchQuery = document
    .getElementById("search-input")
    .value.toLowerCase();
  const selectedCategory = document.getElementById("category-filter").value;

  // Фильтруем по названию и категории
  const filteredData = organizations.filter((org) => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery);
    const matchesCategory =
      selectedCategory === "all" || org.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  renderPlacemarks(filteredData);
}
