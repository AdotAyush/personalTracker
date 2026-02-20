const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User.model');
const logger = require('../utils/logger');

// ─── JWT Strategy ─────────────────────────────────────────────────────────────
if (!process.env.JWT_SECRET && !process.env.JWT_ACCESS_SECRET) {
  throw new Error('JWT_SECRET or JWT_ACCESS_SECRET environment variable is not defined. Please add it to your .env file.');
}

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
  algorithms: ['HS256'],
};

passport.use('jwt', new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.sub).select('-password -refreshTokens');
    if (!user) return done(null, false, { message: 'User not found' });
    if (!user.isActive) return done(null, false, { message: 'Account deactivated' });
    return done(null, user);
  } catch (error) {
    logger.error('JWT Strategy error:', error);
    return done(error, false);
  }
}));

// ─── Google OAuth Strategy ────────────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use('google', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email'],
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      let user = await User.findOne({ email });

      if (user) {
        if (!user.googleId) {
          user.googleId = profile.id;
          user.avatar = profile.photos[0]?.value;
          await user.save();
        }
        return done(null, user);
      }

      user = await User.create({
        googleId: profile.id,
        email,
        name: profile.displayName,
        avatar: profile.photos[0]?.value,
        isEmailVerified: true,
        password: require('crypto').randomBytes(32).toString('hex'),
      });

      return done(null, user);
    } catch (error) {
      logger.error('Google Strategy error:', error);
      return done(error, false);
    }
  }));
}

module.exports = passport;
