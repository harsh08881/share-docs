const express = require('express')
const router = express.Router()


router.get('/', (req, res) => {
    res.render("welcome");
})
router.get('/harsh',(req,res) =>{
    res.render('harsh')
})

module.exports = router