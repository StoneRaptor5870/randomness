import { Pool, PoolClient } from 'pg'
import chalk from 'chalk'
import { config as dotenvConfig } from 'dotenv'

dotenvConfig()

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  max: Number(process.env.POSTGRES_CONNECTION_LIMIT),
  connectionTimeoutMillis: 30000,
  ssl:
    process.env.POSTGRES_SSL === 'true'
      ? { rejectUnauthorized: false }
      : undefined,
})

class PostgresConn {
  async getConnectionFromPool(): Promise<PoolClient> {
    try {
      const client = await pool.connect()
      return client
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED') {
        console.error(chalk.bold.red('Postgres connection was refused.'))
      } else if (err.code === '28P01') {
        console.error(chalk.bold.red('Postgres Access denied for user.'))
      } else {
        console.error(
          chalk.bold.red(`Postgres error: ${err.message || err.code}`),
        )
      }
      throw err
    }
  }

  async runQuery<T>(query: string): Promise<T[]> {
    const client = await this.getConnectionFromPool()
    try {
      const result = await client.query(query)
      return result.rows
    } catch (err: any) {
      err._query = query
      console.error(err)
      throw err
    } finally {
      client.release()
    }
  }
}

const postgresConn = new PostgresConn()

export default postgresConn
