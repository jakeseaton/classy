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

Classy allows the user to shop for courses and how to handle them. 

It uses information from the CS50 courses API, the Wine.com API, and the National Institute on Drug Abuse to pair courses with wines. As courses become more difficult or have low overall scores, there is a chance that instead of a wine, an abusive drug will be assigned.

The user views courses one at a time, and decides whether to do it or back out. If they accept the course, it is added to their study card, and their blood alcohol level increases. As the user gets drunker and drunker, and their schedule gets more and more difficult, the indicators at the bottom of the study card change.  

It things go south, they can always vomit to reduce their BAL and clear their card.

It makes use of Meteor's emphasis on reactive data to keep various UI elements constantly changing, so that the user stays interested and laughing. It reactively rewrited comments from the Q with its suggestion information, occasionally presents drugs, and gives the user various links depending on their state. For example, they can also literally shop for the paired alcohol by clicking on the icon, or figure out what they need to know about their current diagnosis.

Meteor
---
Meteor.

Libraries
---
- Stylus
- accounts-ui
- accounts-password
- bootstrap
- jquery
- u2622:persistent-session


To Use
---

1) Go to classyapp.meteor.com
2) Create an account on the log in page

Known Issues:

-Some Meteor wonkiness, particularly in the sign-in process and loading of suggestions on the course card.
-In the current version 
