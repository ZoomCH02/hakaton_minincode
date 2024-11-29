// Функция для выхода из аккаунта
function logout() {
  fetch("/api/logout", {
    method: "POST",
    credentials: "same-origin", // Обеспечивает отправку cookies с запросом
  })
    .then(response => response.json())
    .then(data => {
      if (data.message === "Выход успешен") {
        alert("Вы успешно вышли из системы!");
        window.location.href = "/login.html"; // Перенаправляем на страницу входа
      } else {
        alert("Ошибка при выходе: " + data.message);
      }
    })
    .catch(error => {
      console.error("Ошибка при запросе на сервер:", error);
      alert("Ошибка при выходе из системы");
    });
}


function get(url, cb) {
  fetch(url, {
    method: "GET",
    credentials: "same-origin", // Для того чтобы использовать сессии
  })
    .then((response) => response.json())
    .then((data) => {
      // Если запрос успешен, отображаем данные о пользователе
      if (data) {
        if (data.message) {
          if (data.message = "auth plz") {
            window.location.replace("/login.html")
          }
        }
        cb(data)
      } else {
        console.warn("free response")
      }
    })
    .catch((error) => {
      console.error("Ошибка загрузки данных пользователя:", error);
      // Можно добавить отображение ошибки на странице
    });
}



function post(url, data, cb) {
  fetch(url, {
    method: "POST",
    credentials: "same-origin", // Для того чтобы использовать сессии
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(data)
  })
    .then((response) => response.json())
    .then((data) => {
      // Если запрос успешен, отображаем данные о пользователе
      if (data) {
        cb(data)
      } else {
        console.warn("free response")
      }
    })
    .catch((error) => {
      console.error("Ошибка загрузки данных пользователя:", error);
      // Можно добавить отображение ошибки на странице
    });
}


function renderStat() {
  root = document.getElementById("root");

  root.innerHTML = `
      <main class="col-md-9 ml-sm-auto col-lg-10 px-md-4 py-4">

        <h1 class="h2" align='center'></h1>

        <div class="card">
          <h5 class="card-header">Статистика</h5>
          <div class="card-body">
          <h5 class="card-title"></h5>
            <p class="card-text">
            <div style="display:flex;">
            <canvas style="width:100%;max-width:500px" id="myChart1"></canvas>
            <canvas style="width:100%;max-width:500px" id="myChart2"></canvas>
            <div>
            </p>
          </div>
        </div>
      </main>
      `;


  get("/api/admin/getStatistic", (data) => {

    var arr1 = []
    var arr1l = []
    for (var el in data.dayeEvents) {
      arr1.push(data.dayeEvents[el])
      arr1l.push(el)
    }
    var arr2 = []
    var arr2l = []
    for (var el in data.dayeOrg) {
      arr2.push(data.dayeOrg[el])
      arr2l.push(el)
    }

    const myChart1 = new Chart("myChart1", {
      type: "bar",
      data: {
        labels: arr1l,
        datasets: [{
          label: 'Событий в день',
          backgroundColor: "red",
          data: arr1
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: false,
              max: 8,
              min: 0
            }
          }]
        },
        title: {
          display: true,
          text: ""
        }
      }
    });

    const myChart2 = new Chart("myChart2", {
      type: "bar",
      data: {
        labels: arr2l,
        datasets: [{
          label: 'Создано организаций в день',
          backgroundColor: "red",
          data: arr2
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: false,
              max: 8,
              min: 0
            }
          }]
        },
        title: {
          display: true,
          text: ""
        }
      }
    });
  })


} //getCountOfTickets


function renderAdmin() {
  root = document.getElementById("root");

  root.innerHTML = `
<main class="col-md-9 ml-sm-auto col-lg-10 px-md-4 py-4">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">Модераторы</h5>
      <p class="card-text">
      <table class="table">
        <thead>
          <tr>
            <th scope="col">id</th>
            <th scope="col">login</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody id="moderRoot">
          
        </tbody>
      </table>
      </p>
    </div>
  </div>
</main>

<main class="col-md-9 ml-sm-auto col-lg-10 px-md-4 py-4">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">Свободные пользователи</h5>
      <p class="card-text">
      <table class="table">
        <thead>
          <tr>
            <th scope="col">id</th>
            <th scope="col">login</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody id="studentRoot">
          
        </tbody>
      </table>
      </p>
    </div>
  </div>
</main>
  `
  var moderRoot = document.getElementById("moderRoot")
  get("/api/admin/getModerators", (data) => {
    for (var el of data) {
      moderRoot.innerHTML += `
      <tr id="rowModer${el.id}">
        <th scope="row">${el.id}</th>
        <td>${el.login}</td>
        <td>
          <button type="button" class="btn btn-danger" id="btn${el.id}" onclick="unModer(${el.id})">Разжаловать</button>
        </td>
      </tr>
      `
    }
  })

  var studentRoot = document.getElementById("studentRoot")
  get("/api/admin/getStudents", (data) => {
    for (var el of data) {
      studentRoot.innerHTML += `
      <tr id="rowStudent${el.id}">
        <th scope="row">${el.id}</th>
        <td>${el.login}</td>
        <td>
          <button type="button" class="btn btn-danger" id="btn${el.id}" onclick="addModer(${el.id})">Назначить</button>
        </td>
      </tr>
      `
    }
  })
}


