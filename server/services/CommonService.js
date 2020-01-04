import { Meteor } from "meteor/meteor";

Meteor.methods({
  checkCommonValidation: async params => {
    console.log("In===Validation");
    if (
      JSON.stringify(params) === "{}" ||
      params === undefined ||
      params === null
    ) {
      return false;
    } else {
      return true;
    }
  },
  checkCreateReqValidation: params => {
    if (
      !params.firstName ||
      !params.lastName ||
      !params.email ||
      !params.password
    ) {
      return false;
    } else {
      return true;
    }
  }
});
