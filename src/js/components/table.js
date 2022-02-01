/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable max-len */
export default class Table {
  constructor({
    section,
    formSection,
    form,
    formClose,
    formSubmit,
    filterButton,
    renderCount,
  }) {
    // Переменные конструктора
    this.section = section;
    this.formSection = formSection;
    this.form = form;
    this.formClose = formClose;
    this.formSubmit = formSubmit;
    this.filterButton = filterButton;

    // Константы класса
    this.renderCount = renderCount || 10;
    this.currentLeft = 0;
    this.currentRight = 0;
    this.rowArray = [];
    this.prevButton = null;
    this.nextButton = null;
    this.tableBody = null;
    this.sortIconsButton = null;

    // Инициализируем запрос
    this.api();
  }

  // Делаем запрос. Обрабатываем
  api() {
    return fetch("./data.json")
      .then((res) => {
        if (res.ok) {
          return res.json(); // Обрабатываем запрос
        }
        return Promise.reject();
      })
      .then((data) => {
        this.rowArray = data; // Делаем массив данных доступным классу
        this.createTable(data); // Создаем таблицу на основе данных
      })
      .catch((err) => {
        throw new Error(err); // Ловим ошибки
      });
  }

  // Шаблон шапки таблицы
  _templateHead() {
    const templateHead = `
    <thead class="table__head">
      <th class="table__head-column">
        <div class="table__box">
          <p class="table__title">FirstName</p>
          <img class="table__sort-icon" data-sort-name="firstName" src="./icons/sort.svg" alt="icons">
        </div>
      </th>
      <th class="table__head-column">
        <div class="table__box">
          <p class="table__title">LastName</p>
          <img class="table__sort-icon" data-sort-name="lastName" src="./icons/sort.svg" alt="icons">
        </div>
      </th>
      <th class="table__head-column">
        <div class="table__box">
          <p class="table__title">About</p>
          <img class="table__sort-icon" data-sort-name="about" src="./icons/sort.svg" alt="icons">
        </div>
      </th>
      <th class="table__head-column">
        <div class="table__box">
          <p class="table__title">EyeColor</p>
          <img class="table__sort-icon" data-sort-name="eyeColor" src="./icons/sort.svg" alt="icons">
        </div>
      </th>
    </thead>
    `;
    return templateHead;
  }

  // Шаблон тела таблицы
  _templateBodyRow(data) {
    const templateBodyRow = `
      <tbody class="table__body">
      <tr class="table__body-row" data-id=${data.id}>
        <td class="table__body-column _first-column">
          <p class="table__text">${data.name.firstName}</p>
        </td>
        <td class="table__body-column _second-column">
          <p class="table__text">${data.name.lastName}</p>
        </td>
        <td class="table__body-column _third-column">
          <p class="table__text">${data.about}</p>
        </td>
        <td class="table__body-column _fourth-column">
          <p class="table__text">${data.eyeColor}</p>
        </td>
      </tr>
    </tbody>
    `;
    return templateBodyRow;
  }

  // Шаблон кнопок prev next
  _templateControlButtons() {
    const _templateControlButtons = `
    <div class="table__controls">
      <button class="table__button-prev" type="button">&#60;</button>
      <button class="table__button-next" type="button">&#62;</button>
    </div>
    `;
    return _templateControlButtons;
  }

  // Собираем таблицу по кусочкам
  createTable() {
    const table = document.createElement("table"); // Создаем родительский элемент таблицы
    table.classList.add("table"); // Добавляем класс

    table.insertAdjacentHTML("beforeend", this._templateHead().trim()); // преобразуем строку в HTML элемент, убираем пробелы, вставляем в самый конец родительского элемента.

    this.tableBody = document.createElement("tbody"); // создали тело
    this.tableBody.classList.add("table__body"); // Добавили класс

    table.appendChild(this.tableBody);// Вставили тело таблицы после шапки

    this.currentRight += this.renderCount; // Ставим праву границу для массива, чтобы отрисовать необходимое кол - во строк
    this.showLimiter(this.currentLeft, this.currentRight); // Отрисовываем тело таблицы

    this.section.insertAdjacentHTML("beforeend", this._templateControlButtons().trim()); // Добавляем кнопки next и prev для перелистывания страниц

    this.section.appendChild(table); // вставляем итоговый элемент таблицы в секцию.
    this.bindStaticDomElements();
    this.bindDynamicDomElements();
    this.staticListener();
    this.dynamicListener();
  }

  // Делаем построенные элементы доступными для класса
  bindStaticDomElements() {
    this.prevButton = document.querySelector(".table__button-prev");
    this.nextButton = document.querySelector(".table__button-next");
    this.sortIconsButton = [...document.querySelectorAll(".table__sort-icon")];
  }

  bindDynamicDomElements() {
    this.tableBodyRow = [...document.querySelectorAll(".table__body-row")];
  }

  // Обрабатываем массив данных и создаем тело, отрисовываем строчки тела таблицы
  renderRow(row) {
    this.tableBody.insertAdjacentHTML("beforeend", this._templateBodyRow(row).trim()); // вставили строку
  }

  reRender() {
    this.showLimiter(this.currentLeft, this.currentRight);
    this.bindDynamicDomElements();
    this.dynamicListener();
  }

  showLimiter(left, right) {
    this.tableBody.innerHTML = "";
    // Очищаем тело таблицы для отрисовки новых элементов.
    this.rowArray.forEach((item, index) => {
      if (index < right && index >= left) {
        this.renderRow(item); // Отрисовываем строки входящие в переданные границы
      }
    });
  }

