const mongoose = require('mongoose')
const User = mongoose.model('User')
const promisify = require('es6-promisify')

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Log In'})
}

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' })
}

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name')
  req.sanitizeBody('surname')
  req.checkBody('name', 'You must supply a name!').notEmpty()
  req.checkBody('surname', 'You must supply a surname!').notEmpty()
  req.checkBody('email', 'You must supply an email!').notEmpty()
  req.checkBody('email', 'Invalid Email!').isEmail()
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  })
  req.checkBody('password', 'Password cannot be blank!').notEmpty()
  req.checkBody('password-confirm', 'Password confirmation cannot be blank!').notEmpty()
  req.checkBody('password-confirm', 'Oops, your passwords do not match!').equals(req.body.password)

  const errors = req.validationErrors()
  if (errors) {
    req.flash('error', errors.map(err => err.msg))
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash() })
    return
  } 
  next()
}

exports.registerUser = async (req, res, next) => {
  const { name, surname, email, password } = req.body
  const user = new User({ name, surname, email })
  const register = promisify(User.register, User)
  await register(user, password)
  next()
}