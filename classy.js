// Client and Server code for Classy
// Developed using Meteor by Jake Seaton
// Quincy Dewolfe 20-05


Courses = new Mongo.Collection("courses");
Wines = new Mongo.Collection("wines");
Drugs = new Mongo.Collection("drugs");
var banners = ["Got it!"]//["Nice!", "Got it!", "Careful!", "Yikes!", "Yesh!","What?","Smart!", "Look at your life", "Look at your choices"]
// SavedCourses = new Mongo.Collection("saved");



// server code
if (Meteor.isServer){

  // insert into wines database
  if (Wines.find().count() ===0){
    // import red wines
    // console.log("importing redwines.json to db")
    var output = JSON.parse(Assets.getText("redwine.json"));
    var redwines = output.Products.List
    //console.log(wines);
    for (wine in redwines){
      var curr = redwines[wine]
      var proof = Math.floor((Math.random()*10)+10);
      curr.Proof = proof;
      curr.Color = "red";
      curr.Icon = "img/redwine.png"
      // console.log(curr.Name)
      Wines.insert(curr)
    }

    // import white wines
    output = JSON.parse(Assets.getText("whitewines.json"));
    // console.log("importing whitewines.json to db")
    var whitewines = output.Products.List;
    for (wine in whitewines){
      var curr = whitewines[wine]
      var proof = Math.floor((Math.random()*10)+10)
      curr.Proof = proof;
      curr.Color = "white";
      curr.Icon = "img/whitewine.png"
      // console.log(curr);
      Wines.insert(curr);
    }


  }

  if (Drugs.find().count() == 0){
    // console.log("importing drugs to db")
    // import drugsss
    drugs = JSON.parse(Assets.getText("drugs.json"));
    // console.log(drugs);
    for (drug in drugs){
      Drugs.insert(drugs[drug]);
    }

  }
  var wineCount = Wines.find().count();
  var wineArray = Wines.find().fetch();
  var courseCount = Courses.find().count();
  var drugCount = Drugs.find().count();
  var drugArray = Drugs.find().fetch();
  // console.log("winecount", wineCount)

  // insert into courses database
  if (courseCount===0){
    // console.log("importing courses.json to db");
    // only need to do this once.
    var courses = JSON.parse(Assets.getText("courses.json"));
    // // console.log(courses);
    for (course in courses){
      var curr = courses[course]

      var difficulty = (Math.random()*5).toPrecision(2)
      var workload = (Math.random()*5).toPrecision(2)
      var overall = (((5 - workload) + (5 - difficulty)) / 2).toPrecision(2)

      var wine = Math.floor((Math.random()*wineCount)+1);
      var Suggestion = wineArray[wine];
      curr.Difficulty = difficulty;
      curr.Workload = workload;
      curr.Overall = overall;

      drug_probability = 25


      // check difficulty
      if (difficulty >= 4.5 || difficulty <=0.5){
        if (flip(drug_probability)){
          // console.log("assigning a drug", curr);
          var drug = Math.floor((Math.random()*drugCount)+1)
          Suggestion = drugArray[drug]

          // assign a drug
        }
      }
      else if (workload >= 4.5 || workload <= 0.5){
        if (flip(drug_probability)){
          // console.log("assigning a drug", curr);
          var drug = Math.floor((Math.random()*drugCount)+1)
          Suggestion = drugArray[drug]
          // assign a drug
        }
      }
      // check overall
      else if (overall >= 4.5||overall <= 0.5){
        if (flip(drug_probability)){
          // console.log("assigning a drug", curr);
          var drug = Math.floor((Math.random()*drugCount)+1)
          Suggestion = drugArray[drug]

          // assign a drug
        }
      }

      curr.Suggestion = Suggestion;
      // hard coded jokes
      // console.log(courses[course].cat_num);
      Courses.insert(curr);
    }
  }

  Meteor.publish("courses", function(){
    return Courses.find();
  });
  // Meteor.publish("drugs", function(){
  //   return Drugs.find();
  // });
  Meteor.publish("saved", function(){
    return SavedCourses.find(this.userId)
  });

}

