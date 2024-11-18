const Joi = require('joi');

const productSchema = Joi.object({
    title: Joi.string().min(3).max(3000).required(),
    shortdesc: Joi.string().required(),
    desc: Joi.string().required(),
    img: Joi.string().required(),
    categories: Joi.array().items(Joi.string().required()).required(),
    size: Joi.array().items(Joi.string().required()).required(),
    color: Joi.array().items(Joi.string().required()).required(),
    pcollection: Joi.string().required(),
    pcollectionid: Joi.string().required(),
    price: Joi.number().required(),
    originalprice: Joi.number().required(),
    inStock: Joi.boolean().required(),
    inTrending: Joi.boolean().required(),
    inFeatured: Joi.boolean().required()
});



module.exports = productSchema;