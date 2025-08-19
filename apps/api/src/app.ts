import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import routes from './routes';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import passport from 'passport';
import authController from 'controllers/authController';

// Required for process.env
dotenv.config();

// Standard setup with Express and EJS
const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

passport.use(
  new JwtStrategy(
    {
      // Get token from Authentication Header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Secret key to compare to
      secretOrKey: process.env.JWT_SECRET!,
    },
    authController.verifyFunction,
  ),
);

// Added to avoid having to pass req.user into each controller/view
// Puts into currentUser local variable
// MUST BE AFTER PASSPORT AND BEFORE ROUTER for controller/views to be able to see
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// Routing
app.use('/', routes);

// Setting up listener
const PORT = process.env.SERVER_PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// Error checking for Express app
// Must be placed after all other middleware to catch error properly
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).send(err.message);
});
