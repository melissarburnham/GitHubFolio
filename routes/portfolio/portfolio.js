const express = require('express')
const router = express.Router()
const { user, ssr, fileHandler } = require('../../controllers')
const { isAuthenticated } = require('../../utils/isAuthenticated')
const path = require('path')

/**
 * SSR Routes - '/portfolio'
 */

// React Server Side Rendering, send fully rendered partial public page
router.route('/user/preview')
  .get(isAuthenticated, (req, res, next) => {
    // Get user data, create SSR html page, send to client
    user.getDataById({ _id: req.user._id })
      .then(userData => ssr.renderPortfolioBody({ userData }))
      .then(html => res.send(html))
      .catch(err => next(err))
  })

// React Server Side Rendering, send fully rendered public page
router.route('/user/:gitHubId')
  .get((req, res, next) => {
    // Get user data, create SSR html page, send to client
    user.getDataByGitHubId({ gitHubId: req.params.gitHubId })
      .then(userData => ssr.renderPortfolioPage({ userData }))
      .then(html => res.send(html))
      .catch(err => next(err))
  })

// React Server Side Rendering, send download file of fully rendered page
router.route('/ssr')
  .get(isAuthenticated, (req, res, next) => {
    // Get user data, create SSR html page, write to file, send to client, delete file
    user.getDataById({ _id: req.user._id })
      .then(userData => ssr.renderPortfolioPage({ userData }))
      .then(html => fileHandler.saveHTMLToLocalTempFolder({ html }))
      .then(filename => {
        const cb = err => {
          if (err) throw err
          fileHandler.deleteFileFromLocalTempFolder({ filename })
        }
        res.download(path.join(__dirname, `../../temp/${filename}`), 'GitHubFolio_Source_Code.html', cb)
      })
      .catch(err => next(err))
  })

module.exports = router
