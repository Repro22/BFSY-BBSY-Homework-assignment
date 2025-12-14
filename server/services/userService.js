const userDao = require("../dao/userDao");

async function listUsers() {
    return userDao.listUsers();
}

module.exports = { listUsers };
