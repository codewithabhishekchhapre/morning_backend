const epxress=require('express');
const app=epxress();
const connectDB=require('./config/db');
const User=require('./model/user');
const Otp=require('./model/otp');

// connect to database
connectDB();

app.use(epxress.json());
app.use(epxress.urlencoded({extended:true}));

app.get('/',function(req,res){
    res.send('Hello World!');
});


app.post('/register', async function(req,res){
    try{

        // get user data from req body (e.g., name, email, password, mobile)
        var {username,email,password,mobile}=req.body;
        
       var user= await User.create({username,email,password,mobile});
       user.save();

        // send response
        res.json({message:'Your registration is successful', user:{username,email,mobile}});
    }
    catch(err){
        res.json({message:'Server error', error:err.message});
    }

});


app.post("/login",async function(req,res){

    try{
        const {email,password}=req.body;

        const user=await User.findOne({email});

        if(!user){
            return res.json({message:'User not found'});
        }

        if(user.password!==password){
            return res.json({message:'Invalid credentials'});
        }

        res.json({message:'Login successful', user:{username:user.username,email:user.email,mobile:user.mobile}});
    }
    catch(err){
        res.json({message:'Server error', error:err.message});
    }
    
});


const generateOTP=function(){
    return Math.floor(100000 + Math.random() * 900000).toString();
}


app.post("/send-otp",async function(req,res){

    try{
        const {sendBy,otp_type}=req.body;

        if(otp_type==="email"){

            if(!sendBy){
                return res.json({message:'Email is required to send OTP'});
            }

            const user=await User.findOne({email:sendBy});
            if(!user){
                return res.json({message:'User with this email not found'});
            }
            const otp=generateOTP();

            const otpEntry=await Otp.create({sendBy,otp});
            otpEntry.save();

            res.json({message:'OTP sent successfully to email', otp});

        }
        else{
            if(!sendBy){
                return res.json({message:'Mobile number is required to send OTP'});
            }
            const user=await User.findOne({mobile:sendBy});
            if(!user){
                return res.json({message:'User with this mobile number not found'});
            }
            const otp=generateOTP();

            const otpEntry=await Otp.create({sendBy,otp});
            otpEntry.save();
            res.json({message:'OTP sent successfully to mobile', otp});
        }
    }
    catch(err){
        res.json({message:'Server error', error:err.message});
    }

});

app.post("/verify-otp",async function(req,res){
    try{
        const {sendBy,otp,otp_type}=req.body;
        const otpEntry=await Otp.findOne({sendBy,otp}).sort({createdAt:-1});

        // check otp is expired or not
        const now=new Date();
        if(otpEntry && (now - otpEntry.createdAt) > 5*60*1000){
            return res.json({message:'OTP expired'});
        }

        if(!otpEntry){
            return res.json({message:'Invalid OTP'});
        }

        // delete record after verification
        await Otp.deleteOne({_id:otpEntry._id});

        // update the user record
        if(otp_type==="email"){
            await User.updateOne({email:sendBy},{$set:{isEmailVerified:true}});
        }
        else{
            await User.updateOne({mobile:sendBy},{$set:{isMobileVerified:true}});
        }


        res.json({message:'OTP verified successfully'});

    }
    catch(err){
        res.json({message:'Server error', error:err.message});
    }
});



app.listen(3000,function(){
    console.log('Server is running on port 3000');
});