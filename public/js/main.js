const header = document.querySelector(".header");
const nav = document.querySelector(".nav");

const stickyNav = function (entries) {
  const [entry] = entries;

  //   if (!intersec) {
  //     header.classList.add("fixed");
  //   } else {
  //     header.classList.remove("fixed");
  //   }
  if (!entry.isIntersecting) nav.classList.add("fixed");
  else nav.classList.remove("fixed");
};

const headerObserver = new IntersectionObserver(stickyNav, {
  root: null,
  threshold: 0.3,
  rootMargin: "80px",
});

headerObserver.observe(header);

// const allTour = document.querySelectorAll(".tour_main");

// const tourMove = function (entries) {
//   const [entry] = entries;
//   console.log(entry);
// };

// const headerOberseverTour = new IntersectionObserver(tourMove, {
//   root: null,
//   threshold: 0,
// });

// allTour.forEach((item) => headerOberseverTour.observe(item));

// Nav mobile
const navIconOpen = document.querySelector(".icon_open");
const navIconClose = document.querySelector(".icon_close");
const navMobile = document.querySelector(".nav_list-mobile");

navIconOpen.addEventListener("click", function (e) {
  e.preventDefault();
  navMobile.classList.add("click");
});

navIconClose.addEventListener("click", function (e) {
  e.preventDefault();
  navMobile.classList.remove("click");
});

//Search
const tinhSelect = document.getElementById("tinh");
const inputPrice = document.querySelector("input[name=price]");

const currenPrice = document.querySelector(".current_price");
const tinhThanh = async function () {
  const tinh = await (await fetch("https://provinces.open-api.vn/api/")).json();
  let html = '<option hidden value="0">Chọn tỉnh</option>';
  console.log(tinh);
  tinh.forEach((item, index) => {
    html += `<option value="${index}">${item["name"]}</option>`;
  });
  tinhSelect.innerHTML = html;
};
tinhThanh();

inputPrice.addEventListener("click", function (e) {
  const price = this.value;
  currenPrice.textContent = `$${price * 100}`;
});

//Tab
const rowTab = document.querySelector(".tab_row");
const opeationTab = document.querySelectorAll(".tab_container_opration");
const buttonTab = document.querySelectorAll(".tab_button_color");
rowTab.addEventListener("click", function (e) {
  if (e.target.closest(".tab_button_color")) {
    link = e.target.closest(".tab_button_color");
    buttonTab.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");

    opeationTab.forEach((item) => item.classList.remove("click"));
    document
      .querySelector(`.tab_container--${link.dataset.tab}`)
      .classList.add("click");
  }
});
