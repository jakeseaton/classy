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

// server code
if (Meteor.isServer){

  // insert into wines database
  if (Wines.find().count() ===0){
    console.log("importing redwines.json to db")
    var output = JSON.parse(Assets.getText("redwine.json"));
    var redwines = output.Products.List
    //console.log(wines);
    for (wine in redwines){
      var curr = redwines[wine]
      var proof = Math.floor((Math.random()*10)+10);
      curr.Proof = proof;
      curr.Color = "red";
      console.log(curr.Name)
      Wines.insert(curr)
    }
    output = JSON.parse(Assets.getText("whitewines.json"));
    var whitewines = output.Products.List;
    for (wine in whitewines){
      var curr = whitewines[wine]
      var proof = Math.floor((Math.random()*10)+10)
      curr.Proof = proof;
      curr.Color = "white";
      // console.log(curr);
      Wines.insert(curr);
    }
  }

  var wineCount = Wines.find().count();
  var wineArray = Wines.find().fetch();
  var courseCount = Courses.find().count();
  console.log("winecount", wineCount)

  // insert into courses database
  if (courseCount===0){
    console.log("importing courses.json to db");
    // only need to do this once.
    var courses = JSON.parse(Assets.getText("courses.json"));
    // // console.log(courses);
    for (course in courses){
      // pair three random wines
      var wine1 = Math.floor((Math.random()*wineCount)+1)
      var wine2 = Math.floor((Math.random()*wineCount)+1)
      var wine3 = Math.floor((Math.random()*wineCount)+1)
      var curr = courses[course]
      // assign it a random course number between 1 and 4
      var number = Math.floor((Math.random() * 4)+1)
      curr.course_number = number
      curr.Wine1 = wineArray[wine1];
      curr.Wine2 = wineArray[wine2];
      curr.Wine3 = wineArray[wine3];

      // console.log(courses[course].cat_num);
      Courses.insert(curr);
    }
  }

  SearchSource.defineSource('courses', function(searchText, options){
    var options = {sort:{isoScore:-1}, limit:15};
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
}

// Client code
if (Meteor.isClient) {

  /* set defaults */
  Session.setDefault("viewingMenu", false);
  Session.setDefault("viewingMyCourses", false);
  Session.setDefault("clickedCourse", false);
  Session.setDefault("currentWine", "");
  // Session.setDefault("viewingSearchResults", false);

  if (! UserSession.get("Menu")){
    UserSession.set("Menu", []);
  }
  if (! UserSession.get("courses")){
    UserSession.set("courses", []);
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

  Template.main.helpers({
    viewingMenuBool: function(){
      return Session.get("viewingMenu");
    },
    viewingMyCoursesBool: function(){
      return Session.get("viewingMyCourses");
    },
    userMenu: function(){
      return UserSession.get("Menu");
    },
    userCourses: function(){
      return UserSession.get("courses");
    }
  });

  Template.result.helpers({
    getCourses:function(){
      var y = CourseSearch.getData({
        transform: function(matchText, regExp){
          return matchText.replace(regExp, "<b>$&</b>")
        },
        // somehow sort by course number?
        // this orders them in
        sort:{isoScore: -1, course_number: 1}
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
      toggleDrawers();

      console.log($(e.target).find(".wine-name").attr("href"));
      var wineName = $(e.target).find(".wine-name").html();
      console.log(wineName)
      var findWine = Wines.find({Name:wineName}).fetch();
      var url_to_search = findWine[0].Url
      console.log(url_to_search);
      $.ajax(url_to_search,{
          type:"GET",
          dataType:"jsonp",
          crossDomain:true,
          success: function(data){
            console.log(data);
            $(data).find(".wineMakerNotes").find("p").each(function(){
              console.log("this");
            });
          }

      });
      console.log(this)
      // Session.set("viewingMyCourses", false);
      Session.set("clickedCourse", this);
      // $(".drawer").show();
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
    else{      return false
        }
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
  Template.DrawerLeft.events({
    "click .star":function(e){
      var Course = Session.get("clickedCourse");
      var MyCoursesArr = UserSession.get("courses");
      MyCoursesArr.push(Course);
      // make sure it isn't already in the array!
      UserSession.set("courses", MyCoursesArr);
      console.log(MyCoursesArr)
      // this_star = e.target()
      // console.log($(this_star).parent().html());

    }
  });
  Template.DrawerRight.events({
    "click .star":function(e){
      var Course = Session.get("clickedCourse");
      var MyCoursesArr = UserSession.get("courses");
      MyCoursesArr.push(Course);
      // make sure it isn't already in the array!
      UserSession.set("courses", MyCoursesArr);
      console.log(MyCoursesArr)
      // this_star = e.target()
      // console.log($(this_star).parent().html());

    }
  });

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

  Template.result.rendered = function(){
    CourseSearch.search('');
    activate();
  }

  Template.body.rendered = function(){
    // $(".drawer").hide();
    $(".carousel").carousel();
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
  Template.menu.helpers({
    viewingMenus: function(){
      return Session.get("viewingMenu");
    },
    currentMenu: function(){
      return curr_men
    },
    exampleMenu: function(){
      return curr_men
    }
  });

  Accounts.ui.config({
    passwordSignupFields:"USERNAME_ONLY"
  });
  // console.log(Courses);

  function toggleDrawers(){
    console.log("togling drawers");

    $(".drawer").each(function(){
        // if it's already hidden
        if ($(this).hasClass("invisible")){
            $(this).removeClass("invisible");
            if ($(this).attr("id") == "drawer-left"){
              $(this).animate({"left":"0"}, "slow");
            }
            else{
              $(this).animate({"right":"0px"}, "slow");
            }
            // remove invisibility
            // slide it in

        }
        else {
          if ($(this).attr("id") == "drawer-left"){
            $(this).animate({"left":"-1000px"}, "slow", function(){
              $(this).addClass("invisible")
            });
          }
          else{
            $(this).animate({"right":"-1000px"}, "slow", function(){
              $(this).addClass("invisible");
            });
          }
          // slide it out
          // add invisibility
        }
    });
  }
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
