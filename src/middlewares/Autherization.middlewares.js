const UserSchema=require("../models/onboarding.models")

const Authorization = (allowedRoles) => {
    return async (req, res, next) => {
      try {
        const userData = await UserSchema.findById(req.user_detail._id);
        if (!userData) {
          return res.status(404).json({
            success:false,
            msg: "User not found",
          });
        }
        const { role } = userData;
        if (!allowedRoles.includes(role.toString())) {
          return res.status(403).json({
            success:false,
            msg: "You are not authorized to access this resource",
          });
        }
        next();
      } catch (error) {
        res.status(500).json({
          success:false,
          msg: error.message,
          "error":"error coming from middleware"
        });
      }
    };
  };




  const checkBlockedUser = async (req, res, next) => {
    try {
        const user = await UserSchema.findById(req.user_detail._id);

        if (!user) {
            return res.status(404).json({ success: false, msg: "User not found." });
        }

        // admin can access
        if (user.role === "admin") {
            return next();
        }

        // block user
        if (user.isBlocked) {
            return res.status(403).json({ success: false, msg: "Your account has been blocked by the admin." });
        }

        next(); 
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
};


  module.exports={Authorization ,checkBlockedUser}