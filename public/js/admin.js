// const iconX = document.querySelector(".icon_order_form");
// const btnOn = document.querySelector(".right_container_link");

// const modal = document.querySelector(".modal");

// iconX.addEventListener("click", function (e) {
//   modal.style.display = "none";
// });

// btnOn.addEventListener("click", function (e) {
//   modal.style.display = "flex";
// });
const deleteButton = document.querySelectorAll(".delete_tour");
const deleteUser = document.querySelectorAll(".delete_user");
deleteButton.forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    const tourId = e.target.querySelector("[name=tourId]").value;
    console.log(tourId);
    const tr = item.closest(".admin_tr");

    fetch("tour/delete/" + tourId, {
      method: "GET",
    })
      .then((result) => {
        return result.json();
      })
      .then((data) => {
        tr.parentNode.removeChild(tr);
      });
  });
});

deleteUser.forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    const userId = e.target.querySelector("[name=userId]").value;

    const tr = item.closest(".admin_tr");

    fetch("user/delete/" + userId, {
      method: "GET",
    })
      .then((result) => {
        return result.json();
      })
      .then((data) => {
        tr.parentNode.removeChild(tr);
      });
  });
});

const allButtonView = document.querySelectorAll(".icon_detail");
const allIconX = document.querySelectorAll(".icon_body_x");
const modal = document.querySelector(".modal");
allButtonView.forEach((item) => {
  item.addEventListener("click", function (e) {
    const inputCheck = e.target.parentNode.querySelector("input[name=checkId]");
    const value = inputCheck.value;
    const modal = document.querySelector(`.modal_${value}`);

    modal.style.display = "flex";
  });
});

allIconX.forEach((item) => {
  item.addEventListener("click", function (e) {
    const modal = e.target.closest(".modal");
    modal.style.display = "none";
    
  });
});
