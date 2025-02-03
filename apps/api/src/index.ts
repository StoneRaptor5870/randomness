import express, { Response } from 'express'
import postgresConn from './config/databases'

const app = express()
const port = process.env.PORT

app.get('/', (_, res: Response) => {
  res.send('<h1>welcome to randomness...</h1>')
})

postgresConn
  .getConnectionFromPool()
  .then(() => {
    console.log('Connected to PostgreSQL successfully.')
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    })
  })
  .catch((err) => {
    console.error('Failed to connect to PostgreSQL:', err)
  })
