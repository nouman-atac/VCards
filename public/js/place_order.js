window.onload=()=>{
    

var x=document.querySelector("#frame");
var iframe = (x.contentWindow || x.contentDocument);
if (iframe.document)iframe = iframe.document;
var email=iframe.querySelectorAll(".card-info-email");
var name1=iframe.querySelectorAll(".card-info-name");
var address=iframe.querySelectorAll(".card-info-address");
var website=iframe.querySelectorAll(".card-info-website");
var mobile=iframe.querySelectorAll(".card-info-mobile");
var profession=iframe.querySelectorAll(".card-info-profession");
   

var emailv=document.querySelector("#email");
var namev=document.querySelector("#name1");
var addressv=document.querySelector("#address");
var websitev=document.querySelector("#website");
var mobilev=document.querySelector("#mobile");
var professionv=document.querySelector("#profession");

var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

emailv.addEventListener("input",(e)=>{
   // e.preventDefault();
   if(emailPattern.test(emailv.value)){
       if(emailv.classList.contains("danger-shadow"))
       emailv.classList.toggle("danger-shadow");
       
       changeAll(email,emailv.value);
       // console.log(email);
       // console.log("True");
   }
   else{
       if(!emailv.classList.contains("danger-shadow"))
       emailv.classList.toggle("danger-shadow");
       // console.log("False");
   }
   
   
   console.log(emailv);
   console.log(email);
   console.log(iframe.body.children);
   console.log("Text : "+email.innerHTML);
});


namev.addEventListener("input",(e)=>{
   // e.preventDefault();
   if(namev.value){
       if(namev.classList.contains("danger-shadow"))
       namev.classList.toggle("danger-shadow");
       changeAll(name1,namev.value);
       // console.log(email);
       // console.log("True");
   }
   else{
       if(!namev.classList.contains("danger-shadow"))
       namev.classList.toggle("danger-shadow");
       // console.log("False");
   }
   
   console.log(namev);
   console.log(name1);
   console.log(name1.textContent);
});

mobilev.addEventListener("input",(e)=>{
   // e.preventDefault();
   if(mobilev.value){
       if(mobilev.classList.contains("danger-shadow"))
       mobilev.classList.toggle("danger-shadow");
       changeAll(mobile,mobilev.value);
       // console.log(email);
       // console.log("True");
   }
   else{
       if(!mobilev.classList.contains("danger-shadow"))
       mobilev.classList.toggle("danger-shadow");
       // console.log("False");
   }
   
   
   console.log(mobile);
   console.log(email);
});

websitev.addEventListener("input",(e)=>{
   // e.preventDefault();
   if(websitev.value){
       if(websitev.classList.contains("danger-shadow"))
       websitev.classList.toggle("danger-shadow");
       changeAll(website,websitev.value);
       // console.log(email);
       // console.log("True");
   }
   else{
       if(!websitev.classList.contains("danger-shadow"))
       websitev.classList.toggle("danger-shadow");
       // console.log("False");
   }
   
   
   // console.log(emailv);
   // console.log(email);
});

addressv.addEventListener("input",(e)=>{
   // e.preventDefault();
   if(addressv.value){
       if(addressv.classList.contains("danger-shadow"))
       addressv.classList.toggle("danger-shadow");
       
       var addr=addressv.value.replace(/\n/g,"</p><br><p>");
       changeAll(address,addr);
       // console.log(email);
       // console.log("True");
   }
   else{
       if(!addressv.classList.contains("danger-shadow"))
       addressv.classList.toggle("danger-shadow");
       // console.log("False");
   }
   
   
   // console.log(emailv);
   // console.log(email);
});

professionv.addEventListener("input",(e)=>{
   // e.preventDefault();
   if(professionv.value){
       if(professionv.classList.contains("danger-shadow"))
       professionv.classList.toggle("danger-shadow");
       changeAll(profession,professionv.value);
       // console.log(email);
       // console.log("True");
   }
   else{
       if(!professionv.classList.contains("danger-shadow"))
       professionv.classList.toggle("danger-shadow");
       // console.log("False");
   }
   
   
   // console.log(emailv);
   // console.log(email);
});




}

function changeAll(objs,val){
    objs.forEach(obj => {
        console.log(obj);
        obj.innerHTML=val;
    });
 }