// Basic animation at the /news and /saved paths
$("#wrapper").hide();
$("#articles").hide();
$("#navigation").hide();

$(document).ready(function() {
  $("#wrapper").fadeIn(500);
  $("#articles").fadeIn(500);
  $("#navigation").fadeIn(1000);
});

// Grab 20 articles to format and display on /news
$.getJSON("/articles", function(data) {
    for (var i = 0; i < 20; i++) {
        $("#articles").append(
            "<h3>" + data[i].title + "</h3>" + "<p id='date'>" + data[i].date + "</p>" + "<span class='brief'>" + data[i].brief + "<span id='more'><a href='http://www.chicagotribune.com" + data[i].link + "' target='_blank'>" + " Read more</span></span></a><button data-id='" + data[i]._id + "'id='saveButton'>Save article</button>");
    }
});

// Grab up to 20 articles that are "saved" to format and display on /saved
$.getJSON("/articles", function(data) {
    for (var i = 0; i < 20; i++) {
        if (data[i].saved == true) {
          $("#savedArticles").append(
            "<h3>" + data[i].title + "</h3>" + "<p id='date'>" + data[i].date + "</p>" + "<span class='brief'>" + data[i].brief + "<span id='more'><a href='http://www.chicagotribune.com" + data[i].link + "' target='_blank'>" + " Read more</span></span></a><button data-id='" + data[i]._id + "'id='unsaveButton'>Remove Article</button><button data-id='" + data[i]._id + "'id='addNote'>Article note</button>");
        }
    }
});

// When user clicks "save article" button, boolean value changes
$(document).on("click", "#saveButton", function() {
  var thisId = $(this).attr("data-id");
  $(this).empty();
  $(this).append("Saved!");

  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      saved: true
    }
  })
    .done(function(data) {
  });
});

// When user clicks "remove article" button, boolean value changes
$(document).on("click", "#unsaveButton", function() {
  var thisId = $(this).attr("data-id");

  $.ajax({
    method: "POST",
    url: "/saved/" + thisId,
    data: {
      saved: false
    }
  })
    .done(function(data) {
      location.reload();
  });
});

// Add feature to write "No saved articles" to div if div is empty

// Add an article note
$(document).on("click", "#addNote", function() {
  var thisId = $(this).attr("data-id");
  console.log(thisId);
  // REWRITE INTO JQUERY
  // var modal = $("#myModal")
  var modal = document.getElementById('myModal');
  modal.style.display = "block";
  var span = document.getElementsByClassName("close")[0];
  span.onclick = function() {
    modal.style.display = "none";
    location.reload();
}
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        location.reload();
    }
}
// END MODAL

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      // if($("#articleTitle").length < 0) {
      //   $("#articleTitle").append(data.title);
      // }
      $("#articleTitle").append("<h2>" + data.title + "</h2>");

      // An input to enter a new title
      $("#noteTitle").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#articleNote").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#articleNote").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
      $("#articleNote").append("<button data-id='" + data._id + "' id='deletenote'>Delete Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  location.reload();

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/saved/note/" + thisId,
    data: {
      title: $("#titleinput").val(),
      body: $("#bodyinput").val()
    }
  })
    .done(function(data) {
      console.log(data);
      $("#myModal").hide();
    });
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

// When you click the deletenote button
$(document).on("click", "#deletenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  location.reload();

  // Run a POST request to "delete" the note, by clearing the input fields.
  $.ajax({
    method: "POST",
    url: "/saved/note/" + thisId,
    data: {
      title: $("").val(),
      body: $("").val()
    }
  })
    .done(function(data) {
      console.log(data);
      $("#myModal").hide();
    });
});
