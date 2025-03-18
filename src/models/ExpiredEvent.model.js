const {Schema,model, default: mongoose}=require("mongoose");

const ExpireEventSchema=new Schema({

    Images: {
        type: [String],
        validate: {
            validator: function(value) {
                return value.length > 0; 
            },
            message: "Add at least one image of the event."
        }
    },
    
    Title:{
        type:String,
        required:true,
        minlength:[3 , "title should be atleast 3 character long"],
        maxlength:[6 , "title should not exceed 6 character"]
    },

subTitle:{
    type:String,
    minlength:[3 , "subTitle should be atleast 3 character long"],
    maxlength:[10 , "subTitle should not exceed 10 character"]

},

Mode:{
    type:String,
    enum:["online","offline"],
    required:[true, "Select atleast one mode"]
},

Location:{
type:{
    type: String,
    enum: ["Point"],
    default: "Point"
},
coordinates: {
    type: [Number], // [longitude, latitude]
    required: function() { 
        return this.Mode === "offline";
     } 
},
address: { 
    type: String, 
    required: function() { 
        return this.Mode === "offline"; 
    } }
},

link: {
    type: String,
    required: function() { 
        return this.mode === "online"; 
    },
    validate: {
        validator: function(value) {
            return /^(https?:\/\/)[^\s$.?#].[^\s]*$/gm.test(value);
        },
        message: "Invalid URL format."
    }
},

eventType:{
    type:String,
    enum:["free","paid"],
    required:[true , "select atleast one option "]
},

eventDate: {
    type: Date,
    required: [true, "Date is required"]
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

categoryRefer:{
type:mongoose.Schema.Types.ObjectId,
ref:"Category",
required:[true, "please select Any Category for this event"]
},

createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
},

expiredAt: { type: Date, default: Date.now }, 

},
{
    versionKey: false,
    timestamps: true,
    strict: true,
}

)

module.exports= model("ExpireEvent",ExpireEventSchema)