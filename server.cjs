const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// 启用 CORS 和 JSON 解析
app.use(cors());
app.use(bodyParser.json());

// 用户数据文件路径
const DATA_FILE = path.join(__dirname, 'userData.json');

// 确保数据文件存在
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({
        users: [
            {
                username: 'senior1',
                password: '123456',
                role: 'elderly',
                id: 1,
                createdAt: new Date().toISOString()
            },
            {
                username: 'volunteer1',
                password: '123456',
                role: 'volunteer',
                id: 2,
                createdAt: new Date().toISOString()
            }
        ]
    }, null, 2));
}

// 读取用户数据
function readUsers() {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (error) {
        console.error('读取用户数据失败:', error);
        return { users: [] };
    }
}

// 保存用户数据
function saveUsers(users) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('保存用户数据失败:', error);
        return false;
    }
}

// 获取所有用户
app.get('/api/users', (req, res) => {
    const data = readUsers();
    res.json(data.users);
});

// 用户注册
app.post('/api/users/register', (req, res) => {
    const { username, password, role } = req.body;
    const data = readUsers();
    
    // 检查用户是否已存在
    if (data.users.some(user => user.username === username)) {
        return res.status(400).json({ error: '用户名已存在' });
    }
    
    // 添加新用户
    const newUser = {
        username,
        password,
        role,
        id: Date.now(),
        createdAt: new Date().toISOString()
    };
    
    data.users.push(newUser);
    
    if (saveUsers(data)) {
        res.json({ message: '注册成功' });
    } else {
        res.status(500).json({ error: '注册失败' });
    }
});

// 用户登录
app.post('/api/users/login', (req, res) => {
    const { username, password } = req.body;
    const data = readUsers();
    
    const user = data.users.find(u => u.username === username && u.password === password);
    
    if (user) {
        res.json({
            message: '登录成功',
            user: {
                username: user.username,
                role: user.role,
                id: user.id
            }
        });
    } else {
        res.status(401).json({ error: '用户名或密码错误' });
    }
});

app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
}); 