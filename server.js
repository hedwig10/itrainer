require("dotenv").config();
var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var session = require("express-session");
//requiring passport as we configured it
var passport = require("./config/passport");
var _USERS = require("./db/seed-users.json");
var _STATS = require("./db/seed-workouts.json");

var db = require("./models");

var app = express();
var PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
// Sessions to keep track of the user
app.use(session({ secret: "keyboard cat", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// Routes
require("./routes/apiRoutes")(app);
require("./routes/htmlRoutes")(app);

var syncOptions = { force: true };

// If running a test, set syncOptions.force to true
// clearing the `testdb`
if (process.env.NODE_ENV === "test") {
  syncOptions.force = true;
}

// Starting the server, syncing our models ------------------------------------/
db.sequelize.sync(syncOptions)
.then(function() {
  debugger;
  if(syncOptions.force === true){
  db.User.bulkCreate(_USERS)
    .then(function(users) {
      console.log("success seeding users " + users);
    })
    .catch(function(error) {
      console.log(error);
    });
  db.Workout.bulkCreate(_STATS)
    .then(function(stats) {
      console.log("success seeding stats " + stats);
    })
    .catch(function(error) {
      console.log(error);
    });
  }
})
.then(function() {
  app.listen(PORT, function() {
    console.log(
      "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
      PORT,
      PORT
    );
  });
});

module.exports = app;
