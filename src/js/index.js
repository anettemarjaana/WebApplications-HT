const express = require("express");
const app = express();

var path = require("path");
app.set("views", path.join("/views", "views"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
/* Now we can save views as .html instead of .ejs */

// Create route
app.get("/", (req, res) => {
  res.render("views/index");
});

app.listen(8080);
