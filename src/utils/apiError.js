class ApiError extends Errors{
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.sucess = false;
        this.data=null;
        this.message = message;
        this.statusCode = statusCode;

        if(stack){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, this.constructor);
        }
    
        Error.captureStackTrace(this, this.constructor);
}}
export {ApiError};