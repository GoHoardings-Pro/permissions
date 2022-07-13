const db = require('../conn/conn');


exports.updateStaffPermission = async (req, res, next) =>{
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
          db.query("UPDATE tbl_staff_permissions SET can_view="+element.can_view+", can_view_own = "+element.can_view_own+", can_edit = "+element.can_edit+",can_create = "+element.can_create+", can_delete = "+element.can_delete+" WHERE role_id="+roleid+" AND  staff_id="+obj+" AND permission_id="+element.permission_id+"", async (err,result) => {      
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
              if (err){
                res.send({"err": err,message :"User Not Created Check Manually"})
              }else if (result == []){
                return res.send({false: `No Data Found on DataBase`})
             } else {
                return resolve(result)
             }
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
}


exports.getUser = async (req, res, next) =>{
    try {
        const {role} = req.body
        role ?  db.query("SELECT id,email FROM tbl_staff WHERE role='"+role+"'",(err,result) => {
            if (err){
                res.send({"err": err,message :"User Not Created Check Manually"})
              }else if (result == []){
                return res.send({false: `No Data Found on DataBase`})
             } else {
                return res.send(result)
             }
        })
        : res.send({message:"User data Null"})
    } catch (err){
      res.status(404).json({
        messsage:err.res
      })
    }
}


exports.getPermissions = async (req, res, next) =>{
    try {
            const {role} = req.body
          role ? db.query("SELECT * FROM tbl_roles WHERE role='"+role+"'",(err,result) => {
            if (err){
                res.send({"err": err,message :"User Not Created Check Manually"})
              }else if (result == []){
                return res.send({false: `No Data Found on DataBase`})
             } else {
                const roleid = result[0].role_id
               // If we get both userid and roleid then we show the permission of that perticular role which matched by userid
                // that query worked on tbl_staff_permissions where we try to get user permissions by the perticular role with his userid
                db.query("SELECT permission_id,can_view,can_view_own,can_edit,can_create,can_delete  From tblrolepermissions WHERE role_id = "+roleid+"",async (err,result) =>{
                    if (err){
                        res.send({"err": err,message :"User Not Created Check Manually"})
                  } else if (result.length == []){
                    // If we don't get userid that's means its a new user we can deciade roll abd this ides
                    // Here we admire that user is new so we select his role and on this this we get permissions which are get from tblrolepermissions table were 
                    db.query("SELECT can_view,can_view_own,can_edit,can_create,can_delete, permission_id  From tbl_empty_permissions", async(err, result) => {
                        if (err){
                            res.send({"err": err,message :"User Not Created Check Manually"})
                          }else if (result == []){
                            return res.send({false: `No Data Found on DataBase`})
                         } else {
                            return res.send(result)
                         }
                    })
                  } else {
                    return res.send(result);
                  }
                })
              }
            })
            : res.send({message:"User data Null"})
          } catch (err){
            res.status(404).json({
              messsage:err.res
            })
          }
}


exports.createPermission = async (req, res, next) =>{
    try{
        const {role} = req.body
       role ? db.query("INSERT into tbl_roles (role) VALUES  ('"+role+"')", async(err,result) => {
        if (err){
            res.send({"err": err,message :"User Not Created Check Manually"})
          }else if (result == []){
            return res.send({false: `No Data Found on DataBase`})
         } else {
            return res.send(result)
         }
        })
        : res.send({message:"User data Null"})
    } catch (err){
        res.status(404).json({
          messsage:err.res
        })
    }
   
}


/// For single user



exports.singleUserUpdate = async (req, res, next) =>{
  try{
      const {role} = req.body
     role ? db.query("INSERT into tbl_roles (role) VALUES  ('"+role+"')", async(err,result) => {
      if (err){
          res.send({"err": err,message :"User Not Created Check Manually"})
        }else if (result == []){
          return res.send({false: `No Data Found on DataBase`})
       } else {
          return res.send(result)
       }
      })
      : res.send({message:"User data Null"})
  } catch (err){
      res.status(404).json({
        messsage:err.res
      })
  }
 
}



exports.singleUser = async (req, res, next) =>{
  try{
      const {role, id} = req.body
     role,id ? db.query("SELECT * FROM tbl_staff_permission WHERE role_id="+role+" AND staff_id="+id+"", async(err,result) => {
      if (err){
          res.send({"err": err,message :"User Not Created Check Manually"})
        }else if (result == []){
          return res.send({false: `No Data Found on DataBase`})
       } else {
          return res.send(result)
       }
      })
      : res.send({message:"User data Null"})
  } catch (err){
      res.status(404).json({
        messsage:err.res
      })
  }
 
}
