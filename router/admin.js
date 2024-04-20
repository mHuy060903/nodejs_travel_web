const express = require("express");
const User = require("../model/user");
const { body, check } = require("express-validator");
const router = express.Router();
const isAuth = require("../middleware/is-auth");
const adminController = require("../controllers/admin");

router.get("/user", isAuth, adminController.getAllUser);

router.get("/user/add", isAuth, adminController.getAddUser);

router.get("/user/edit/:userId", isAuth, adminController.getEditUser);

router.get("/user/delete/:userId", adminController.getDeleteUser);

router.get("/tour", adminController.getAllTour);

router.get("/tour/add", adminController.getAddTour);

router.get("/tour/edit/:tourId", adminController.getEditTour);

router.post(
  "/tour/add",
  [
    body("name", "Tên phải lớn hơn 10 kí tự")
      .isLength({ min: 10 })
      .isString()
      .trim(),
    body("location", "Địa điểm không được để trống").notEmpty(),
    body("price", "Giá không được để trống")
      .notEmpty()
      .custom((value) => {
        if (+value <= 0) {
          throw new Error("Giá không thể nhỏ hơn 0");
        }

        return true;
      }),
    body("des", "Mô tả phải lớn hơn 20 kí tự").isLength({ min: 20 }),
  ],
  adminController.postAddTour
);

router.post(
  "/tour/edit",
  [
    body("name", "Tên phải lớn hơn 10 kí tự")
      .isLength({ min: 10 })
      .isString()
      .trim(),
    body("location", "Địa điểm không được để trống").notEmpty(),
    body("price", "Giá không được để trống")
      .notEmpty()
      .custom((value) => {
        if (+value <= 0) {
          throw new Error("Giá không thể nhỏ hơn 0");
        }

        return true;
      }),
    body("des", "Mô tả phải lớn hơn 20 kí tự").isLength({ min: 20 }),
  ],
  adminController.postEditTour
);

router.get("/tour/delete/:tourId", adminController.getDeleteTour);

router.post(
  "/user/add",
  [
    body("name", "Vui lòng nhập tên lớn hơn 6 kí tự")
      .isLength({ min: 6 })
      .trim(),
    body("email")
      .isEmail()
      .withMessage("Vui lòng nhập đúng định dạng email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email này đã được sử dụng");
          }
        });
      })
      .normalizeEmail(),
    body("password", "Vui lòng nhập mật khẩu lớn hơn 6 kí tự")
      .isLength({ min: 6 })
      .trim(),
    body("confirmpassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Xác nhận mật khẩu không trùng khớp");
        }
        return true;
      }),
  ],
  adminController.postAddUser
);

router.post(
  "/user/edit",
  [
    body("name", "Vui lòng nhập tên lớn hơn 6 kí tự")
      .isLength({ min: 6 })
      .trim(),

    body("email")
      .isEmail()
      .withMessage("Vui lòng nhập đúng định dạng email")
      .normalizeEmail(),
  ],
  adminController.postEditUser
);

router.get('/checks', adminController.getChecks);

router.post('/confirmpay', isAuth, adminController.postConfirmPay);


router.get('/thongke', adminController.getThongKe);

module.exports = router;
