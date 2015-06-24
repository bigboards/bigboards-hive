var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var GitHubStrategy = require('passport-github').Strategy;

module.exports.strategies = {};

module.exports.strategies.google = function(config, onUserLogin) {
    return new GoogleStrategy(config.oauth.google,
        function(accessToken, refreshToken, profile, done) {
            var profileId = profile.id;
            var profileData = {
                username: profile.id,
                bio: profile.aboutMe,
                origin: 'google'
            };

            if (profile.emails && profile.emails.length > 0) profileData.email = profile.emails[0];
            if (profile.image) profileData.avatar_url = profile.image.url;
            //if (profile.photos && profile.photos.length > 0) profileData.image.url = profile.photos[0];
            if (profile.name) {
                profileData.firstname = profile.name.givenName;
                profileData.surname = profile.name.familyName;
            }

            onUserLogin(accessToken, profileId, profileData, done);
        }
    );
};

module.exports.strategies.github = function(config, onUserLogin) {
    return new GitHubStrategy(config.oauth.github,
        function(accessToken, refreshToken, profile, done) {
            var profileId = profile.username;
            var profileData = {
                username: profile.username,
                name: profile.name,
                email: profile.email,
                bio: profile.bio,
                avatar_url: profile.avatar_url,
                gravatar_id: profile.gravatar_id,
                origin: 'github'
            };

            onUserLogin(accessToken, profileId, profileData, done);
        }
    );
};
