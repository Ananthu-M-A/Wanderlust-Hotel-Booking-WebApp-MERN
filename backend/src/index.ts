import dotenv from 'dotenv';
dotenv.config();
import { validateEnv } from './utils/validateEnv';
validateEnv(process.env);

import express from 'express';
import http from 'http';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoDBStore from 'connect-mongodb-session';
import messageSocket from './sockets/messageSocket';
import { connectDb } from './utils/MongoDB';
import authRouter from './routes/auth.route';
import profileRouter from './routes/profile.route';
import homeRouter from './routes/home.route';
import bookingRouter from './routes/booking.route';
import liveChatRouter from './routes/chat.route';
import adminRouter from './routes/admin.route';
import usersRouter from './routes/users.route';
import hotelsRouter from './routes/hotels.route';
import restaurantsRouter from './routes/restaurants.route';
import bookingsRouter from './routes/bookings.route';


// Winston logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    // You can add file transports here
  ],
});

connectDb();
const MongoDBStoreSession = MongoDBStore(session);
const store = new MongoDBStoreSession({
  uri: process.env.MONGODB_CONNECTION_STRING as string,
  collection: 'sessions'
});
store.on('error', function (error: any) {
  console.error('MongoDBStore error:', error);
});


const app = express();
const server = http.createServer(app);
messageSocket(server);

// Security middleware
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use(morgan("dev"));
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || "Secret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 86400000,
  },
  store: store
}));


// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wanderlust Hotel Booking API',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/*.ts'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/user", authRouter);
app.use("/api/user/profile", profileRouter);
app.use("/api/user/home", homeRouter);
app.use("/api/user/booking", bookingRouter);
app.use("/api/user/live-chat", liveChatRouter);

app.use("/api/admin", adminRouter);
app.use("/api/admin/users", usersRouter);
app.use("/api/admin/hotels", hotelsRouter);
app.use("/api/admin/restaurants", restaurantsRouter);
app.use("/api/admin/bookings", bookingsRouter);


// Centralized error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  console.log(`Server started on port ${PORT}`);
});

