import uuid from '../Utils/uuid.js'

const startSession = (req, res)=>{
    const userContext = ""
    const contextId = uuid.createContext(userContext)

    res.json({contextId})
}


export default startSession