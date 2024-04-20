const bcrypt = require("bcryptjs");
const User = require("../model/user");
const nodemailer = require("nodemailer");
const sendgirdTransport = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator");
const cryto = require("crypto");
const user = require("../model/user");

const transporter = nodemailer.createTransport(
  sendgirdTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    isgetSign: "",
    isFixed: "true",
    pageTitle: "Login",
    hasError: "",
    hasSuccess: "",
    NotifyMessage: "",
    arrayErrorsLogin: [],
    oldValueLogin: {},
    arrayErrorsSignup: [],
    oldValueSignup: {},
  });
};

exports.getLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    pageTitle: "Reset Password",
    isFixed: "",
    resetPassword: "",
    hasSuccess: "",
    hasError: "",
    NotifyMessage: "",
    ErrorsArray: [],
    oldInput: "",
    userId: '',
    passwordToken: '',
  });
};

exports.getToken = (req, res, next) => {
  const token = req.params.token;
  User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}}).then(user => {
    res.render("auth/reset", {
      pageTitle: "Reset Password",
      isFixed: "",
      resetPassword: "true",
      hasSuccess: "",
      hasError: "",
      NotifyMessage: "",
      ErrorsArray: [],
      oldInput: "",
      userId: user._id,
      passwordToken: token,
    });
  })
  
}

exports.postResetPassowrd = (req, res, next) => {
  const userId = req.body.userId;
  const newPassword = req.body.password;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
   return res.render("auth/reset", {
      pageTitle: "Reset Password",
      isFixed: "",
      resetPassword: "true",
      hasSuccess: "",
      hasError: "true",
      NotifyMessage: "Thay đổi mật khẩu không thành công",
      ErrorsArray: errors.errors,
      oldInput: newPassword,
      userId: userId,
      passwordToken: passwordToken,
    });
  }

 return User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: {$gt: Date.now() + 3600},
    _id: userId,
  }).then(user => {
    resetUser = user;
    return bcrypt.hash(newPassword, 12);
  }).then(hashPassword => {
    resetUser.resetToken = undefined,
    resetUser.resetTokenExpiration = undefined,
    resetUser.password = hashPassword
    return resetUser.save();
  }).then(result => {
    res.render("auth/login", {
      isgetSign: "",
      isFixed: "true",
      pageTitle: "Login",
      hasError: "",
      hasSuccess: "true",
      NotifyMessage: "Thay đổi mật khẩu thành công",
      arrayErrorsLogin: [],
      oldValueLogin: {},
      arrayErrorsSignup: [],
      oldValueSignup: {},
    });
  }).catch(err => {
    console.log(err);
  })
  

}

exports.postReset = (req, res, next) => {
  const email = req.body.email;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.render("auth/reset", {
      pageTitle: "Reset Password",
      isFixed: "",
      resetPassword: "",
      hasSuccess: "",
      hasError: "true",
      NotifyMessage: "Reset Password thất bại",
      ErrorsArray: errors.errors,
      oldInput: email,
      userId: '',
      passwordToken: '',
    });
  }

  cryto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }

    const token = buffer.toString("hex");
    
    User.findOne({ email: email })
      .then((user) => {
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;

        return user.save();
      })
      .then((result) => {
        transporter.sendMail({
          to: req.body.email,
          from: "hatzingvn123@gmail.com",
          subject: "Password reset",
          html: `
          <p>You requested a password reset</p>
          <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
        `,
        });
        res.render("auth/reset", {
          pageTitle: "Reset Password",
          isFixed: "",
          resetPassword: "",
          hasSuccess: "true",
          hasError: "",
          NotifyMessage: "Kiểm tra email để reset password",
          ErrorsArray: [],
          oldInput: "",
          userId: '',
          passwordToken: '',
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.postSignUp = async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmpassword;

  const errors = validationResult(req);

  const errorArray = errors.errors;
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      isgetSign: "true",
      isFixed: "",
      pageTitle: "Login",
      hasError: "true",
      hasSuccess: "",
      NotifyMessage: "Đăng kí thất bại",
      arrayErrorsLogin: [],
      oldValueLogin: {},
      arrayErrorsSignup: errorArray,
      oldValueSignup: {
        email: errorArray.find((e) => e.param === "email")
          ? errorArray.find((e) => e.param === "email").value
          : email,
        password: password,
        name: name,
        confirmPassword: confirmPassword,
      },
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashPassword) => {
      const user = new User({
        name: name,
        email: email,
        password: hashPassword,
      });
      return user.save();
    })
    .then((result) => {
      transporter.sendMail({
        to: email,
        from: "hatzingvn123@gmail.com",
        subject: "Signup succeeded!",
        html: "<h1>You successfully signed up!</h1>",
      });
      return res.render("auth/login", {
        isgetSign: "",
        isFixed: "",
        pageTitle: "Login",
        hasError: "",
        hasSuccess: "true",
        NotifyMessage: "Đăng kí thành công",
        arrayErrorsLogin: [],
        oldValueLogin: {},
        arrayErrorsSignup: [],
        oldValueSignup: {},
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  const errorArray = errors.errors;
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      isgetSign: "",
      isFixed: "",
      pageTitle: "Login",
      hasError: "true",
      hasSuccess: "",
      NotifyMessage: "Đăng nhập thất bại",
      arrayErrorsLogin: errorArray,
      oldValueLogin: {
        email: errorArray.find((e) => e.param === "email")
          ? errorArray.find((e) => e.param === "email").value
          : email,
        password: password,
      },
      arrayErrorsSignup: [],
      oldValueSignup: {},
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          isgetSign: "",
          isFixed: "",
          pageTitle: "Login",
          hasError: "true",
          hasSuccess: "",
          NotifyMessage: "Email chưa được đăng ký",
          arrayErrorsLogin: errorArray,
          oldValueLogin: {
            email: errorArray.find((e) => e.param === "email")
              ? errorArray.find((e) => e.param === "email").value
              : email,
            password: password,
          },
          arrayErrorsSignup: [],
          oldValueSignup: {},
        });
      }
      bcrypt.compare(password, user.password).then((doMatch) => {
        if (doMatch) {
          req.session.isLoggin = true;
          req.session.user = user;
          return req.session.save((err) => {
            res.redirect("/");
          });
        }
        return res.status(422).render("auth/login", {
          isgetSign: "",
          isFixed: "",
          pageTitle: "Login",
          hasError: "true",
          hasSuccess: "",
          NotifyMessage: "Mật khẩu không đúng",
          arrayErrorsLogin: errorArray,
          oldValueLogin: {
            email: errorArray.find((e) => e.param === "email")
              ? errorArray.find((e) => e.param === "email").value
              : email,
            password: password,
          },
          arrayErrorsSignup: [],
          oldValueSignup: {},
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
