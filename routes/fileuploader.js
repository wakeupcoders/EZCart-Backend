const router = require("express").Router();
const CustomErrorHandler = require("../services/CustomErrorHandler");
const { GoogleGenerativeAI } = require('@google/generative-ai');
let multerInstance = require('../helpers/fileuploader');
var { APP_URL } = require("../config/index");
// const fs = require('fs');
const fs = require('fs/promises');



//Create Order in CoinGate
router.post("/singleupload", multerInstance.single('file'), async (req, res, next) => {
    try {

        // Set up Gemini API
        const gemini_api_key = 'AIzaSyAPEE1DCLwJJirsydsZR-RRFTtmYp6zrG4';
        const googleAI = new GoogleGenerativeAI(gemini_api_key);
        const geminiConfig = {
            temperature: 0.4,
            topP: 1,
            topK: 32,
            maxOutputTokens: 4096,
        };

        const geminiModel = googleAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            geminiConfig,
        });
        const filePath = req.file.path;

        const imageFile = await fs.readFile(filePath);
        const imageBase64 = imageFile.toString("base64");



        const promptConfigDesc = [
            { text: "write a description for this image in 500 words" },
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: imageBase64,
                },
            },
        ];
    
        const description = await geminiModel.generateContent({
            contents: [{ role: "user", parts: promptConfigDesc }],
        });
        const desc = await description.response;
    
    
    
        
        const promptConfigTitle = [
            { text: "write a for this product image for 20 words" },
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: imageBase64,
                },
            },
        ];
    
        const title = await geminiModel.generateContent({
            contents: [{ role: "user", parts: promptConfigTitle }],
        });
        const titletxt = await title.response;
    

        res.json({ title:titletxt.text(), description:desc.text(), metadata: req.file, 'fileUrl': APP_URL + "/images/" + req.file.filename });
    } catch (err) {
        next(err)
    }

});

router.post("/singleremove", async (req, res, next) => {
    try {

        fs.unlink(req.body.file, (err) => {
            if (err) {
                console.error(err)
                return next();
            }
            return res.status(200).json({ message: "file removed successfully" })
        })

    } catch (err) {
        next(err)
    }
});


module.exports = router;