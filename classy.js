// Client and Server code for Classy
// Developed using Meteor by Jake Seaton
// Quincy Dewolfe 20-05

// Change all "the" to "le," etc
// can we get a gradient on the header or something?
// figure out the course orders based on the user's concentration
// what geneds have they satisfied? can make those a fifth course
// intended concentrations -> all courses in those departments are marked as
// var curr_men = [{course_number: "1", title:"Poetry Without Borders", description: "hell yeah"},{course_number: "2", title:"CS50", description: "See David Malan"}, {course_number: "3", title:"Justice", description: "with Michael Sandel"}, {course_number: "4", title:"Arrivals", description: "sup"}]
Courses = new Mongo.Collection("courses");
Wines = new Mongo.Collection("wines");
Beers = new Mongo.Collection("beers");
Drugs = new Mongo.Collection("drugs");


// server code
if (Meteor.isServer){

  // insert into wines database
  if (Wines.find().count() ===0){
    // import red wines
    console.log("importing redwines.json to db")
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
    console.log("importing whitewines.json to db")
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
  // import beers
  if (Beers.find().count() == 0){
    console.log("importing beers to db")
    output = JSON.parse(Assets.getText("beers.json"));
    beers = output.beers;
    for (beer in beers){
      // console.log(beers[beer])
      Beers.insert(beers[beer]);
    }
  }

  if (Drugs.find().count() == 0){
    console.log("importing drugs to db")
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
  console.log("winecount", wineCount)

  // insert into courses database
  if (courseCount===0){
    console.log("importing courses.json to db");
    // only need to do this once.
    var courses = JSON.parse(Assets.getText("courses.json"));
    // // console.log(courses);
    for (course in courses){
      var curr = courses[course]
      // pair three random wines
      // assign it a random course number between 1 and 4
      // var number = Math.floor((Math.random() * 4)+1)
      // curr.course_number = number

      var difficulty = (Math.random()*5).toPrecision(2)
      var workload = (Math.random()*5).toPrecision(2)
      var overall = (((5 - workload) + (5 - difficulty)) / 2).toPrecision(2)
      var suggestions = [];

      curr.Difficulty = difficulty;
      curr.Workload = workload;
      curr.Overall = overall;

      drug_probability = 25

      // check difficulty
      if (difficulty >= 4.5 || difficulty <=0.5){
        if (flip(drug_probability)){
          // console.log("assigning a drug", curr);
          var drug = Math.floor((Math.random()*drugCount)+1)
          suggestions.push(drugArray[drug])

          // assign a drug
        }
      }

      // check workload
      if (workload >= 4.5 || workload <= 0.5){
        if (flip(drug_probability)){
          // console.log("assigning a drug", curr);
          var drug = Math.floor((Math.random()*drugCount)+1)
          suggestions.push(drugArray[drug])
          // assign a drug
        }
      }

      // check overall
      if (overall >= 4.5||overall <= 0.5){
        if (flip(drug_probability)){
          // console.log("assigning a drug", curr);
          var drug = Math.floor((Math.random()*drugCount)+1)
          suggestions.push(drugArray[drug])

          // assign a drug
        }
      }

      // update the number of suggestions to 10
      var to_add = 10 - suggestions.length


      //add suggested wines
      for (i = 0; i < to_add; i++){
        //
        // if flip(beer_probability
        var wine = Math.floor((Math.random()*wineCount)+1);
        suggestions.push(wineArray[wine]);
      }

      // hard coded jokes
      curr.Suggestions = suggestions;
      // console.log(courses[course].cat_num);
      Courses.insert(curr);
    }
  }

  SearchSource.defineSource('courses', function(searchText, options){
    var options = {sort:{isoScore:-1}, limit:30};
    if (searchText){
      var regExp = buildRegExp(searchText);

      // need to add faculty here
      var selector = {$or: [
        {field:regExp},
        {number:regExp},
        {title:regExp},
        {description:regExp},
        {Wine1: regExp},
        {Wine2: regExp},
        {Wine3: regExp}
      ]};

      // screen based on which course number?

      // this might need to be Packages
      return Courses.find(selector, options).fetch();
    } else {
      // check to see which boxes are checked
      return Courses.find({}, options).fetch();
    }
  });

  function buildRegExp(searchText){
    // this is a dumb implementation
    var parts = searchText.trim().split(/[\-\:]+/)
    return new RegExp("("+parts.join('|')+")","ig");
  }

  // get user data about courses and menus
  // Meteor.publish("userData",function(){
  //   if (this.userId){
  //     return Meteor.users.find(
  //       {_id: this.userId},
  //       {fields:{"menus":1,"courses":1}}
  //     );
  //   }
  //   else {
  //     this.ready()
  //   }
  // });
  Meteor.publish("courses", function(){
    return Courses.find();
  });

}
// Client code
if (Meteor.isClient) {
  Meteor.subscribe("courses");
  // why isn't this working
  Router.route("/",function(){
    this.render("home");
      // if (!Meteor.user()){
      //   this.render("loginpage")
      // }
      // else {
      //   this.render("home")
      // }
  });

  Router.route("/?*", function(){
    console.log("derp")
    Router.go("/");
  });

  Router.route("/mycourses", function(){
    if (Meteor.user()){
      this.render("mycourses");
    }
    else{
      this.render("loginpage");
    }
  });

  Router.route("/mymenu", function(){
    if (Meteor.user()){
      this.render("mymenu");
    }
    else {
      this.render("loginpage");
    }
  });

  Router.route("/login", function(){
    this.render("loginpage")
  });
  Router.route("/shop", function(){
    this.render("shop");
  });


  /* set defaults */
  Session.setDefault("viewingMenu", false);
  Session.setDefault("viewingMyCourses", false);
  Session.setDefault("clickedCourse", false);
  Session.setDefault("currentWine", "");
  Session.setDefault("visitedCourses", []);
  Session.setDefault("shoppingUrl", "/");
  // Session.setDefault("viewingSearchResults", false);

  if (! UserSession.get("Menu")){
    UserSession.set("Menu", []);
  }
  if (! UserSession.get("courses")){
    UserSession.set("courses", []);
  }
  if (!UserSession.get("courseNames")){
    UserSession.set('courseNames', []);
  }
  if (!UserSession.get("cardNames")){
    UserSession.set("cardNames", [])
  }
  // Get user data about courses and menus
  // Meteor.subscribe("userData");
  // console.log(Meteor.users);
  // Meteor.user.menus = ["hello"];
  //
  // UserSession.set("menus",["derp"]);
  // console.log(UserSession.get("menus"));
  // console.log(Meteor.user.menus);

  var options = {
    keepHistory: 1000 * 60 * 5,
    localSearch: true
  };
  /* faculty or faculty.last?*/
  // , "faculty_last", "Wine1", "Wine2", "Wine3"
  var fields = ['field', "number", "title", "description"];
  var CourseSearch = new SearchSource('courses', fields, options);

  Template.result.helpers({
    getCourses:function(){
      var y = CourseSearch.getData({
        transform: function(matchText, regExp){
          return matchText.replace(regExp, "<b>$&</b>")
        },
        // somehow sort by course number?
        // this orders them in
        sort:{isoScore: -1, Overall :-1}
      });
      // console.log(y);
      // return y
      for (x in y){
        if (y[x].faculty.length != 0){
          y[x].faculty_last = y[x].faculty[0].last;
          // y[x].faculty_last = y[x].faculty[0].Last
        }
        else{
          y[x].faculty_last = "TBD"
        }
        // console.log(y[x]);
      }

      return y
    },
    isLoading:function(){
      return CourseSearch.getStatus().loading;
    }
  });
  // var elementPosition = $(".drawer").offset();
  // console.log(elementPosition)
  // $(window).scroll(function(){
  //   if($(window).scrollTop() > elementPosition.top()){
  //       console.log("derp");
  //             $('.drawer').css('position','fixed').css('top','0');
  //       }
  //   else {
  //           $('.drawer').css('position','static');
  //       }
  // });

  Template.result.events({
    "click li": function(e, template){
      // toggleDrawers();
      // CODE TO SEARCH THE SITE OF THE WINE
      // console.log($(e.target).find(".wine-name").attr("href"));
      // var wineName = $(e.target).find(".wine-name").html();
      // console.log(wineName)
      // var findWine = Wines.find({Name:wineName}).fetch();
      // var url_to_search = findWine[0].Url
      // console.log(url_to_search);
      // $.ajax(url_to_search,{
      //     type:"GET",
      //     dataType:"jsonp",
      //     crossDomain:true,
      //     success: function(data){
      //       console.log(data);
      //       $(data).find(".wineMakerNotes").find("p").each(function(){
      //         console.log("this");
      //       });
      //     }
      //
      // });
      // console.log(this)
      // Session.set("viewingMyCourses", false);

      // set as current course to view
      Session.set("clickedCourse", this);
      // saved visited courses
      var temp = Session.get("visitedCourses");
      temp.push(this);
      Session.set("visitedCourses", temp);
      $("#viewer").removeClass("invisible")
      // $(".drawer").show();
    },
    "mouseenter li":function(e){
      $(e.target).find("img").removeClass("invisible").slideDown();
    },
    "mouseleave li":function(e){
      $(e.target).find("img").slideUp(function(){
        $(this).addClass("invisible")
      });
    }
  });

  Template.DrawerLeft.helpers({
    viewingCourses: function(){
      if (Session.get("viewingMyCourses")){
        console.log("returning derp")
        return true
      }
      else if (Session.get("clickedCourse")){
        console.log
        console.log("returning this")
        return true
      }
      else
        return false
    },
    // course_to_view:function(){
    //   if (Session.get("clickedCourse")){
    //     return Session.get("clickedCourse")
    //   }
    // },
    coursesToView: function(){
      // if (Session.get("viewingMyCourses")){
      //   console.log("lol");
      //   return UserSession.get("courses");
      // }
      if (Session.get("clickedCourse")){
        console.log("yay");
        console.log(Session.get("clickedCourse"));
        return [Session.get("clickedCourse")];
      }
    }
  });

Template.viewer.helpers({
  // workload: function(){
  //   var x = Session.get("clickedCourse");
  //   var y = x.Workload
  //   return y * 10
  // },
  current_suggestions:function(){
    var curr = Session.get("clickedCourse");
    var all = curr.Suggestions;
    var items = [];
    for (i = 0; i< 3; i++){
      var index = Math.floor((Math.random()*(all.length)))
      items.push(all[index]);
    }
    return items;
  },
  coursesToView: function(){
    var curr = Session.get("clickedCourse");
    // if (Session.get("viewingMyCourses")){
    //   console.log("lol");
    //   return UserSession.get("courses");
    // }
    if (curr){
      var card = UserSession.get("Menu")
      var fav = UserSession.get("courses")
      if ($.inArray(curr, card) != -1){
          curr.Card = true
      }
      if ($.inArray(curr, fav) != -1){
        curr.Favorite = true
      }

      // console.log("yay");
      // console.log(Session.get("clickedCourse"));
      return [curr];
    }
  },
  suggestions: function(){
    return this.Suggestions
  }
  // viewingMenuBool: function(){
  //   return Session.get("viewingMenu");
  // },
  // viewingMyCoursesBool: function(){
  //   return Session.get("viewingMyCourses");
  // },
  // userMenu: function(){
  //   return UserSession.get("Menu");
  // },
  // userCourses: function(){
  //   return UserSession.get("courses");
  // }
});

Template.viewer.events({
  "click #refresh":function(){
    console.log("refreshing");
    console.log(this);
  },
  "mouseenter .circle": function(e){
    $(e.target).find("img").slideUp(function show(){
      $(e.target).find("i").removeClass("invisible")
    });

    // $('.wine-glass').hover(function(){
    //   // mouseenter
    //   console.log("derp")
    //   $(this).first().addClass("invisible");
    // },function(){
    //   $(this).first().removeClass("invisible");
    // });

    // $(e.target).find("img").replaceWith(derp)
    // console.log(this)


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
  "click .star":function(e){
    if (Meteor.user()){
      var namesArray = UserSession.get("courseNames");
      if ($.inArray(this.cat_num, namesArray) != -1){
        alert("already favorited");
      }
      else{
        namesArray.push(this.cat_num);
        UserSession.set("courseNames", namesArray);
        var MyCoursesArr = UserSession.get("courses");
        MyCoursesArr.push(this);
        UserSession.set("courses", MyCoursesArr);

      }
    }
    else{
      alert("You aren't logged in");
    }

  },
  "click .add":function(e){
    if (Meteor.user()){
      // if this has class active
      // else
      var cardnames = UserSession.get("cardNames");
      if ($.inArray(this.cat_num, cardnames)!= -1){
        alert("Already on your study card");
      }
      else{
        cardnames.push(this.cat_num);
        UserSession.set("cardNames", cardnames);
        var MyCardArr = UserSession.get("Menu");
        MyCardArr.push(this);
        UserSession.set("Menu", MyCardArr)
      }
    }else{
      alert("You aren't logged in");
    }
  },
  "click #refresh":function(){
    // hack
    var derp = UserSession.get("courseNames")
    UserSession.set("courseNames", derp);
  }
});

Template.DrawerLeft.helpers({
  // viewingCourses: function(){
  //   if (Session.get("viewingMyCourses")){
  //     return true
  //   }
  //   else if (Session.get("clickedCourse")){
  //     return true
  //   }
  //   else{      return false
  //       }
  // },
  // course_to_view:function(){
  //   if (Session.get("clickedCourse")){
  //     return Session.get("clickedCourse")
  //   }
  // },
  coursesToView: function(){
    // if (Session.get("viewingMyCourses")){
    //   console.log("lol");
    //   return UserSession.get("courses");
    // }
    if (Session.get("clickedCourse")){
      console.log("yay");
      console.log(Session.get("clickedCourse"));
      return [Session.get("clickedCourse")];
    }
  }
});
  Template.DrawerLeft.events({
    "click .star":function(e){

      var Course = Session.get("clickedCourse");
      var MyCoursesArr = UserSession.get("courses");
      MyCoursesArr.push(Course);
      // make sure it isn't already in the array!
      UserSession.set("courses", MyCoursesArr);
      // this_star = e.target()
      // console.log($(this_star).parent().html());

    }
  });
  Template.mycourses.events({
    "click li":function(){
      Session.set("clickedCourse", this);
      $("#viewer").removeClass("invisible");
    },

  });

  // Template.DrawerRight.events({
  //   "click .star":function(e){
  //     var Course = Session.get("clickedCourse");
  //     var MyCoursesArr = UserSession.get("courses");
  //     MyCoursesArr.push(Course);
  //     // make sure it isn't already in the array!
  //     UserSession.set("courses", MyCoursesArr);
  //     console.log(MyCoursesArr)
  //     // this_star = e.target()
  //     // console.log($(this_star).parent().html());
  //
  //   }
  // });

  Template.search.events({
    "keyup #search-box":_.throttle(function(e){
      var text = $(e.target).val().trim();
      CourseSearch.search(text);
    }, 200),

    // somethign here like a click on the box? screen results by -1
    "click .toggle-checked": function(){
      // change the preferences!!!
      console.log("you clicked", this._id);
      // handle the checkbox being checked or unchecked
      // filter the data by this
      // redisplay data in the list
    }
  });

  Template.shop.helpers({
    shopUrl:function(){
      return Session.get("shoppingUrl");;
    }
  });

  Template.result.rendered = function(){
    CourseSearch.search('');
    activate();
  }

  Template.body.rendered = function(){
    // $(".drawer").hide();
  }

  Template.body.events({
    // WHEN THEY HIT ENTER ON THE SEARCH
    "submit .search-form":function(e){
      var text = e.target.text.value;
      // search the courses database for matches
      // clear form
      // e.target.text.value = "";

      // prefent default form submit
      return false;
    } // also ad event listeners for when the person clicks their individual things
    //add listeners to the classes that will be in each item
    // like the arrow, and the bottle or number.
  });

  Template.classy_header.events({
    "click #my-menus":function(){
      Session.set("viewingMenu", true)
      // display a pop up
      // when they choose one, insert it into the current menu.

      // display the user's courses
    },
    "click #my-courses":function(){
      Session.set("viewingMyCourses", true)
      // when they choose one, insert it into the search results.
      // do I want to do this in the search results or the drawer?
    }
  });

  // Template.menu.helpers({
  //   viewingMenus: function(){
  //     return Session.get("viewingMenu");
  //   },
  //   currentMenu: function(){
  //     return curr_men
  //   },
  //   exampleMenu: function(){
  //     return curr_men
  //   }
  // });
  Template.mycourses.helpers({
    favoriteCourses:function(){
      var favorites = UserSession.get("courses");
      return favorites

    }
  });
  Template.mymenu.helpers({
    studyCard:function(){
      var added = UserSession.get("Menu");
      return added;
    }
  });

  Accounts.ui.config({
    passwordSignupFields:"USERNAME_ONLY"
  });
  // console.log(Courses);

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

}// end client code

function activate(){
  //
  $("tr").hover(function(){
    console.log("derp");
    $(this).find("img").toggleClass("invisible");
  }, function(){
    $(this).find("img").toggleClass("invisible");
  });
}
//
// // Accepts a url and a callback function to run.
// function requestCrossDomain( site, selector, callback ) {
//
//     // If no url was passed, exit.
//     if ( !site ) {
//         alert('No site was passed.');
//         return false;
//     }
//
//     // Take the provided url, and add it to a YQL query. Make sure you encode it!
//     var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + site + '"') + '&format=xml&callback=cbFunc';
//     component = encodeURIComponent('SELECT * FROM data.html.cssselect where url ="'+ site + '" AND css = "'+selector+'"')
//
//     console.log("component", component)
//     var yql = "https://query.yahooapis.com/v1/public/yql?q="+ component+ "&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys"
//     console.log(yql);
//     // Request that YSQL string, and run a callback function.
//     // Pass a defined function to prevent cache-busting.
//     $.getJSON( yql, cbFunc );
//
//     function cbFunc(data) {
//       console.log(data);
//     // If we have something to work with...
//     if ( data.results[0] ) {
//         // Strip out all script tags, for security reasons.
//         // BE VERY CAREFUL. This helps, but we should do more.
//         data = data.results[0].replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
//
//         console.log("derp");
//         // If the user passed a callback, and it
//         // is a function, call it, and send through the data var.
//         if ( typeof callback === 'function') {
//             callback(data);
//         }
//     }
//     // Else, Maybe we requested a site that doesn't exist, and nothing returned.
//     else throw new Error('Nothing returned from getJSON.');
//     }
// }
//


//   Template.body.events({
//   "submit .new-task": function (event) {
//     // This function is called when the new task form is submitted
//
//     var text = event.target.text.value;
//
//     Tasks.insert({
//   text: text,
//   createdAt: new Date(),            // current time
//   owner: Meteor.userId(),           // _id of logged in user
//   username: Meteor.user().username  // username of logged in user
// });
//     // Clear form
//     event.target.text.value = "";
//
//     // Prevent default form submit
//     return false;
//   }
//
// });
// // In the client code, below everything else
// Template.menu.events({
//   "click .toggle-checked": function () {
//     // Set the checked property to the opposite of its current value
//     Tasks.update(this._id, {$set: {checked: ! this.checked}});
//   },
//   "click .delete": function () {
//     Tasks.remove(this._id);
//   }
// });
// At the bottom of the client code
// Accounts.ui.config({
//   passwordSignupFields: "USERNAME_ONLY"
// });
function flip(chance){
  var temp = Math.random() * 100
  if (temp <= chance){
    return true
  }
  else {
    return false
  }

}
