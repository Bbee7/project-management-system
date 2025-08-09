// const mysql = require('mysql2/promise');

// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: '123456',
//   database: 'project_manager',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// module.exports = pool;




const mysql = require('mysql2/promise');
const config = require('./config');

const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试数据库连接
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功');
    
    // 测试查询
    const [rows] = await connection.query('SELECT COUNT(*) AS count FROM project_management');
    console.log(`数据库中有 ${rows[0].count} 个项目`);
    
    connection.release();
  } catch (err) {
    console.error('数据库连接失败:', err);
  }
}

testDatabaseConnection();



module.exports = pool;