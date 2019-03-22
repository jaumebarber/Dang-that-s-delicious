const passport = require('passport')
const crypto = require('crypto')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const promisify = require('es6-promisify')

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Login failed!',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
})

exports.logout = (req, res) => {
  req.logout()
  req.flash('success', 'You are now logged out!')
  res.redirect('/')
}

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next()
    return
  }
  req.flash('error', 'Oops, you are not logged in!')
  res.redirect('/login')
}

exports.renderForgot = (req, res) => {
  res.render('forgot', { title: 'Password recovery'})
}

exports.forgot = async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    req.flash('error', 'A password reset email has been sent to you!' )
    return res.redirect('/login')
  }
  user.resetPasswordToken =  crypto.randomBytes(20).toString('hex')
  user.resetPasswordExpires = Date.now() + 7200000
  await user.save()
  const resetUrl = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`
  req.flash('success', `A password reset email has been sent to you!` )
  res.redirect('/login')
}

exports.reset = async (req, res) => {
  const token = req.params.token
  const user = await User.findOne({ 
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() } 
  })
  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired!' )
    return res.redirect('/login')
  }
  res.render('reset', { title: 'Reset your password' })
}

exports.confirm = (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) {
    next()
    return
  }
  req.flash('error', 'Passwords do not match!')
  res.redirect('back')
}

exports.update = async (req, res) => {
  const token = req.params.token
  const user = await User.findOne({ 
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() } 
  })
  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired!' )
    return res.redirect('/login')
  }
  const setPassword = promisify(user.setPassword, user)
  await setPassword(req.body.password)
  user.resetPasswordToken = undefined
  user.resetPasswordExpires = undefined
  const updatedUser = await user.save()
  await req.login(updatedUser)
  req.flash('success', 'Password reset successfully! You are now logged in.')
  res.redirect('/')
}