const UserSchema=require('../models/onboarding.models')
const categorySchema=require('../models/Category.models')
const EventSchema = require('../models/Events.models')

// Add Categories in collection
const AddCategoriesByAdmin = async (req, res) => {
    try {
      const data = req.body;
  
      const user = await UserSchema.findById(req.user_detail._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          msg: 'User not found',
        });
      }
  
      const checkCategoryName = await categorySchema.findOne({ name: data?.name });
      if (checkCategoryName) {
        return res.status(409).json({
          success: false,
          msg: "This category already exists",
        });
      }
  
  
      const addCat = new categorySchema(data);
      await addCat.save();
  
      return res.status(201).json({
        success: true,
        msg: "Category added successfully",
      });
      
    } catch (error) {
      console.error("Error adding category:", error);
      return res.status(500).json({
        success: false,
        msg: error.message,
      });
    }
  };
  

// add event in collection
const AddEvent=async(req,res)=>{
    try {
        
const user=await UserSchema.findById(req.user_detail._id)

if (!user) {
    return res.status(404).json({succes:false, msg: 'User not found' });
}

const newEvent = new EventSchema({
    ...req.body, 
    createdBy: req.user_detail._id,
    Images: req.imageUrls  
});

await newEvent.save()

res.status(201).json({
    success:true,
    msg:"event created scussfully",
    data:newEvent
})

    } catch (error) {
        res.status(500).json({
            success:false,
            msg:error.message
        })
    }
}

//block user
const blockUser = async (req, res) => {
  try {
      const { userId } = req.body;
      const adminId = req.user_detail._id;

      const user = await UserSchema.findById(userId);
      if (!user) {
          return res.status(404).json({ success: false, msg: "User not found." });
      }

   
      if (user.role === "admin") {
          return res.status(400).json({ success: false, msg: "Admins cannot be blocked." });
      }

      user.isBlocked = true;
      user.blockedBy = adminId;
      await user.save();

      return res.status(200).json({ success: true, msg: "User has been blocked successfully." });
  } catch (error) {
      return res.status(500).json({ success: false, msg: error.message });
  }
};

// all blocked user
const getBlockedUsers = async (req, res) => {
  try {
      const blockedUsers = await UserSchema.find({ isBlocked: true }).populate("blockedBy", "first_name", "last_name", "telegram_id");

      if (blockedUsers.length === 0) {
          return res.status(404).json({
              success: false,
              msg: "No blocked users found.",
          });
      }

      res.status(200).json({
          success: true,
          msg: "Blocked users retrieved successfully",
          data: blockedUsers,
      });

  } catch (error) {
      res.status(500).json({
          success: false,
          msg: error.message,
      });
  }
};




module.exports={AddCategoriesByAdmin,AddEvent,blockUser,getBlockedUsers}