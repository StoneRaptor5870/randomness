import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD as unknown as string,
  database: process.env.POSTGRES_DB,
  max: Number(process.env.POSTGRES_CONNECTION_LIMIT),
  connectionTimeoutMillis: 30000,
  ssl:
    process.env.POSTGRES_SSL === 'true'
      ? { rejectUnauthorized: false }
      : undefined,
})

async function runMigrations() {
  try {
    const migrationPath = path.join(__dirname, '../migrations')
    const migrationFiles = fs
      .readdirSync(migrationPath)
      .filter((file) => file.endsWith('.sql'))

    // Handle specific migration file if provided
    const specificMigration = process.argv[2] // Read file name from command-line args

    if (specificMigration) {
      const migrationFilePath = path.join(migrationPath, specificMigration)
      if (!fs.existsSync(migrationFilePath)) {
        console.error(
          chalk.red(`Migration file not found: ${specificMigration}`),
        )
        return
      }
      const sql = fs.readFileSync(migrationFilePath, 'utf8')
      console.log(chalk.green(`Running migration: ${specificMigration}`))
      await pool.query(sql)
    } else {
      // Run all migrations sequentially
      for (const file of migrationFiles) {
        const sql = fs.readFileSync(path.join(migrationPath, file), 'utf8')
        console.log(chalk.green(`Running migration: ${file}`))
        await pool.query(sql)
      }
    }

    console.log(chalk.blue('Migrations applied successfully!'))
  } catch (err) {
    console.error(chalk.red('Migration error:'), err)
  } finally {
    await pool.end()
  }
}

runMigrations()
