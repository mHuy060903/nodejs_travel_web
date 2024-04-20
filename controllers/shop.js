const { validationResult } = require("express-validator");
const { populate } = require("../model/tour");
const Tour = require("../model/tour");
const util = require("../util/main");
const Comment = require("../model/comment");
const Order = require("../model/order");
const User = require("../model/user");
const sendgirdTransport = require("nodemailer-sendgrid-transport");
const nodemailer = require("nodemailer");
const Check = require("../model/check");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const tour = require("../model/tour");
const { file } = require("pdfkit");
const bcrypt = require("bcryptjs");
const puppeteer = require("puppeteer");
const transporter = nodemailer.createTransport(
  sendgirdTransport({
    auth: {
      api_key:
      // Your Key
        "",  
    },
  })
);
exports.getIndex = async (req, res, next) => {
  const name = req.query.name;
  const location = req.query.location;
  const price = req.query.price * 100 || 0;
  let search = '';
  let allTour = [];
  if (name || location || price) {
    search = 'true';
    if (price > 0) {
      allTour = await Tour.find({
        $and: [
          { name: { $regex: ".*" + name + ".*", $options: "i" } },
          { price: { $lte: price } },
          { location: { $regex: ".*" + location + ".*", $options: "i" } },
        ],
      }).populate("userId");
    } else {
      allTour = await Tour.find({
        $and: [
          { name: { $regex: ".*" + name + ".*", $options: "i" } },

          { location: { $regex: ".*" + location + ".*", $options: "i" } },
        ],
      }).populate("userId");
    }
  } else {
    allTour = await Tour.find().populate("userId");
  }

  res.render("shop/index", {
    isFixed: "",
    pageTitle: "Trang chủ",
    hasError: "",
    hasSuccess: "",
    NotifyMessage: "",
    allTour: allTour,
    valueSearch: {
      name: name,
      location: location,
      price: price / 100,
    },
    isSearch: search,
  });
};

