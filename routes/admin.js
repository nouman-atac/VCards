const express=require("express");
const path=require("path");
const router=express.Router();
const fileUpload=require("express-fileupload");
const model=require("./../models/model");
const functions=require("./../modules/functions");
const dbs=require("./../modules/mongo");
const uuid=require("uuid");
const bcrypt=require("bcrypt");
const methodOverride=require("method-override");
var cookieParser = require('cookie-parser');
var session = require('express-session');


var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const allowedImg=["image/png","image/jpg","image/jpeg"];

router.use(cookieParser());
router.use(express.json());
router.use(methodOverride("_method"));
router.use(express.static(path.join(__dirname,"public")));
router.use(session({secret: "90932cbd29df4a5b84a62467e3a6e952",
                 resave:false,
                 saveUninitialized:true,
                 cookie: { maxAge: 5*60000 , secure:true,httpOnly:false}
            }));
router.use(express.urlencoded({ extended: ".hbs"}));
router.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  }));
router.use(express.static(path.join(__dirname,"../public")));

function admin_authenticated (req,res,next){
    if(typeof req.session.aemail ==="undefined")
    {       
        console.log("session undefined");
        res.redirect("/admin/login?msg=Login to access this resource");
    }
    else if(!req.session.aemail){
        // console.log("Session"+req.session.idd);
        res.redirect("/admin/login?msg=Login to access this resource");
    }
    else
    {
        next();
    }

    
}

router.get("/addcard",admin_authenticated,(req,res)=>{
    res.render("addCard",{msg:req.query.msg,title:"Admin",admin:1});
});

router.get("/login",(req,res)=>{
    res.render("adminlogin",{login:1,title:"Admin Login",admin:1,msg:req.query.msg});
});

router.post("/login",(req,res)=>{
    // res.render("adminlogin",{login:1,title:"Admin Login"});
    var data=req.body;
    console.log(req.body);
    console.log(data);
    if(typeof data.inputEmail==="undefined"|| typeof data.inputPassword==="undefined"){
        res.redirect("/admin/login?msg=Please Provide All Fields");
    }
    else if(!data.inputPassword||!data.inputEmail){
        res.redirect("/admin/login?msg=All Fields Are Necessary");

    }
    else if(!emailPattern.test(data.inputEmail)){
        res.redirect("/admin/login?msg=Invalid Email Provided!");

    }
    else{

    
        dbs.getDB().collection("admin").find({email:data.inputEmail}).toArray((err,doc)=>{
            if(err)
                {console.log("Query Error");
                return err;}
            else{
                // console.log(doc[0].password);
                console.log(doc);
                // console.log(bcrypt.hashSync(req.body.password,10));
                if(doc.length===1){
                    bcrypt.compare(data.inputPassword,doc[0].password,(err,result)=>{
                        if(err){
                            res.redirect("/admin/login?msg=Login Failed");
                        }
                        else{
                            if(result){
                                // req.session.idd=doc[0].cust_id;
                                req.session.aemail=doc[0].email;
                                req.session.valid=1;
                                // req.session.pic=doc[0].profile_pic;
                                // req.session.cname=doc[0].name;
                                console.log(doc[0].cust_id+" "+req.session.idd);
                                res.redirect("/admin/dashboard?msg=Login Sucessfull");

                            }
                            else
                            res.redirect("/admin/login?msg=Invalid Password!");

                        }
                    })
                }
                else
                res.redirect("/admin/login?msg=Email Does Not Exists!");

            }
        });
    }
});

router.get("/dashboard",admin_authenticated,(req,res)=>{
    // res.render("admincards",{admin:1,msg:req.query.msg});
    dbs.getDB().collection("cards").find({}).toArray((err,card)=>{
        if(err)
            {console.log("Query Error");
            res.json(err);;}
        else{
            //console.log(Object.keys(doc).length);
            
            res.render("admincards",{admin:1,msg:req.query.msg,card});
            
        }
    });
});


router.get("/orders",admin_authenticated
,(req,res)=>{
    // res.render("addCard",{msg:req.query.msg,title:"Admin",admin:1});
    var query=[{$lookup:{from:"cards",localField:"card_id",foreignField:"card_id",as:"card"}},{$lookup:{from:"customer",localField:"cust_id",foreignField:"cust_id",as:"customer"}}];
    dbs.getDB().collection("orders").aggregate(query).toArray((err,orders)=>{
        if(err)
        throw err;
        else{
            console.log(orders);
            // var doc={
            //     cname:req.session.cname,
            //     profile_pic:req.session.pic

            // }
            res.render("adminorders",{title:"My Orders",orders:orders,admin:1})
            // res.json(orders);
        }
    });
});

router.post("/addcard",admin_authenticated,(req,res)=>{
    // console.log(req.body);
    // console.log(req.files);
    if(!req.body.card_name||!req.body.card_category||!req.body.card_cost||!req.body.description||!req.files.card_file||!req.files.card_image){
        res.redirect("/admin/addcard?msg=No Field Should Be Empty!");
    }
    else if(req.body.card_cost<1){
        res.redirect("/admin/addcard?msg=Card Cost Should be a Number and should be Greater Than 1");
    }
    else if(req.files.card_image.size>5*1024*1024){
        res.redirect("/admin/addcard?msg=Image size should be less than 5MB");
    }
    else if(req.files.card_file.mimetype!="text/html"){
        res.redirect("/admin/addcard?msg=Card File Should Be of Type HTML");
    }
    else if(!allowedImg.includes(req.files.card_image.mimetype)){
        res.redirect("/admin/addcard?msg=Card Image Should be of type Image");
    }
    else{
        var curTime=Date.now();
        var card=Object(model.cards);
        card.card_id=uuid.v4();
        card.card_name=req.body.card_name;
        card.card_category=req.body.card_category;
        card.card_img=curTime+"-"+req.files.card_image.name;
        card.card_file=curTime+"-"+req.files.card_file.name;
        card.card_cost=Number(req.body.card_cost);
        card.card_description=req.body.description;
        card.date=functions.getRealDate();
        card.utc=curTime;

        var img_path="public/uploaded/card_images/"+card.card_img;
        var file_path="public/uploaded/card_files/"+card.card_file;

        req.files.card_image.mv(img_path,(err)=>{
            if(err){
                res.status(500).send(err);
            }
            else{
                req.files.card_file.mv(file_path,(err)=>{
                    if(err){
                        res.status(500).send(err);
                    }
                    else{
                       dbs.getDB().collection("cards").insertOne(card,(err,result)=>{
                           if(err){
                            res.redirect("/admin/addcard?msg=DB Problem");
                           }
                           else{
                                res.redirect(303,"/admin/addcard?msg=Upload Successful");
                           }
                       })
                    }
                });
            }
        });
        
        

    }
});

router.delete("/deletecard",admin_authenticated,(req,res)=>{
    console.log(req.body);
    var c_id=req.body.card_id.trim();
    console.log(c_id);
    dbs.getDB().collection("cards").deleteOne({card_id:c_id},(err,result)=>{
        if(err)
            throw err;
        else{
            res.redirect("/admin/dashboard?msg=Card Deleted");
        }
    });
});

router.get("/logout",admin_authenticated,(req,res)=>{
    req.session.destroy();
    res.redirect("/");
});

module.exports=router;