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

// <!-- <template name = "DrawerLeft">
//   <div id = "drawer">
//     <div id = "results">
//       <ul id = "search-results-table">
//         {{>result}}
//       </ul>
//     </div>
//   </div>
// </template> -->

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
