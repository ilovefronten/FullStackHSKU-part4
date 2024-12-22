const { PORT } = require('./util/config')
const app = require('./app')
const logger = require('./util/logger')

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})