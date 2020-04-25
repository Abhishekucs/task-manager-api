const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/users')
const taskRouter = require('./routers/tasks')

const app = express()
const port = process.env.PORT

//below code convert json file to objects
app.use(express.json())

//routers
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () =>{
    console.log('Port is up and running at ' + port)
})