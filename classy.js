// Client and Server code for Classy
// Developed using Meteor by Jake Seaton
// Quincy Dewolfe 20-05


Courses = new Mongo.Collection("courses");
Wines = new Mongo.Collection("wines");
Drugs = new Mongo.Collection("drugs");
// SavedCourses = new Mongo.Collection("saved");



// server code
if (Meteor.isServer){
    // Solution to persistence bug
    // Meteor.methods({
    //   newCourse:function(course){
    //     var index = this.userId;
    //     if (index){
    //       var old = SavedCourses.find(index);
    //       // SavedCourses.insert()
    //       // console.log(old)
    //       if (old.courses){
    //         var arr = old.courses
    //         arr.push(course)
    //         SavedCourses.update(index, {$set:{courses:arr}})
    //
    //       }
    //       else{
    //         old.courses = [course]
    //       }
    //     }
    //   }
    // });

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
  // Search code--unused
  // SearchSource.defineSource('courses', function(searchText, options){
  //   var options = {sort:{isoScore:-1}, limit:30};
  //   if (searchText){
  //     var regExp = buildRegExp(searchText);
  //
  //     var selector = {$or: [
  //       {field:regExp},
  //       {number:regExp},
  //       {title:regExp},
  //       {description:regExp},
  //       {Suggestion: regExp}
  //     ]};
  //
  //     return Courses.find(selector, options).fetch();
  //   } else {
  //     // check to see which boxes are checked
  //     return Courses.find({}, options).fetch();
  //   }
  // // });
  //
  // function buildRegExp(searchText){
  //   // this is a dumb implementation
  //   var parts = searchText.trim().split(/[\-\:]+/)
  //   return new RegExp("("+parts.join('|')+")","ig");
  // }
  //
  // Meteor.publish("userData",function(){
  //   if (this.userId){
  //     return Meteor.users.find(
  //       {_id: this.userId},
  //       {fields:{Yes:1, No:1}}
  //     );
  //   }
  //   else {
  //     this.ready();
  //   }
  // });

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
  Session.setDefault("percentage", 1);
  Session.setDefault("queue", []);
  Session.setDefault("seen", [])

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
      console.log("worked!");
    }
    if (Meteor.user()){
      if (!Meteor.user.Yes){
        Meteor.user.Yes = []
      }
      if (!Meteor.user.No){
        Meteor.user.No = []
      }
      console.log(Meteor.user.Yes)
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

Template.prereqs.events({
  "mouseenter .circle": function(e){
    $(e.target).find("img").slideUp(function show(){
      $(e.target).find("i").removeClass("invisible")
    });
  },
  "mouseleave .circle":function(e){
    $(e.target).find("i").addClass("invisible");
    $(e.target).find("img").slideDown();
  },
  "click .suggestion-item": function(e){
    e.preventDefault();
    var destination = $(e.target).parents("a").attr("href");
    Session.set("shoppingUrl", destination)
    Router.go("/shop");
    // $("iframe").content().append("derp")

  },
  "click #no" :function next(e){
    console.log("hi");
    $("#viewer").fadeOut();
    $("#feature-box").fadeOut(function callback(){
      var curr = this
      var queue = Session.get("queue");
      queue.shift();
      Session.set("queue", queue);
       $("#viewer").fadeIn();
       $("#feature-box").fadeIn();
    });
  },
  "click #yes":function next(e){
    // Meteor.call("newCourse", this, function(){
    //   // console.log("worked");
    //   // console.log(SavedCourses.find().fetch());
    //
    // });
    var curr = this
    $("#feature-box").slideUp();
    $(".comments").hide();
    $("#no").hide();
    // $(".comments").slideUp();
    $("#viewer").slideUp(function callback(){
      var queue = Session.get("queue");
      // console.log(queue.length);
      queue.shift();
      Session.set("queue", queue);
      var p = parseInt(Session.get("percentage"));
      p += curr.Suggestion.Proof;
      Session.set("percentage", p.toString());
      $("#feature-box").fadeIn();
      $("#viewer").fadeIn();
    });

    if (Meteor.user()){
      var Yes = Meteor.user.Yes
      Yes.push(this);
      Meteor.user.Yes = Yes
    }
    // else{
    //   console.log("can't add to yes beCAUSE not logged in")
    // }
  }
});

Template.viewer.helpers({
  current:function(){
    return [Session.get("queue")[0]]
  }
});
// Template.viewer.events({
//   "click img":function(){
//     console.log(this);
//   }
// })

// Template.viewer.events({
//   // click on add or
//
// });
//
//   Template.body.rendered = function(){
//
//   }
  //
  // Template.body.events({
  //   "click #yes":function(){
  //     // $("#viewer").fadeOut()
  //   }
  //   // also ad event listeners for when the person clicks their individual things
  // });
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
      var answer = Meteor.user.Yes
      return answer
    }
  });

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

