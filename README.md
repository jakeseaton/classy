Classy
=======

Jake Seaton
Quincy Dewolfe 20-05

LOCATION
---
Code: github.com/jakeseaton/classy
Product: classyapp.meteor.com


DESCRPTION
---

Classy allows the user to shop for courses and how to deal with them.

It is built using Meteor, a web application framework that emphasizes reactive data. The app takes advantage of this to track the user's shopping process, which is augmented to include the "prerequisite" alcoholic beverages for taking particular courses at Harvard.

Various features, such as the addition of abusive drugs to the database of courses, re-writing of comments from the Harvard Q data, and the single course presentation are designed to keep the user interested, and hopefully laughing.

Classy uses information from the CS50 courses API, the Wine.com API, the National Institute on Drug Abuse.

Each course is paired with a wine from the database. As courses become more difficult or have extremely low overall scores, there is a chance that instead of a wine, an abusive drug will be assigned.

The user is given the opption to take the course by stating that they have the prerequisites. If they accept the course, the course and product slide up toward the menu bar and study card button. The "GOT IT!" button lingers, and the counter at the bottom increments, tracking the cumulative proof of the user's study card. Otherwise, both course and wine fade out.

Known Issues:
--The study card is not persistent
  -- this is because the favorited courses are being stored in the user database. The solution is to create a new databse that pairs the user's id's to an array containing all of the courses they have favorited, and then publishing the data specific to the current user to the client using Meteor.publish.
--Meteor's login functionality is occasionally wonky, particularly on mobile
--Very rarely, the image for the coruse does not show up.
--The stylesheet is extremely disorganized
  --The site functions on mobile, but there are bugs in the styling.
--Sometimes the new proof percentage is appended instead of added to the bottom.
