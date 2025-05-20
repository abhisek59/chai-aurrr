const asyncHabdler=(requestHandler)=>(req,res,next)=>{
    Promise.resolve(requestHandler(req,res,next))
    .catch((err)=>{
        console.log(err);
        res.status(500).json({
            message:"Something went wrong",
            error:err.message
        })
    })
}   ;
export {asyncHabdler}

