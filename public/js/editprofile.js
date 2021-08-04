var image=document.querySelector("#profile_image");
var validImg=["image/jpg","image/jpeg","image/png"];
var img_label=document.querySelector(".image_name");

image.addEventListener("change",()=>{
    console.log(image.files);
    if(validImg.includes(image.files[0].type)){
        if(img_label.classList.contains("text-danger"))
            img_label.classList.toggle("text-danger");

        if(!img_label.classList.contains("text-success"))
            img_label.classList.toggle("text-success");

          img_label.textContent=image.files[0].name;
        var images = document.getElementById('img_display');
        images.src = URL.createObjectURL(image.files[0]);
      
    }
    else{
        if(!img_label.classList.contains("text-danger"))
            img_label.classList.toggle("text-danger");
        if(img_label.classList.contains("text-success"))
            img_label.classList.toggle("text-success");

            img_label.textContent="Invalid Type! (Only .png,.jpg,.jpeg) supported";
    }
});