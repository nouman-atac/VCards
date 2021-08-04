const PORT=5001;
const http = require('http')
const https = require('https')

const fs = require('fs')
const qs = require('querystring')
const express=require("express");
const exphbs= require('express-handlebars');
const path=require("path");
const dbs=require("./modules/mongo");
const bcrypt=require("bcrypt");
const uuid=require("uuid");
const model=require("./models/model");
var cookieParser = require('cookie-parser');
var session = require('express-session');
const { nextTick } = require("process");
const admin=require("./routes/admin");
const card=require("./routes/card");
const methodOverride=require("method-override");
const fileUpload=require("express-fileupload");
var functions=require("./modules/functions");

const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.urlencoded({ extended: false });
// const checksum_lib = require('./paytm/PaytmChecksum');
const PaytmChecksum = require('./paytm/PaytmChecksum');
const config = require('./paytm/config');

var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const allowedImg=["image/png","image/jpg","image/jpeg"];



const app=express();
app.use("/admin",admin);
app.use("/card",card);
app.engine("handlebars",exphbs());
app.set("view engine","handlebars");
app.use(express.json());
app.use(express.urlencoded({ extended: ".hbs"}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"public")));
app.use(cookieParser());
app.use(session({secret: "90932cbd29df4a5b84a62467e3a6e952",
                 resave:false,
                 saveUninitialized:true,
                 cookie: { maxAge: 5*60000 , secure:true,httpOnly:false}
            }));
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    }));

String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};

function authenticated (req,res,next){
    if(typeof req.session.idd ==="undefined")
    {       
        console.log("session undefined");
        res.redirect("/login?msg=Login to access this resource");
    }
    else if(!req.session.idd){
        console.log("Session"+req.session.idd);
        res.redirect("/login?msg=Login to access this resource");
    }
    else
    {
        next();
    }

    
}



app.get("/",(req,res)=>{

    dbs.getDB().collection("cards").find({}).limit(3).toArray((err,card)=>{
        if(err)
            {console.log("Query Error");
            res.json(err);;}
        else{
            //console.log(Object.keys(doc).length);
            if(typeof req.session.idd!=="undefined"){
                dbs.getDB().collection("customer").find({cust_id:req.session.idd}).toArray((err,doc)=>{
                    if(err){
                        req.session.destroy();
                        res.redirect("/login?msg= Failure");
                    }
                    else{
                        if(doc.length==1){
                        console.log("Query Done");
                        console.log(doc);
                        res.render("home",{doc:doc[0],card:card,title:"Home",logged:req.session.valid});
                        }
                        else{
                            req.session.destroy();
                            res.redirect("/login?msg= Failure");
                        }
                    }
                    
                });
            }
            else{
                console.log("Query Done");
                console.log(card);
                res.render("home",{card:card,title:"Home"});
            }
        }
    });

});

app.get("/gallery",(req,res)=>{
    dbs.getDB().collection("cards").find({}).limit(12).toArray((err,card)=>{
        if(err)
            {console.log("Query Error");
            res.json(err);;}
        else{
            //console.log(Object.keys(doc).length);
            if(typeof req.session.idd!=="undefined"){
                dbs.getDB().collection("customer").find({cust_id:req.session.idd}).toArray((err,doc)=>{
                    if(err){
                        req.session.destroy();
                        res.redirect("/login?msg= Failure");
                    }
                    else{
                        if(doc.length==1){
                        console.log("Query Done");
                        console.log(doc);
                        // res.render("home",{doc:doc[0],card:card,title:"Home",logged:req.session.valid});
                        res.render("gallery",{doc:doc[0],card:card,title:"Card Gallery",logged:req.session.valid});
                        }
                        else{
                            req.session.destroy();
                            res.redirect("/login?msg= Failure");
                        }
                    }
                    
                });
            }
            else{
            console.log("Query Done");
            // console.log(card);
            res.render("gallery",{card:card,title:"Card Gallery"});
            }
        }
    });
});
app.get("/register",(req,res)=>{
    res.render("register",{login:1,title:"User Registration",msg:req.query.msg,logged:req.session.valid});
});
app.get("/login",(req,res)=>{
    res.render("login",{login:1,title:"User Login",msg:req.query.msg,logged:req.session.valid});
});



