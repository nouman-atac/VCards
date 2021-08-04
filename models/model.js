
var customer={
    cust_id:"",
    email:"",
    password:"",
    name:"",
    address:"",
    profession:"",
    website:"",
    dob:"",
    date:"",
    utc:0,
    profile_pic:"",
    mobile_no:"",
    last_login:""
};
var cards={
    card_id:"",
    card_name:"",
    card_category:"",
    card_img:"",
    card_file:"",
    card_description:"",
    card_cost:0,
    date:"",
    utc:0
};
var order={
    order_id:"",
    cust_id:"",
    card_id:"",
    payment_id:"",
    tx_token:"",
    payment_status:"",
    payment_code:null,
    bankTxnId:"",
    amount:"",
    delivery_address:"",
    city:"",
    state:"",
    country:"",
    card_details:{},
    quantity:"",
    date:"",
    utc:0
};
module.exports={customer,cards,order};