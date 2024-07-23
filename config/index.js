const dotenv = require("dotenv");
dotenv.config();

module.exports = {
    EMAIL,
    EMAIL_PASS,
    APP_URL,
    DEBUG_MODE,
    COINGATE_TOKEN,
    COINGATE_URL,
    GEM_API_KEY
} = process.env;