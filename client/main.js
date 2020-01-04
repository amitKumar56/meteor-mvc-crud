import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";

import "./main.html";
import "./main.css";

Template.hello.onCreated(function() {
  // $(document).ready(function() {
  //   $('[data-toggle="tooltip"]').tooltip();
  // });

  let tpl = this;
  this.users = new ReactiveVar([]);

  //Getting List of users
  Meteor.call("listUser", {}, function(err, result) {
    console.log("result=====", result);
    if (err) {
      console.log("Err=====", err);
      tpl.users.set([]);
    } else if (result && result.flag) {
      let d = result.data;
      let emails = _.pluck(d, "email");
      Session.set("UserEmails", emails);
      tpl.users.set(d);
      swal({
        title: result.message,
        text: result.message,
        type: "success"
      });
    } else {
      tpl.users.set([]);
      Session.set("UserEmails", []);
      swal({
        title: result.message,
        text: "Failed to get data,please try again!",
        type: "warning"
      });
    }
  });
});
Template.hello.onRendered(function() {});

Template.hello.helpers({
  getUsers() {
    let users = Template.instance().users.get();
    console.log("users===>>>List", users);
    return users;
  },
  editUserData: () => {
    return Session.get("editUserData");
  },
  userEmails: () => {
    return Session.get("UserEmails");
  },
  indexIncrement: index => {
    return (index += 1);
  },
  searchValue() {
    return Session.get("filterSearch");
  },
  gettingFanDetails(fanArrayObj) {
    let fansByName = [];
    if (fanArrayObj && fanArrayObj.length > 0) {
      _.each(fanArrayObj, function(fanObj) {
        let firstName = fanObj && fanObj.firstName ? fanObj.firstName : "Demo";
        let lastName = fanObj && fanObj.lastName ? fanObj.lastName : "Test";
        let fullName = firstName + " " + lastName;
        fansByName.push(fullName);
      });
    }
    return fansByName;
  }
});

Template.hello.events({
  "submit #login-from": function(event) {
    event.preventDefault();

    var email = event.target.email.value;
    var password = event.target.password.value;

    //Calling APi for store data
    Meteor.call("logiInUser", email, password, async (err, result) => {
      debugger;
      console.log("Login====>>>", result);
      if (err) {
        swal({
          title: "Data Not Found?",
          text: "Invalid credntial's,Email or password wrong!",
          type: "warning"
        });
      } else if (result === undefined) {
        swal({
          title: "Data Not Found?",
          text: "Invalid credntial's,Email or password wrong!",
          type: "warning"
        });
      } else {
        swal({
          title: "Data Found?",
          text: "LoggedIn Successfully,Explore More",
          type: "success"
        });
      }
    });

    //Clear form data after success
    event.target.email.value = "";
    event.target.password.value = "";
  },
  "submit #register-form": async event => {
    console.log("Register====>>>", event.target);
    event.preventDefault();
    var email = event.target.email.value;
    var password = event.target.password.value;
    var firstName = event.target.firstname.value;
    var lastName = event.target.lastname.value;

    //First time user register
    if (!Session.get("editUserData")) {
      Meteor.call("addUser", email, password, firstName, lastName, function(
        err,
        createObj
      ) {
        console.log("createObj====>>>", createObj);
        if (err) {
          swal({
            title: "Register Failed!",
            text: "Failed to register data,please try again!",
            type: "warning"
          });
        } else if (createObj && createObj.flag === false) {
          swal({
            title: "Register Failed!",
            text: "Invalid request,please try again!",
            type: "warning"
          });
        } else if (createObj === undefined) {
          swal({
            title: "Register Failed!",
            text: "Failed to register data,please try again!",
            type: "warning"
          });
        } else {
          swal({
            title: "Register Successfull",
            text: "User Data register Successfully",
            type: "success"
          });
        }
      });
    }
    //If user already exists then update
    else {
      let data = Session.get("editUserData");
      Meteor.call(
        "editUserData",
        email,
        firstName,
        lastName,
        data._id,
        (err, res) => {
          res = JSON.parse(res);
          if (err) {
            swal({
              title: "Update Failed!",
              text: "Failed to update data,please try again!",
              type: "warning"
            });
          } else if (res === undefined) {
            swal({
              title: "Update Failed!",
              text: "Failed to update data,please try again!",
              type: "warning"
            });
          } else {
            swal({
              title: "Update Successfull",
              text: "User Data Updated Successfully",
              type: "success"
            });
          }
          delete Session.keys["editUserData"];
        }
      );
    }
    //Clear form data after success
    event.target.email.value = "";
    event.target.password.value = "";
    event.target.firstname.value = "";
    event.target.lastname.value = "";
  },
  "click .user-delete": function(event, tpl) {
    let PId = this._id;
    console.log("In--Delete---", PId);
    //Calling APi for store data
    Meteor.call("deleteUser", PId, async (err, result) => {
      debugger;

      if (err) {
        swal({
          title: "Data Not Found?",
          text: "Invalid credntial's,Email or password wrong!",
          type: "warning"
        });
      } else if (result === undefined) {
        swal({
          title: "Data Not Found?",
          text: "Invalid credntial's,Email or password wrong!",
          type: "warning"
        });
      } else {
        //Getting Db Response data for compare and remove
        let dbResponse = JSON.parse(result);
        //All User lists
        let users = tpl.users.get();

        // Another method to search for the index.
        var index = users
          .map(function(el) {
            return el._id;
          })
          .indexOf(dbResponse._id);

        // Delete the item by index.
        users.splice(index, 1);
        tpl.users.set(users);

        // To check.
        swal({
          title: "Deleted Successfully",
          text: "Deleted Successfully",
          type: "success"
        });
      }
    });
  },
  "click .user-edit": function(event, tpl) {
    console.log("This----Edit", this);
    Session.set("editUserData", this);
  },
  "keyup #filter-search": function(event, tpl) {
    let users = tpl.users.get();
    let $input = $(event.target);
    let term = $input[0].value;
    users = users.filter(function(user) {
      return (
        user.firstName.toLowerCase().match(term) ||
        user.email.toLowerCase().match(term) ||
        user.lastName.toLowerCase().match(term)
      );
    });
    Session.set("filterSearch", term);
    tpl.users.set(users);
  },
  "click .clearSearch": function(event, tpl) {
    Meteor.call("listUser", {}, function(err, result) {
      Session.set("filterSearch", "");
      $("#category-select").val("Please Select");
      if (err) {
        tpl.users.set([]);
      } else if (result && result.flag) {
        let d = result.data;
        tpl.users.set(d);
      } else {
        tpl.users.set([]);
      }
    });
  },
  "change #category-select": function(event, tpl) {
    let users = tpl.users.get();
    var category = $(event.currentTarget).val();

    Meteor.call("listUser", { email: category }, function(err, result) {
      if (err) {
        console.log("Err=====", err);
        tpl.users.set([]);
      } else if (result && result.flag) {
        let d = result.data;
        tpl.users.set(d);
      } else {
        tpl.users.set([]);
      }
    });
  }
});
