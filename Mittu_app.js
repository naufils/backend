require('dotenv').config();

const mongoose = require('mongoose');
const express = require('express');
const mysql = require('mysql');
const Razorpay = require("razorpay");
const bodyParser = require('body-parser');
const config=require('./db_details.js');

const bluebird = require('bluebird');
const multiparty = require('multiparty');
const AWS=require('aws-sdk');
AWS.config.loadFromPath('./aws-det.json');
const s3 = new AWS.S3();

const jwt=require('jsonwebtoken');

var bcrypt = require('bcryptjs');
const fs=require('fs');
const fileType = require('file-type');
const app = express();

//Added By ThyDreams Studio.
//Author : Dibyajyoti Mishra
//c/o: ThyDreams Studio.

//*********************************************************************************************** */
// DB connection
mongoose.connect(process.env.MONGOURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

//Response when DB is connection is successful
mongoose.connection.on('connected', () => {
  console.log('DB CONNECTED');
});

//Response when DB is connection failed
mongoose.connection.on('error', () => {
  console.log('Some Error has occurred in the connection.Please check again!');
});

const razorpay = new Razorpay({
    key_id: process.env.RAZOR_KEY,
    key_secret: process.env.RAZOR_SECRET,
});


var videoWatchCount = new mongoose.Schema({
  email: {
    type: String,
    default: "",
  },
  plan_purchased:{
      type: Boolean,
      default: false
  },
  planB:{
    type:Date,
    default:Date.now
  },
  planE:{
    type:Date,
    default:Date.now
  },
  payment_id:{
    type:String,
    default:''
  },
  amount:{
    type:Number,
    default:0
  },
  months:{
    type:Number,
    default:0
  },
  videos_watched:{
      type:Number,
      default:0
  },
  video_url1:{
    type:String,
    default:"none"
  },
  video_url2:{
    type:String,
    default:"none"
  }
});

var vc_model = mongoose.model('videoWatchCountModel', videoWatchCount );



const subscriptionRoutes = require("./routes/subscription");
const subscriberRoutes = require("./routes/subscriber");

app.use("/api", subscriptionRoutes);
app.use("/api", subscriberRoutes);

//*********************************************************************************************** */

var cors = require('cors')
app.use(cors())
let connection = mysql.createConnection(config);




app.use(bodyParser.json())


  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
  //   con.query("CREATE DATABASE vidflix", function (err, result) {
  //     if (err) throw err;
  //     console.log("Database created");
  //   });

  //   var sql = "CREATE TABLE customers (name VARCHAR(255), address VARCHAR(255))";
  //   con.query(sql, function (err, result) {
  //       if (err) throw err;
  //       console.log("Table created");
  //   });
  // });


  AWS.config.setPromisesDependency(bluebird);

const uploadFile = (buffer, name, type) => {
  const params = {
    ACL: 'public-read',
    Body: buffer,
    Bucket: "mittuapp-app",
    ContentType: type.mime,
    Key: `${name}.${type.ext}`
  };
  return s3.upload(params).promise();
};

// app.use('/s3', require('react-s3-uploader/s3router')({
//   bucket: "hometheater-app",
//   // region: 'us-east-1', //optional
//   // signatureVersion: 'v4', //optional (use for some amazon regions: frankfurt and others)
//   signatureExpires: 60, //optional, number of seconds the upload signed URL should be valid for (defaults to 60)
//   headers: {'Access-Control-Allow-Origin': '*'}, // optional
//   ACL: 'public-read', // this is default
//   uniquePrefix: true // (4.0.2 and above) default is true, setting the attribute to false preserves the original filename in S3
// }));
// class FindOne {
//   st = {
//     bool1:'',
//     bool2:''
//   }
//   execute_query(query, vc_model, bool_var){
//     var self = this;
//
//     vc_model.findOneAndUpdate(query, { $inc: { videos_watched: 1 } }, function( err, result){
//     if(err) this.st[bool_var] =  false;
//     else{
//       if(result==null){
//         this.st[bool_var] = false;
//       }
//       else if(result.videos_watched>=1 && !result.plan_purchased){
//         res.send({ 'show_ad': true, 'continue':false });
//         console.log("show ad stop video");
//         this.st[bool_var] = true;
//       }
//       else if(result.videos_watched<1 && !result.plan_purchased){
//         res.send({'show_ad': true, 'continue':true});
//         console.log("show ad show video");
//         this.st[bool_var] = true;
//       }
//       else if(result.plan_purchased) {
//         res.send({ 'show_ad': false, 'continue':true });
//         console.log("stop ad show video");
//         this.st[bool_var] = true;
//       }
//     }
//   })
//  }
//   getBool(){
//     var ele = [];
//     ele.push(this.st.bool1)
//     ele.push(this.st.bool2)
//     return ele;
//   }
// }



app.post('/payInfo', (req, res)=>{
  console.log(req.body)
  vc_model.findOne({email:req.body.email})
  .then((result)=>{
    console.log(result);
    if(result.plan_purchased){
      res.send({'unpaid':false, 'planB':result.planB, 'planE':result.planE, 'payId':result.payment_id, 'amount':(result.amount/100), 'months':result.months})
    } else {
      res.send({'unpaid':true})
    }
  })
  .catch((err)=>{
    res.send({'unpaid':true})
    console.log(err);
  });
})




app.post('/chkStatus', (req, res)=>{
  console.log(req.body)
  vc_model.findOne({email:req.body.email})
  .then((result)=>{
    console.log(Date.now()-result.planE);
    if(Date.now()-result.planE>0){
      vc_model.updateOne({_id:result._id}, {plan_purchased:false})
    }
    res.send({success:true})
  })
})

app.post('/confirmnsave', (req, res)=>{
  vc_model.findOne({email:req.body.email})
  .then((result)=>{
    vc_model.updateOne({_id:result._id}, {payment_id:req.body.payment_id, plan_purchased:true})
    .then((result2)=>{
      console.log("Saved Plan Details")
    })
    .catch((err2)=>{
      console.log("Error in saving plan details");
    });
    res.send({success:true})
  })
  .catch((err)=>{
    console.log("yahi error h");
    res.send({success:false})
  });
})

app.post('/paynsubscribe', (req, res)=>{

  var planId = req.body.planId;

  razorpay.plans.fetch(planId)
  .then((plan)=>{
    console.log(plan);
    options = {
      amount: plan.item.amount,
      currency: "INR",
      receipt: "order_rcptid11"
    }
    razorpay.orders.create(options)
    .then((order, err)=>{
      if(err) console.log("Error creating order")
      else {
        console.log(order,"tahi hua");
        const query1 = {email:req.body.email}
        vc_model.findOne(query1)
        .then((result, err)=>{
          if(err) console.log(err)
          else
          {
            console.log(result)
            var planE = new Date();
            if(plan.period=="weekly"){
              planE.setDate(planE.getDate() + 7);
            } else if(plan.period=="monthly"){
              planE.setDate(planE.getDate() + (28*plan.interval));
            }
            vc_model.updateOne({ _id: result._id }, { planE: planE, amount: plan.item.amount, months:plan.interval })
            .then((res)=>{
              console.log(res)
            })
            .catch((err)=>{
              console.log(err)
            })
          }
        });
        console.log("amount", order.amount )
        res.send({
          cancel:false,
          amount:order.amount,
          orderId: order.id,
          receipt: order.receipt
        })
      }
    })
  })
})

app.post("/planpurchased", (req, res)=>{
  const query1 = {email:req.body.email}

  vc_model.findOne(query1)
  .then((result, err)=>{
    if(err) console.log(err)
    else
    {
      if(result.plan_purchased){
        res.send({'show_ad':false})
      } else {
        res.send({'show_ad':true})
      }
    }
  })
  .catch((err)=>{
    console.log(err);
  });
})

app.post("/iwatched", (req, res) => {
  console.log(req.body);
  const query1 = {email:req.body.email, video_url1:req.body.video_url}
  const query2 = {email:req.body.email, video_url2:req.body.video_url}
  var show_ad,show_vd;
  var bool=true;

  vc_model.findOne(query1)
  .then((result, err)=>{
    if(err) console.log(err)
    else
    {
      if(result!=null){
        if(result.plan_purchased){
          show_vd = true;
          show_ad = false;
          return res.send({'show_ad':show_ad, 'show_vd':show_vd})
        } else {
          show_vd = true;
          show_ad = true;
          return res.send({'show_ad':show_ad, 'show_vd':show_vd})
        }
      }
      else {
         vc_model.findOne(query2)
         .then((result, err)=>{
           if(err) console.log(err)
           else
           {
             if(result!=null){
               console.log(result);
               if(result.plan_purchased){
                 show_vd = true;
                 show_ad = false;
                 return res.send({'show_ad':show_ad, 'show_vd':show_vd})
               } else {
                 show_vd = true;
                 show_ad = true;
                 return res.send({'show_ad':show_ad, 'show_vd':show_vd})
               }
             }
             else {
               vc_model.findOne({ email: req.body.email })
                 .then((result2, err2)=>{
                   console.log((result2.video_url2=="none"), !result2.video_url2);
                   if(result2.video_url2=="none"){
                     bool=false;
                     vc_model.updateOne({ _id: result2._id }, { $inc: { videos_watched: 1 }, video_url2:req.body.video_url })
                     .then(()=>{
                       vc_model.findOne({ email: req.body.email })
                       .then((doc)=>{
                         if(doc!=null){
                           if(doc.plan_purchased){
                             show_vd = true;
                             show_ad = false;
                             return res.send({'show_ad':show_ad, 'show_vd':show_vd})
                           }
                           if(doc.videos_watched<=2){
                             show_vd = true;
                             show_ad = true;
                             return res.send({'show_ad':show_ad, 'show_vd':show_vd})
                           } else {
                             show_vd = false;
                             show_ad = true;
                             return res.send({'show_ad':show_ad, 'show_vd':show_vd})
                           }
                         } else {
                           console.log("err q2")
                         }
                       })
                     })
                   }
                   if(bool){
                     console.log(bool,"ye pda gand.....")
                     vc_model.findOne({ email: req.body.email })
                       .then((result2, err2)=>{
                         if(result2.video_url1=="none"){

                           vc_model.updateOne({ _id: result2._id }, { $inc: { videos_watched: 1 }, video_url1:req.body.video_url })
                           .then((doc)=>{
                           vc_model.findOne({ email: req.body.email })
                           .then((doc)=>{
                             if(doc!=null){
                               if(doc.plan_purchased){
                                 show_vd = true;
                                 show_ad = false;
                                 return res.send({'show_ad':show_ad, 'show_vd':show_vd})
                               }
                               if(doc.videos_watched<=2){
                                 show_vd = true;
                                 show_ad = true;
                                 return res.send({'show_ad':show_ad, 'show_vd':show_vd})
                               } else {
                                 show_vd = false;
                                 show_ad = true;
                                 return res.send({'show_ad':show_ad, 'show_vd':show_vd})
                               }
                             } else {
                               console.log("err q2")
                             }
                           })
                         })
                       } else if(result2.plan_purchased){
                           show_vd = true;
                           show_ad = false;
                           return res.send({'show_ad':show_ad, 'show_vd':show_vd})
                       } else {
                         show_vd = false;
                         show_ad = true;
                         return res.send({'show_ad':show_ad, 'show_vd':show_vd})
                       }
                    })
                   }
                 })
             }
           }
         })
       }

         }
  console.log("bools", show_ad, show_vd);
})
})

app.post("/accountcreated", (req,res) => {
  console.log("account created", req.body)
  if(req.body!=null){
    var vc_instance = new vc_model({email:req.body.email})
    vc_instance.save(function (err) {
      if (err) return err;
      else return true;
    });
    res.status(200).send({'success':true})
  } else{
    res.status(400).send({'success':false})
  }
})


app.post('/mittu_upload/thumbnail', (request, response) => {
  console.log('Request', request);
  const form = new multiparty.Form();
    form.parse(request, async (error, fields, files) => {
      console.log('Files', files);
      if (error) throw new Error(error);
      try {
        const path = files.file[0].path;
        console.log("path", path);
        const buffer = fs.readFileSync(path);
        const type = fileType(buffer);
        const timestamp = Date.now().toString();
        const fileName = `Thumbnails/${timestamp}-lg`;
        const data = await uploadFile(buffer, fileName, type);

        console.log("Data", data)

        response.send({data: true, dataLocation: data.Location})

      } catch (error) {
        console.log("error",error);
        response.status(400).send({data: false, catch: true});
      }
    });
})

app.post('/mittu_upload/video', (request, response) => {
  const form = new multiparty.Form();
    form.parse(request, async (error, fields, files) => {
      console.log('Files', files);
      if (error) throw new Error(error);
      try {
        const path = files.file[0].path;
        const buffer = fs.readFileSync(path);
        const type = fileType(buffer);
        const timestamp = Date.now().toString();
        const fileName = `Videos/${timestamp}-lg`;
        const data = await uploadFile(buffer, fileName, type);

        console.log("Data", data)

        response.send({data: true, dataLocation: data.Location});


      } catch (error) {
        console.log("error",error);
        response.status(400).send({data: false, catch: true});
      }
    });
})

app.post('/mittu_admin/createVideo', (request, response) => {
      try {
        console.log('Req', request.body)

        let name=request.body.name.value;
        let desc=request.body.desc.value;
        let cat=request.body.cat;
        let subcat=request.body.subCat;
        let feature=request.body.original;
        let view=request.body.view;
        let image=request.body.image;
        let video=request.body.video;

        let sql1="insert into video_featured (feature_id,vid_id) values(?,?)";

        let sql = "insert into mit_videos (vid_name, vid_desc, cat_id, subcat_id, view_id, vid_thumbs, vid_location,active_flag, deleted_flag) values('"+name+"', '"+desc+"', ?, ?, ?, ?, ?, 1, 0)";
        connection.query(sql,[cat, subcat, view, image, video], function(err, result){
          if(err){
            response.send({data: false, dbError: true});
            console.log(err);
          } else {
            if(result.insertId){
                feature.map((item,i) => {
                  if(item !== ''){
                    connection.query(sql1,[item ? item : null, result.insertId], function(err1, result1){
                    try{
                      if(err1){
                        console.log(err1);
                        res.send({data: false, dbError: true});
                      } else {
                        if(result1.insertId){
                          if(feature.length == i+1){
                            response.send({data: true, result});
                          }
                        } else {
                          response.send({data: false});
                        }
                    }
                  }catch(c2){
                    console.log(c2);
                    response.send({data: false, catch: true});
                  }
                  })
                } else {
                  response.send({data: true, result});
                }
              })
            } else {
              response.send({data: false});
            }
          }
        })
      } catch (error) {
        console.log("error",error);
        response.status(400).send({data: false, catch: true});
      }
});


app.post('/mittu_admin/editVideo', (req, res) => {
  try{

    let name=request.body.name.value;
    let desc=request.body.desc.value;
    let cat=request.body.cat;
    let subcat=request.body.subCat;
    let feature=request.body.original;
    let view=request.body.view;
    let image=request.body.image;
    let video=request.body.video;

    let sql1="update video_featured set (feature_id,vid_id) values(?,?) where vid_id=?";

    let sql = "update mit_videos set (vid_name, vid_desc, cat_id, subcat_id, view_id, vid_thumbs, vid_location) values(?, ?, ?, ?, ?, ?, ?) where vid_id=?";
        connection.query(sql,[name, desc, cat, subcat, view, image, video], function(err, result){
          if(err){
            response.send({data: false, dbError: true});
            console.log(err);
          } else {
            if(result.affectedRows){
                feature.map((item,i) => {
                  if(item !== ''){
                  connection.query(sql1,[item], function(err1, result1){
                    try{
                      if(err1){
                        console.log(err1);
                        res.send({data: false, dbError: true});
                      } else {

                      if(result1.affectedRows){
                        if(feature.length == i+1){
                          response.send({data: true, result});
                        }
                      } else{
                        response.send({data: false});
                      }
                    }
                  }catch(c2){
                    console.log(c2);
                    response.send({data: false, catch: true});
                  }
                  })
                } else {
                  response.send({data: true, result});
                }
                })
              } else {
                response.send({data: false});
              }
          }
        })

  } catch(catch1){
    console.log(catch1);
    res.send({data: false, catch: true})
  }
})

app.get('/mittu_admin/fetch-allData', (req, res) => {
  console.log("connecting..")
  let sqlQ1='select * from mit_category';
  connection.query(sqlQ1, function(errcats, cats){
    if(errcats){
      res.send({data: false, dbError: true});
      return console.log("Error", errcats);
    }
      let sqlQ2='select * from mit_subcategories';
        connection.query(sqlQ2, function(errsubcats, subcats){
          if(errsubcats){
            res.send({data: false, dbError: true});
            return console.log("Error", errsubcats);
          }
            let sqlQ3='select * from mit_featured';
              connection.query(sqlQ3, function(errfeature, feature){
                if(errfeature){
                  res.send({data: false, dbError: true});
                  return console.log("Error", errfeature);
                }
                  let sqlQ4='select * from mit_views';
                    connection.query(sqlQ4, function(errviews, views){
                      if(errviews){
                        res.send({data: false, dbError: true});
                        return console.log("Error", errviews);
                      }
                        res.send({data: true, views, feature, subcats, cats});
                        return console.log("result", views);

                    })

              })

        })
  })
})

// app.post("/add/category", (req, res) => {
//   console.log("req", req.body);
//   let catName= req.body.cat;

//   let sql="insert into mit_category (cat_name, delete_flag, active_flag) values('"+ catName +"',0,1)";
//   connection.query(sql, function(err, result){
//     if(err){
//       res.send({data: false, dbError: true});
//       return console.log(err);
//     }

//     if(result.affectedRows){
//       res.send({data: true, result});
//       return console.log("Result", result);
//     } else {
//       res.data({data: false});
//       return false;
//     }
//   })
// })

app.post('/mittu_add/subcategory', (req, res) => {
  console.log("req", req.body);
  let subCat= req.body.subCat;

      let sql="insert into mit_subcategories (subcat_name, subcat_delete_flag, subcat_active_flag) values('"+ subCat +"',0,1)";
      connection.query(sql, function(err, result){
        if(err){
          res.send({data: false, dbError: true});
          return console.log(err);
        }

        if(result.affectedRows){
            res.send({data: true, result});
            return console.log("Result", result);

        } else {
          res.data({data: false});
          return false;
        }
      })
  })

app.post('/mittu_add/featured', (req, res) => {
  console.log("req", req.body);
  let featured= req.body.featured;

  let sql="insert into mit_featured (feature_name, feature_deleted, feature_active) values('"+ featured +"',0,1)";
  connection.query(sql, function(err, result){
    if(err){
      res.send({data: false, dbError: true});
      return console.log(err);
    }

    if(result.affectedRows){
      res.send({data: true, result});
      return console.log("Result", result);
    } else {
      res.data({data: false});
      return false;
    }
  })
})

app.post('/mittu_add/view', (req, res) => {
  console.log("req", req.body);
  let view= req.body.view;

  let sql="insert into mit_views (view_name, view_deleted, view_active) values('"+ view +"',0,1)";
  connection.query(sql, function(err, result){
    if(err){
      res.send({data: false, dbError: true});
      return console.log(err);
    }

    if(result.affectedRows){
      res.send({data: true, result});
      return console.log("Result", result);
    } else {
      res.data({data: false});
      return false;
    }
  })
})

// app.get('/featureData', (req, res) => {
//   let sql="select * from mit_featured where (feature_deleted=0 or feature_deleted IS NULL)";
//   connection.query(sql, function(err, result){
//     if(err){
//       res.send({data: false, dbError: true});
//       return console.log(err);
//     }

//     if(result.length !== 0){
//       res.send({data: true, result});
//       return console.log("Result", result);
//     } else {
//       res.send({data: false});
//       return false;
//     }
//   })
// })

app.get("/all-features-fetch", (req, res) => {

  try{
    console.log("running")
    let featureArray=[];
    let check=[];
    let sql="select * from mit_featured where (feature_deleted=0 or feature_deleted IS NULL)";
    connection.query(sql, function(err, result){
      try{
        if(err){
          res.send({data: false, dbError: true});
          return console.log("err in all features");
        } else{
          if(result.length !== 0){
            result.map(item => {
              return featureArray.push(item.feature_id)
            });

            console.log("featureArray", featureArray)

            featureArray.map((item, i) => {
              console.log("i",i);
              let sql1="select mit_featured.feature_name, video_featured.feature_id,video_featured.vid_id,mit_videos.vid_name,mit_videos.vid_desc,mit_videos.cat_id,mit_videos.subcat_id,mit_videos.view_id,mit_videos.vid_thumbs,mit_videos.vid_location from video_featured INNER JOIN mit_videos ON video_featured.vid_id=mit_videos.vid_id INNER JOIN mit_featured on video_featured.feature_id=mit_featured.feature_id where video_featured.feature_id="+item+" and mit_videos.active_flag=1 and mit_videos.deleted_flag=0";
              connection.query(sql1, function(err1, result1){
                try{
                  if(err1){
                    res.send({data: false, dbError: true})
                    return console.log(err1);
                  } else{
                    if(result1.length!=0){
                    check.push(result1);
                    }

                    if(featureArray.length == i+1){
                      res.send({data: true, check});
                    }
                  }
                }catch(err102){
                  res.send({data: false, catch: true});
                }
              })
            })
          } else {
            res.send({data: false, featureArray, check});
          }
        }
      }catch(err101){
        res.send({data: false, catch: true});
      }
    })
  } catch(err111){
    res.send({data: false, catch: true});
  }
})


app.get('/fetch-movies', (req, res) => {
  try{
    let check=[];

            let sql1="select * from mit_views where (view_deleted=0 or view_deleted IS NULL) && (view_active=1)";
            connection.query(sql1, function(err1, result1){
              try{
                if(err1){
                  res.send({data: false, dbError: true});
                  console.log(err1)
                } else {
                  if(result1.length != 0){

                    result1.map((item, i) => {
                      console.log("i",i);
                      let sql2="select mit_videos.*,mit_category.*,mit_views.* from mit_videos INNER JOIN mit_views ON mit_videos.view_id=mit_views.view_id JOIN mit_category ON mit_videos.cat_id=mit_category.cat_id where mit_category.cat_name='Movie' and mit_views.view_id="+item.view_id+" and mit_videos.active_flag=1 and mit_videos.deleted_flag=0";
                      connection.query(sql2, function(err2, result2){
                        try{
                          if(err2){
                            res.send({data: false, dbError: true})
                            console.log(err2);
                          } else{
                            if(result2.length!=0){

                              check.push(result2);

                              if(result1.length == i+1){
                                res.send({data: true, check});
                              }
                            } else {
                              if(result1.length == i+1){
                                res.send({data: true, check});
                              }
                            }
                          }
                        }catch(err104){
                          console.log(err104)
                          if(result1.length == i+1){
                            res.send({data: false, catch: true});
                          }
                        }
                      })
                    })

                  } else {
                    res.send({data: false, view: false});
                  }
                }
              }catch(err103){
                res.send({data: false, catch: true})
                console.log(err103)
              }
            })

  } catch(err101){
    res.send({data: false, catch: true})
    console.log(err101)
  }
})


app.get('/fetch-comedy', (req, res) => {
  try{
    let check=[];

    let sql1="select * from mit_views where (view_deleted=0 or view_deleted IS NULL) && (view_active=1)";
            connection.query(sql1, function(err1, result1){
              try{
                if(err1){
                  res.send({data: false, dbError: true});
                  console.log(err1)
                } else {
                  if(result1.length != 0){

                    result1.map((item, i) => {
                      console.log("i",i, result1.length);
                      let sql2="select mit_videos.*,mit_category.*,mit_views.* from mit_videos INNER JOIN mit_views ON mit_videos.view_id=mit_views.view_id JOIN mit_category ON mit_videos.cat_id=mit_category.cat_id where mit_category.cat_name='Comedy' and mit_views.view_id="+item.view_id+" and mit_videos.active_flag=1 and mit_videos.deleted_flag=0";
                      connection.query(sql2, function(err2, result2){
                        try{
                          if(err2){
                            res.send({data: false, dbError: true})
                            console.log(err2);
                          } else{
                            if(result2.length!=0){
                              check.push(result2);
                              if(result1.length == i+1){
                                res.send({data: true, check});
                              }
                            } else {
                              if(result1.length == i+1){
                                res.send({data: true, check});
                              }
                            }
                          }
                        }catch(err104){
                          console.log(err104)
                          if(result1.length == i+1){
                            res.send({data: false, catch: true});
                          }
                        }
                      })

                    })

                  } else {
                    res.send({data: false, view: false});
                  }
                }
              }catch(err103){
                res.send({data: false, catch: true})
                console.log(err103)
              }
            })

  } catch(err101){
    res.send({data: false, catch: true})
    console.log(err101)
  }
})

app.get('/fetch-shortFilms', (req, res) => {
  try{
    let movieArray=[];
    let check=[];

    let sql1="select * from mit_views where (view_deleted=0 or view_deleted IS NULL) && (view_active=1)";
            connection.query(sql1, function(err1, result1){
              try{
                if(err1){
                  res.send({data: false, dbError: true});
                  console.log(err1)
                } else {
                  if(result1.length != 0){

                    result1.map((item, i) => {
                      console.log("i",i, result1.length);
                      let sql2="select mit_videos.*,mit_category.*,mit_views.* from mit_videos INNER JOIN mit_views ON mit_videos.view_id=mit_views.view_id JOIN mit_category ON mit_videos.cat_id=mit_category.cat_id where mit_category.cat_name='Short Films' and mit_views.view_id="+item.view_id+" and mit_videos.active_flag=1 and mit_videos.deleted_flag=0";
                      connection.query(sql2, function(err2, result2){
                        try{
                          if(err2){
                            res.send({data: false, dbError: true})
                            console.log(err2);
                          } else{
                            if(result2.length!=0){
                              check.push(result2);
                              if(result1.length == i+1){
                                res.send({data: true, check});
                              }
                            } else {
                              if(result1.length == i+1){
                                res.send({data: true, check});
                              }
                            }
                          }
                        }catch(err104){
                          console.log(err104)
                          if(result1.length == i+1){
                            res.send({data: false, catch: true});
                          }
                        }
                      })


                    })

                  } else {
                    res.send({data: false, view: false});
                  }
                }
              }catch(err103){
                res.send({data: false, catch: true})
                console.log(err103)
              }
            })

  } catch(err101){
    res.send({data: false, catch: true})
    console.log(err101)
  }
})

app.get('/fetch-CPanti', (req, res) => {
  try{
    let check=[];

    let sql1="select * from mit_views where (view_deleted=0 or view_deleted IS NULL) && (view_active=1)";
            connection.query(sql1, function(err1, result1){
              try{
                if(err1){
                  res.send({data: false, dbError: true});
                  console.log(err1)
                } else {
                  if(result1.length != 0){

                    result1.map((item, i) => {
                      console.log("i",i, result1.length);
                      let sql2="select mit_videos.*,mit_category.*,mit_views.* from mit_videos INNER JOIN mit_views ON mit_videos.view_id=mit_views.view_id JOIN mit_category ON mit_videos.cat_id=mit_category.cat_id where mit_category.cat_name='C Panti' and mit_views.view_id="+item.view_id+" and mit_videos.active_flag=1 and mit_videos.deleted_flag=0";
                      connection.query(sql2, function(err2, result2){
                        try{
                          if(err2){
                            res.send({data: false, dbError: true})
                            console.log(err2);
                          } else{
                            if(result2.length!=0){
                              check.push(result2);


                              if(result1.length == i+1){
                                res.send({data: true, check});
                              }

                            } else {
                              if(result1.length == i+1){
                                res.send({data: true, check});
                              }
                            }



                          }
                        }catch(err104){
                          console.log(err104)
                          if(result1.length == i+1){
                            res.send({data: false, catch: true});
                          }
                        }
                      })

                    })

                  } else {
                    res.send({data: false, view: false});
                  }
                }
              }catch(err103){
                res.send({data: false, catch: true})
                console.log(err103)
              }
            })

  } catch(err101){
    res.send({data: false, catch: true})
    console.log(err101)
  }
})


app.post('/signup', (req, res) => {
  try{
    console.log(req.body);
    let name=req.body.name;
    let email=req.body.email;
    let pass=req.body.pass;

    let salt=bcrypt.genSaltSync(10);
    let hashPass=bcrypt.hashSync(pass, salt);

    let uniqueCheck = "select users_email from mit_users where users_email='"+email+"' and users_active_flag=1 and (users_delete_flag=0 or users_delete_flag IS NULL)";

    connection.query(uniqueCheck, (uErr, uniqueResult) => {
      try{
        if(uErr){
          console.log(uErr);
          res.send({data: false, dbError: true})
        } else {
          if(uniqueResult.length !==0){
            res.send({data: true, unique: false, uniqueResult})
          } else {

            let sql="insert into mit_users(users_name, users_password, users_email, users_active_flag) values('"+name+"','"+hashPass+"','"+email+"',1)";
              connection.query(sql, (err, result) => {

                try{
                  if(err){
                    console.log(err);
                    res.send({data: false, dbError: true})
                  } else{
                    if(result.affectedRows){
                      res.send({data: true, unique: true, result})
                    } else {
                      res.send({data: false, result})
                    }
                  }

                }catch(c2){
                  console.log(c2);
                  res.send({data: false, catch: true})
                }
              })
          }
        }

      } catch(catchErr){
        console.log(catchErr);
        res.send({data: false, catch: true})
      }
    })



  }catch(c1){
    console.log(c1);
    res.send({data: false, catch: true})
  }
})


app.post('/login', (req, res) => {
  console.log(req.body);
  try{
    let email=req.body.email;
    let pass=req.body.pass;

    let sql = "select * from mit_users where users_email='"+email+"' and users_active_flag=1";
    connection.query(sql, (err, result) => {
      try{
        if(err){
            console.log(err);
            res.send({data: false, dbError: true})
        } else {
            if(result.length !==0){
              console.log("result", result)
              let passCompare= bcrypt.compareSync(pass, result[0].users_password)

              if(passCompare){

                let token=generateToken(result[0].users_id,'1adfc');
                let tokenStore="update mit_users set user_token='"+token+"' where users_id="+result[0].users_id+" ";

                connection.query(tokenStore, (errTStore, resultTStore) => {
                  try{
                    if(errTStore){
                      console.log(errTStore);
                      res.send({data: false, dbError: true});
                    } else {
                      if(resultTStore.affectedRows){
                        res.send({data: true, result, match: true, tInsert: true, token});
                      } else {
                        res.send({data: true, result, match: true, tInsert: false, token})
                      }

                    }
                  } catch(cTStore){
                    console.log("ctoken", cTStore);
                    res.send({data: false, catch: true})
                  }
                })

              } else {
                res.send({data: true, result, match: false})
              }
            } else {
              res.send({data:false, result})
            }
        }
      }catch(c2){
        console.log(c2);
        res.send({data: false, catch: true})
      }
    })


    const generateToken=(id,type)=>{

      var access='auth';
      var token=jwt.sign({id,type},'HomeTheater').toString();
      return token;
  }


  }catch(c1){
    console.log(c1);
    res.send({data: false, catch: true})
  }
})

app.post("/mittu_admin/fetch/allVideos", (req, res) => {
  let sql="select * from mit_videos where (deleted_flag=0 or deleted_flag IS NULL) && (active_flag=1 or active_flag IS NULL)"
  connection.query(sql, function(err, result) {
    try{

      if(err){
        console.log(err);
        res.send({data: false, dbError: true});
      } else {
        if(result.length !== 0){
          res.send({data: true, result})
        } else {
          res.send({data: false, result})
        }
      }

    } catch(catch1){
      console.log(catch1);
      res.send({data: false, catch: true})
    }
  })
})

app.post("/user_details", (req, res) => {
  console.log(" user token",req.body.token);
  let sql="select * from mit_users where user_token=?";

  connection.query(sql, [req.body.token], function(err, result) {
    try{
      if(err){
        console.log(err);
        res.send({data: false, dbError: true})
      } else {
        console.log("Result", result);
        if(result.length !== 0){
          res.send({data: true, result});
        } else {
          res.send({data: false})
        }
      }

    } catch(catch1){
      console.log(catch1);
      res.send({data: false, catch: true});
    }
  })
})

app.post("/searchResult", (req, res) => {
  console.log(req.body)
  let sql="select * from mit_videos where vid_name LIKE '"+req.body.searchItem+"%' and active_flag=1 and (deleted_flag=0 or deleted_flag IS NULL)"
  connection.query(sql, function(err, result){
    try{
      if(err){
        console.log(err);
        res.send({data: false, dbError: true});
      } else {
        console.log("Result", result)
        if(result.length !== 0 ){
          res.send({data: true, result})
        } else {
          res.send({data: false, result})
        }
      }

    }catch(catch1){
      console.log(catch1);
      res.send({data: false, catch: true});
    }
  })
})


app.get("/search/subcategories", (req, res) => {
  console.log(req.body)
  let sql="select * from mit_subcategories where subcat_active_flag=1 and (subcat_delete_flag=0 or subcat_delete_flag IS NULL)"
  connection.query(sql, function(err, result){
    try{
      if(err){
        console.log(err);
        res.send({data: false, dbError: true});
      } else {
        console.log("Result", result)
        if(result.length !== 0 ){
          res.send({data: true, result})
        } else {
          res.send({data: false, result})
        }
      }

    }catch(catch1){
      console.log(catch1);
      res.send({data: false, catch: true});
    }
  })
})


app.post("/search/category/searchResult", (req, res) => {
  console.log(req.body)
  let sql="select * from mit_videos where subcat_id=? and active_flag=1 and (deleted_flag=0 or deleted_flag IS NULL)"
  connection.query(sql,[req.body.subcat_id], function(err, result){
    try{
      if(err){
        console.log(err);
        res.send({data: false, dbError: true});
      } else {
        console.log("Result", result)
        if(result.length !== 0 ){
          res.send({data: true, result})
        } else {
          res.send({data: false, result})
        }
      }

    }catch(catch1){
      console.log(catch1);
      res.send({data: false, catch: true});
    }
  })
})


app.post('/mittu_admin/delete-video', (req, res) => {
    let sql = "update mit_videos set deleted_flag=1 where vid_id=?";
    connection.query(sql, [req.body.id], function(err, result){
      try{
        if(err){
          console.log(err);
          res.send({data: false, dbError: true})
        } else {
          if(result.affectedRows){
            res.send({data: true})
          } else {
            res.send({data: false})
          }
        }

      } catch(catchErr){
        console.log(catchErr);
        res.send({data: false, catch: true})
      }
    })
})


app.post('/mittu_admin/login', (req, res) => {

  try{
    let email=req.body.email;
    let pass=req.body.pass;

    let sql = "select * from mit_admin where admin_email=?";
    connection.query(sql,[email], (err, result) => {
      try{
        if(err){
            console.log(err);
            res.send({data: false, dbError: true})
        } else {
            if(result.length !==0){
              console.log("result", result)
              let passCompare= bcrypt.compareSync(pass, result[0].users_password)

              if(passCompare){

                let token=generateToken(result[0].users_id,'1adfc');
                let tokenStore="update mit_admin set admin_token='"+token+"' where admin_id="+result[0].users_id+" ";

                connection.query(tokenStore, (errTStore, resultTStore) => {
                  try{
                    if(errTStore){
                      console.log(errTStore);
                      res.send({data: false, dbError: true});
                    } else {
                      if(resultTStore.affectedRows){
                        res.send({data: true, result, match: true, tInsert: true, token});
                      } else {
                        res.send({data: true, result, match: true, tInsert: false, token})
                      }

                    }
                  } catch(cTStore){
                    console.log(cTStore);
                    res.send({data: false, catch: true})
                  }
                })

              } else {
                res.send({data: true, result, match: false})
              }
            } else {
              res.send({data:false, result})
            }
        }
      }catch(c2){
        console.log(c2);
        res.send({data: false, catch: true})
      }
    })


    const generateToken=(id,type)=>{

      var access='auth';
      var token=jwt.sign({id,type},'HomeTheater').toString();
      return token;
  }


  }catch(c1){
    console.log(c1);
    res.send({data: false, catch: true})
  }
})


app.post("/mittu_admin/fetch_byVideo", (req, res) => {
  try{
    console.log("req", req.body)
    let id=req.body.id;

    let sql="select * from mit_videos where vid_id=?";
    connection.query(sql,[id], function(err, result){
      try{
        if(err){
          console.log(err);
          res.send({data: false, dbError: true})
        } else{
          console.log("Result:", result)
          if(result.length !== 0){
            res.send({data: true, result});
          } else {
            res.send({data: false, result})
          }
        }

      }catch(errC1){
        console.log(errC1);
        res.send({data: false, catch: true})
      }
    })

  } catch(errCatch){
    console.log(errCatch);
    res.send({data: false, catch: true});
  }
})

//Added By ThyDreams Studio.
//Author : Dibyajyoti Mishra
//c/o: ThyDreams Studio.

app.post("/user/subscribers",(req,res) => {
  const {name, email, phone } = req.body;
  if(!name || !email || !phone){
    res.status(422).json("Please Fill All The Details.")
  }
  else {

    var sql = "INSERT INTO subscribers(name,email,phone) values(name, email, phone)"
    res.locals.connection.query(sql, (error, results, fields) => {
      if(error) throw error;
      res.send(JSON.stringify(results));
  });
}
});

app.post("/user/pay", async(req,res) => {
  //const amount =  * 100;

  const payment_capture = 1;
  const currency = "INR";

  const options = {
    amount: amount,
    currency,
    //receipt: .toString(),
    payment_capture,
  };
  try {
    const response = await razorpay.orders.create(options, (err, order) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ error: "Some Error has occurred. Are you online?" });
      }

      return res.status(200).json({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      });
    });
  } catch (error) {
    console.log(error);
  }
})







app.listen(process.env.HOST_PORT ,process.env.HOST_ADDRES,()=>{
    console.log(`Server is about to start at port number ${process.env.HOST_ADDRESS}:${process.env.HOST_PORT}`);
});
