$(document).ready(function() {
  $("#welcomeBox").hide();
  $("#welcomeText").hide();
  $("#welcomeBox").slideDown("slow", function() {
  $("#welcomeText").fadeIn("slow");
  });
});

$("button").on("click", "#welcomeScrape", function() {
 console.log("Clicked!!");
  $("#welcomeBox").slideUp("slow");
  $("#welcomeText").fadeOut("slow");
  });
