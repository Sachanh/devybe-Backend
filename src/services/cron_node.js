const cron = require("node-cron");
const EventSchema = require("../models/Events.models");
const ExpireEventSchema = require("../models/ExpiredEvent.model");

const moveExpiredEvents = async () => {
    try {
        const currentDate = new Date();

        const expiredEvents = await EventSchema.find({ eventDate: { $lt: currentDate } });

        await ExpireEventSchema.insertMany(expiredEvents);

        await EventSchema.deleteMany({ eventDate: { $lt: currentDate } });

    } catch (error) {
        console.error("Error moving expired events:", error);
    }
};

// Schedule the job to run at midnight every day
cron.schedule("0 0 * * *", moveExpiredEvents, {
    scheduled: true,
    timezone: "Asia/Kolkata",
});

module.exports = moveExpiredEvents;
