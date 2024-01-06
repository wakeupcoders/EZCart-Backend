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

router.post("/cleanuploads", async(req, res,next) => {
    try {
        fs.readdir('../uploads/', (err, files) => {
            if (err) throw err;
            
            for (const file of files) {
                console.log(file + ' : File Deleted Successfully.');
                fs.unlinkSync(folder+file);
            }
            res.json({ message: 'File uploaded successfully!' });
          });
    } catch (err) {
        next(err)
    }
});


module.exports = router;