function unModer(id) {
  get("/api/admin/deliteModerator?id=" + id, (data) => {
    if (data.status == "OK") {

      var html = document.getElementById(`rowModer${id}`)
      html.setAttribute("id", "rowStudent" + id)
      document.getElementById("btn" + id).setAttribute("onclick", `addModer(${id})`)
      document.getElementById("btn" + id).innerText = "Назначить"
      var htmlres = html.outerHTML
      html.remove()
      studentRoot.innerHTML += htmlres
    } else {
      alert(data)
    }
  })
}
function addModer(id) {
  get("/api/admin/addModerator?id=" + id, (data) => {
    if (data.status == "OK") {


      var html = document.getElementById(`rowStudent${id}`)
      html.setAttribute("id", "rowModer" + id)

      document.getElementById("btn" + id).setAttribute("onclick", `unModer(${id})`)
      document.getElementById("btn" + id).innerText = "Разжаловать"

      var htmlres = html.outerHTML
      html.remove()
      moderRoot.innerHTML += htmlres


    } else {
      alert(data)
    }
  })
}





function render(url, header, mode, mode_n) {
  root = document.getElementById("root");

  root.innerHTML = `
<main class="col-md-9 ml-sm-auto col-lg-10 px-md-4 py-4">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">${header}</h5>
      <p class="card-text">
      <table class="table">
        <thead>
          <tr>
            <th scope="col">id</th>
            <th scope="col">Название</th>
            <th scope="col">Описание</th>
            <th scope="col">Адрес</th>
            <th scope="col">Телефон</th>
            <th scope="col">Подтвердить</th>
          </tr>
        </thead>
        <tbody id="moderRoot">
          
        </tbody>
      </table>
      </p>
    </div>
  </div>
</main>
      `;

  get(url, (data) => {
    var moderRoot = document.getElementById("moderRoot")
    for (var el of data) {
      moderRoot.innerHTML += `
      <tr onclick="edit(event,this)" data-id="${el.id}" id="rowOrg${el.id}">
        <th data-cal="id" scope="row">${el.id}</th>
        <td data-cal="name">${el.name}</td>
        <td data-cal="description">${el.description}</td>
        <td data-cal="address">${el.address}</td>
        <td data-cal="contact_info">${el.contact_info}</td>
        <td>
          <button type="button" class="btn btn-danger" id="btn${el.id}" onclick="verefy(${el.id},${mode_n})">${mode}</button>
        </td>
      </tr>
      `
    }
  })
}

select = false

function edit(e, el) {
  if (select)
    return
  if ((e.target.type != 'td' || e.target.type != 'input') && e.target.type)
    return
  if (e.target.childNodes.length > 1)
    return
  if (e.target.dataset.cal == "id")
    return
  var text = e.target.innerText
  var id = el.dataset.id
  e.target.innerHTML = `<input value="${text}" id="inp${id}"><button onclick="update(${id},'${e.target.dataset.cal}')" >OK</button>`
  console.log('1')
  e.stopPropagation()
  select = true
}

function update(id, cal) {

  var input = document.getElementById(`inp${id}`)

  post("/api/admin/updateOrg", { col: cal, val: input.value, id: id }, (data) => {
    if (data.status == 'OK') {
      var parent = input.parentNode
      parent.innerHTML = input.value
    }
  })

  select = false
}

function verefy(id, n) {
  post("/api/admin/updateOrg", { col: 'verified', val: n, id: id }, (data) => {
    if (data.status == 'OK')
      document.getElementById('rowOrg' + id).remove()
  })
}

function renderVerefay() {
  render("/api/admin/getOrgVerefy", "Подтвержденные", "Скрыть", 0)
}

function renderOrders() {
  render("/api/admin/getOrgForModeration", "Ожидает модерации", "Подтвердить", 1)
}