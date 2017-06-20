// *******************************************************************************
// Server.js - This file is the initial starting point for the Node/Express server.
// *******************************************************************************

// *** Dependencies
// =============================================================|
var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
mongoose.Promise = Promise;
var request = require("request");
var cheerio = require("cheerio");
var path = require("path")

// Requiring our models for syncing
// =============================================================|
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

// Sets up the Express App
// =============================================================|
var app = express();
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make "public" a static directory
// =============================================================|
app.use(express.static("public"));

// Database configuration with mongoose
// =============================================================|
mongoose.connect("mongodb://localhost/newsFeed");
var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// ROUTES
// =============================================================|

// Load our /news path
app.get("/news", function(req, res) {
  res.sendFile(path.join(__dirname + '/public/news.html'));
});

// Load our /saved path
app.get("/saved", function(req, res) {
      res.sendFile(path.join(__dirname + '/public/saved.html'));
  });

// SCRAPING ARTICLES /////////////

// Scrape articles from Chicago Tribune breaking section
app.get("/scrape", function(req, res) {
  request("http://www.chicagotribune.com/news/local/breaking/", function(error, response, html) {
    var $ = cheerio.load(html);
    $("section.trb_outfit_group_list_item_body").each(function(i, element) {

      var result = {};

      result.title = $(this).children("h3").text();
      result.date = $(this).find("span.trb_outfit_categorySectionHeading_date").attr("data-dt");
      result.brief = $(this).children("p").text();
      result.link = $(this).find("a.trb_outfit_relatedListTitle_a").attr("href");

      var entry = new Article(result);

      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(doc);
          console.log("==================================");
        }
      });
    });
  });
  setTimeout(function() { res.redirect('/news'); }, 400);
});

// This will get the articles we scraped from Tribune
app.get("/articles", function(req, res) {
  Article.find({}, function(error, doc) {
    if (error) {
      console.log(error);
    } else {
      res.json(doc);
    }
  });
});

// SAVING AN ARTICLE /////////////

// Save an article by updating the boolean "saved" value
app.post("/articles/:id", function(req, res) {
  Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true })
  .exec(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});

// Remove an article from our list of "saved" articles
app.post("/saved/:id", function(req, res) {
  Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": false })
  .exec(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});

// ARTICLE NOTES /////////////

// Get an article and see it's associated note
app.get("/articles/:id", function(req, res) {
  Article.findOne({ "_id": req.params.id })
  .populate("note")
  .exec(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});

// Create a new note or replace an existing note
app.post("/saved/note/:id", function(req, res) {
  var newNote = new Note(req.body);
  newNote.save(function(error, doc) {
    if (error) {
      console.log(error);
    } else {
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      .exec(function(err, doc) {
        if (err) {
          console.log(err);
        } else {
          res.send(doc);
        }
      });
    }
  });
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
