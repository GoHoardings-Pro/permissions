const express = require("express")
const mysql = require("mysql")
const bcrypt = require("bcrypt");
const cors = require("cors");
const app = express();
app.use(express.json())
app.use(cors())

db = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "",
    database : "sql_login"
})
// List of Users
app.get("/", async (req,res) => {
   await db.query("SELECT * FROM tbl_staff " , async  (err,result) => {
    if (err){
      res.send({"err": err,message :"Some Error Got"})
    }
       return res.send(result)
    } )
})

// Create a new user
app.post("/create", async (req,res) => {
  const {email, password:Npassword, role} = req.body;
  const password = await bcrypt.hash(Npassword,8)
  db.query(
    "Insert into  tbl_staff (email, password, role) VALUES (?,?,?) ",
    [  email, password, role],
    (err, result) => {
      if (err){
        res.send({"err": message,message :"Some Error Got"})
      }
         return res.send(result)
      } 
  );
})
// toggle button for  each user 

app.post("/toggle", async (req,res) => {
    toggle = req.body.id
    db.query("SELECT * from tbl_staff WHERE id = "+toggle+" ", async (err, result) => {
        if (err) throw err;
        let toggleValue = result[0].toggle
        if (toggleValue == 0){
            db.query("UPDATE tbl_staff SET toggle = 1 WHERE id = "+toggle+"", (err,result) => {
                if (err) throw err;
                db.query('SELECT * FROM tbl_staff', async (err, result) => {
                    if (err) throw err;
                    return res.send(result);
                  });
            })
        } else {
            db.query('UPDATE tbl_staff SET toggle = 0 WHERE id = '+toggle+'', async (err, result) => {
              if (err) throw err;
              db.query('SELECT * FROM tbl_staff', async (err, result) => {
                if (err){
                  res.send({"err": message,message :"Some Error Got"})
                }
                   return res.send(result)
                
              });
            });
          }
    })
  })

  // here we update user password email and role

app.post("/update/:id", async (req,res) =>{
const id = req.params.id;
  const {email, password:Npassword, role} = req.body;
  const password = await bcrypt.hash(Npassword,8)
  db.query(
    "UPDATE tbl_staff SET email = ?, password = ?, role = ?  WHERE id = "+id+"",
    [  email, password, role],
    (err, result) => {
      if (err){
        res.send({"err": message,message :"Some Error Got"})
      }
         return res.send(result)
      } 
  );
});
// Getting Permissions of the User by tbl-staff-permissions or if user don't have user id then we get permissions from tbl-role permission 
app.post("/permission", async (req,res) =>{
  try {
    const {role, id} = req.body
  
    db.query("SELECT * FROM tbl_roles WHERE role='"+role+"'",(err,result) => {
      if (err){
        res.send({"err" : err, message: "Role_Id not found"})
      } else {
        const roleid = result[0].role_id;
        // If we get both userid and roleid then we show the permission of that perticular role which matched by userid
        // that query worked on tbl_staff_permissions where we try to get user permissions by the perticular role with his userid
        db.query("SELECT permission_id,can_view,can_view_own,can_edit,can_create,can_delete  From tbl_staff_permissions WHERE role_id = "+roleid+" OR staff_id="+id+"",async (err,result) =>{
        // db.query("SELECT permission_id,can_view,can_view_own,can_edit,can_create,can_delete  From tbl_empty_permissions ",async (err,result) =>{
          if (err) {
            res.send(err);
          } else if (result.length == []){
            // If we don't get userid that's means its a new user we can deciade roll abd this ides
            // Here we admire that user is new so we select his role and on this this we get permissions which are get from tblrolepermissions table were 
            db.query("SELECT can_view,can_view_own,can_edit,can_create,can_delete, permission_id  From tblrolepermissions WHERE role_id = "+roleid+" ", async(err, result) => {
            // db.query("SELECT can_view,can_view_own,can_edit,can_create,can_delete, permission_id  From tbl_empty_permissions WHERE  ", async(err, result) => {
              if (err){
                res.send(err)
              } else if (result.length == []){
                res.send({"err" : result, message: "Data is empty"})
              }else {
                return res.send(result);
              }
            })
          } else {
            return res.send(result);
          }
        })
      }
    })
  } catch (err){
    res.status(404).json({
      messsage:err.res
    })
  }
})

