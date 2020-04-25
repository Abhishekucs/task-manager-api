const express = require('express')
const Tasks = require('../models/tasks')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks', auth, async (req, res) =>{
    // const task = new Tasks(req.body)
    const task = new Tasks({
        ...req.body,
        owner: req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
    } catch(e){
        res.status(400).send(e)
    }
})

// GET /tasks?status=true
// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) =>{
    const match = {}
    const sort = {}
    
    if(req.query.status) {
        match.status = req.query.status 
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try{
        // const task = await Tasks.find({ owner: req.user._id })  //we can use this also
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()

        res.send(req.user.tasks)
    } catch(e){
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res) =>{
    const _id = req.params.id

    try{
        // const task = await Tasks.findById(_id)
        const task = await Tasks.findOne({ _id, owner: req.user._id })
        if(!task){
            return res.status(404).send()
        }

        res.send(task)
    } catch(e){
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const CanBeUpdated = ["description", "status"]
    const toValidation = updates.every((update) =>{
        return CanBeUpdated.includes(update)
    })

    if(!toValidation){
        return res.status(400).send({error: 'Invalid Updates!'})
    }
    try{

        const task = await Tasks.findOne({ _id: req.params.id, owner: req.user._id })
        // const task = await Tasks.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        
        if(!task){
            return res.status(400).send()
        }

        updates.forEach((update) =>{
            task[update] = req.body[update]
        })

        await task.save()
        res.send(task)
    } catch(e){
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try{
        // const task = await Tasks.findByIdAndDelete(req.params.id)
        const task = await Tasks.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if(!task){
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router