import { Meteor } from "meteor/meteor";
//Inject All Db/Schema Collections
import "./models/Collections";
//Inject All Controllers for handle operations
import "./controllers/UserController";
//Inject Common Servcies
import "./services/CommonService";

Meteor.startup(() => {});