  // Ставим границы для отрисовки следующих элементов
  next() {
    if (this.currentRight < this.rowArray.length) {
      this.currentRight += this.renderCount; // Увеличиваем счетчик на кол-во элементов которые необходимо отрисовать
      this.currentLeft += this.renderCount;
      this.reRender();
    }
  }

  // Ставим границы для отрисовки предыдущих элементов
  prev() {
    if (this.currentLeft > 0) {
      this.currentLeft -= this.renderCount; // Увеличиваем счетчик на кол-во элементов которые необходимо отрисовать
      this.currentRight -= this.renderCount;
      this.reRender();
    }
  }

  // Поиск ключа в объекте
  findObjectKey(keyName, object, changeValue = null) {
    for (const key in object) { // Проходим по ключам в объекте;
      if (key === keyName) { // Если нашли на самом первом уровне
        return changeValue ? object[key] = changeValue : object[key]; // Возвращаем его в виде данных - ключа, если changeValue = null или меняем значение если changeValue не пуст.
      }
      if (Array.isArray(object[key]) && object[key].includes(keyName)) { // Проверяем если ключ в массиве
        return changeValue ? object[key] = changeValue : object[key]; // Возвращаем его если нашли
      }
      if (typeof object[key] === "object" && !Array.isArray(object[key])) { // Если ничего не нашли идем на уровень глубже в объект
        const res = this.findObjectKey(keyName, object[key], changeValue); // Проверяем на уровне глубже наличие ключа.
        if (res) { return res; } // Если нашли ключ то вернули его.
      }
    }
    return null; // Вернули null если переданного ключа нет в объекте
  }

  // Логика работы фильтра
  filter(event) {
    const { target } = event; // получили DOM элемент
    const { sortName } = target.dataset; // Прочитали дата атрибут

    if (target.classList.contains("_active")) { // Проверяем по классу(флагу) в каком порядке сортируются элементы
      target.classList.remove("_active"); // Убираем класс(флаг) для изменения порядка сортировки при повторном клике на элемент
      this.sortBtoA(sortName); // Меняем сортировку
    } else {
      this.sortIconsButton.forEach((icon) => icon.classList.remove("_active")); // Удаляем все активные классы с других кнопок.
      target.classList.add("_active"); // Устанавливаем флаг сортировки
      this.sortAtoB(sortName); // Меняем сортировку
    }
    this.reRender(); // рендерим тело с новой сортировкой
  }

  // Фильтр по убыванию
  sortAtoB(sortName) {
    this.rowArray.sort((prev, next) => {
      // Делает запрос в функцию поиска ключа в текущем объекте чтобы по нему вести сортировку
      if (this.findObjectKey(sortName, prev) < this.findObjectKey(sortName, next)) return -1; // Сравниваем ключи
      if (this.findObjectKey(sortName, prev) > this.findObjectKey(sortName, next)) return 1;
      return 0;
    });
  }

  // Фильтр по возрастанию
  sortBtoA(sortName) {
    this.rowArray.sort((prev, next) => {
      // Делает запрос в функцию поиска ключа в текущем объекте чтобы по нему вести сортировку
      if (this.findObjectKey(sortName, prev) > this.findObjectKey(sortName, next)) return -1; // Сравниваем ключи
      if (this.findObjectKey(sortName, prev) < this.findObjectKey(sortName, next)) return 1;
      return 0;
    });
  }

  // Открываем форму
  openForm(event) {
    const { currentTarget } = event; // Получаем элемент по которому кликнули
    const { id } = currentTarget.dataset; // Достаем дата атрибут для поиска элемента в массиве объектов
    this.formSection.classList.add("_open"); // Показываем форму для редактирования.
    this.renderFormText(id); // Отрисовываем текст в форме
  }

  // Заполняем форму текстом
  renderFormText(id) {
    const objectElement = this.rowArray.find((key) => key.id === id); // находим соответствующий объект.
    const { elements } = this.form; // Получаем все поля формы
    this.form.dataset.id = id; // Ставим id на форму (используется в функции saveForm())
    for (let i = 0; i < elements.length; i++) {
      elements[i].value = (this.findObjectKey(elements[i].name, objectElement)); // Заполняем форму значениями из найденного объекта
    }
  }

  // Сохраняем фому
  saveForm() {
    const { id } = this.form.dataset; // Получаем id формы
    const objectElement = this.rowArray.find((key) => key.id === id); // находим соответствующий объект.
    const { elements } = this.form; // Получаем все поля формы

    for (let i = 0; i < elements.length; i++) {
      this.findObjectKey(elements[i].name, objectElement, elements[i].value); // Изменяем объект массива, передавая 3 аргумент со значением поля в функцию.
    }
    this.reRender(); // Перерисовываем тело таблицы с новыми данными
  }

  // Закрываем фому
  closeForm() {
    this.formSection.classList.remove("_open");
  }

  // Ставим "статичные" слушатели
  staticListener() {
    this.prevButton.addEventListener("click", this.prev.bind(this));
    this.nextButton.addEventListener("click", this.next.bind(this));
    this.sortIconsButton.forEach((icon) => icon.addEventListener("click", this.filter.bind(this)));
    this.formClose.addEventListener("click", this.closeForm.bind(this));
    this.formSubmit.addEventListener("click", this.saveForm.bind(this));
  }

  // Ставим "динамические" слушатели
  dynamicListener() {
    this.tableBodyRow.forEach((row) => row.addEventListener("click", this.openForm.bind(this)));
  }
}
