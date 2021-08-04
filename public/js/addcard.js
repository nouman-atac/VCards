
var image=document.querySelector("#validatedCustomImage");
    var file=document.querySelector("#validatedCustomFile");

    var card_name=document.querySelector("#card_name");
    var img_label=document.querySelector(".image-label");
    var file_label=document.querySelector(".file-label");
    var description=document.querySelector(".description");
    var validImg=["image/jpg","image/jpeg","image/png"];
  function  validate(){
    console.log("Start ok");
      var img=image.files[0];
      var card=file.files[0];

      if(!card_name||!description){
          return false;
      }
      else if(card.type!="text/html"||!validImg.includes(img.type)){
        console.log("Typee Problem");
        console.log(`${img.type} --- ${card.type}`);
          return false;
      }
      else{
        console.log("Everything ok");
          return true;
          
      }
  }

  image.addEventListener("change",()=>{
      console.log(image.files);
      if(validImg.includes(image.files[0].type)){
          if(image.classList.contains("is-invalid"))
            image.classList.toggle("is-invalid");
            img_label.textContent=image.files[0].name;
        var images = document.getElementById('output');
	    images.src = URL.createObjectURL(image.files[0]);
        
      }
      else{
          if(!image.classList.contains("is-invalid"))
            image.classList.toggle("is-invalid");
            img_label.textContent="Choose File...";
      }
  });
  file.addEventListener("change",()=>{

      if(file.files[0]!="text/html"){
          if(file.classList.contains("is-invalid"))
            file.classList.toggle("is-invalid");
        file_label.textContent=file.files[0].name;
      }
      else{
          if(!file.classList.contains("is-invalid"))
            file.classList.toggle("is-invalid");
      }
  });
