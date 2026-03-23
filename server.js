const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 初始化数据文件
function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    const init = {
      players: ['小伟','子荣','雄哥','涛哥','老吴','阿杜','杰哥','锦亿弟弟','明哥','小李哥','哈登'],
      matches: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(init, null, 2));
    return init;
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API
app.get('/api/data', (req, res) => {
  res.json(loadData());
});

app.post('/api/match', (req, res) => {
  const { mode, winners, losers } = req.body;
  if (!mode || !winners?.length || !losers?.length) {
    return res.status(400).json({ error: '参数不完整' });
  }
  const data = loadData();
  data.matches.unshift({
    id: Date.now(),
    mode,
    winners,
    losers,
    time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
  });
  saveData(data);
  res.json({ ok: true });
});

app.delete('/api/match/:id', (req, res) => {
  const data = loadData();
  data.matches = data.matches.filter(m => m.id !== Number(req.params.id));
  saveData(data);
  res.json({ ok: true });
});

app.post('/api/player', (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: '名字不能为空' });
  const data = loadData();
  if (data.players.includes(name.trim())) {
    return res.status(400).json({ error: '球员已存在' });
  }
  data.players.push(name.trim());
  saveData(data);
  res.json({ ok: true });
});

app.delete('/api/player/:name', (req, res) => {
  const data = loadData();
  data.players = data.players.filter(p => p !== req.params.name);
  saveData(data);
  res.json({ ok: true });
});

app.delete('/api/matches', (req, res) => {
  const data = loadData();
  data.matches = [];
  saveData(data);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`篮球积分赛服务已启动: http://localhost:${PORT}`);
});
