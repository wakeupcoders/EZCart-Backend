const router = require("express").Router();
const CustomErrorHandler = require("../services/CustomErrorHandler");
let multerInstance = require('../helpers/fileuploader');
var { APP_URL } = require("../config/index");
const fs = require('fs');


//Create Order in CoinGate
router.post("/singleupload",multerInstance.single('file'), async(req, res,next) => {
    try {
        res.json({ metadata: req.file, 'fileUrl': APP_URL+"/images/"+req.file.filename });
    } catch (err) {
        next(err)
    }
});

router.post("/singleremove", async(req, res,next) => {
    try {
        
        fs.unlink(req.body.file, (err) => {
            if (err) {
              console.error(err)
              return next();
            }
          return res.status(200).json({message:"file removed successfully"})
          })

    } catch (err) {
        next(err)
    }
});


module.exports = router;