const BaseJoi = require('joi');
const sanitize = require('sanitize-html');

const extension = (joi)=>({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules:{
        escapeHTML:{
            validate(value, helpers){
                const clean = sanitize(value, {
                    allowedTags: [],
                    allowedAttributes: {}
                });
                if(clean !== value) return helpers.error('string.escapeHTML', {value})
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.reviewschema = Joi.object({
    review: Joi.object({
        body: Joi.string()
            .min(1)
            .required().escapeHTML(),
        rating: Joi.number().min(1).max(5)
            .required()
    }).required()
});

module.exports.Campgroundschema = Joi.object({
    name: Joi.string()
        .min(3)
        .required().escapeHTML(),
    price: Joi.number()
        .required(),
    location: Joi.string()
        .required().escapeHTML(),
    // image: Joi.string()
    //     .required(),
    description: Joi.string()
        .required().escapeHTML(),
    deleteImage: Joi.array()
});

