import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { environment } from "./environment.js";

const getCallbackURL = (provider) => {
  const baseURL =
    environment.NODE_ENV === "production"
      ? process.env.SERVER_URL?.replace(/\/$/, '') // Loại bỏ dấu / ở cuối
      : "http://localhost:8000";

  return `${baseURL}/api/auth/${provider}/callback`;
};

passport.use(
  new FacebookStrategy(
    {
      clientID: environment.FACEBOOK_APP_ID,
      clientSecret: environment.FACEBOOK_APP_SECRET,
      callbackURL: getCallbackURL("facebook"),
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
