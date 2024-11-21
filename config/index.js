const dotenv = require("dotenv");
dotenv.config();

module.exports = {
    BRAND_NAME,
    EMAIL,
    EMAIL_PASS,
    BREVO_EMAIL,
    APP_URL,
    DEBUG_MODE,
    COINGATE_TOKEN,
    COINGATE_URL,
    GEM_API_KEY
} = process.env;