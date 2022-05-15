const router   = require('express').Router();
const mongoose = require('mongoose');

router.get('/', async(req, res) => {
    res.json({
        error: null,
        data: {
            user: req.user,
        }
    })
})

module.exports = router