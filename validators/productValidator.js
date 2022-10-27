const Joi = require('joi');

const productSchema = Joi.object({
    title: Joi.string().min(3).max(30).required(),
    desc: Joi.string().required(),
    img: Joi.string().required(),
    categories: Joi.array().items(Joi.string().required()).required(),
    size: Joi.array().items(Joi.string().required()).required(),
    color: Joi.array().items(Joi.string().required()).required(),
    pcollection: Joi.string().required(),
    price: Joi.number().required(),
    originalprice: Joi.number().required()


});



module.exports = productSchema;