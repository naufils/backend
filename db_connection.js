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
    var sql = "CREATE TABLE subscribers name VARCHAR(100), email VARCHAR(300), phone INT(10)"
    var check = "SHOW TABLES LIKE 'subscribers'"
    if(check !=='subscribers'){
    con.query(sql,(err, result) => {  
      if (err){
        res.status(500).json({error: "Some error occurred. Couldn't create Table"})
      };  
      console.log("Table created");  
      });
    } 
  });

  return con;
}

module.exports=dbconn;