exports.getTour = (req, res, next) => {
  const tourId = req.params.tourId;
  let tours;
  Tour.findById(tourId)
    .populate("userId")
    .then((tour) => {
      if (!tour) {
        res.redirect("/");
      }
      tours = tour;
      return Comment.find({ tourId: tourId }).populate("userId");
    })
    .then((comment) => {
      const date = util.getDate(tours.date);

      return res.render("shop/detail", {
        isFixed: "true",
        pageTitle: "Chi tiết",
        tour: tours,
        tourDate: date,
        userId: req.user._id,
        emailUser: req.user.email,
        oldInput: {},
        errorsMessage: [],
        comments: comment,
        isModal: "",
        formEmail: "true",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postComment = async (req, res, next) => {
  const userId = req.body.userId;
  const tourId = req.body.tourId;
  const numStar = req.body.num_star;
  const commentText = req.body.comment;

  try {
    const tour = await Tour.findById(tourId);
    const comments = await Comment.find({ tourId: tourId }).populate("userId");
    const date = util.getDate(tour.date);

    const errors = validationResult(req);
    const errorsArray = errors.errors;

    if (!errors.isEmpty()) {
      res.send("fail");
      return res.render("shop/detail", {
        isFixed: "true",
        pageTitle: "Chi tiết",
        tour: tour,
        tourDate: date,
        userId: req.user._id,
        oldInput: {
          numStar: numStar,
          comment: commentText,
        },
        errorsMessage: errorsArray,
        commnets: comments,
        isModal: "",
        formEmail: "true",
      });
    }
    const comment = new Comment({
      tourId: tourId,
      userId: userId,
      numStar: numStar,
      text: commentText,
      time: util.getDate(new Date(), true),
    });
    const commentnew = await (await comment.save()).populate("userId");
    return res.send(commentnew);
    // const commentsNew = await Comment.find({ tourId: tourId }).populate(
    //   "userId"
    // );
    // return res.render("shop/detail", {
    //   isFixed: "true",
    //   pageTitle: "Chi tiết",
    //   tour: tour,
    //   tourDate: date,
    //   userId: req.user._id,
    //   oldInput: {},
    //   errorsMessage: [],
    //   comments: commentsNew,
    // });
  } catch (error) {
    console.log(error);
  }
};

exports.postOrder = async (req, res, next) => {
  const quantity = req.body.quantity;
  const userId = req.body.userId;
  const tourId = req.body.tourId;
  const email = req.body.email;

  const tour = await Tour.findById(tourId).populate("userId");
  const comments = await Comment.find({ tourId: tourId }).populate("userId");
  const date = util.getDate(tour.date);
  const errors = validationResult(req);
  const errorsArray = errors.errors;

  if (!errors.isEmpty()) {
    return res.render("shop/detail", {
      isFixed: "true",
      pageTitle: "Chi tiết",
      tour: tour,
      tourDate: date,
      userId: req.user._id,
      emailUser: email,
      oldInput: {},
      errorsMessage: errorsArray,
      comments: comments,
      isModal: "true",
      formEmail: "true",
    });
  }
  const time = util.getDate(new Date(), true);
  const numRandom = util.randomNum();

  let order = await Order.findOne({ tourId: tourId, userId: userId });

  if (order) {
    order.time = time;
    order.codeToken = numRandom;
    order.quantity = quantity;
  } else {
    order = new Order({
      tourId: tourId,
      userId: req.user._id,

      codeToken: numRandom,
      quantity: quantity,
      time: time,
    });
  }

  const orderSave = await order.save();
  transporter.sendMail({
    to: email,
    from: "hatzingvn123@gmail.com",
    subject: "Xác nhận đăng ký tour",
    html: `<h1>Mã xác nhận của bạn là ${numRandom} </h1>`,
  });
  return res.render("shop/detail", {
    isFixed: "true",
    pageTitle: "Chi tiết",
    tour: tour,
    tourDate: date,
    userId: req.user._id,
    emailUser: email,
    oldInput: {},
    errorsMessage: [],
    comments: comments,
    isModal: "true",
    formEmail: "",
  });
};

exports.postAddCart = async (req, res, next) => {
  const userId = req.body.userId;
  const tourId = req.body.tourId;
  const codeToken = req.body.codeToken;

  const order = await Order.findOne({ tourId: tourId, codeToken: codeToken });
  const tour = await Tour.findById(tourId).populate("userId");
  const comments = await Comment.find({ tourId: tourId }).populate("userId");
  const date = util.getDate(tour.date);
  if (order) {
    const userOrder = await User.findById(userId);
    const cartIndex = userOrder.cart.items.findIndex((tour) => {
      return tour.tourId.toString() === order.tourId.toString();
    });

    // const items = [...userOrder.cart.items];
    if (cartIndex >= 0) {
      userOrder.cart.items[cartIndex] = {
        tourId: order.tourId,
        SDT: order.SDT,
        quantity: order.quantity,
      };
    } else {
      userOrder.cart.items.push({
        tourId: order.tourId,
        quantity: order.quantity,
        SDT: order.SDT,
      });
    }
    await Order.deleteOne({ codeToken: codeToken });
    const userNewSave = await userOrder.save();

    return res.redirect("/cart");
  } else {
    return res.render("shop/detail", {
      isFixed: "true",
      pageTitle: "Chi tiết",
      tour: tour,
      tourDate: date,
      userId: req.user._id,
      emailUser: "",
      oldInput: {
        codeToken: codeToken,
      },
      errorsMessage: [
        {
          param: "codeToken",
          msg: "Mã không hợp lệ",
        },
      ],
      comments: comments,
      isModal: "true",
      formEmail: "",
    });
  }
};

exports.getCart = async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("cart.items.tourId");
  const items = user.cart.items;
  const numberOrder = util.ramdomOrder();

  let total = 0;
  items.forEach((item) => (total += item.tourId.price * item.quantity));

  return res.render("shop/cart", {
    isFixed: "true",
    pageTitle: "Giỏ hàng",
    items: items,
    total: total,
    random: numberOrder,
    errorsArray: [],
    oldInput: {},
    modal: "",
  });
};

exports.deleteOrder = async (req, res, next) => {
  const orderId = req.body.orderId;
  const user = await User.findById(req.user._id);

  const items = user.cart.items;

  const itemsUpdate = items.filter(
    (item) => item._id.toString() !== orderId.toString()
  );

  user.cart.items = itemsUpdate;

  const update = await user.save();

  return res.redirect("/cart");
};

exports.postOrderCart = async (req, res, next) => {
  const stk = req.body.stk;
  const text = req.body.codeToken;
  const user = await User.findById(req.user._id).populate("cart.items.tourId");
  const items = user.cart.items;
  const numberOrder = util.ramdomOrder();

  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].tourId.price * items[i].quantity;
  }

  const errors = validationResult(req);
  const errorsArray = errors.errors;

  if (!errors.isEmpty()) {
    return res.render("shop/cart", {
      isFixed: "true",
      pageTitle: "Giỏ hàng",
      items: items,
      total: total,
      random: text,
      errorsArray: errorsArray,
      oldInput: {
        stk: stk,
      },
      modal: "true",
    });
  }

  const tours = user.cart.items.map((i) => {
    return {
      quantity: i.quantity,
      tour: { ...i.tourId._doc },
    };
  });

  const check = new Check({
    user: {
      email: user.email,
      userId: user._id,
    },
    tours: tours,
    infor: {
      STK: stk,
      code: text,
      time: new Date(),
      timeToken: new Date().getTime() + 300000,
      total: total,
    },
  });
  const checkSave = await check.save();
  user.clearCart();
  return res.redirect("/check");
};

exports.getCheck = async (req, res, next) => {
  const check = await Check.find({ "user.userId": req.user._id });
  check.forEach((i) => {
    const date = util.getDate(i.infor.time, true);
    i.infor.date = date;

    i.tours.forEach((e) => {
      e.tour.date = util.getDate(e.tour.date);
    });
  });
  return res.render("shop/check", {
    isFixed: "true",
    pageTitle: "Tour đã mua",
    checks: check,
  });
};

exports.getInvoices = async (req, res, next) => {
  const checkId = req.params.checkId;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`http://localhost:3000/pdf/${checkId}`, { waitUntil: "networkidle0" });
  const pdf = await page.pdf({ format: "A4" });

  await browser.close();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline; filename="' + `${checkId}.pdf` + '"');
  res.send(pdf);
  // const check = await Check.findOne({ _id: checkId });
  // if (!check) {
  //   return res.redirect("/check");
  // }

  // const invoiceName = "invoice-" + checkId + ".pdf";
  // const pdfDoc = new PDFDocument();
  // const invoicePath = path.join("data", "invoices", invoiceName);
  // res.setHeader("Content-Type", "application/pdf");
  // res.setHeader(
  //   "Content-Disposition",
  //   'inline; filename="' + invoiceName + '"'
  // );
  // pdfDoc.pipe(fs.createWriteStream(invoicePath));
  // pdfDoc.pipe(res);

  // pdfDoc.font("Times-Roman").text("INVOICE", {
  //   width: 410,
  //   align: "center",
  // });
  // pdfDoc
  //   .font("Times-Roman")
  //   .text("---------------------------------------------------------", {
  //     width: 410,
  //     align: "center",
  //   });
  // pdfDoc.moveDown();
  // pdfDoc.font("Times-Roman").text(`Email: ${check.user.email}`, {
  //   align: "left",
  //   height: 1000,
  // });
  // pdfDoc.moveDown();
  // pdfDoc.font("Times-Roman").text(`STK: ${check.infor.STK}`, {
  //   align: "left",
  //   height: 1000,
  // });
  // pdfDoc.moveDown();
  // pdfDoc
  //   .font("Times-Roman")
  //   .text(`Time: ${util.getDate(check.infor.time, true)}`, {
  //     align: "left",
  //     height: 1000,
  //   });
  // let totalPrice = 0;
  // check.tours.forEach((tour) => {
  //   totalPrice += tour.tour.price * tour.quantity;
  //   pdfDoc.moveDown();
  //   pdfDoc
  //     .font("Times-Roman")
  //     .text(
  //       `Name: ${tour.tour.name};                      Quantity:  ${tour.quantity};                Price: ${tour.tour.price};            Total: ${totalPrice} `,
  //       {
  //         align: "left",
  //         height: 1000,
  //       }
  //     );
  // });
  // pdfDoc.moveDown();
  // pdfDoc
  //   .font("Times-Roman")
  //   .text(`---------------------------------------------------------`, {
  //     align: "center",
  //     height: 1000,
  //   });
  // pdfDoc.moveDown();
  // pdfDoc.font("Times-Roman").text(`Total: ${totalPrice}`, {
  //   align: "center",
  //   height: 1000,
  // });
  // pdfDoc.end();
};

exports.getProfile = async (req, res, next) => {
  const user = await User.findById(req.user._id);

  return res.render("shop/profile", {
    isFixed: "true",
    pageTitle: "Thông tin cá nhân",
    user: user,
    errorArray: [],
    isChange: "",
    oldInput: {},
    hasSuccess: "",
    hasError: "",
    NotifyMessage: "",
  });
};

exports.postProfile = async (req, res, next) => {
  const name = req.body.name;
  const address = req.body.address;
  const sdt = req.body.phone;
  const sex = req.body.sex;
  const image = req.file;
  const errors = validationResult(req);
  const errorArray = errors.errors;

  const user = await User.findById(req.user._id);
  user.name = name;
  if (address) {
    if (address.length < 8) {
      user.address = address;
      errorArray.push({
        param: "address",
        msg: "Địa chỉ phải lớn hơn 8 kí tự",
      });
    } else {
      user.address = address;
    }
  }

  if (image) {
    user.image = image.path;
  }

  if (sex) {
    user.sex = sex;
  }

  if (sdt) {
    if (util.isPhoneNumber(sdt)) {
      user.SDT = sdt;
    } else {
      user.SDT = sdt;
      errorArray.push({
        param: "sdt",
        msg: "Số điện thoại phải hợp lệ",
      });
    }
  }

  if (!errors.isEmpty()) {
    return res.render("shop/profile", {
      isFixed: "true",
      pageTitle: "Thông tin cá nhân",
      user: user,
      errorArray: errorArray,
      isChange: "",
      oldInput: {},
      hasSuccess: "",
      hasError: "true",
      NotifyMessage: "Sửa thông tin thất bại",
    });
  }

  const userNew = await user.save();
  return res.render("shop/profile", {
    isFixed: "true",
    pageTitle: "Thông tin cá nhân",
    user: userNew,
    errorArray: [],
    isChange: "",
    oldInput: {},
    hasSuccess: "true",
    hasError: "",
    NotifyMessage: "Sửa thông tin thành công",
  });
};

exports.changePassword = async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const oldPass = req.body.oldPassword;
  const newPass = req.body.newPassword;
  const passCofirm = req.body.confirmPassword;
  const errors = validationResult(req);
  const errorArray = errors.errors;
  const indexOldPw = errorArray.findIndex(
    (item) => item.param === "oldPassword"
  );
  if (indexOldPw < 0) {
    const result = await bcrypt.compare(oldPass, user.password);
    if (!result) {
      errorArray.push({
        param: "oldPassword",
        msg: "Mật khẩu cũ không đúng",
      });
    }
  }
  if (!errors.isEmpty()) {
    return res.render("shop/profile", {
      isFixed: "true",
      pageTitle: "Thông tin cá nhân",
      user: user,
      oldInput: {
        oldPw: oldPass,
        newPw: newPass,
        passCofirm: passCofirm,
      },
      errorArray: errorArray,
      isChange: "true",
      hasSuccess: "",
      hasError: "true",
      NotifyMessage: "Thay đổi mật khẩu thất bại",
    });
  }
  const newPassWord = await bcrypt.hash(newPass, 12);
  user.password = newPassWord;
  const userNew = await user.save();
  return res.render("shop/profile", {
    isFixed: "true",
    pageTitle: "Thông tin cá nhân",
    user: userNew,
    errorArray: [],
    isChange: "true",
    oldInput: {},
    hasSuccess: "true",
    hasError: "",
    NotifyMessage: "Thay đổi mật khẩu thành công",
  });
};

exports.sendPDF = async (req, res, next) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/pdf", { waitUntil: "networkidle0" });
  const pdf = await page.pdf({ format: "A4" });

  await browser.close();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline; filename="' + "test" + '"');
  res.send(pdf);
};

exports.getPdfCustomer = async (req, res, next) => {
  const checkId = req.params.checkId;
  const check = await Check.findOne({ _id: checkId }).populate('user.userId');
  const date = util.getDate(check.infor.time, true);
 
  return res.render("shop/pdf", {
    check: check,
    time: date,
  });
};
