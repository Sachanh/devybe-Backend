const express=require("express")
require('dotenv').config();
const db_connection=require('./src/config/db')
const cors = require('cors');
const userRouter=require("./src/routes/UserAuth.routes")
const logger=require('./src/middlewares/logger.middleware')
const morgan = require('morgan');
const AdminRoutes = require("./src/routes/Admin.routes");
const moveExpiredEvents = require("./src/services/cron_node");
const rateLimitMiddleware=require("./src/middlewares/RateLimiter.middleware")
// define port
const Port = process.env.PORT ;


//server initiate
const app=express()

// middlewares
app.use(express.json())
app.use(morgan('combined'));
app.use(logger)
app.use(express.urlencoded({ extended: true }));
app.use(rateLimitMiddleware)
moveExpiredEvents() //cron for check which event is expire

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://devybe-backend.onrender.com' 
];

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", allowedOrigins.includes(req.headers.origin) ? req.headers.origin : "http://localhost:3000");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// Use CORS middleware after setting headers manually
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));



// Routes
app.get('/hs/', async (req, res) => {
    return res.status(200).send({ 'msg': 'Server is Up' });
});


// API Routes
app.use('/user', userRouter);
app.use('/admin', AdminRoutes)




// server listening---------
app.listen(Port, async() => {
    try {
        await db_connection();
    } catch (error) {
        console.error(`Connection to DB Failed: ${error.message}`);
    }
    console.log(`Server is Up on Port ${Port}`);
}).on('error', (error) => {
    console.error(`Error starting server: ${error.message}`);
});

