const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().min(3).max(30).required().messages({
        "string.empty": "Name cannot be empty",
    }),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    external_login: Joi.boolean(),
    external_login_id: Joi.string(),
    img: Joi.string()
});



module.exports = registerSchema;