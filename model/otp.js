const mongoose=require('mongoose');

const otpSchema=new mongoose.Schema({
    sendBy:{
            type:String,
          
    },
     otp:{
               type:String,
               required:true,
     },
     createdAt:{
               type:Date,
               default:Date.now,
     },
});

const Otp=mongoose.model('Otp',otpSchema);
module.exports=Otp;

