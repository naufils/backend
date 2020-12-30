const config={
    //if you want to keep the databse as same as that of homethatre no need to change anything here, else create a new db instance and make the schema in that
    //and add its creds here, OK? got it


    // host: "http://hometheaterdb.cq2qb1yin7yo.ap-south-1.rds.amazonaws.com:3306",

    host:'database-hometheatre.co2jlxdnpaox.ap-south-1.rds.amazonaws.com',
    // host:'copydb.cq2qb1yin7yo.ap-south-1.rds.amazonaws.com',
    // host:'localhost',
    user:'admin',
    password:'hometheatre',
    // password:'root',
    database:'mittu',
    server_url:'database-hometheatre.co2jlxdnpaox.ap-south-1.rds.amazonaws.com:3306',
    // server_url:"http://192.168.43.235:8080",
    // env_system:'local',
    // timezone:'UTC',
    dateStrings:true
    
    // stripe keys Publishable key: pk_test_Mcd8yANnIgUybHBGQ8PhhoEp  Secret key: sk_test_LZmGWOmXb69THgpmEus4pbpo
}
module.exports=config;
