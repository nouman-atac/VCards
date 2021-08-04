const MongoClient=require("mongodb").MongoClient;
const assert=require("assert");
const url="mongodb://localhost:27017";
var db=null;
var anu=1;

const connection=(cb)=>{
    if(db!=null)
        cb();
    else{
        const client=new MongoClient(url,{useUnifiedTopology:true});

        client.connect((err,client)=>{
            if(err){
                console.log("Error occured:"+err);
                cb(err);
            }
            else{
                db=client.db("visiting_card_system");
                cb();
            }
        });
    }
}

const getDB=function(){
    return db;
}

function select(collection,query){
    var ret;
    getDB().collection(collection).find(query).toArray((err,doc)=>{
        if(err)
            {console.log("Query Error");
            return err;}
        else{
            //console.log(Object.keys(doc).length);
            console.log("Query Done");
            //console.log(doc);
            return doc;
        }
    });
    console.log(ret);
    return ret;
    
}
const insertOne=(collection,userInput)=>{
    
    getDB().collection(collection).insertOne(userInput,(err,result)=>{
        if(err){
            const error1 = new Error("Failed to insert in "+collection);
             ret= {error:error1};
        }
        else
             return {result : result, document : result.ops[0],msg : "Successfully inserted Todo!!!",error:null};
    });
    
}
module.exports={connection,getDB,select,insertOne};