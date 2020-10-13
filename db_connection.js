var mysql = require('mysql');

const dbconn=()=>{
  var con = mysql.createConnection({
    host: "http://hometheaterdb.cq2qb1yin7yo.ap-south-1.rds.amazonaws.com:3306",
    user: "root",
    password: "hometheater",
    database:'vidflix'
  });
 
  con.connect(function(err) {
    if (err){
      console.log("error in DB connection")
    }
    //  throw err;
    else
    console.log("Connected!");
  });
  return con;
}

module.exports=dbconn;