// app.get("/test", async (req,res) => {
//   const role = "Accounts"
//   db.query("SELECT role_id from tbl_roles WHERE role='"+role+"'", async(err,result) => {
//     if (err) throw err;
//     const  role_id = result[0].role_id
//   db.query("SELECT * From tbl_staff_permissions WHERE role_id="+role_id+"", async (err,result) => {
//     if (err) throw err;
//     return res.send (result)
//   })
// })
// })

// app.get("/test1", async (req,res) => {
//   const role = "Accounts"
//   db.query("SELECT id,email FROM tbl_staff WHERE role='"+role+"'", async (err,result)=>{
//     if (err) throw err;
//     return res.send (result)
// })
// })

// app.get("/test2", async (req,res) => {
//   const role = "Accounts"
//   let staff_id = [1,12,24,109,43,5465,647]
//   let gha = []
//   db.query("SELECT role_id from tbl_roles WHERE role='"+role+"'", async(err,result) => {
//     if (err) throw err;
//     const  role_id = result[0].role_id
//   db.query("SELECT DISTINCT staff_id FROM tbl_staff_permissions WHERE role_id="+role_id+"", (err,result) => {
//     if (err) throw err;
    
//     result.forEach((element) => {
//       gha.push(element.staff_id)
//   })
//   gha.forEach((obj) => {
//     if(obj == staff_id) {
//       console.log(true);
//     } else {
//       console.log(false);
//     }
//   })
//   })
//   })
  
// })

// Updateing the Permissions of a specific USER
app.post("/updatePermission", async (req,res) => {
  const  {permission, role, id}   = req.body
  let promises = []
  db.query("SELECT * FROM tbl_roles WHERE role='"+role+"'", async(err,result) => {
    if (err) {
     res.send(err);
    } else {
      const roleid = result[0].role_id;
      permission.forEach((obj) =>{
        promises.push(new Promise((resolve, reject) => {
        //  db.query("UPDATE tbl_staff_permissions SET role_id = "+role_id+", staff_id ="+id+", permission_id = "+obj.permission_id+", can_view = "+obj.can_view+", can_view_own = "+obj.can_view_own+", can_edit = "+obj.can_edit+",can_create = "+obj.can_create+", can_delete = "+obj.can_delete+" WHERE role_id = "+role_id+"", async (err,result) => {
         db.query("INSERT into tbl_staff_permissions (role_id, staff_id , permission_id , can_view , can_view_own, can_edit,can_create, can_delete) VALUES ("+roleid+","+id+", "+obj.permission_id+","+obj.can_view+","+obj.can_view_own+","+obj.can_edit+","+obj.can_create+","+obj.can_delete+")", async (err,result) => {
          if (err) {
            reject(err)
          }
          resolve(result);
      })
      }))
    })
    }
  
  
  
try {
  const result = await Promise.all(promises)
  return res.send(result);
} catch (err) {
  return (err)
}
})
})

// Create a new role 
app.post("/createPermission", async (req,res) => {
  const {role} = req.body
  db.query("INSERT into tbl_roles (role) VALUES  ('"+role+"')", async(err,result) => {
    if (err) throw err;
    return res.send(result)
  })
 
})


app.get("/getRoles", async (req,res) => {
  db.query("SELECT role FROM tbl_roles", async(err,result) => {
    if (err) throw err;
    return res.send(result)
  })
  
})

app.post("/getPermissions", async (req,res) => {
  
  try {
    const {role} = req.body
    
    db.query("SELECT * FROM tbl_roles WHERE role='"+role+"'",(err,result) => {
      if (err){
        res.send({"err" : err, message: "Role_Id not found"})
      } else {
        const roleid = result[0].role_id
       // If we get both userid and roleid then we show the permission of that perticular role which matched by userid
        // that query worked on tbl_staff_permissions where we try to get user permissions by the perticular role with his userid
        db.query("SELECT permission_id,can_view,can_view_own,can_edit,can_create,can_delete  From tblrolepermissions WHERE role_id = "+roleid+"",async (err,result) =>{
          if (err) {
            res.send(err);
          } else if (result.length == []){
            // If we don't get userid that's means its a new user we can deciade roll abd this ides
            // Here we admire that user is new so we select his role and on this this we get permissions which are get from tblrolepermissions table were 
            db.query("SELECT can_view,can_view_own,can_edit,can_create,can_delete, permission_id  From tbl_empty_permissions", async(err, result) => {
              if (err){
                res.send({"err": message,message :"Some Error Got"})
              } else if (result.length == []){
                res.send({"err" : result, message: "Data is empty"})
              }else {
                return res.send(result);
              }
            })
          } else {
            return res.send(result);
          }
        })
      }
    })
  } catch (err){
    res.status(404).json({
      messsage:err.res
    })
  }
})

