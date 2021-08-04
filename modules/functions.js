function getRealDate(){
    var d=new Date();
    var date=d.getDate();
    var month=d.getMonth();
    var year=d.getFullYear();
    var hour=d.getHours();
    var min=d.getMinutes();
    var sec=d.getSeconds();
    var realDate=`${date<10?"0"+date:date}/${month<10?"0"+month:month}/${year<10?"0"+year:year}  ${hour<10?"0"+hour:hour}:${min<10?"0"+min:min}:${sec<10?"0"+sec:sec}`
    return realDate;
}

module.exports={getRealDate}