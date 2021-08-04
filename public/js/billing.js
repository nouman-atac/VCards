var total=document.querySelector(".total-amount");
var quantity=document.querySelector("#quantity");


function totalAmount(cost) {
    var amount=cost*Number(quantity.value);
    console.log(amount);
    total.textContent=amount;

}