/* Search Stuff */
  // Template.result.helpers({
  //   getCourses:function(){
  //     var y = CourseSearch.getData({
  //       transform: function(matchText, regExp){
  //         return matchText.replace(regExp, "<b>$&</b>")
  //       },
  //       // somehow sort by course number?
  //       // this orders them in
  //       sort:{isoScore: -1}
  //     });
  //     // console.log(y);
  //     // return y
  //     for (x in y){
  //       if (y[x].faculty.length != 0){
  //         y[x].faculty_last = y[x].faculty[0].last;
  //         // y[x].faculty_last = y[x].faculty[0].Last
  //       }
  //       else{
  //         y[x].faculty_last = "TBD"
  //       }
  //       // console.log(y[x]);
  //     }
  //     var curr = Session.get("queue");
  //     Session.set("queue", curr.push[y])
  //     return y
  //   },
  //   isLoading:function(){
  //     return CourseSearch.getStatus().loading;
  //   }
  // });
  //  Template.search.events({
    //   "keyup #search-box":_.throttle(function(e){
    //     var text = $(e.target).val().trim();
    //     CourseSearch.search(text);
    //   }, 200),
    //
    //   // somethign here like a click on the box? screen results by -1
    //   "click .toggle-checked": function(){
    //     // change the preferences!!!
    //     console.log("you clicked", this._id);
    //     // handle the checkbox being checked or unchecked
    //     // filter the data by this
    //     // redisplay data in the list
    //   }
    // });
  //
  // Template.result.events({
  //   "click li": function(e, template){
  //     // toggleDrawers();
  //     // CODE TO SEARCH THE SITE OF THE WINE
  //     // console.log($(e.target).find(".wine-name").attr("href"));
  //     // var wineName = $(e.target).find(".wine-name").html();
  //     // console.log(wineName)
  //     // var findWine = Wines.find({Name:wineName}).fetch();
  //     // var url_to_search = findWine[0].Url
  //     // console.log(url_to_search);
  //     // $.ajax(url_to_search,{
  //     //     type:"GET",
  //     //     dataType:"jsonp",
  //     //     crossDomain:true,
  //     //     success: function(data){
  //     //       console.log(data);
  //     //       $(data).find(".wineMakerNotes").find("p").each(function(){
  //     //         console.log("this");
  //     //       });
  //     //     }
  //     //
  //     // });
  //     // console.log(this)
  //     // Session.set("viewingMyCourses", false);
  //
  //     // set as current course to view
  //     Session.set("clickedCourse", this);
  //     // saved visited courses
  //     var temp = Session.get("visitedCourses");
  //     temp.push(this);
  //     Session.set("visitedCourses", temp);
  //     $("#viewer").removeClass("invisible")
  //     // $(".drawer").show();
  //   },
  //   "mouseenter li":function(e){
  //     $(e.target).find("img").removeClass("invisible").slideDown();
  //   },
  //   "mouseleave li":function(e){
  //     $(e.target).find("img").slideUp(function(){
  //       $(this).addClass("invisible")
  //     });
  //   }
  // });
  // //   Template.body.events({
  //     // WHEN THEY HIT ENTER ON THE SEARCH
  //     "submit .search-form":function(e){
  //       var text = e.target.text.value;
  //       // search the courses database for matches
  //       // clear form
  //       // e.target.text.value = "";
  //
  //       // prefent default form submit
  //       return false;
  //     } // also ad event listeners for when the person clicks their individual things
  //   });
  // function toggleDrawers(){
  //   console.log("togling drawers");
  //
  //   $(".drawer").each(function(){
  //       // if it's already hidden
  //       if ($(this).hasClass("invisible")){
  //           $(this).removeClass("invisible");
  //           if ($(this).attr("id") == "drawer-left"){
  //             $(this).animate({"left":"0"}, "slow");
  //           }
  //           else{
  //             $(this).animate({"right":"0px"}, "slow");
  //           }
  //           // remove invisibility
  //           // slide it in
  //
  //       }
  //       else {
  //         if ($(this).attr("id") == "drawer-left"){
  //           $(this).animate({"left":"-1000px"}, "slow", function(){
  //             $(this).addClass("invisible")
  //           });
  //         }
  //         else{
  //           $(this).animate({"right":"-1000px"}, "slow", function(){
  //             $(this).addClass("invisible");
  //           });
  //         }
  //         // slide it out
  //         // add invisibility
  //       }
  //   });
  // }
  // requestCrossDomain('http://harvardlampoon.com',"#hero", function(results) {
  //     console.log("derp2");
  // });
  // function shopscript(){
  //   $("iframe").each(function(){
  //     console.log(this)
  //   });
  //
  // }
// Template.suggestion.helpers({
//
// })
