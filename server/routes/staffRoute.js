const express = require("express")
const router = express.Router();
const { list, createUser, toggle, update, updatePermission, permission, roles} = require('../controller/staffController')

router.route("/list").get(list).post(createUser);
router.route("/updatePermission").post(updatePermission);
router.post("/toggle",toggle);


router.route("/rolePermission").get(roles).post(permission);
router.route("/update").post(update);


module.exports = router