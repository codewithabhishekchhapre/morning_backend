const mongoose  = require('mongoose');

const connectDB= async ()=>{
     try{

         await mongoose.connect('mongodb://127.0.0.1:27017/morning_backend');
          console.log("MongoDB Connected Successfully ✔");
     }
     catch(err){
        console.log('Database connection error',err);
     }
}

module.exports = connectDB;