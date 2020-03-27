define("HomeView", [
  "jquery",
  "underscore",
  "backbone",
  "text!templates/home.html",
  "GameModel"
], function($, _, Backbone, tpl, GameModel) {
  var HomeView;

  HomeView = Backbone.View.extend({
    initialize: function() {
      this.currSelected = "NONE";
      this.model = new GameModel();
      this.template = _.template(tpl);
    },
    events: {
      "keyup #peasant-name": "onPeasantNameType",
      "keyup #king-name": "onKingNameType",
      "keyup #king-pass": "onKingPassType",
      "click #peasant-submit": "submitPeasant",
      "click #king-submit": "submitKing",
      "click .team.left img": "clickTeam",
      "click .team.right img": "clickTeam"
    },
    render: function() {
      var that = this,
        tmpl;

      var tmpl = this.template();

      $(that.el).html(tmpl);
      return this;
    },
    clickTeam: function() {
      $("html, body").animate(
        {
          scrollTop: $("#form-start").offset().top - 50
        },
        800
      );
    },
    onKingNameType: function(e) {
      var kingName = $(this.el)
        .find("#king-name")
        .val()
        .trim();
      if (kingName == "") {
        kingName = "&lt; your name here &gt;";
      }
      $(this.el)
        .find("#king-name-preview")
        .html(kingName);
    },
    onKingPassType: function(e) {
      var kingName = $(this.el)
        .find("#king-pass")
        .val()
        .trim();
      if (kingName == "") {
        kingName = "usurpthis";
      }
      $(this.el)
        .find("#king-pass-preview")
        .html(kingName);
    },
    onPeasantNameType: function(e) {
      var kingName = $(this.el)
        .find("#peasant-name")
        .val()
        .trim();
      if (kingName == "") {
        kingName = "&lt; your name here &gt;";
      }
      $(this.el)
        .find("#peasant-name-preview")
        .html(kingName);
    },
    submitPeasant: function() {
      var that = this,
        peasantName = $("#peasant-name").val();
      //hide the button
      $("#peasant-submit").hide();
      $("#peasant-loading")
        .html("Loading...")
        .show("slow");
      //send ajax request to server
      $.ajax({
        url: "/api/v1/game/random",
        type: "GET",
        data: {
          peasantName: peasantName
        },
        dataType: "json"
      })
        .done(function(res) {
          $("#peasant-submit").show();
          if (res.error) {
            console.log(res);
            $("#peasant-loading").html(res.error);
            $("#peasant-loading").show("slow");
          } else {
            if (res) {
              that.model.set(res);
              that.model.trigger("peasant-start-success");
            } else {
              console.log(res);
              $("#peasant-loading").html(res.error);
            }
          }
        })
        .fail(function(jqXHR, textStatus) {
          console.log("Request failed: " + textStatus);
          $("#peasant-loading").html("Request failed: " + textStatus);
        });
    },
    submitKing: function() {
      var kingName = $.trim($("#king-name").val());
      var kingPass = $.trim($("#king-pass").val());

      $("#king-submit").hide();
      $("#king-loading")
        .html("Loading...")
        .show("slow");
      this.model.save(
        {
          kingName: kingName,
          kingPass: kingPass
        },
        {
          silent: false,
          sync: true,
          success: function(model, res) {
            $("#king-submit").show();
            if (res && res.error) {
              if (res.error.code == 2) {
                $("#king-loading")
                  .html("Game limit reached")
                  .show("slow");
              }
            } else {
              console.log("Success, starting a new game");
              model.trigger("king-start-success");
            }
          },
          error: function(model, res) {
            console.log("Hey");
            $("#king-submit").show();
            if (res && res.errors) {
              console.log("Error starting new game");
              $("#king-loading").html("Error starting new game");
            } else if (res.status === 404) {
              console.log("Unable to start a new game: 404");
              $("#king-loading").html("Unable to start a new game: Error 404");
            } else if (res.status === 500) {
              console.log("Unable to start a new game: 500");
              $("#king-loading").html("Unable to start a new game: Error 500");
            }
          }
        }
      );
    }
  });

  return HomeView;
});
