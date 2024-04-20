const express = require("express");
const { body } = require("express-validator");
const shopController = require("../controllers/shop");
const util = require("../util/main");
const router = express.Router();
const isAuth = require("../middleware/is-auth");
router.get("/", shopController.getIndex);

router.get("/tour/:tourId", isAuth, shopController.getTour);

router.get("/cart", isAuth, shopController.getCart);

router.post(
  "/tour/comment",
  [
    body("num_star", "Bạn hãy đánh giá số sao").notEmpty(),
    body("comment", "Bạn hãy nhập bình luận").notEmpty(),
  ],
  shopController.postComment
);

router.post(
  "/order",
  [body("email").isEmail().withMessage("Hãy nhập đúng định dạng Email")],
  shopController.postOrder
);

router.post("/addcart", isAuth, shopController.postAddCart);

router.post("/order/delete-tour", shopController.deleteOrder);

router.post(
  "/ordercart",
  [body("stk", "So tai khoan phai co it nhat 10 ki tu").isLength({ min: 10 })],
  shopController.postOrderCart
);

router.get("/check", isAuth, shopController.getCheck);

router.get("/check/:checkId", isAuth, shopController.getInvoices);

router.get("/profile", isAuth, shopController.getProfile);

router.post(
  "/profile",
  [
    body("name", "Vui lòng nhập tên lớn hơn 6 kí tự")
      .isLength({ min: 6 })
      .trim(),
  ],
  shopController.postProfile
);

router.post(
  "/changepass",
  [
    body("oldPassword", "Không được để trống").notEmpty(),
    body("newPassword", "Mật khẩu phải lớn hơn 6 kí tự").isLength({ min: 6 }),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Xác nhận mật khẩu không trùng khớp");
      }
      return true;
    }),
  ],
  shopController.changePassword
);

router.get("/testpdf", shopController.sendPDF);

router.get('/pdf/:checkId', shopController.getPdfCustomer)

module.exports = router;
