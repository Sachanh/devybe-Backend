const {Router}=require("express")
const UserAuthRouter=Router()
const {Registration, GetAccessToken, GetUserInfo, Update_User_Info ,Update_user_avatar, GetAllCategories, addCategory, GetEvents} =require("../controllers/UserAuth.controllers")
const { verifyToken } = require("../middlewares/Auth.middleware")
const {upload, processImage}=require("../utils/Multer.utils")
const { checkBlockedUser } = require("../middlewares/Autherization.middlewares")


UserAuthRouter.post('/register',Registration)
UserAuthRouter.post('/token' , GetAccessToken)
UserAuthRouter.get('/',verifyToken ,checkBlockedUser, GetUserInfo)
UserAuthRouter.patch('/update',verifyToken,checkBlockedUser,Update_User_Info)
UserAuthRouter.put('/update-avatar',verifyToken,checkBlockedUser, upload.single('avatar'), processImage ,Update_user_avatar);
UserAuthRouter.get("/categories",verifyToken,checkBlockedUser,GetAllCategories)
UserAuthRouter.patch("/categories",verifyToken,checkBlockedUser,addCategory)
UserAuthRouter.get("/events",verifyToken,checkBlockedUser,GetEvents)


module.exports=UserAuthRouter



