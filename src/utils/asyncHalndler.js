const asyncHandler = (requestHandler)=>(req, res, next)=>{
    Promise.resolve(requestHandler(req, res, next))
        .catch((err)=> next(err));
}
export { asyncHandler };

// Usage example
// import { asyncHandler } from './utils/asyncHandler.js';
