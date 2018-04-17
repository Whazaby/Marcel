const express = require('express')
const router = express.Router()
const {check, validationResult} = require('express-validator/check')

const {matchedData} = require('express-validator/filter')
const multer = require('multer')

const urlUpload = 'src/public/uploads';
const upload = multer({storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, urlUpload)
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-'+ file.originalname)
        }
    })})
const LitigeService = require("./services/litige-service.js");
var ObjectId = require('mongodb').ObjectID;

//https://github.com/expressjs/multer
//https://github.com/ctavan/express-validator#schema-validation
router.get('/', (req, res) => {
    res.render('index')
})

router.get('/contact', (req, res) => {
    res.render('contact', {
        data: {},
        errors: {},
        csrfToken: req.csrfToken()
    })
})

router.post('/contact', upload.single('photo'), [
    check('message')
        .isLength({min: 1})
        .withMessage('Message is required')
        .trim(),
    check('email')
        .isEmail()
        .withMessage('That email doesn‘t look right')
        .trim()
        .normalizeEmail()
], (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.render('contact', {
            data: req.body,
            errors: errors.mapped(),
            csrfToken: req.csrfToken()
        })
    }

    const data = matchedData(req)
    console.log('Sanitized:', data)

    if (req.file) {
        console.log('Uploaded: ', req.file)
        // Homework: Upload file to S3
    }

    req.flash('success', 'Thanks for the message! I‘ll be in touch :)')
    res.redirect('/')
})

router.get('/litiges', (req, res) => {
    const litigeService = new LitigeService();
    
    litigeService.find({},function(data){
        return res.render('litiges', {
            data: data,
            errors: {},
            csrfToken: req.csrfToken()
        })
    });
})

router.post('/litiges', upload.array(), [
    check('recherche')
        .isLength({min: 1})
        .withMessage('recherche is required')
        .trim()
], (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.render('litiges', {
            data: req.body,
            errors: errors.mapped(),
            csrfToken: req.csrfToken()
        })
    }

    const data = matchedData(req)
    console.log('Sanitized:', data)

    const litigeService = new LitigeService();
    const query = {
        nom: data.recherche,
    };

    litigeService.find(query,function(data){
        return res.render('litiges', {
            data: data,
            errors: {},
            csrfToken: req.csrfToken()
        })
    });
        
})

router.get('/litige', (req, res) => {
    res.render('litige', {
        data: {},
        errors: {},
        csrfToken: req.csrfToken()
    })
})

router.post('/litige', upload.any(), [
    check('message')
        .isLength({min: 1, max: 1000})
        .withMessage('Message is required')
        .trim(),
    check('email')
        .isEmail()
        .withMessage('That email doesn‘t look right')
        .trim()
        .normalizeEmail(),
    check('nom')
        .trim()
        .matches('^[a-zA-Z][0-9a-zA-Z .,\'-]*$'),
    check('prenom')
        .trim()
        .matches('^[a-zA-Z][0-9a-zA-Z .,\'-]*$'),
    check('objet')
        .trim()
        .isLength({min: 5}),
    check('localite')
        .trim()
        .isLength({min: 2}),
    check('telephone')
        .trim()
        .matches('^(\\+237)?\\s?[0-9]{7,9}$'),
], (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.render('litige', {
            data: req.body,
            errors: errors.mapped(),
            csrfToken: req.csrfToken()
        })
    }

    const data = matchedData(req)
    console.log('Sanitized:', data)

    var pathFiles = [];
    
    if (req.files) {
        console.log("Fichiers: ",req.files)

        req.files.forEach(function(el) {
            pathFiles.push(el.filename);
        });
    }
    const litigeService = new LitigeService();
    const litige = {
        message : data.message,
        email: data.email,
        nom: data.nom,
        prenom: data.prenom,
        objet: data.objet,
        localite: data.localite,
        telephone: data.telephone,
        files: pathFiles
    };

    litigeService.insert(litige);

    req.flash('success', 'Thanks for the message! I‘ll be in touch :)')
    res.redirect('/')
})

router.get('/litige/:id', upload.array(), function(req, res) {

    console.log(req.params.id);
    const query = {
        _id: ObjectId(req.params.id),
    };
    const litigeService = new LitigeService();

    litigeService.find(query,function(data){
        console.log(data);
        return res.render('litige', {
            data: data[0],
            errors: {},
            csrfToken: req.csrfToken()
        })
    });
})


module.exports = router