app.post("/nouman",(req,res)=>{
    res.json(req.body);
});



app.get("/cardview",authenticated,(req,res)=>{
    dbs.getDB().collection("cards").find({card_id:req.query.id}).toArray((err,doc)=>{
        if(err)
            {console.log("Query Error");
            res.json(err);
        }
        else{
            // console.log(doc);
            if(Object.keys(doc).length==1)
            {  
                res.render("place_order",{place_order:1,doc:doc[0],msg:req.query.msg,logged:1});
            }
            else{
                res.redirect("/gallery?msg=Card Not Found")
            }
        }
    });
    
});


app.post("/callback",(req,res)=>{
    let callbackResponse = ''

// req.on('error', (err) => {
//     console.error(err.stack)
// }).on('data', (chunk) => {
//     callbackResponse += chunk
// }).on('end', () => {
//     let data = qs.parse(callbackResponse)
    console.log(req.session);
    var data=req.body;
    console.log(data)

    // data = JSON.parse(JSON.stringify(data))

    const paytmChecksum = data.CHECKSUMHASH

    var isVerifySignature = PaytmChecksum.verifySignature(data, config.PaytmConfig.key, paytmChecksum)
    if (isVerifySignature) {
        console.log("Checksum Matched");

        var paytmParams = {};

        paytmParams.body = {
            "mid": config.PaytmConfig.mid,
            "orderId": data.ORDERID,
        };

        PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), config.PaytmConfig.key).then(function (checksum) {
            paytmParams.head = {
                "signature": checksum
            };

            var post_data = JSON.stringify(paytmParams);

            var options = {

                /* for Staging */
                hostname: 'securegw-stage.paytm.in',

                /* for Production */
                // hostname: 'securegw.paytm.in',

                port: 443,
                path: '/v3/order/status',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': post_data.length
                }
            };

            // Set up the request
            var response = "";
            var post_req = https.request(options, function (post_res) {
                post_res.on('data', function (chunk) {
                    response += chunk;
                });

                post_res.on('end', function () {
                    console.log('Response: ', response);
                    var txData=JSON.parse(response);
                    var update={
                        bankTxnId:txData.body.bankTxnId,
                        resultCode:txData.body.resultInfo.resultCode,
                        resultMsg:txData.body.resultInfo.resultMsg
                    }
                    if(txData.body.resultInfo.resultCode==="01"){
                        update.payment_status="Success";
                    }
                    else if(txData.body.resultInfo.resultCode==="400"||txData.body.resultInfo.resultCode==="402"){
                        update.payment_status="Pending";
                    }
                    else{
                        update.payment_status="Failure";
                    }
                   dbs.getDB().collection("orders").updateOne({order_id:txData.body.orderId},{$set:update},(err,result)=>{
                        if(err)
                        throw(err);
                        else{
                            res.redirect("myorders");
                            res.end();
                        }
                   });
                    
                });
            });

            // post the data
            post_req.write(post_data);
            post_req.end();
        });
    } else {
        console.log("Checksum Mismatched");
    }
// })
});



app.get("/test",authenticated,(req,res)=>{
    res.send("<h2>Successful</h1>");
});

