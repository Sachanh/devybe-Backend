const mongoose = require("mongoose")
const UserSchema = require("../models/onboarding.models")
const jwt = require("jsonwebtoken")
const fs = require('fs');

const categorySchema=require('../models/Category.models')
const EventSchema=require('../models/Events.models')
const cloudinary=require('../config/cloudinary')






// user registration ----------
const Registration = async (req, res) => {
    const data = req.body

    if (!data?.telegram_id) {
        return res.status(400).json({
            msg: "telegram_id is required",
        });
    }

    try {
        let access_token;
        let refresh_token;
        let userID;

        const IsUserExist = await UserSchema.findOne({ telegram_id: data.telegram_id })
        if (IsUserExist) {

            if (IsUserExist.isBlocked) {
                return res.status(403).json({ msg: "Your account has been blocked by the admin. You cannot log in." });
            }

            userID = IsUserExist._id

            access_token = jwt.sign({ userID }, process.env.SECRET_ACCESS_KEY, { expiresIn: "7d" });
            refresh_token = jwt.sign({ userID }, process.env.SECRET_REFRESH_KEY, { expiresIn: "7d" })

            return res.status(201).json({
                msg: 'Account Created Successfully',
                x_auth_access_token: access_token,
                x_auth_refresh_token: refresh_token,
                x_userid: userID,
                first_name:IsUserExist.first_name,
                is_newUser:false
            })
        }

        // check if event not ended before user select
        if (data.selectedEvents && data.selectedEvents.length > 0) {
            const currentTime = new Date().toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });


//now find events that ahve ended
const expiredEvents = await EventSchema.find({
    _id: { $in: data.selectedEvents },
    eventEndTime: { $lte: currentTime }, 
});

if (expiredEvents.length > 0) {
    return res.status(400).json({
        success: false,
        msg: "Some selected events have already ended.",
        endedEvents: expiredEvents.map(event => ({
            id: event._id,
            name: event.eventName,
            endedAt: event.eventEndTime,
        })),
    });
}
}

        const AddData = new UserSchema(data)
        await AddData.save()

        userID = AddData._id;
        access_token = jwt.sign({ userID }, process.env.SECRET_ACCESS_KEY, { expiresIn: "7d" });
        refresh_token = jwt.sign({ userID }, process.env.SECRET_REFRESH_KEY, { expiresIn: "7d" })

        res.setHeader("x-auth-access-token", `Bearer ${access_token}`);
        res.setHeader("x-auth-refresh-token", `Bearer ${refresh_token}`);


        return res.status(201).json({
            msg: 'Account Created Successfully',
            x_auth_access_token: access_token,
            x_auth_refresh_token: refresh_token,
            x_userid: userID,
            first_name:AddData.first_name,
            is_newUser: true
        });

    } catch (error) {
        res.status(500).json({
            success:false,
            message: error.message,
          });
    }
}


// create access token again
const GetAccessToken = async (req, res) => {
    const { refresh_token } = req.body
    try {
        const decoded = jwt.verify(refresh_token, process.env.SECRET_REFRESH_KEY);

        if (!decoded) {
            return res.status(500).json({
                success:false ,
                msg: "Token is invalid or expired"
            })
        }
        const userID = decoded.userID
        console.log('check what getting-------',userID);
        const access_token = jwt.sign({ userID }, process.env.SECRET_ACCESS_KEY, { expiresIn: "15m" });

        res.status(200).json({
            success:true ,
            access_token: access_token,
            msg:"token created successfully"
        })

    } catch (error) {
        res.status(500).json({
            success:false,
            message: error.message,
          });
    }
}


// user info
const GetUserInfo = async (req, res) => {
    try {
        const user_data = await UserSchema.findOne({ _id: req.user_detail._id }, { telegram_id: 0 ,role:0}).populate("selectedCategories")
        .populate("selectedEvents");;
 
        if (!user_data) {
            return res.status(404).json({
                msg: "data not found ! please try again",
            });
        }

        res.status(200).json({
            success: true,
            message: "User data retrieved successfully",
            data: user_data,
        })


    } catch (error) {
        res.status(500).json({
            success:false,
            msg:error.message
        })
    }
}


// update user info
const Update_User_Info=async(req,res)=>{
            
    const data=req.body

    try {
        
const user_data = await UserSchema.findOne({_id:req.user_detail._id});
if(!user_data){
    return res.status(404).json({
        msg:'User not found ! Please try again'
    })
};

    await UserSchema.findByIdAndUpdate( 
        user_data._id ,
        { $set: data }, 
        { new: true },
    )

    res.status(201).json({
        success:true,
        message: "user updated successfully",
      });

    } catch (error) {
        res.status(500).json({
            success:false,
            message: error.message,
          });
    }
}



