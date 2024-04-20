const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const multer = require("multer");
const User = require("./model/user");
const Check = require("./model/check");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = require("./socket").init(server);

const mongooseURL =
  "mongodb+srv://minhhuy123:huy123456@cluster0.p4o0mgs.mongodb.net/doan?retryWrites=true&w=majority";

const store = new MongoDBStore({
  uri: mongooseURL,
  collection: "sessions",
});

const fileStorages = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Math.random() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const shopRouter = require("./router/shop");
const adminRouter = require("./router/admin");
const authRouter = require("./router/auth");
const chatRouter = require("./router/chat");
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorages, fileFilter: fileFilter }).single("image")
);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.isLoggin = req.session.isLoggin;
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      res.locals.isRole = user.role;
      res.locals.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use((req, res, next) => {
  const now = new Date().getTime();

  Check.deleteMany({
    $and: [{ "infor.timeToken": { $lt: now } }, { "infor.status": { $lt: 1 } }],
  })
    .then((result) => {})
    .catch((err) => {
      console.log(err);
    });

  return next();
});

app.use(shopRouter);
app.use(authRouter);
app.use("/admin", adminRouter);

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.emit("join", "A user joined the chat");

  socket.on("postMessage", (msg) => {
    io.emit("post", msg);
  });
});
app.use(chatRouter);
// app.use((req, res, next) => {
//   res.render("error", {
//     pageTitle: "Error",
//     isFixed: "true",
//     isLoggin: req.session.isLoggin,
//   });
// });
// app.use((error, req, res, next) => {
//   res.render("error", {
//     pageTitle: "Error",
//     isFixed: "true",
//     isLoggin: req.session.isLoggin,
//   });
// });
mongoose
  .connect(mongooseURL)
  .then((result) => {
    server.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
