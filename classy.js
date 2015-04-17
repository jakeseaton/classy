// Client and Server code for Classy
// Developed using Meteor by Jake Seaton
// Quincy Dewolfe 20-05

var RED = "#B71C1C"
var BLUE = "#90A4AE"
var GOLD = "#BC9D52"

var STATUSTODATA  = {
  "":["http://harvardlampoon.com", "drunk/sober.png"],
  "SOBER":["http://www.urbandictionary.com/define.php?term=sober", "drunk/sober.png"],
  "BUZZED":["http://www.urbandictionary.com/define.php?term=buzzed", "drunk/sober.png"],
  "HORNY":["http://www.urbandictionary.com/define.php?term=horny", "drunk/tipsy.png"],
  "SLOPPY":["http://www.urbandictionary.com/define.php?term=sloppy", "drunk/buzzed.png"],
  "HAMMERED":["http://www.urbandictionary.com/define.php?term=hammered", "drunk/buzzed.png"],
  "WASTED":["http://www.urbandictionary.com/define.php?term=White+Girl+Wasted", "drunk/wasted.png"],
  "SHITFACED":["http://www.urbandictionary.com/define.php?term=shitfaced", "drunk/wasted.png"],
  "BLACKOUT":["http://www.urbandictionary.com/define.php?term=blackout", "drunk/blackout.png"],
  "CLICK HERE":["http://huhs.harvard.edu/need-care/get-help-now", "drugs/meth.png"]
}

var STATUSES = ["", "SOBER", "BUZZED", "HORNY", "SLOPPY", "HAMMERED", "WASTED", "SHITFACED", "BLACKOUT", "CLICK HERE"]
Courses = new Mongo.Collection("courses");
Wines = new Mongo.Collection("wines");
Drugs = new Mongo.Collection("drugs");
var banners = ["CLASSY!", "DRINK UP!", "KEG STAND!", "SHOTS!", "WINE NIGHT!", "GOOD CHOICE!"]//["Nice!", "Got it!", "Careful!", "Yikes!", "Yesh!","What?","Smart!", "Look at your life", "Look at your choices"]
var noBanners = ["MAYBE NEXT TIME", "TRYING TO CUT BACK"]
var vomBanners = ["BLEARGH", "MUCH BETTER", "HOLD MY HAIR"]
var vomNoises = ["noises/vomit1.wav", "noises/vomit2.wav"]

// SavedCourses = new Mongo.Collection("saved");



// server code
if (Meteor.isServer){

  // insert into wines database
  if (Wines.find().count() ===0){

    var output = JSON.parse(Assets.getText("redwine.json"));
    var redwines = output.Products.List
    for (wine in redwines){
      var curr = redwines[wine]
      var proof = Math.floor((Math.random()*10)+10);
      curr.Proof = proof;
      curr.Color = "red";
      curr.Icon = "img/redwine.png"
      Wines.insert(curr)
    }

    // import white wines
    output = JSON.parse(Assets.getText("whitewines.json"));
    var whitewines = output.Products.List;
    for (wine in whitewines){
      var curr = whitewines[wine]
      var proof = Math.floor((Math.random()*10)+10)
      curr.Proof = proof;
      curr.Color = "white";
      curr.Icon = "img/whitewine.png"

      Wines.insert(curr);
    }


  }

  if (Drugs.find().count() == 0){


    drugs = JSON.parse(Assets.getText("drugs.json"));

    for (drug in drugs){
      Drugs.insert(drugs[drug]);
    }

  }
  var wineCount = Wines.find().count();
  var wineArray = Wines.find().fetch();
  var courseCount = Courses.find().count();
  var drugCount = Drugs.find().count();
  var drugArray = Drugs.find().fetch();


  // insert into courses database
  if (courseCount===0){
    // console.log("importing courses.json to db");
    // only need to do this once.
    var courses = JSON.parse(Assets.getText("courses.json"));

    for (course in courses){
      var curr = courses[course]
      if (curr["description"] == "") {
        curr["description"] = "No description."
      }

      var difficulty = (Math.random()*5).toPrecision(2)
      var workload = (Math.random()*5).toPrecision(2)
      var overall = (((5 - workload) + (5 - difficulty)) / 2).toPrecision(2)

      var wine = Math.floor((Math.random()*wineCount)+1);
      var Suggestion = wineArray[wine];
      curr.Difficulty = difficulty;
      curr.Workload = workload;
      curr.Overall = overall;
      // curr.OverallCritical = false
      // curr.WorkloadCritical = false
      // curr.DifficultyCritical = false

      drug_probability = 50


      // check difficulty
      if (difficulty >= 4.5 || difficulty <=0.5){
        // curr.DifficultyCritical = true
        if (flip(drug_probability)){

          var drug = Math.floor((Math.random()*drugCount)+1)
          Suggestion = drugArray[drug]

          // assign a drug
        }
      }
      else if (workload >= 4.5 || workload <= 0.5){
        //curr.WorkloadCritical = true
        if (flip(drug_probability)){

          var drug = Math.floor((Math.random()*drugCount)+1)
          Suggestion = drugArray[drug]
          // assign a drug
        }
      }
      // check overall
      else if (overall >= 4.5||overall <= 0.5){
        //curr.OverallCritical = true
        if (flip(drug_probability)){

          var drug = Math.floor((Math.random()*drugCount)+1)
          Suggestion = drugArray[drug]

          // assign a drug
        }
      }

      curr.Suggestion = Suggestion;
      // hard coded jokes
      Courses.insert(curr);
    }
  }

  Meteor.publish("courses", function(limit){

    var defaultLimit = limit || 10
    var randomIndex =  Math.floor((Math.random()*courseCount)+1)
    // limit courseCount
    return Courses.find({}, {limit:defaultLimit}, {skip:randomIndex})
    // return Courses.find({})
  });
  // Meteor.publish("saved", function(){
  //   return SavedCourses.find(this.userId)
  // });

}