app.post("/register",(req,res)=>{
    console.log(req.body);
    var data=req.body;
    console.log(typeof data.inputfname); console.log(typeof data.inputlname); console.log(typeof data.inputmobile); console.log(typeof data.inputEmail); console.log(typeof data.inputPassword);console.log(typeof data.inputConfPassword); 
        if(typeof data.inputfname==="undefined"||typeof data.inputlname==="undefined"||typeof data.inputmobile==="undefined"||typeof data.inputEmail==="undefined"||typeof data.inputPassword==="undefined"||typeof data.inputConfPassword==="undefined"){
            res.redirect("/register?msg=Please Provide All Fields");
        }
        else if( !data.inputfname|| !data.inputlname|| !data.inputmobile|| !data.inputEmail|| !data.inputPassword| !data.inputConfPassword){
            res.redirect("/register?msg=All Fields Are Necessary");
        }
        else if(!emailPattern.test(data.inputEmail)){
            res.redirect("/register?msg=Invalid Email Address");
        }
        else if(data.inputPassword!==data.inputConfPassword){
            res.redirect("/register?msg=Password Should Match");
        }
        else{
        var newUser=Object(model.customer);
        console.log(newUser);
        newUser.email=data.inputEmail;
        newUser.password=bcrypt.hashSync(data.inputPassword,10);
        newUser.cust_id=uuid.v4();
        newUser.name=data.inputfname+" "+data.inputlname;
        newUser.mobile_no=data.inputmobile;        newUser.date=functions.getRealDate();


        dbs.getDB().collection("customer").find({email:data.inputEmail}).toArray((err,doc)=>{
            if(err)
                {console.log("Query Error");
                res.json(err);}
            else{
               // res.json(doc.length)
                if(doc.length>=1){
                    res.redirect("/register?msg=Email Already Exists");
                }else{
                    dbs.getDB().collection("customer").insertOne(newUser,(err,result)=>{
                        if(err){
                            // const error1 = new Error("Failed to insert in "+collection);
                            res.redirect("/register?msg=Registration Failed");
                        }
                        else
                        res.redirect("/login?msg=Login Sucessful");

                    });
                }
            }
        });
    }
    

});

app.post("/order",authenticated,(req,res)=>{
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
                if(doc.length==1)
                {
                   
                    if(!req.body.name1||!req.body.email||!req.body.profession||!req.body.mobile||!req.body.address||!req.body.website)
                    {
                        res.redirect("/cardview?id="+req.body.card_id+"&msg=All Fields Are Necessary");
                    }
                    else if(!emailPattern.test(req.body.email)){
                        res.redirect("/cardview?id="+req.body.card_id+"&msg=Invalid Email");
                    }
                    else{
                        // doc[0].?
                        // res.render("place_order2",{data:doc});
                        res.render("billing",{title:"Billing",billing:1,doc:doc[0],data:req.body,logged:1})
                    }
                
                }
    
                else{
                    res.redirect("/gallery?msg=Card Not Found");
                }
            }
        });
    }
    
});

app.get("/billing",(req,res)=>{
    console.log(req);
    res.render("billing",{title:"billing",billing:1,cost:7})
});

