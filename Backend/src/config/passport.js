import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { environment } from "./environment.js";

passport.use(
  new FacebookStrategy(
    {
      clientID: environment.FACEBOOK_APP_ID,
      clientSecret: environment.FACEBOOK_APP_SECRET,
      callbackURL: "https://automation-1-m004.onrender.com/api/auth/facebook/callback",
      profileFields: ["displayName", "photos", "name"],
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        profile.accessToken = accessToken;
        return cb(null, profile);
      } catch (error) {
        return cb(error, null);
      }
    }
  )
);

export default passport;
