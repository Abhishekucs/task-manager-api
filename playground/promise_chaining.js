require('../src/db/mongoose')
const Tasks = require('../src/models/tasks')

// Tasks.findByIdAndRemove('5e9a8b2d142cfa417cece689').then((task) =>{
//     console.log(task)
//     return Tasks.find({ status: false })
// }).then((tasks) =>{
//     console.log(tasks)
// }).catch((e) =>{
//     console.log(e)
// })

const deleteTaskandCount = async (id) =>{
    const remove = await Tasks.findByIdAndRemove(id)
    const count = await Tasks.countDocuments({ status: true })
    return count
}

deleteTaskandCount('5e9a09b5c66eec267899bf44').then((count) =>{
    console.log(count)
}).catch((e) =>{
    console.log(e)
})