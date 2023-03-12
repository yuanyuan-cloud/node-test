const mysql = require('mysql2/promise');

// 创建wowo数据库连接
const pool = mysql.createPool({
	host: 'localhost',
	user: 'root',
	password: 'Wushidishi0!',
	database: 'wowo',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});

// 往users表中添加数据
async function addUser(session_key, openid, avatar) {
try {
const [rows] = await pool.query(
'select id from users where openid = ?',
[openid]
);
if(rows.length >0){
console.log(`用户已存在,id为${rows[0].id}`);
return rows[0].id;
} else {
const [result] = await pool.query(
'insert into users (session_key, openid, avatar) values (?,?,?)',
[session_key, openid, avatar]
);
console.log(`向users表中插入数据，id为${result.insertId}`);
return result.insertId;
}
}catch(err){
console.log(err);
}
}

// 查询users表中所有数据
async function getUsers() {
try {
const [results, fields] = await pool.query('select * from users');
return results;
} catch (err) {
console.log(err);
}
}

// 更新users表中的数据
async function updateUser(id, session_key, openid, avatar) {
const query = 'update users set session_key = ?, openid = ?, avatar = ? where id = ?';
try{const values = [session_key, openid, avatar, id];
const [result] = await pool.query(query, values);
return result;
} catch (err) {
console.log(err);
}
}
// 删除users表中的数据
async function deleteUser(id) {
const query = 'delete from users where id = ?';
try{const [result] = await pool.query(query, [id]);
return result.affectedRows;
}catch (err) {
console.log(err);
}
}

// 往posts表中添加数据
async function addPost(openid, avatar, content, tmstamp) {
try {
const [result] = await pool.query(
'insert into posts (openid, avatar, content, tmstamp) values (?, ?, ?, ?)',
[openid, avatar, content, tmstamp]
);
console.log(`向posts表中插入数据，id为${result.insertId}`);
return results;
} catch (err) {
console.log(err);
}
}

// 查询posts表中所有数据
async function getPosts() {
try {
const [results, fields] = await pool.query('select * from posts');
return results.insertId;
} catch (err) {
console.log(err);
}
}

// 更新posts表中的数据 
async function updatePost(id, openid, avatar, content, tmstamp) {
const query = 'update posts set openid = ?, avatar = ?, content = ?, tmstamp = ? where id = ?';
try {
const values = [openid, avatar, content, tmstamp, id];
const [result] = await pool.query(query, values);
return result.affectedRows;
}catch (err) {
console.log(err);
}
}


// 删除posts表中的数据
async function deletePost(id) {
const query = 'delete from posts where id = ?';
try {
const [result] = await pool.query(query, [id]);
return result.affectedRows;
} catch (err) {
console.log(err);
}
}

// 往users表中根据openid插入token
async function updateToken(openid, token) {
  try {
    const [result] = await pool.query(
      'SELECT id FROM users WHERE openid=?',
      [openid]
    );
    if (result.length === 0) {
      console.log(`没有找到对应的openid`);
      return null;
    } else {
      const id = result[0].id;
      const [updateResult] = await pool.query(
        'UPDATE users SET token=? WHERE id=?',
        [token, id]
      );
      console.log(`成功更新1条数据，id为${id}`);
      return id;
    }
  } catch (err) {
    console.error(err);
  }
}


// 根据token查询openid
async function getOpenidByToken(token) {
const conn = await pool.getConnection();
try {
const sql = 'select openid from users where token=?';
const [results, fields] = await conn.execute(sql, [token]);
if(results.length > 0){
console.log(`token ${token} 找到openid ${results[0].openid},用户已登录`);
return results[0].openid;
} else {
console.log(`token ${token}未找到对应openid，用户未登录`);
return null;
}
} catch (err) {
console.error(`在获取token ${token}时发生错误: ${err}`);
return null;
} finally {
conn.release();
}
}

module.exports = {
addUser,
getUsers,
updateUser,
deleteUser,
addPost,
getPosts,
updatePost,
deletePost,
updateToken,
getOpenidByToken
};