// Client code
if (Meteor.isClient) {

  Meteor.subscribe("courses");
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
    // Meteor.subscribe("saved");

    // var data = SavedCourses.find({}).fetch();
    // console.log("New saved courses!", data);
    Meteor.subscribe("userData");
    var curr_queue = Session.get("queue")
    var curr_seen = Session.get("seen")
    var Limit = curr_seen.length + curr_queue.length + 20
    if (curr_queue.length < 10){
      var new_courses = Courses.find({}, {limit:Limit}).fetch()
      for (i in new_courses){
        if ($.inArray(new_courses[i].cat_num, curr_seen) == -1){
          curr_queue.push(new_courses[i]);
        }
      }
      Session.set("queue", curr_queue)
    }
    // if (Meteor.user()){
    //   if (!Meteor.user.Yes){
    //     Meteor.user.Yes = []
    //   }
    //   else{
    //     Session.set("studyCard", Meteor.user.Yes)
    //     // var x = 0
    //     // for (y in Meteor.user.Yes){
    //     //   x += Meteor.user.Yes[y].Suggestion.Proof
    //     // }
    //     // Session.set("percentage", Math.max(x,15))
    //   }
    //   if (!Meteor.user.No){
    //     Meteor.user.No = []
    //   }
    // }
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
  color:function(){
    var p = parseInt(Session.get("percentage"));
    if (p < 50){
      return "#90A4AE"
    }
    else if (p > 100){
      return "#EA212E"
    }
    else{
      return "#BC9D52"
    }
  },
  percentage:function(){
    var p = Session.get("percentage");
    return p
  },
  message:function(){
    return "Drunk-o'-Meter"
    // var p = Session.get("percentage")
    // if (p < 50){
    //   return "Sober"
    // }
    // else if  (p>100){
    //   return "Danger!"
    // }
    // else{
    //   return "Careful"
    // }
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
Template.prereqs.events({
  "click #no" :function next(e){
    // console.log("hi");
    display_next(false)
    var curr = this
  },
  "click #yes":function next(e){
    var curr = this
    Session.set("studyCard", Session.get("studyCard").push(this))
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
});

Template.viewer.helpers({
  current:function(){
    return [Session.get("queue")[0]]
  }
});
Template.viewer.events({
  "click #no" :function next(e){
    // console.log("hi");
    display_next(false)
    var curr = this
  },
  "click #yes":function next(e){
    var curr = this
    console.log(curr)
    display_next(true)
    var p = parseInt(Session.get("percentage"));
    p += curr.Suggestion.Proof;
    Session.set("percentage", Math.max(p,15).toString());
    var currCard = Session.get("studyCard")
    console.log(currCard)
    currCard.push(curr)
    console.log(currCard)
    Session.set("studyCard", currCard)
  }
});
Template.homeStudyCard.helpers({
  studyCard:function(){
    return Session.get("studyCard")
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

    }
  });
  Template.classy_footer.helpers({
    color:function(){
      var p = parseInt(Session.get("percentage"));
      if (p < 50){
        return "#90A4AE"
      }
      else if (p > 100){
        return "#EA212E"
      }
      else{
        return "#BC9D52"
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


function display_next(yes){
  if (yes){
    var rand = banners[Math.floor(Math.random() * banners.length)];
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
      $("#banner").addClass("invisible")
          // $(".comments").hide();
    })
     $("#feature-box").slideUp(function(){
     });
      $("#viewer").slideUp(function callback(){
        var queue = Session.get("queue");
        // console.log(queue.length);
        queue.shift();
        Session.set("queue", queue);
        $("#viewer").fadeIn(500, function(){
            $("#feature-box").animate({width:"toggle"})
        });
      });
    }

  else{
    $("#banner").css("font-size",60)
    $("#banner").html("NOPE!")
    $("#banner").removeClass("invisible")
    $("#banner").animate({
      "font-size":"76"
    },1000,function undo(){
      $("#banner").addClass("invisible")
    });
    $("#viewer").fadeOut();
    $("#feature-box").fadeOut(function callback(){
      var queue = Session.get("queue");
      queue.shift();
      Session.set("queue", queue);
      $("#viewer").fadeIn(500, function(){
        $("#feature-box").animate({width:'toggle'})
      });
    });

  }
}
