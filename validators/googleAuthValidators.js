const Joi = require('joi');

const googleRegisterSchema = Joi.object({
    name: Joi.string().min(3).max(30).required().messages({
        "string.empty": "Name cannot be empty",
    }),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    external_login: Joi.boolean().required(),
    external_login_id: Joi.string().required(),
    img: Joi.string()
});



module.exports = googleRegisterSchema;