// Client code
if (Meteor.isClient) {

  // Meteor.subscribe("courses");
  // Meteor.subscribe("saved");
  /* set defaults */
  Session.setDefault("viewingStudyCard", false);
  Session.setDefault("logging", false);
  Session.setDefault("browsing", true);
  // Session.setDefault("clickedCourse", false);
  // Session.setDefault("studyCard", [])
  Session.setDefault("queue", []);
  Session.setDefault("seen", [])
  // Session.set("percentage", 15)
  Tracker.autorun(function () {

    var curr_queue = Session.get("queue")
    var curr_seen = Session.get("seen")
    var Limit = curr_seen.length + curr_queue.length + 20
    if (curr_queue.length < 10){
      Meteor.subscribe("courses", Limit)
      // var Skip = Math.floor((Math.random()*4000)+1);
      // var new_courses = Courses.find({}, {limit:Limit}).fetch()
      var new_courses = Courses.find({}).fetch()
      // var randomIndex = Math.floor(Math.random() * new_courses.length + 1);

      // console.log(new_courses)
      // console.log(new_courses[randomIndex])
      for (i in new_courses){
        if ($.inArray(new_courses[i].cat_num, curr_seen) == -1){
          console.log("adding", new_courses[i].cat_num, "to queue!")
          curr_queue.push(new_courses[i]);
        }
      }
      console.log(curr_queue)
      Session.set("queue", curr_queue)
    }
    if (Meteor.user()){
      var currStudyCard = Session.get("studyCard")
      if (currStudyCard){
        var x = 0
        for (y in currStudyCard){
          x += currStudyCard[y].Suggestion.Proof
        }
        Session.set("percentage", Math.max(x,15))
            // for (y in Meteor.user.Yes){
            //   x += Meteor.user.Yes[y].Suggestion.Proof
            // }
            // Session.set("percentage", Math.max(x,15))
          }
          else{
            Session.set("percentage", 15)
          }
      }
      else{
        Session.set("percentage", 15)
      }

  });
  // search source code
  // var options = {
  //   keepHistory: 1000 * 60 * 5,
  //   localSearch: true
  // };
  // /* faculty or faculty.last?*/
  // // , "faculty_last", "Wine1", "Wine2", "Wine3"
  // var fields = ['field', "number", "title", "description", "Suggestion"];
  // var CourseSearch = new SearchSource('courses', fields, options);
  Template.prereqs.helpers({
    current:function(){
      return [Session.get("queue")[0]]
    }
  });
Template.classy_header.helpers({
  current:function(){
    return [Session.get("queue")[0]]
  },
  color:function(){
    var p = parseInt(Session.get("percentage"));
    if (p < 50){
      return BLUE
    }
    else if (p > 100){
      return RED//"#EA212E"
    }
    else{
      return GOLD
    }
  },
  percentage:function(){
    var p = Session.get("percentage");
    return p
  },
  message:function(){
    return "Drunk-o'-Meter"
    // var p = Session.get("percentage")
    // // var
    // // if (p < 50){
    // //   return "Sober"
    // // }
    // // else if  (p>100){
    // //   return "Danger!"
    // // }
    // // else{
    // //   return "Careful"
    // // }
  },
  img:function(){
    var p = Session.get("percentage");
    if (p < 50){
      return "img/yes.png"
    }
    else if (p > 100){
      return "drugs/meth.png"
    }
    else{
      return "img/no.png"
    }
  }

});

Template.prereqs.events({});

Template.viewer.helpers({
  current:function(){
    return [Session.get("queue")[0]]
  }
});
Template.viewer.events({
  "click #no" :function next(e){
    seen = Session.get("seen")
    seen.push(this.cat_num)
    console.log(seen)
    Session.set("seen", seen)
    display_next(false)
  },
  "click #yes":function next(e){
    var curr = this
    var currArray = Session.get("studyCard")
    var seen = Session.get("seen")
    console.log(seen)
    seen.push(curr.cat_num)
    Session.set("seen", seen)
    if (currArray){
      currArray.push(this)
      Session.set("studyCard", currArray)
    }
    else{
      Session.set("studyCard", [this])
    }
    display_next(true)
    var p = parseInt(Session.get("percentage"));
    p += curr.Suggestion.Proof;
    Session.set("percentage", Math.max(p,15).toString());
    // if (Meteor.user()){
    //   var Yes = Meteor.user.Yes
    //   Yes.push(this);
    //   Meteor.user.Yes = Yes
    // }
  }

  // "click #no" :function next(e){
  //   // console.log("hi");
  //   display_next(false)
  //   var curr = this
  // },
  // "click #yes":function next(e){
  //   var curr = this
  //   display_next(true)
  //   var currCard = Session.get("studyCard")
  //   // if you click this too fast it can still break this.
  //   if ($.notIn(curr, currCard) == -1){
  //     // var p = parseInt(Session.get("percentage"));
  //     // p += curr.Suggestion.Proof;
  //     // Session.set("percentage", Math.max(p,15).toString());
  //     currCard.push(curr)
  //     Session.set("studyCard", currCard)
  //   }
  //
  // }
});
Template.homeStudyCard.helpers({
  studyCard:function(){
    return Session.get("studyCard")
  }
});
Template.homeStudyCard.events({
  "click #delete":function(){
    // console.log(this)
    var curr = Session.get("studyCard")
    // console.log(curr)
    // var index = curr.indexOf(this)
    for (object in curr) {
      // console.log(object)
      // console.log(curr[object])
      // console.log(curr[object]["cat_num"])
      if (curr[object]["cat_num"] == this["cat_num"]){
        // console.log("worked")
        curr.splice(object, 1)
        // console.log(curr)
      }
    }
    Session.set("studyCard", curr)
    // if (index > -1){
    //   curr.splice(index, 1);
    //
    // }else{
    //   console.log("derp")
    // }
  }
});
  Template.body.helpers({
    Browsing: function(){
      return Session.get("browsing")
    },
    ViewingStudyCard:function(){
      return Session.get("viewingStudyCard");
    },
    Logging:function(){
      return Session.get("logging");
    }
  });

  Template.classy_header.events({
    "click #my-menus":function(){
      Session.set("viewingStudyCard", true)
      Session.set("logging", false)
      Session.set("browsing", false)
      // change the body stuff
    },
    "click .home":function(){
      console.log(this)
      Session.set("viewingStudyCard", false)
      Session.set("browsing", true)
      Session.set("logging", false)
    },
    "click #logger":function(){
      Session.set("browsing", false);
      Session.set("viewingStudyCard", false);
      Session.set("logging", true);
      console.log("worked")

    },
    "click #vomit":function(){
      vomit()
      //window.open('www.google.com','_blank');
      Session.set("studyCard", [])
    }
  });
  Template.statusBar.helpers({
    percentage:function(){
      return Session.get("percentage")
    },
    color:function(){
      return RED
    },
    link:function(){
      var p = Session.get("percentage")
      var index = getIndex(p)
      var status = STATUSES[index]
      var url = STATUSTODATA[status][0]
      return url
    },
    status:function(){
      var p = Session.get("percentage")
      var index = getIndex(p)
      var status = STATUSES[index]
      return status
    },
    image:function(){
      var p = Session.get("percentage")
      var index = getIndex(p)
      var status = STATUSES[index]
      var statusData = STATUSTODATA[status]
      var img = statusData[1]
      return img
    }
  });
  Template.classy_footer.helpers({
    color:function(){
      var p = parseInt(Session.get("percentage"));
      if (p < 50){
        return BLUE
      }
      else if (p > 100){
        return RED
      }
      else{
        return GOLD //"#BC9D52"
      }
    },
    percentage:function(){
      var p = Session.get("percentage");

      return Session.get("percentage");
    },
    img:function(){
      var p = Session.get("percentage");
      if (p < 50){
        return "img/yes.png"
      }
      else if (p > 100){
        return "drugs/meth.png"
      }
      else{
        return "img/no.png"
      }
    }

  });
  Template.mymenu.helpers({
    studyCard:function(){
      var answer = Session.get("studyCard") // Meteor.user.Yes
      return answer
    }
  });
  Template.mymenu.events({
    "click #browse-link":function(){
      Session.set("viewingStudyCard", false);
      Session.set("logging", false)
      Session.set("browsing", true)
    },
    "click #delete":function(){
      // console.log(this)
      var curr = Session.get("studyCard")
      // console.log(curr)
      // var index = curr.indexOf(this)
      for (object in curr) {
        // console.log(object)
        // console.log(curr[object])
        // console.log(curr[object]["cat_num"])
        if (curr[object]["cat_num"] == this["cat_num"]){
          // console.log("worked")
          curr.splice(object, 1)
          // console.log(curr)
        }
      }
      Session.set("studyCard", curr)
      // if (index > -1){
      //   curr.splice(index, 1);
      //
      // }else{
      //   console.log("derp")
      // }
    }

  })

  Template.loginpage.events({
    "click #logo":function(){
      Session.set("logging", false)
      Session.set("browsing", true)
    }
  });


  Accounts.ui.config({
    passwordSignupFields:"USERNAME_ONLY"
  });

}// end client code

