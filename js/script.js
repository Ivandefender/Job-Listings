const dataUrl = "./data.json";
let jobsData = null;

async function addJobListings() {
  const responce = await fetch(dataUrl);
  jobsData = await responce.json();
  console.log(jobsData);
  await new Promise((resolve, reject) => {
    insertJobs(jobsData);
    filtering();
    resolve();
  });
}

// Два рішення в мене вийшло (це перше, але не допрацьоване, а активне друге (воно перероблене та спрощене трохи))
// function filtering() {
//   let filterBtnsArrWithEquals = [];
//   let filterBtnsArrWithoutEquals = [];
//   jobsData.forEach((item, i) => {
//     const { role, level, languages, tools } = item;
//     filterBtnsArrWithEquals.push(role, level, ...languages, ...tools);
//     filterBtnsArrWithoutEquals = filterBtnsArrWithEquals.filter(
//       (item, index) => filterBtnsArrWithEquals.indexOf(item) === index
//     );
//   });
//   console.log(filterBtnsArrWithoutEquals);

//   let filterBtns = [];
//   const filterRole = document.querySelectorAll(".role__btn");
//   const filterLevel = document.querySelectorAll(".level__btn");
//   const filterLanguages = document.querySelectorAll(".language__btn");
//   const filterTools = document.querySelectorAll(".tool__btn");
//   const filterItems = document.querySelectorAll(".filter__item");
//   console.log(filterItems);

//   filterBtns = [
//     ...filterRole,
//     ...filterLevel,
//     ...filterLanguages,
//     ...filterTools,
//   ];
//   filterBtns.forEach((btn) => {
//     btn.addEventListener("click", () => {
//       const filterAttribute = btn.getAttribute("data-filter");
//       console.log(filterAttribute);
//       filterItems.forEach((item) => {
//         filterBtnsArrWithoutEquals.forEach(arrPoint =>{
//           if(arrPoint !== filterAttribute){
//             console.log(arrPoint !== filterAttribute);
//             console.log(`Не збігається значення arrPoint: ${arrPoint} зі значенням filterAttribute: ${filterAttribute}`);
//             item.style.backgroundColor = 'red';
//           }else{
//             console.log(`Збігається arrPoint:${arrPoint} зі значенням filterAttribute: ${filterAttribute}`)
//             item.style.backgroundColor = 'green';
//           }
//         })
//       });
//     });
//   });
//   console.log(filterBtns);
// }

function filtering() {
  // Доступи до кнопок окремих категорій
  const filterRole = document.querySelectorAll(".role__btn");
  const filterLevel = document.querySelectorAll(".level__btn");
  const filterLanguages = document.querySelectorAll(".language__btn");
  const filterTools = document.querySelectorAll(".tool__btn");

  // Картки вакансій
  const filterItems = document.querySelectorAll(".filter__item");

  // Додавання збоку полоси якщо у вакансія - New, Featured
  document.querySelectorAll(".job__company").forEach((item) => {
    if (
      item.querySelector(".job__new") &&
      item.querySelector(".job__featured")
    ) {
      const statusItem = item
        .closest(".filter__item")
        .querySelector(".status__item");
      statusItem.style.display = "block";
    }
  });

  const filterBtns = [
    //Всі кнопки на сторінці
    ...filterRole,
    ...filterLevel,
    ...filterLanguages,
    ...filterTools,
  ];

  // Поле з відібраними фільтрами та його додавання в структуру сторінки
  let searchContainer = document.createElement("div");
  searchContainer.classList.add("searchContainer");
  document.body.insertBefore(
    searchContainer,
    document.querySelector(".background__head")
  );

  // Відібрані фільтри (контейнер) та додавання його до searchContainer
  let selectedFilters = null;
  selectedFilters = document.createElement("div");
  selectedFilters.classList.add("selected__filters-inner");
  searchContainer.appendChild(selectedFilters);

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      searchContainer.style.display = "flex";
      const filterAttribute = btn.getAttribute("data-filter");
      if (
        !selectedFilters.querySelector(`[data-filter="${filterAttribute}"]`)
      ) {
        addFiltersToSearch(filterAttribute, selectedFilters);
      } else {
        alert(`Фільтр ${filterAttribute} вже доданий`);
      }

      filterItems.forEach((item) => {
        // Отримання в кожному елементі(item) значення атрибута, яке було записане в конструкторі insertJobs
        const itemRoles = item
          .querySelector(".role__btn")
          .getAttribute("data-filter");
        const itemLevels = item
          .querySelector(".level__btn")
          .getAttribute("data-filter");
        const itemLanguages = Array.from(
          item.querySelectorAll(".language__btn")
        ).map((btn) => btn.getAttribute("data-filter"));
        const itemTools = Array.from(item.querySelectorAll(".tool__btn")).map(
          (btn) => btn.getAttribute("data-filter")
        );

        if (
          // Перевірка чи збігається атрибут data-filter у всіх кнопках з натиснутою перед цим кнопкою фільтра
          filterAttribute === itemRoles ||
          filterAttribute === itemLevels ||
          itemLanguages.includes(filterAttribute) ||
          itemTools.includes(filterAttribute)
        ) {
          item.style.display = "flex";
        } else {
          item.style.display = "none";
        }
      });
    });
  });
  clearFilters(filterItems, searchContainer);
  removeOneFilterItem(selectedFilters, searchContainer, filterItems);
}

// Перетворення відібраного фільтру у кнопку та додавання у поле відібраних фільтрів. Приймає значення атрибута кнопки, відібрані фільтри
function addFiltersToSearch(filterBtnValue, selectedFilters) {
  if (selectedFilters.children.length >= 7) {
    alert("Можна вибрати не більше 7 фільтрів");
    return;
  }

  const searchBtnInner = document.createElement("div");
  searchBtnInner.classList.add("search__btn-inner");
  searchBtnInner.innerHTML = `  
  <button class="selected__btn" data-filter="${filterBtnValue}">${filterBtnValue}</button>
  <button class="close__btn"></button>`;

  selectedFilters.appendChild(searchBtnInner);
}

