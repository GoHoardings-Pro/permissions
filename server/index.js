const express = require("express")
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 8000
const bodyparser = require('body-parser');
app.use(bodyparser());
app.use(express.json())
app.use(cors())
app.use( express.json({limit: '14kb'}))
app.use(express.urlencoded({ extended: true}));


const permissionRoute = require('./routes/permissionRoute');
app.use('/api/v1/permission', permissionRoute)

const staffRoute = require('./routes/staffRoute');
app.use('/api/v1/staff', staffRoute)


// // Create a new user
// // Create a new role 
// app.post("/createPermission", async (req,res) => {
//   
// })


// app.post("/getPermissions", async (req,res) => {
//   
// })



// app.post("/getUser", async (req,res) => {
// 
// })


// app.post("/updateStaffPermission", async (req,res) => {

// })

app.listen(PORT, () => {
  console.log(`Your Website Running at ${PORT}`);
})