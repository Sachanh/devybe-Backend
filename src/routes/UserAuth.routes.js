const {Router}=require("express")
const rateLimit = require('express-rate-limit');
const UserAuthRouter=Router()
const {Registration, GetAccessToken, GetUserInfo, Update_User_Info ,Update_user_avatar, GetAllCategories, addCategory, GetEvents} =require("../controllers/UserAuth.controllers")
const { verifyToken } = require("../middlewares/Auth.middleware")
const {upload, processImage}=require("../utils/Multer.utils")
const { checkBlockedUser } = require("../middlewares/Autherization.middlewares")




// rate limit
const updateAvatarLimiter = rateLimit({
    windowMs: 10 * 24 * 60 * 60 * 1000,          // 10 days window
    max: 1,                     // Only 1 request allowed per window per IP
    message: "You can update your avatar only once every 10 days.",
    statusCode: 429,
});


UserAuthRouter.post('/register',Registration)
UserAuthRouter.post('/token' , GetAccessToken)
UserAuthRouter.get('/',verifyToken ,checkBlockedUser, GetUserInfo)
UserAuthRouter.patch('/update',verifyToken,checkBlockedUser,Update_User_Info)
UserAuthRouter.put('/update-avatar',verifyToken,checkBlockedUser,updateAvatarLimiter, upload.single('avatar'), processImage ,Update_user_avatar);
UserAuthRouter.get("/categories",verifyToken,checkBlockedUser,GetAllCategories)
UserAuthRouter.patch("/categories",verifyToken,checkBlockedUser,addCategory)
UserAuthRouter.get("/events",verifyToken,checkBlockedUser,GetEvents)


module.exports=UserAuthRouter



