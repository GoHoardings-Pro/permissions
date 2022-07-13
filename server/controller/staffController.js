const db = require('../conn/conn');
const AppError = require('../utils/AppError');
const bcrypt = require("bcrypt")

exports.list = async (req, res, next) => {
    try{
         db.query("SELECT * FROM tbl_staff ",  (err,result) => {
                if (err){
                  return res.send({"err": err, message :"Some Error Got"})
                } else if (result == []){
                   return res.send({"No Data": `No Data Found on DataBase`})
                } else {
                   return res.send(result)
                }
                } )
            } catch (err){
                res.status(404).json({
                  messsage:err.res
                })
            }
}

exports.createUser = async (req, res, next) => {
    try{
        const {email, password:Npassword, role} = req.body;
        if(req.body != undefined) {
            const password = await bcrypt.hash(Npassword,8)
          db.query(
            "Insert into tbl_staff (email, password, role) VALUES (?,?,?) ",
            [email, password, role],
            (err, result) => {
              if (err){
                res.send({"err": err,message :"User Not Created Check Manually"})
             } else {
                return  res.send(result)
             }
            });
        } else {
             res.send({message:"User data Null"})
        }     
    } catch (err){
        res.status(404).json({
          messsage:err.res
        })
    }
}


exports.toggle = async (req, res, next) => {
    try{
       const {id} = req.body   
       id  ?  db.query("SELECT * from tbl_staff WHERE id = "+id+" ", (err, result) => {
            if (err){
                res.send({"err": err,message :"User Not Created Check Manually"})
              } 
            const toggleValue = result[0].toggle
            if (toggleValue == 0){
                db.query("UPDATE tbl_staff SET toggle = 1 WHERE id = "+id+"", (err,result) => {
                    if (err){
                        res.send({"err": err,message :"User Not Created Check Manually"})
                      }else if (result == []){
                        return res.send({false: `No Data Found on DataBase`})
                     }
                    db.query('SELECT * FROM tbl_staff', async (err, result) => {
                        if (err){
                            res.send({"err": err,message :"User Not Created Check Manually"})
                          }else if (result == []){
                            return res.send({false: `No Data Found on DataBase`})
                         } else {
                            return res.send(result)
                         }
                      });
                })
            } else {
                db.query('UPDATE tbl_staff SET toggle = 0 WHERE id = '+id+'', async (err, result) => {
                    if (err){
                        res.send({"err": err,message :"User Not Created Check Manually"})
                      }else if (result == []){
                        return res.send({false: `No Data Found on DataBase`})
                     } 
                  db.query('SELECT * FROM tbl_staff', async (err, result) => {
                    if (err){
                        res.send({"err": err,message :"User Not Created Check Manually"})
                      }else if (result == []){
                        return res.send({false: `No Data Found on DataBase`})
                     } else {
                        return res.send(result)
                     }
                  });
                });
              }
        })
    :      res.send({message:"User data Null"})     
    } catch (err){
            res.status(404).json({
              messsage:err.res
            })
        }
}


exports.roles = async (req, res, next) => {
    try{
        db.query("SELECT role FROM tbl_roles", async(err,result) => {
            if (err){
                res.send({"err": err,message :"User Not Created Check Manually"})
              }else if (result == []){
                return res.send({false: `No Data Found on DataBase`})
             } else {
                return res.send(result)
             }
            })
    } catch (err){
            res.status(404).json({
              messsage:err.res
            })
        }
}

exports.permission = async (req, res, next) => {
    try {
       const {role, id} = req.body
      role,id ?  db.query("SELECT * FROM tbl_roles WHERE role='"+role+"'",(err,result) => {
              if (err){
                res.send({"err" : err, message: "Role_Id not found"})
              } else {
                const roleid = result[0].role_id;
                // If we get both userid and roleid then we show the permission of that perticular role which matched by userid
                // that query worked on tbl_staff_permissions where we try to get user permissions by the perticular role with his userid
                db.query("SELECT permission_id,can_view,can_view_own,can_edit,can_create,can_delete  From tbl_staff_permissions WHERE role_id = "+roleid+" OR staff_id="+id+"",async (err,result) =>{
                  if (err) {
                    res.send({"err" : err, message: "No data found"})
                  } else if (result.length == []){
                    // If we don't get userid that's means its a new user we can deciade roll abd this ides
                    // Here we admire that user is new so we select his role and on this this we get permissions which are get from tblrolepermissions table were 
                    db.query("SELECT can_view,can_view_own,can_edit,can_create,can_delete, permission_id  From tblrolepermissions WHERE role_id = "+roleid+" ", async(err, result) => {
                      if (err){
                        res.send({"err" : err, message: "No data found"})
                      } else if (result.length == []){
                        res.send({"err" : err, message: "Data is empty"})
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
            :  res.send({message:"User data Null"})
          } catch (err){
            res.status(404).json({
              messsage:err.res
            })
          }
}

exports.updatePermission = async (req, res, next) => {
    try {
        const  {permission, role, id}   = req.body
          let promises = []
          db.query("SELECT * FROM tbl_roles WHERE role='"+role+"'", async(err,result) => {
            if (err) {
             res.send(err);
            } else {
              const roleid = result[0].role_id;
              permission.forEach((obj) =>{
                promises.push(new Promise((resolve, reject) => {
                 db.query("UPDATE tbl_staff_permissions SET  permission_id = "+obj.permission_id+", can_view = "+obj.can_view+", can_view_own = "+obj.can_view_own+", can_edit = "+obj.can_edit+",can_create = "+obj.can_create+", can_delete = "+obj.can_delete+" WHERE role_id = "+ roleid +" AND staff_id ="+ id +"", async (err,result) => {
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
          } catch (err){
            res.status(404).json({
              messsage:err.res
            })
          }
}


exports.update = async (req, res, next) => {
    try {
    
  const {id,email, password:Npassword, role} = req.body;
  console.log(id, email, role);
  const password = await bcrypt.hash(Npassword,8)
  db.query(
    "UPDATE tbl_staff SET email = ?, password = ?, role = ?  WHERE id = "+id+"",
    [  email, password, role],
    (err, result) => {
      if (err){
        res.send({"err": "message","message" :"Some Error Got"})
      }
         return res.send(result)
      } 
  );
          } catch (err){
            res.status(404).json({
              messsage:err.res
            })
          }
}




