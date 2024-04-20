const express = require("express");
const authController = require("../controllers/auth");
const User = require("../model/user");
const { body, check } = require("express-validator");
const router = express.Router();
const isAuth = require("../middleware/is-auth");
const isLogin = require("../middleware/is-login");
router.get("/login",isLogin, authController.getLogin);

router.get("/logout", authController.getLogout);

router.get('/reset/:token', authController.getToken);

router.get('/reset', authController.getReset);


router.post('/resetpassword', body('password', 'Mật khẩu phải lớn hơn 6 kí tự').isLength({min: 6}).trim() ,authController.postResetPassowrd);

router.post('/reset' , [
  body('email').isEmail().withMessage('Vui lòng nhập đúng định dạng email').custom((value, {req}) => {
    return User.findOne({email: value}).then(user => {
      if(!user) { 
        return Promise.reject('Email này chưa được đăng ký');
      }
    })
  })
], authController.postReset);

router.post(
  "/signup",
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
  authController.postSignUp
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Vui lòng nhập đúng định dạng email")
      .normalizeEmail(),
    body("password", "Mật khẩu không đúng")
      .isLength({ min: 6 })
      .trim()
      .isAlphanumeric(),
  ],
  authController.postLogin
);

module.exports = router;
