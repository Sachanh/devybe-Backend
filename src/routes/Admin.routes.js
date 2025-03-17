const { Router } = require("express")
const { AddCategoriesByAdmin, AddEvent, blockUser, getBlockedUsers } = require("../controllers/Admin.controllers")
const { verifyToken } = require("../middlewares/Auth.middleware")
const { Authorization } = require("../middlewares/Autherization.middlewares")
const eventUpload = require("../middlewares/EventUploads");  
const eventUploadToCloudinary = require("../middlewares/eventUploadToCloudinary");

const AdminRoutes = Router()

AdminRoutes.post('/addcategory', verifyToken, Authorization(["admin"]), AddCategoriesByAdmin)

AdminRoutes.post('/event',
    verifyToken, 
    Authorization(["admin"]), 
    eventUpload.array("images", 5),  
    eventUploadToCloudinary, 
    AddEvent
);


AdminRoutes.post('/blockuser',verifyToken,Authorization(["admin"]),blockUser)
AdminRoutes.get('/blockuser',verifyToken,Authorization(["admin"]),getBlockedUsers)




module.exports = AdminRoutes