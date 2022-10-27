//const DEBUG_MODE = require('../config/index');
const ValidationError = require('joi');
const CustomErrorHandler = require('../services/CustomErrorHandler');

const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let data = {
        message: 'Internal server error',
        ...(process.env.DEBUG_MODE === 'true' && { originalError: err.message })
    }



    if (err instanceof CustomErrorHandler) {
        statusCode = err.status;
        data = {
            message: err.message
        }
    }

    console.log(err.message)

    return res.status(statusCode).json(data);
}

module.exports = errorHandler;