// update avater
const Update_user_avatar=async (req, res) => {
    try {
        const userId = req.user_detail._id;


        if (!req.file) {
            return res.status(400).json({ msg: 'Avatar image is required' });
        }

        const user = await UserSchema.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }


 // Deleting previous avatar from Cloudinary if exists
 if (user.avatar_public_id) {
    await cloudinary.uploader.destroy(user.avatar_public_id);
}

// Upload new avatar to Cloudinary
const result = await cloudinary.uploader.upload(req.file.path, {
    folder: 'avatars',
    public_id: `avatar-${userId}-${Date.now()}`,
    overwrite: true,
    resource_type: 'image'
});



// Removing file from local after upload
fs.unlinkSync(req.file.path);

// Updating user data
user.avatar = result.secure_url;
user.avatar_public_id = result.public_id;  // Storing public_id for future delete
await user.save();

// Removing unwanted fields before sending response
const updated_user = user.toObject();
delete updated_user.role;
delete updated_user.__v;

        return res.status(200).send({ msg: 'Avatar updated successfully', data: updated_user });
    } catch (error) {
        console.error('Error updating avatar:', error);
        return res.status(500).send({ msg: 'Internal server error, try again later' });
    }
};



// get all category
const GetAllCategories=async(req,res)=>{

    try {

        const userId = req.user_detail._id;

        const user = await UserSchema.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }


        const categories=await categorySchema.find()

 res.status(200).json({
    success:true,
    msg:"data fetched successfully",
    data:categories 
 })

    } catch (error) {
        res.status(500).json({
            success:false,
            msg:error.message
        })
    }
}  


// add custome category
const addCategory = async (req, res) => {
    try {
        const userId = req.user_detail._id;
        const { names } = req.body;

        const user = await UserSchema.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (!Array.isArray(names) || names.length === 0) {
            return res.status(400).json({ success: false, msg: "Category names must be a non-empty array." });
        }

        // Check how many categories the user already has
        const categoryCount = user.selectedCategories.length;
        if (categoryCount >= 5) {
            return res.status(400).json({ success: false, msg: "You can only add up to 5 categories." });
        }

        // Find existing categories (global, not user-specific)
        const existingCategories = await categorySchema.find({ name: { $in: names } });
        const existingNames = existingCategories.map(cat => cat.name);

        // Filter out categories that user already has
        const userExistingCategories = user.selectedCategories.map(cat => cat.toString());
        const newCategories = existingCategories
            .filter(cat => !userExistingCategories.includes(cat._id.toString()))
            .map(cat => cat._id);

        // Add new categories if they don't exist
        const categoriesToAdd = names.filter(name => !existingNames.includes(name));
        const newCategoryDocs = await categorySchema.insertMany(categoriesToAdd.map(name => ({ name })));

        // Merge new and existing category IDs
        const allCategoryIds = [...newCategories, ...newCategoryDocs.map(cat => cat._id)];

        // Update user's selected categories
        user.selectedCategories.push(...allCategoryIds);
        await user.save();

        return res.status(201).json({
            success: true,
            msg: `${allCategoryIds.length} categories added successfully!`,
            addedCategories: allCategoryIds
        });

    } catch (error) {
        console.error("Error adding category:", error);
        return res.status(500).json({ success: false, msg: error.message });
    }
};

  
// get events
const GetEvents=async(req,res)=>{
    try {
        const userId = req.user_detail._id;

        const user = await UserSchema.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const currentTime = new Date().toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false, // 24-hour format
        });

        // should not show ended events
        const getEventdata = await EventSchema.find({
            eventEndTime: { $gt: currentTime },
        });


res.status(200).json({
    success:true,
    msg:"events fetched successfully",
    data:getEventdata
})

    } catch (error) {
        res.status(500).json({
            success:false,
            msg:error.message
        })
    }
}

// register event
const registerEvent = async (req, res) => {
    try {
      const { eventId } = req.body; // frontend should send { eventId: "eventMongoId" }
      const userId = req.user_detail._id;
  
      // Find the user
      const user = await UserSchema.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      // Check if event exists
      const event = await categorySchema.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          msg: "Event not present or may have expired!"
        });
      }
  
      // Optional: Check if already registered
      if (user.registeredEvents.includes(eventId)) {
        return res.status(400).json({ msg: "Already registered for this event" });
      }
  
      // Push the event ID into user's registeredEvents array
      user.registeredEvents.push(eventId);
      await user.save();
  
      return res.status(200).json({
        success: true,
        msg: "Event registered successfully",
        registeredEvents: user.registeredEvents
      });
  
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Server Error" });
    }
  };
  

module.exports = { Registration, GetAccessToken, GetUserInfo ,Update_User_Info , Update_user_avatar,GetAllCategories,addCategory,GetEvents,registerEvent}