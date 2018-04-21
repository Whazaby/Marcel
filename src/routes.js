const express = require('express')
const router = express.Router()
const {check, validationResult} = require('express-validator/check')

const {matchedData} = require('express-validator/filter')
const multer = require('multer')
const mkdirp = require('mkdirp')

const urlUpload = 'src/public/uploads';
const upload = multer({storage: multer.diskStorage({
        destination: function (req, file, cb) {
            console.log("destination function");
            console.log(req);
            console.log(file);
            cb(null, urlUpload)
        },
        filename: function (req, file, cb) {
            console.log("filename function");
            console.log(req);
            console.log(file);
            cb(null, Date.now() + '-'+ file.originalname)
        }
    })})
const LitigeService = require("./services/litige-service.js");
const CommentaireService = require("./services/commentaire-service.js");
const FichierService = require("./services/fichier-service.js");

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

    const litigeService = new LitigeService();
    const fichierService = new FichierService();
    const litige = {
        message : data.message,
        email: data.email,
        nom: data.nom,
        prenom: data.prenom,
        objet: data.objet,
        localite: data.localite,
        telephone: data.telephone,
    };


    litigeService.insert(litige,function(data){
        const queryFiles = [];
    
    if (req.files) {
        console.log("Fichiers: ",req.files)

        req.files.forEach(function(el) {
            queryFiles.push({
               "idLitige":data._id.toString(), 
               "path": el.filename
            });
        }); 
    }
        fichierService.insert(queryFiles);
    });

    req.flash('success', 'Thanks for the message! I‘ll be in touch :)')
    res.redirect('/litiges')
})

router.get('/litige/:id', upload.array(), function(req, res) {

    console.log(req.params.id);
    const query = {
        _id: ObjectId(req.params.id),
    };
    const litigeService = new LitigeService();
    const commentaireService = new CommentaireService();
    const fichierService = new FichierService();
      
      var promiseLitige = new Promise((resolve, reject) => { 
        litigeService.find(query,function(data){
            console.log("Promise litige: ",data);
            resolve(data[0]);
        }); 
    });
      var promiseCommentaires = new Promise((resolve, reject) => { 
        commentaireService.find({"idLitige":req.params.id},function(data) {
            console.log("Promise commentaires: ", data);
            resolve(data);
       });
      });
      var promiseFichiers = new Promise((resolve, reject) => {
        fichierService.find({"idLitige":req.params.id},function(data){
            console.log("Promise fichiers: ", data);
            resolve(data);
        });
      });
      
      Promise.all([promiseLitige, promiseCommentaires,promiseFichiers]).then(values => { 
        console.log("3 then render: ", values);
        const result = values[0];
        result.commentaires = values[1];
        result.files = values[2];
        console.log("Result ",result);
        return res.render('litige', {
            data: result,
            errors: {},
            csrfToken: req.csrfToken()
        });
      }, reason => {
        console.log(reason)
      });   
      
})

router.post('/commentaire', upload.single(''), [
    check('commentaire')
        .isLength({min: 1})
        .withMessage('Un Commentaire est requis')
        .trim()
], (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.render('commentaire', {
            data: req.body,
            errors: errors.mapped(),
            csrfToken: req.csrfToken()
        })
    }

    const data = matchedData(req)
    console.log('Sanitized:', data);

    const commentaireService = new CommentaireService();

    commentaireService.insert({
      idLitige: req.body.idLitige,
      commentaire: data.commentaire
    });
     
    req.flash('success', 'Thanks for the message! I‘ll be in touch :)')
    res.redirect('/litige/'+req.body.idLitige)
})

module.exports = router
 