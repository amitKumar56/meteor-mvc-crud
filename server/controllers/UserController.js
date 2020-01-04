import { Meteor } from "meteor/meteor";
import { Users } from "../models/Collections";

Meteor.methods({
  addUser: async (email, password, firstName, lastName) => {
    console.log("In=====Mongoosee");

    let params = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      createdAt: new Date(),
      createdBy: "5e0b2c175168ac136d997486",
      fans: ["5e0b14fa30582e125f43e5bd", "5e0b14ee30582e125f43e5bc"]
    };
    //Check Blank Validation
    let isValid = Meteor.call("checkCommonValidation", params);

    //Check Required Validation
    let isValidReq = Meteor.call("checkCreateReqValidation", params);

    if (!isValid) {
      let notValid = {
        flag: false
      };
      return notValid;
    } else if (!isValidReq) {
      let notValid = {
        flag: false
      };
      return notValid;
    } else {
      const userCreateObj = await Users.insert(params);
      console.log("userCreateObj===>>>", userCreateObj);
      if (userCreateObj) {
        let result = {
          data: userCreateObj,
          flag: true,
          message: "User Created Successfully"
        };
        return result;
      } else {
        let result = {
          flag: false,
          message: "Failed to create user"
        };
        return result;
      }
    }
  },
  listUser: async params => {
    let userFilter = {};
    if (params.email) {
      userFilter.email = params.email;
    }
    let users = await Users.find(userFilter).fetch();
    console.log("users====>>>>", users.length);
    if (users && users.length && users.length > 0) {
      let result = {
        data: users,
        flag: true,
        message: "User data found"
      };
      return result;
    } else {
      let result = {
        data: [],
        flag: false,
        message: "User data not found Successfully"
      };
      return result;
    }
  },
  logiInUser: async (email, password) => {
    let userFilter = {
      email: email,
      password: password
    };
    // let user = await Users.findOne(userFilter);
    // console.log("Login----", user);
    // return user;
  },
  deleteUser: async id => {
    console.log("Delete---User", id);
    let user = await Users.remove(id);
    console.log("Delete-User----", user);
    return user;
  },
  editUserData: async (email, firstName, lastName, id) => {
    console.log("Edit-User----", email, firstName, lastName, id);
    let updatedUser = await Users.update(
      { _id: id },
      {
        $set: {
          firstName: firstName,
          lastName: lastName,
          email: email
        }
      }
    );
    console.log("updatedUser====>>>", updatedUser);
    return updatedUser;
  }
});
