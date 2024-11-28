function logout() {}

function renderStat() {
  root = document.getElementById("root");

  root.innerHTML = `
          <main class="col-md-9 ml-sm-auto col-lg-10 px-md-4 py-4">

      <h1 class="h2" align='center'>Статистика</h1>

              <div class="card">
        <h5 class="card-header">Всего пользователей</h5>
        <div class="card-body">
        <h5 class="card-title">авпавп</h5>
          <p class="card-text"></p>
        </div>
      </div>
      <div id='root2'></div>
            </main>
      `;

  var root2 = document.getElementById("root2");
  root2.innerHTML = `
          <div class="row my-4">
            <div class="col-12 col-md-6 col-lg-6 mb-4 mb-lg-0">
                <div class="card">
                    <h5 class="card-header">Продано билетов для "${name}"</h5>
                    <div class="card-body">
                      <h5 class="card-title">Обычный: ${standart}</h5>
                      <h5 class="card-title">Обычный+: ${standartplus}</h5>
                      <h5 class="card-title">Продвинутый: ${premium}</h5>
                    </div>
                  </div>
            </div>
            <div class="col-12 col-md-6 col-lg-6 mb-4 mb-lg-0">
                <div class="card">
                    <h5 class="card-header">Выставлено счетов всего</h5>
                    <div class="card-body">
                      <h5 class="card-title">${schet}</h5>
                    </div>
                  </div>
            </div>
          </div>`;

  root2.innerHTML += `
                <div class="col-12 col-md-6 col-lg-6 mb-4 mb-lg-0">
                <div class="card">
                    <h5 class="card-header">Применение промокодов</h5>
                    <div class="card-body">
                      <div id='hsdf'></div>
                    </div>
                  </div>
                </div>
                `;
  var h = document.getElementById("hsdf");
  h.innerHTML += `
                            <div class="row">
                            <div class="col">
                              <h5 class="card-title">${n}:</h5>
                              </div>
                               <div class="col">
                              <p>${a[0].uses}</p>
                               </div>
                              </div>
                            `;
} //getCountOfTickets