app.post('/paynow',authenticated, [parseUrl, parseJson], (req, res) => {
        console.log(req.session);
        var data=req.body;
        if(typeof data.card_id ==="undefined"){
            req.session.destroy();
            res.redirect("/login?msg=We have logged you out due to a Failure");
        }
        else if(!data.name||!data.email||!data.mobile||!data.website||!data.profession||!data.address||!data.delivery_address||!data.city||!data.state||!data.country||!data.quantity){
            res.redirect("/order?msg=All Fields Are necessary");
        }
        else{
            dbs.getDB().collection("cards").find({card_id:data.card_id}).toArray((err,card)=>{
                if(err){
                    req.session.destroy();
                    res.redirect("/login?msg=We have logged you out due to a Failure");
                }
                else{
                    if(card.length==1){
                        var card=card[0];
                        console.log(typeof card.card_cost);
                        console.log(typeof card.card_cost);
                        var amount=Number(card.card_cost)*Number(data.quantity.trim());
                        var order=Object(model.order);
                        order.order_id=uuid.v4();
                        order.card_id=data.card_id;
                        order.cust_id=req.session.idd;
                        order.amount=amount;
                        order.delivery_address=data.delivery_address;
                        order.city=data.city;
                        order.state=data.state;
                        order.country=data.country;
                        order.quantity=data.quantity;
                        order.date=functions.getRealDate();
                        order.utc=Date.now();
                        order.card_details={
                            email:data.email,name:data.name,mobile:data.mobile,profession:data.profession,website:data.website,address:data.address   };
                            // res.json(order);
                            var paytmParams = {};
    
paytmParams.body = {
    "requestType"   : "Payment",
    "mid"           : config.PaytmConfig.mid,
    "websiteName"   : "WEBSTAGING",
    "orderId"       : order.order_id,
    "callbackUrl"   : "https://localhost:5001/callback",
    "txnAmount"     : {
        "value"     : amount.toString(),
        "currency"  : "INR",
    },
    "userInfo"      : {
        "custId"    : order.cust_id,
    },
};
var orderId=order.order_id;

/*
* Generate checksum by parameters we have in body
* Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
*/
PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), config.PaytmConfig.key).then(function(checksum){

    paytmParams.head = {
        "signature"    : checksum
    };

    var post_data = JSON.stringify(paytmParams);

    var options = {

        /* for Staging */
        hostname: 'securegw-stage.paytm.in',

        /* for Production */
        // hostname: 'securegw.paytm.in',

        port: 443,
        path: '/theia/api/v1/initiateTransaction?mid='+config.PaytmConfig.mid+'&orderId='+order.order_id,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': post_data.length
        }
    };

    var response = "";
    var post_req = https.request(options, function(post_res) {
        post_res.on('data', function (chunk) {
            response += chunk;
        });

        post_res.on('end', function () {
            response = JSON.parse(response)
            console.log('txnToken:', response.body.txnToken);
            order.tx_token=response.body.txnToken;
            dbs.getDB().collection("orders").insertOne(order,(err,result)=>{
                if(err)
                throw(err);
            });
            console.log(order);

            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.write(`<html>
                <head>
                    <title>Show Payment Page</title>
                </head>
                <body>
                    <center>
                        <h1>Please do not refresh this page...</h1>
                    </center>
                    <form method="post" action="https://securegw-stage.paytm.in/theia/api/v1/showPaymentPage?mid=${config.PaytmConfig.mid}&orderId=${orderId}" name="paytm">
                        <table border="1">
                            <tbody>
                                <input type="hidden" name="mid" value="${config.PaytmConfig.mid}">
                                    <input type="hidden" name="orderId" value="${orderId}">
                                    <input type="hidden" name="txnToken" value="${response.body.txnToken}">
                         </tbody>
                      </table>
                                    <script type="text/javascript"> document.paytm.submit(); </script>
                   </form>
                </body>
             </html>`)
            res.end()
        });

    });

    post_req.write(post_data);
    post_req.end();
    });
}
                    else{
                        req.session.destroy();
                        res.redirect("/login?msg=We have logged you out due to a Failure");
                    }
                }
            });
        }
      });


app.post("/login",(req,res)=>{
    var data=req.body;
    if(typeof data.inputEmail==="undefined"|| typeof data.inputPassword==="undefined"){
        res.redirect("/login?msg=Please Provide All Fields");
    }
    else if(!data.inputPassword||!data.inputEmail){
        res.redirect("/login?msg=All Fields Are Necessary");

    }
    else if(!emailPattern.test(data.inputEmail)){
        res.redirect("/login?msg=Invalid Email Provided!");

    }
    else{

    
        dbs.getDB().collection("customer").find({email:data.inputEmail}).toArray((err,doc)=>{
            if(err)
                {console.log("Query Error");
                return err;}
            else{
                // console.log(doc[0].password);
                // console.log(bcrypt.hashSync(req.body.password,10));
                if(Object.keys(doc).length===1){
                    bcrypt.compare(data.inputPassword,doc[0].password,(err,result)=>{
                        if(err){
                            res.redirect("/login?msg=Login Failed");
                        }
                        else{
                            if(result){
                                req.session.idd=doc[0].cust_id;
                                req.session.email=doc[0].email;
                                req.session.valid=1;
                                req.session.pic=doc[0].profile_pic;
                                req.session.cname=doc[0].name;
                                console.log(doc[0].cust_id+" "+req.session.idd);
                                res.redirect("/?msg=Login Sucessfull");

                            }
                            else
                            res.redirect("/login?msg=Invalid Password!");

                        }
                    })
                }
                else
                res.redirect("/login?msg=Email Does Not Exists!");

            }
        });
    }
});

app.get("/myorders",authenticated,(req,res)=>{
    var id =req.session.idd||"cust__1";
    var query=[{$match:{cust_id:id}},{$lookup:{from:"cards",localField:"card_id",foreignField:"card_id",as:"card"}}];
    dbs.getDB().collection("orders").aggregate(query).toArray((err,orders)=>{
        if(err)
        throw err;
        else{
            console.log(orders);
            var doc={
                cname:req.session.cname,
                profile_pic:req.session.pic

            }
            res.render("myorders",{title:"My Orders",orders:orders,myorders:1,doc,logged:1})
        }
    });
});

