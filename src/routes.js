
const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

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

router.post('/contact',upload.single('photo'), [
  check('message')
    .isLength({ min: 1 })
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

router.get('/litige', (req, res) => {
  res.render('litige', {
    data: {},
    errors: {},
    csrfToken: req.csrfToken()
  })
})

router.post('/litige',upload.single('photo'), [
  check('message')
    .isLength({ min: 1 })
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
    return res.render('litige', {
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


module.exports = router
