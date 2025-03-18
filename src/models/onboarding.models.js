const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    first_name: {
        type: String,
        minlength: [2, 'FirstName must be at least 2 characters long'],
        trim: true
    },
    last_name: {
        type: String,
        minlength: [2, 'LastName must be at least 2 characters long'],
        trim: true
    },
    telegram_id: {
        type: String,
        unique: true,
        require: [true, "Telegram Id is required"],
        trim: true
    },
    avatar: {
        type: String,
        default: ""
    },

    role: {
        type: String,
        enum: ["user", "admin", "organisor"],
        default: "user"
    },


    isBlocked: { type: Boolean, default: false },

    blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        default: null,
    },
    
    selectedCategories: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category", 
        },
      ],

      selectedEvents: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "event",
        },
      ],
      avatar_public_id: {
        type:String
      },
},
    {
        versionKey: false,
        timestamps: true,
        strict: true,
    }
);




UserSchema.path("selectedCategories").validate(function (categories) {
    return categories.length <= 5;
  }, "You can select up to 5 categories only.");


module.exports = mongoose.model("User", UserSchema)