const { Schema, model, default: mongoose } = require("mongoose");

const EventSchema = new Schema(
    {
        Images: {
            type: [String],
            validate: {
                validator: (value) => value.length > 0,
                message: "Add at least one image of the event.",
            },
        },

        Title: {
            type: String,
            required: true,
            minlength: [3, "Title should be at least 3 characters long"],
            maxlength: [6, "Title should not exceed 6 characters"],
        },

        subTitle: {
            type: String,
            minlength: [3, "SubTitle should be at least 3 characters long"],
            maxlength: [10, "SubTitle should not exceed 10 characters"],
        },

        Mode: {
            type: String,
            enum: ["online", "offline"],
            required: [true, "Select at least one mode"],
        },

        Location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: function () {
                    return this.Mode === "offline";
                },
            },
            address: {
                type: String,
                required: function () {
                    return this.Mode === "offline";
                },
            },
        },

        link: {
            type: String,
            required: function () {
                return this.Mode === "online";
            },
            validate: {
                validator: (value) => /^(https?:\/\/)[^\s$.?#].[^\s]*$/gm.test(value),
                message: "Invalid URL format.",
            },
        },

        eventType: {
            type: String,
            enum: ["free", "paid"],
            required: [true, "Select at least one option"],
        },

        eventDate: {
            type: Date,
            required: [true, "Date is required"],
            validate: {
                validator: function (date) {
                    return date > new Date();
                },
                message: "Date must be in the future",
            },
        },

        eventStartTime: {
            type: String,
            required: true,
            validate: {
                validator: (value) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value),
                message: "Time must be in HH:mm format (24-hour).",
            },
        },

        
        eventEndTime: {
            type: String,
            required: true,
            validate: {
                validator: function (value) {
                    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) {
                        return false; 
                    }
                    if (!this.eventStartTime) return false; 
                    
                    return value > this.eventStartTime; 
                },
                message: "Event end time must be in HH:mm format and later than event start time.",
            },
        },

        categoryRefer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Please select a category for this event"],
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // registerUser:{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "User",
        //     required: true,
        // }
    },
    {
        versionKey: false,
        timestamps: true,
        strict: true,
    }
);

module.exports = model("event", EventSchema);