// Видалення одного елемента з відібраних фільтрів (якщо вибраних немає то зникає поле, яке з'явилось). Приймає відібрані фільтри, загальне поле з фільтрами, картки вакансій щоб їх передати до updateJobItems()
function removeOneFilterItem(selectedFilters, container, filterItems) {
  selectedFilters.addEventListener("click", (event) => {
    if (event.target.classList.contains("close__btn")) {
      event.target.parentElement.remove();

      updateJobItems(filterItems);
      if (selectedFilters.children.length === 0) {
        container.style.display = "none";
      }
    }
  });
}

// Для оновлення карток вакансія після видалення вибраного фільтра. Приймає картки вакансій
function updateJobItems(filterItems) {
  const activeFilters = document.querySelectorAll(".selected__btn");

  filterItems.forEach((item) => {
    let visibleItems = true;

    activeFilters.forEach((filter) => {
      const filterAttribute = filter.getAttribute("data-filter");
      const itemRoles = item
        .querySelector(".role__btn")
        .getAttribute("data-filter");
      const itemLevels = item
        .querySelector(".level__btn")
        .getAttribute("data-filter");
      const itemLanguages = Array.from(
        item.querySelectorAll(".language__btn")
      ).map((btn) => btn.getAttribute("data-filter"));
      const itemTools = Array.from(item.querySelectorAll(".tool__btn")).map(
        (btn) => btn.getAttribute("data-filter")
      );

      // Якщо не збігається з натиснутою кнопкою то задається значення visibleItems - false (не буде відображатись)
      if (
        filterAttribute !== itemRoles &&
        filterAttribute !== itemLevels &&
        !itemLanguages.includes(filterAttribute) &&
        !itemTools.includes(filterAttribute)
      ) {
        visibleItems = false;
      }
    });

    // На кожній ітерації передається це значення і вже в залежності від нього відображуються оновлений набір карток вакансій. Картки з'являються якщо visibleItems true
    if (visibleItems) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
  });
}

// Кнопка видалення всіх фільтрів та зникнення поля з фільтрами. Приймає картки вакансій, загальне поле з фільтрами
function clearFilters(filterItems, container) {
  const clearBtn = document.createElement("button");
  clearBtn.classList.add("clear");
  clearBtn.textContent = "Clear";
  container.appendChild(clearBtn);

  clearBtn.addEventListener("click", () => {
    container.style.display = "none";
    const selectedFiltersInner = document.querySelector(
      ".selected__filters-inner"
    );
    selectedFiltersInner
      .querySelectorAll(".selected__btn")
      .forEach((btn) => btn.parentElement.remove());

    filterItems.forEach((item) => {
      item.style.display = "flex";
    });
  });
}

// Додавання картки з вакансією. Приймає розпарсений data.json
function insertJobs(data) {
  const jobsContainer = document.createElement("div");
  jobsContainer.classList.add("jobs__container");
  document.body.appendChild(jobsContainer);

  data.forEach((item) => {
    const {
      company,
      logo,
      featured,
      position,
      role,
      level,
      postedAt,
      contract,
      location,
      languages,
      tools,
    } = item;

    const filterItem = document.createElement("div");
    filterItem.classList.add("filter__item");
    filterItem.innerHTML = `
    <div class="status__item"></div>

    <div class="item__info">
        <img src="${logo}" alt="${company}">
      <div class="info__job">
          <div class="job__company">
            <p class="company">${company}</p>
            ${typeOfJobListing(item.new, featured)}
          </div>
        <p class="profession">${position}</p>
        <p class="job__work-time">${postedAt} · ${contract} · ${location}</p>
      </div>
    </div>

    <div class="filters">
      <div class="role">
        <button class="role__btn" data-filter="${role}">${role}</button>
      </div>
      <div class="level">
        <button class="level__btn" data-filter="${level}">${level}</button>
      </div>
      ${jobLanguages(languages)}
      ${jobTools(tools)}
    </div>
    `;
    jobsContainer.appendChild(filterItem);
  });
}

// Текст New Featured. Приймає значення із розпарсеного data.json
function typeOfJobListing(isNew, isFeatured) {
  let result = "";
  if (isNew && isFeatured) {
    result += `<p class="job__new job__base-status">New!</p><p class="job__featured job__base-status">Featured</p>`;
  }
  return result;
}

// Діставання значень з масиву languages в data.json і перетворення в кнопки та додавання на сторінку. Приймає значення із розпарсеного data.json
function jobLanguages(languages) {
  const languagesInner = document.createElement("div");
  languagesInner.classList.add("languages");
  languages.forEach((language) => {
    const languageBtn = document.createElement("button");
    languageBtn.classList.add("language__btn");
    languageBtn.setAttribute("data-filter", language);
    languageBtn.textContent = language;
    languagesInner.appendChild(languageBtn);
  });
  return languagesInner.outerHTML; //?
}

// Діставання значень з масиву tools в data.json і перетворення в кнопки та додавання на сторінку. Приймає значення із розпарсеного data.json
function jobTools(tools) {
  const toolsInner = document.createElement("div");
  toolsInner.classList.add("tools");
  tools.forEach((tool) => {
    const toolBtn = document.createElement("button");
    toolBtn.classList.add("tool__btn");
    toolBtn.setAttribute("data-filter", tool);
    toolBtn.textContent = tool;
    toolsInner.appendChild(toolBtn);
  });
  return toolsInner.outerHTML; //?
}

addJobListings();