app.get("/profile",authenticated,(req,res)=>{
    dbs.getDB().collection("customer").find({cust_id:req.session.idd}).toArray((err,doc)=>{
        if(err){
            res.redirect("/logout?_method=DELETE");
        }
        else{
            if(doc.length==1){
                res.render("profile",{profile:1,doc:doc[0],logged:req.session.valid});
            }
            else{
                res.redirect("/logout?_method=DELETE");
            }
        }
    });
});

app.get("/editprofile",authenticated,(req,res)=>{
    dbs.getDB().collection("customer").find({cust_id:req.session.idd}).toArray((err,doc)=>{
        if(err){
            res.redirect("/logout?_method=DELETE");
        }
        else{
            if(doc.length==1){
                res.render("editprofile",{profile:1,doc:doc[0],logged:req.session.valid});
            }
            else{
                res.redirect("/logout?_method=DELETE");
            }
        }
    });
});

app.post("/editprofile",authenticated,(req,res)=>{
    dbs.getDB().collection("customer").find({cust_id:req.session.idd}).toArray((err,doc)=>{
        if(err){
            console.log("Query Error")
            res.redirect("/logout?_method=DELETE");
        }
        else{
            // console.log(doc);
            if(Object.keys(doc).length==1)
            {   

                var data=req.body;
                console.log(data);
                
                console.log("Image : "+typeof req.files.image);
                if(typeof data.name === "undefined"||typeof data.dob === "undefined"||typeof data.mobile === "undefined"||typeof data.address === "undefined"||typeof data.profession === "undefined"||typeof data.website==="undefined"||typeof req.files.image==="undefined")
                {
                    res.redirect("/editprofile?msg=Please Provide All Field With *");
                }
                else if(!data.name||!data.dob||!data.profession||!data.mobile||!data.address||!req.files.image)
                {
                    res.redirect("/editprofile?msg=All Fields With * Are Necessary");
                }
                else if(req.files.image.size>5*1024*1024){
                    res.redirect("/editprofile?msg=Image size should be less than 5MB");
                }
                
                else if(!allowedImg.includes(req.files.image.mimetype)){
                    res.redirect("/editprofile?msg=Card Image Should be of type Image");
                }
                else{
                    var updateUser={
                        name:data.name,
                        dob:data.dob,
                        profession:data.profession,
                        mobile_no:data.mobile,
                        website:data.website,
                        profile_pic:req.session.idd+"-"+Date.now()+"-"+req.files.image.name,
                        address:data.address
                    }
                    var img_path="public/uploaded/user_profile/"+updateUser.profile_pic;
                    req.files.image.mv(img_path,(err)=>{
                        if(err){
                            res.status(500).send(err);
                        }
                        else{
                               
                            dbs.getDB().collection("customer").updateOne({cust_id:req.session.idd},{$set:updateUser},(err,result)=>{
                                if(err){
                                res.redirect("/admin/addcard?msg=DB Problem");
                                }
                                else{
                                    res.redirect("/profile?msg=Profile Update Successful");
                                }
                            })
                                
                            
                        }
                    });
                }
            
            }

            else{
                res.redirect("/logout?_method=DELETE");
            }
        }
    });
});

app.delete("/logout",authenticated,(req,res)=>{
    req.session.destroy();
    res.redirect("/");
});

var options = {
    key: fs.readFileSync('./localhost.key').toString(),
    cert: fs.readFileSync('./localhost.crt').toString(),
    ciphers: 'ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA:ECDHE-RSA-AES256-SHA384',
    honorCipherOrder: true,
    secureProtocol: 'TLSv1_2_method'
};

dbs.connection((err)=> {
    if(err){
        console.log("Error in DB Connection");
        process.exit(1);
    }
    else{
        https.createServer(options, app).listen(PORT, () => {
            console.log('Listening on port 5001')
          })
        // app.listen(PORT,()=>{console.log(`Listening on port ${PORT}`)});
    }
});

