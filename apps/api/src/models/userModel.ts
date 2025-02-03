import postgresConn from '../config/databases'

class UserModel {
  async getAllUsers() {
    const query = 'SELECT id, name, email, created_at FROM users;'
    return await postgresConn.runQuery(query)
  }

  async createUser(name: string, email: string, password: string) {
    const query = `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at;
    `
    return await postgresConn.runQuery(query, [name, email, password])
  }
}

export default new UserModel()
