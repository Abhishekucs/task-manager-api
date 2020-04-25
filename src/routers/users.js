const express = require('express')
const Users = require('../models/users')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { userWelcomeMail } = require('../emails/account')
const { userCanceledMail } = require('../emails/account')
const router = new express.Router()

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
           return cb(new Error('Please upload an Image'))
        }

        cb(undefined, true)
    }
})

//code below uses async/await
router.post('/users', async (req, res) =>{
    const user = new Users(req.body)

    try{
        await user.save()
        userWelcomeMail(user.email, user.name)
        const token = await user.generateAuthToken()

        res.status(201).send({ user, token })
    } catch(e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) =>{
    try {
        const user = await Users.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) =>{
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) =>{
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) =>{
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/users/me', auth, async (req, res) =>{

    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) =>{
    const updates = Object.keys(req.body)
    const CanBeUpdated = ["name", "email", "age", "password"]
    const toValidation = updates.every((update) =>{
        return CanBeUpdated.includes(update)
    })

    if(!toValidation){
        return res.status(400).send({error: 'Invalid Updates!'})
    }
    try{

        // const user = await Users.findById(req.user._id)

        updates.forEach((update) =>{
            req.user[update] = req.body[update]
        })

        await req.user.save()
        // const user = await Users.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})

        res.send(req.user)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) =>{
    try{
        await req.user.remove()
        userCanceledMail(req.user.email, req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await Users.findById(req.params.id)

        if(!user || !user.avatar) {
            return new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})
module.exports = router