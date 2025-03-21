const express=require("express")
require('dotenv').config();
const db_connection=require('./src/config/db')
const cors = require('cors');
const userRouter=require("./src/routes/UserAuth.routes")
const logger=require('./src/middlewares/logger.middleware')
const morgan = require('morgan');
const AdminRoutes = require("./src/routes/Admin.routes");
const moveExpiredEvents = require("./src/services/cron_node");
// const rateLimitMiddleware=require("./src/middlewares/RateLimiter.middleware")
// define port
const Port = process.env.PORT ;


//server initiate
const app=express()

// middlewares
app.use(express.json())
app.use(morgan('combined'));
app.use(logger)
app.use(express.urlencoded({ extended: true }));
// app.use(rateLimitMiddleware)
moveExpiredEvents() //cron for check which event is expire
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    '*'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.options('*', cors()); // added for handle preflight request from 5173 or 3000 port



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

