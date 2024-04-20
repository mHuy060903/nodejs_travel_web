const User = require("../model/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
// const user = require("../model/user");
const Tour = require("../model/tour");
const mongoose = require("mongoose");
const util = require("../util/main");
const Check = require("../model/check");
const ITEM_PER_PAGE = 3;

exports.getAllUser = async (req, res, next) => {
  let totalItem;
  let allUsers;

  if (req.user.role === 1) {
    return res.redirect("/");
  }
  let query = "";
  const page = +req.query.page || 1;
  const name = req.query.name;
  const email = req.query.email;

  if (name) {
    query = `&name=${name}`;
  }

  if (query && email) {
    query += `&email=${email}`;
  } else if (!name && email) {
    query = `&email=${email}`;
  }

  // if (query && email) {
  //   query += ", {email: { $regex: '.*' + email + '.*'}}";
  // } else if (!name && email) {
  //   query = "{email: { $regex: '.*' + email + '.*'}}";
  // }

  if (name) {
    totalItem = await User.find({
      name: { $regex: ".*" + name + ".*", $options: 'i' },
    }).countDocuments();
    allUsers = await User.find({
      name: { $regex: ".*" + name + ".*", $options: "i" },
    })
      .skip((page - 1) * ITEM_PER_PAGE)
      .limit(ITEM_PER_PAGE);
  }

  if (email) {
    totalItem = await User.find({
      email: { $regex: ".*" + email + ".*", $options: 'i' },
    }).countDocuments();
    allUsers = await User.find({
      email: { $regex: ".*" + email + ".*", $options: "i" },
    })
      .skip((page - 1) * ITEM_PER_PAGE)
      .limit(ITEM_PER_PAGE);
  }

  if (name && email) {
    totalItem = await User.find({
      $and: [
        { email: { $regex: ".*" + email + ".*", $options: 'i' } },
        { name: { $regex: ".*" + name + ".*" }, $options: 'i' },
      ],
    }).countDocuments();

    allUsers = await User.find({
      $and: [
        { email: { $regex: ".*" + email + ".*", $options: 'i' } },
        { name: { $regex: ".*" + name + ".*" }, $options: 'i' },
      ],
    })
      .skip((page - 1) * ITEM_PER_PAGE)
      .limit(ITEM_PER_PAGE);
  }

  if (!name && !email) {
    totalItem = await User.find().countDocuments();
    allUsers = await User.find()
      .skip((page - 1) * ITEM_PER_PAGE)
      .limit(ITEM_PER_PAGE);
  }
  return res.render("admin/users/user", {
    pageTitle: "Quản lý người dùng",
    path: "/user",
    user: req.user,
    allUser: allUsers,
    hasSuccess: "",
    hasError: "",
    NotifyMessage: "",
    currentPage: page,
    hasNextPage: ITEM_PER_PAGE * page < totalItem,
    hasPreviousPage: page > 1,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: Math.ceil(totalItem / ITEM_PER_PAGE),
    query: query,
    queryInput: {
      email: email,
      name: name,
    },
  });
};

exports.getAllTour = async (req, res, next) => {
  const page = +req.query.page || 1;

  const name = req.query.name;
  let query = "";
  let totalItem;
  let allTours;
  const allUsers = await User.find();

  if (name) {
    query = `&name=${name}`;
  }

  if (name) {
    totalItem = await Tour.find({
      name: { $regex: ".*" + name + ".*", $options: "i" },
    }).countDocuments();
    allTours = await Tour.find({
      name: { $regex: ".*" + name + ".*", $options: "i" },
    })
      .populate("userId")
      .skip((page - 1) * ITEM_PER_PAGE)
      .limit(ITEM_PER_PAGE);
  }

  if (!name) {
    totalItem = await Tour.find().countDocuments();
    allTours = await Tour.find()
      .populate("userId")
      .skip((page - 1) * ITEM_PER_PAGE)
      .limit(ITEM_PER_PAGE);
  }
  return res.render("admin/tours/tour", {
    pageTitle: "Quản lý Tour",
    path: "/tour",
    user: req.user,
    allTours: allTours,
    hasSuccess: "",
    hasError: "",
    NotifyMessage: "",
    allUsers: allUsers,
    currentPage: page,
    hasNextPage: ITEM_PER_PAGE * page < totalItem,
    hasPreviousPage: page > 1,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: Math.ceil(totalItem / ITEM_PER_PAGE),
    query: query,
    queryInput: {
      name: name,
    },
  });
};

exports.getEditUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const allUser = await User.find();
    const user = await User.findById(userId);

    // if (!user) {
    //   return res.render("admin/users/user", {
    //     pageTitle: "Quản lý người dùng",
    //     path: "/user",
    //     user: req.user,
    //     allUser: allUser,
    //     hasSuccess: "",
    //     hasError: "true",
    //     NotifyMessage: "Người dùng không có trong hệ thống",
    //   });
    // }

    return res.render("admin/users/add", {
      pageTitle: "Sửa người dùng",
      path: "/user",
      user: req.user,
      hasSuccess: "",
      hasError: "",
      NotifyMessage: "",
      errorsArray: [],
      oldInput: {
        email: user.email,
        name: user.name,
        password: "",
        confirmPassword: "",
        role: user.role,
      },
      editMode: "true",
      userId: userId,
    });
  } catch (error) {
    const err = new Error("User not found");
    return next(err);
  }
};

