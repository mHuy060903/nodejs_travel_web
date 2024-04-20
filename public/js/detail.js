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

//comments
const star = document.querySelector("input[name='num_star']");
const clickStar = document.querySelectorAll(".comments_star");
const hasStar = document.querySelector(".comments_has_star");
hasStar.addEventListener("click", function (e) {
  if (e.target.closest(".comments_star")) {
    const link = e.target.closest(".comments_star");

    clickStar.forEach((item) => item.classList.remove("active"));

    link.classList.add("active");
    star.value = link.dataset.num;
  }
});

const btnIncrease = document.querySelector(".btn_increase");
const btnReduce = document.querySelector(".btn_reduce");
const currentQuantity = document.querySelector(".order_quantity");

btnIncrease.addEventListener("click", function (e) {
  const currentValue = +currentQuantity.value;
  currentQuantity.value = currentValue + 1;
});

btnReduce.addEventListener("click", function (e) {
  const currentValue = +currentQuantity.value;
  if (currentValue === 1) {
    return (currentQuantity.value = 1);
  }
  currentQuantity.value = currentValue - 1;
});

const iconX = document.querySelector(".icon_order_form");
const btnOn = document.querySelector(".btn_on_modal");
const modal = document.querySelector(".modal");
const close = modal.querySelector(".close_x");

iconX.addEventListener("click", function (e) {
  modal.style.display = "none";
});

btnOn.addEventListener("click", function (e) {
  modal.style.display = "flex";
});

// clickStar.forEach((item) => {
//item.classList.remove("active");
// item.addEventListener("click", function (e) {
// const click = e.target.classList.contains('comments_star');
// if(click) {
//   click.classList.add('active');
// }
//item.classList.add("active");
//  });
// });

const formPostComment = document.querySelector(".form_comment");

formPostComment.addEventListener("submit", function (e) {
  e.preventDefault();
  const num = formPostComment.querySelector("[name=num_star]").value;
  const userId = formPostComment.querySelector("[name=userId]").value;
  const tourId = formPostComment.querySelector("[name=tourId]").value;
  const text = formPostComment.querySelector(".comments_area").value;

  const commentsContainer = document.querySelector(".comments_containers");
  const data = {
    userId: userId,
    tourId: tourId,
    num_star: num,
    comment: text,
  };
  fetch("/tour/comment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      const active = document.querySelector(".comments_star.active");

      const result = '<i class="fa-solid fa-star icon_star"></i>'.repeat(
        data.numStar
      );
      const html = `
      <div class="col c-12 l-12 c-12">
                <div class="comments_container">
                 
                  <div class="comments_detail">
                    <div class="comments_user">
                      <img
                        src="/${data.userId.image}"
                        alt=""
                        class="tour_bottom_creator_image"
                      />
                      <div class="comments_name_star">
                        <span class="comments_name">${data.time}</span>
                        <span class="comments_name">${data.userId.name}</span>
                        <div class="comments_been_star">
                         
                        ${result}
                        </div>
                      </div>
                    </div>
                    <p class="comments_text">${data.text}</p>
                  </div>
                </div>
              </div>`;
      commentsContainer.insertAdjacentHTML("afterbegin", html);
      formPostComment.querySelector(".comments_area").value = "";
      active.classList.remove("active");
    })
    .catch((err) => console.log(err));
});