function flip(chance){
  var temp = Math.random() * 100
  if (temp <= chance){
    return true
  }
  else {
    return false
  }

}

function getIndex(p){
  // p is the percentage
  var index = Math.floor(p / 10)
  if (index >= 10){
    return 9
  }
  else{
    return index
  }
}

function display_next(yes){
  if (yes){
    var rand = banners[Math.floor(Math.random() * banners.length)];
    $("#banner").css("font-size",60)
    // console.log(this.Suggestion.Icon)
    // construct = "<img id = 'banner-image' src = "+this.Suggestion.Icon+">"
    $("#banner").html(rand)

    $("#viewer").slideUp(function callback(){
      var queue = Session.get("queue");
      // console.log(queue.length);
      queue.shift();
      Session.set("queue", queue);
      $("#banner").removeClass("invisible")
      $("#banner").animate({
        "font-size":"200"
      },1000,function undo(){
        $("#banner").addClass("invisible")
        $("#viewer").fadeIn(500)
            // $(".comments").hide();
      });
    });
    // $("#banner-image").animate({
    //   "width":"800px",
    //   "height": "800px",
    // },function undo(){
    //   $("#banner").addClass("invisible")
    // });

    }

  else{

    $("#viewer").fadeOut(function(){
      var queue = Session.get("queue");
      queue.shift();
      Session.set("queue", queue);
      $("#banner").css("font-size",60)
      var rand = noBanners[Math.floor(Math.random() * noBanners.length)];
      $("#banner").html(rand)
      $("#banner").removeClass("invisible")
      $("#banner").animate({
        "font-size":"76"
      },1000,function undo(){
        $("#banner").addClass("invisible")
        $("#viewer").fadeIn(500)
      });
    })
  }
}

function vomit(){
  var rand = vomBanners[Math.floor(Math.random() * vomBanners.length)];
  var randNoise = vomNoises[Math.floor(Math.random() * vomNoises.length)];

  new Audio(randNoise).play();
  $("#banner").css("font-size",60)
  // console.log(this.Suggestion.Icon)
  // construct = "<img id = 'banner-image' src = "+this.Suggestion.Icon+">"
  $("#banner").html(rand)
  $("#banner").removeClass("invisible")
  // $("#banner-image").animate({
  //   "width":"800px",
  //   "height": "800px",
  // },function undo(){
  //   $("#banner").addClass("invisible")
  // });
  $("#banner").animate({
    "font-size":"200"
  },1000,function undo(){
    $("#banner").animate({
      color: "black"
    }, function(){
      $("#banner").addClass("invisible")
    })
        // $(".comments").hide();
  });
  }
