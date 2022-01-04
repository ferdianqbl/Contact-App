const { urlencoded } = require("express");
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const { loadContact, findContact, addContact, checkDuplicate, deleteContact, updateContacts } = require("./utils/contacts");
const { body, validationResult, check } = require("express-validator");
// to use connect-flash
const session = require('express-session');
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
//end connect-flash
const port = 3000;

// menggunakan view engine ejs
app.set("view engine", "ejs");

// Third Party Middleware
app.use(expressLayouts);

// Built in Middleware
app.use(express.static("public"));
app.use(
  urlencoded({
    extended: true,
  })
); // to get all form value

// flash configuration
app.use(cookieParser('secret'));

app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

app.use(flash());

// ===========================================
app.get("/", (req, res) => {
  const mahasiswa = [
    {
      nama: "ferdi",
      email: "ferdi@gmail.com",
    },
    {
      nama: "anton",
      email: "anton@gmail.com",
    },
    {
      nama: "ucup",
      email: "ucup@gmail.com",
    },
  ];

  res.render("index", {
    name: "ferdi",
    age: 19,
    mahasiswa,
    title: "Halaman Home",
    layout: "layouts/main-layout.ejs",
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    title: "Halaman About",
    layout: "layouts/main-layout.ejs",
  });
});

app.get("/contact", (req, res) => {
  const contacts = loadContact();
  // console.log(req);
  res.render("contact", {
    title: "Halaman Contact",
    layout: "layouts/main-layout.ejs",
    contacts,
    flashMsg: req.flash('flashMsg'),
  });
});

// add contact
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Form Add Contact",
    layout: "layouts/main-layout",
  });
});

// add contact process
app.post(
  "/contact",
  [
    body("name").custom((value) => {
      const isDuplicate = checkDuplicate(value);

      if (isDuplicate) throw new Error("Name has been used!");
      return true;
    }),
    check("email", "Email not Valid!").isEmail(),
    check("phone", "Phone not Valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Form Add Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    }

    else {
      addContact(req.body);
      req.flash('flashMsg', 'Contact added successfully'); // set message to success, check app.get contact
      res.redirect("/contact");
    }
  }
);

// delete
app.get('/contact/delete/:name', (req, res) => {
  const contact = findContact(req.params.name);

  if (!contact) {
    res.status(404); // menangani jika halaman tidak ada
    res.send("<h1>404</h1>");
  }
  else {
    deleteContact(req.params.name);
    req.flash('flashMsg', 'Contact deleted successfully'); // set message to success, check app.get contact
    res.redirect('/contact');
  }
})

// edit contact
app.get('/contact/edit/:name', (req, res) => {

  const contact = findContact(req.params.name);

  res.render("edit-contact", {
    title: "Form Edit Contact",
    layout: "layouts/main-layout",
    contact
  });
})

app.post(
  "/contact/update",
  [
    body("name").custom((value, { req }) => {
      const isDuplicate = checkDuplicate(value);

      if (value !== req.body.oldName && isDuplicate) throw new Error("Name has been used!");
      return true;
    }),
    check("email", "Email not Valid!").isEmail(),
    check("phone", "Phone not Valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Form Edit Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body
      });
    }

    else {
      updateContacts(req.body);
      req.flash('flashMsg', 'Contact updated successfully'); // set message to success, check app.get contact
      res.redirect("/contact");
    }
  }
);

// detail contact
app.get("/contact/:name", (req, res) => {
  const contact = findContact(req.params.name);
  res.render("detail", {
    title: "Halaman Detail Contact",
    layout: "layouts/main-layout.ejs",
    contact,
  });
});


// akan dijalankan ketika tidak ada router yang sesuai dari code sebelumnya (selalu letakkan di bawah)
app.use((req, res) => {
  res.status(404); // menangani jika halaman tidak ada
  res.send("<h1>404</h1>");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
