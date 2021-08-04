const express=require("express");
const path=require("path");
const router1=express.Router();
const fileUpload=require("express-fileupload");
const model=require("./../models/model");
const functions=require("./../modules/functions");
const dbs=require("./../modules/mongo");
const uuid=require("uuid");
const router = require("./admin");
var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

router1.use(express.static(path.join(__dirname,"../public")));
router1.use(express.urlencoded({ extended: ".hbs"}));
router1.use(express.json());



router1.get("/nouman",(req,res)=>{
    res.render("nouman");
});



router1.get("/view",(req,res)=>{
    dbs.getDB().collection("cards").find({card_id:req.query.id}).toArray((err,doc)=>{
        if(err)
            {console.log("Query Error");
            res.json(err);
        }
        else{
            // console.log(doc);
            if(Object.keys(doc).length==1)
            {  
                res.render("place_order",{place_order:1,doc:doc[0],msg:req.query.msg});
            }
            else{
                res.redirect("/gallery?msg=Card Not Found")
            }
        }
    });
    
});

router1.post("/order",(req,res)=>{
    console.log(req.body);
    if(typeof(req.body.card_id)==="undefined" ){
        //res.redirect("/gallery?msg=Card Not Found1");
        res.json({data:req.body,bd:req.body,x:1});
    }
    else if(!req.body.card_id){
        //res.redirect("/gallery?msg=Card Not Found2");
        res.json({data:req.body,bd:req.body,y:1});
    
    }
    else{
        dbs.getDB().collection("cards").find({card_id:req.body.card_id}).toArray((err,doc)=>{
            if(err)
                {console.log("Query Error");
                res.json(err);
            }
            else{
                // console.log(doc);
                if(Object.keys(doc).length==1)
                {
                   
                    if(!req.body.name1||!req.body.email||!req.body.profession||!req.body.mobile||!req.body.address||!req.body.website)
                    {
                        res.redirect("/card/?id="+req.body.card_id+"&msg=All Fields Are Necessary");
                    }
                    else if(!emailPattern.test(req.body.email)){
                        res.redirect("/card/?id="+req.body.card_id+"&msg=Invalid Email");
                    }
                    else{
                        // res.render("place_order2",{data:req.body});
                        res.json(req.body);
                    }
                
                }
    
                else{
                    res.redirect("/gallery?msg=Card Not Found");
                }
            }
        });
    }
    
});

router1.post("/order1",(req,res)=>{
    res.json(req.body);
})



module.exports=router1;