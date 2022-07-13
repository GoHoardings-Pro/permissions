const mysql = require("mysql")

const db = mysql.createConnection({
    user:"root",
    host:"localhost",
    database:"sql_login"
})

db.connect((err)=>{
    if(err)  {return false}
    else {return true}
  
   
  })
  
  
  
  module.exports = db;