exports.getAddUser = (req, res, next) => {
  res.render("admin/users/add", {
    pageTitle: "Thêm người dùng",
    path: "/user",
    user: req.user,
    hasSuccess: "",
    hasError: "",
    NotifyMessage: "",
    errorsArray: [],
    oldInput: {},
    editMode: "",
  });
};

exports.getAddTour = (req, res, next) => {
  res.render("admin/tours/add", {
    pageTitle: "Thêm tour",
    path: "/tour",
    user: req.user,
    userId: req.user._id,
    hasSuccess: "",
    hasError: "",
    NotifyMessage: "",
    errorsArray: [],
    oldInput: {},
    editMode: "",
  });
};

exports.getEditTour = (req, res, next) => {
  const tourId = req.params.tourId;

  Tour.findById(tourId)
    .then((tour) => {
      if (!tour) {
        res.redirect("/admin/tour");
      }
      // const date = tour.date.split('T')[0];
      // console.log(tour.date);
      // console.log(tour.date.getDate());
      // console.log(tour.date.getMonth() + 1);
      // console.log(tour.date.getFullYear());
      return res.render("admin/tours/add", {
        pageTitle: "Sửa tour",
        path: "/tour",
        user: req.user,
        userId: req.user._id,
        hasSuccess: "",
        hasError: "",
        NotifyMessage: "",
        errorsArray: [],
        oldInput: {
          name: tour.name,
          price: tour.price,
          date: util.getDate(tour.date),
          des: tour.description,
          location: tour.location,
        },
        editMode: "true",
        tourId: tourId,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postEditTour = (req, res, next) => {
  const location = req.body.location;
  const name = req.body.name;
  const image = req.file;
  const price = req.body.price;
  const date = req.body.date;
  const des = req.body.des;
  const tourId = req.body.tourId;
  const errors = validationResult(req);
  let errorsArray = errors.errors;

  if (date) {
    const dateValidator = new Date();
    const dateStart = new Date(date);
    if (dateValidator > dateStart) {
      errorsArray.push({
        param: "date",
        msg: "Ngày xuất phát không thể nhỏ hơn ngày hiện tại",
      });
    }
  } else {
    errorsArray.push({
      param: "date",
      msg: "Ngày không được để trống",
    });
  }

  if (!errors.isEmpty()) {
    return res.render("admin/tours/add", {
      pageTitle: "Sửa tour",
      path: "/tour",
      user: req.user,
      userId: req.user._id,
      hasSuccess: "",
      hasError: "",
      NotifyMessage: "",
      errorsArray: errorsArray,
      oldInput: {
        name: name,
        price: price,
        date: date,
        des: des,
        location: location,
      },
      editMode: "true",
      tourId: tourId,
    });
  }

  Tour.findById(tourId)
    .then((tour) => {
      if (!tour) {
        res.redirect("/admin/tour");
      }
      tour.name = name;
      tour.price = price;
      tour.date = date;
      tour.description = des;
      tour.location = location;
      if (image) {
        tour.imageUrl = image.path;
      }

      return tour.save();
    })
    .then((result) => {
      res.redirect("/admin/tour");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getDeleteTour = (req, res, next) => {
  const tourId = req.params.tourId;

  Tour.findById(tourId)
    .then((tour) => {
      if (!tour) {
        res.redirect("/admin/tour");
      }
      return Tour.deleteOne({ _id: tourId });
    })
    .then((result) => {
      return res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAddTour = (req, res, next) => {
  const location = req.body.location;
  const name = req.body.name;
  const image = req.file;
  const price = +req.body.price;
  const date = req.body.date;
  let des = req.body.des;

  const errors = validationResult(req);

  let errorsArray = errors.errors;
  if (!image) {
    errorsArray.push({
      param: "image",
      msg: "Hình ảnh không được để trống",
    });
  }

  if (date) {
    const dateValidator = new Date();
    const dateStart = new Date(date);
    if (dateValidator > dateStart) {
      errorsArray.push({
        param: "date",
        msg: "Ngày xuất phát không thể nhỏ hơn ngày hiện tại",
      });
    }
  } else {
    errorsArray.push({
      param: "date",
      msg: "Ngày không được để trống",
    });
  }

  if (!errors.isEmpty()) {
    return res.render("admin/tours/add", {
      pageTitle: "Thêm tour",
      path: "/tour",
      user: req.user,
      userId: req.user._id,
      hasSuccess: "",
      hasError: "",
      NotifyMessage: "",
      errorsArray: errorsArray,
      oldInput: {
        name: name,
        price: price,
        date: date,
        des: des,
        location: location,
      },
      editMode: "",
    });
  }

  des = des.replace(/<\/?[^>]+(>|$)/g, "");
  const tour = new Tour({
    location: location,
    name: name,
    price: price,
    description: des,
    date: date,
    userId: req.user._id,
    imageUrl: image.path,
  });

  return tour
    .save()
    .then((result) => {
      res.redirect("/admin/tour");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAddUser = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmpassword;
  const role = +req.body.role;

  const errors = validationResult(req);

  console.log(errors.errors);
  if (!errors.isEmpty()) {
    return res.render("admin/users/add", {
      pageTitle: "Thêm người dùng",
      path: "/user",
      user: req.user,
      hasSuccess: "",
      hasError: "true",
      NotifyMessage: "Thêm người dùng thất bại",
      errorsArray: errors.errors,
      oldInput: {
        email: email,
        name: name,
        password: password,
        confirmPassword: confirmPassword,
        role: role,
      },
      editMode: "",
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashPassword) => {
      const user = new User({
        email: email,
        password: hashPassword,
        name: name,
        role: role,
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/admin/user");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postEditUser = (req, res, next) => {
  const image = req.file;
  const email = req.body.email;
  const name = req.body.name;
  const role = req.body.role;
  const userId = req.body.userId;

  const errors = validationResult(req);
  console.log(errors.errors);

  if (!errors.isEmpty()) {
    return res.render("admin/users/add", {
      pageTitle: "Sửa người dùng",
      path: "/user",
      user: req.user,
      hasSuccess: "",
      hasError: "true",
      NotifyMessage: "Sửa thất bại",
      errorsArray: errors.errors,
      oldInput: {
        email: email,
        name: name,
        role: role,
      },
      editMode: "true",
      userId: userId,
    });
  }

  User.findById(userId)
    .then((user) => {
      user.email = email;
      user.name = name;
      user.role = role;
      if (image) {
        user.image = image.path;
      }

      return user.save().then((result) => {
        res.redirect("/admin/user");
      });
    })
    .catch((err) => console.log(err));
};

exports.getDeleteUser = (req, res, next) => {
  const userId = req.params.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        res.redirect("/admin/user");
      }
      return User.deleteOne({ _id: userId });
    })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getChecks = async (req, res, next) => {
  const page = +req.query.page || 1;
  const checks0 = await Check.find({ "infor.status": 0 });
  const checks1 = await Check.find({ "infor.status": 1 })
    .skip((page - 1) * ITEM_PER_PAGE)
    .limit(ITEM_PER_PAGE);

  const now = new Date();
  const test = checks0[0];
  checks0.forEach((check) => {
    check.csrf = check.infor.timeToken - now.getTime();
  });

  checks1.forEach((item) => {
    const date = util.getDate(item.infor.time, true);
    item.infor.date = date;
  });
  const totalItem = await Check.find({ "infor.status": 1 }).countDocuments();
  return res.render("admin/checks/checks", {
    pageTitle: "Quản lý hóa đơn",
    path: "/checks",
    checks0: checks0,
    checks1: checks1,
    hasSuccess: "",
    hasError: "",
    NotifyMessage: "",
    currentPage: page,
    hasNextPage: ITEM_PER_PAGE * page < totalItem,
    hasPreviousPage: page > 1,
    nextPage: page + 1,
    previousPage: page - 1,
    lastPage: Math.ceil(totalItem / ITEM_PER_PAGE),
    query: "",
  });
};

exports.postConfirmPay = (req, res, netx) => {
  const checkId = req.body.checkId;

  Check.findById(checkId)
    .then((check) => {
      if (!check) {
        return res.redirect("/admin/checks");
      }
      check.infor.status = 1;
      check.infor.time = new Date();
      return check.save();
    })
    .then((result) => {
      return res.redirect("/admin/checks");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getThongKe = async (req, res, next) => {
  const now = new Date().toISOString().slice(0, 10);
  const date = req.query.day || now;

  const nowTime = new Date().getTime();
  const dateTime = new Date(date).getTime();
  let total = 0;
  let arrCheck = [];
  if (dateTime > nowTime) {
    return res.render("admin/thongke/thongke", {
      pageTitle: "Quản lý hóa đơn",
      path: "/thongke",
      arrCheck: arrCheck,
      date: date,
      error: "true",
      total: total,
    });
  }
  arrCheck = await Check.find({ "infor.status": { $gte: 1 } }).populate(
    "user.userId"
  );

  arrCheck = arrCheck.filter((item) => {
    return item.infor.time.toISOString().slice(0, 10) === date;
  });

  arrCheck.forEach((item) => {
    const date = util.getDate(item.infor.time, true);
    item.infor.date = date;
  });

  arrCheck.forEach((item) => (total += item.infor.total));

  return res.render("admin/thongke/thongke", {
    pageTitle: "Quản lý hóa đơn",
    path: "/thongke",
    arrCheck: arrCheck,
    date: date,
    error: "",
    total: total,
  });
};