app.post("/getUser", async (req,res) => {
const {role} = req.body
  db.query("SELECT id,email FROM tbl_staff WHERE role='"+role+"'",(err,result) => {
    if (err){
      res.send({"err" : err, message: "Role_Id not found"})
    } else {
      return res.send(result)
    }
  })
})

app.post("/updateStaffPermission", async (req,res) => {
  const {role, permission, user_id} = req.body; 
  let promises = []
  db.query("SELECT * FROM tbl_roles WHERE role='"+role+"'", async (err,result) => {
    if (err) throw err;
      const roleid = result[0].role_id;
      // We trying to calculate the users length && if length more then zero then we update users permissions
    if(user_id.length != []){
      // ForEach loop on users length
     user_id.forEach((obj) => {
        // Promises are used to get all data on a single handel promise will until all data not collected 
        promises.push(new Promise ((reject, resolve) => { 
             // ForEach loop on permission 
        permission.forEach((element) => {
          // Update query on tbl_staff_permissions for useres
          db.query("UPDATE tbl_staff_permissions SET  can_view="+element.can_view+", can_view_own = "+element.can_view_own+", can_edit = "+element.can_edit+",can_create = "+element.can_create+", can_delete = "+element.can_delete+" WHERE  role_id="+roleid+" OR  staff_id="+obj+" AND permission_id="+element.permission_id+"", async (err,result) => {      
            if (err){
                  reject(err)
                }
                 resolve(result)
              })
            })
                 }))
                })
                // here promises given output on try catch bloack
                try {
                  const result = await Promise.all(promises)
                  return res.send(result);
                } catch (err) {
                  return (err)
                }
      // if useres length is zero then we do do that querys         
      } else  {
        // Here we trying compare role id which we have with those who on tblrolepermissions
        db.query("SELECT DISTINCT * From  tblrolepermissions WHERE role_id="+roleid+"", async (err,result) => {
          if (err) {
            res.send(err)
          }
          // If frontend role id is not match with tblrolepermissions role id then we insert new role id onto tblerolepermission with permissions
        if(result.length == []){
             // ForEach loop on permission 
          permission.forEach((item) => {  
                // Promises are used to get all data on a single handel promise will until all data not collected 
            promises.push(new Promise ((reject, resolve) => { 
                 // Insert query on tblrolepermissions for new roleid with permissions
            db.query("INSERT into tblrolepermissions (role_id,can_view,can_view_own,can_edit,can_create,can_delete,permission_id) VALUES ("+roleid+","+item.can_view+", "+item.can_view_own+","+item.can_edit+","+item.can_create+","+item.can_delete+","+item.permission_id+")",async (err, result) => {
              // trying to handel error
              if (err)
              {
                reject(err)
              }
              // getting result on promises
        return resolve(result);
           })
          }))
          }) 
           // If frontend role id is match with tblrolepermissions role id then we insert new role id onto tblerolepermission with permissions
        } else {
           // ForEach loop on permission 
          permission.forEach((obj) => {
                // Promises are used to get all data on a single handel promise will until all data not collected 
            promises.push(new Promise ((reject, resolve) => { 
                 // Update query on tblrolepermissions by the help roleid to update permissions
              db.query('UPDATE tblrolepermissions SET can_view="'+obj.can_view+'", can_view_own="'+obj.can_view_own+'", can_edit="'+obj.can_edit+'", can_delete="'+obj.can_delete+'", can_create="'+obj.can_create+'" WHERE role_id = "'+roleid+'" AND permission_id="'+obj.permission_id+'" ', async (err, result) => {
                if (err)
                {
                  reject(err)
                }
          return resolve(result);
             })
        
        }))
   
          }) 
        }
        try {
          const result = await Promise.all(promises)
          return res.send(result);
        } catch (err) {
          return (err)
        }
        })
        
    } 
    })   
    // try {
    //   const result = await Promise.allSettled(promises)
    //   return res.send(result);
    // } catch (err) {  
    //   return (err)
    // }
})

app.listen(300,async (req,res) => { 
    console.log("Who are you");
})