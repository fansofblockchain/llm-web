
## 环境依赖版本

建议使用以下运行环境（本地开发与部署一致）：

- Python：`3.11.x`（最低 `3.10+`，推荐与 `Dockerfile` 保持一致）
- Node.js：`20.x LTS`（最低 `18.18+`，用于 Vite 8）
- npm：`9+`（推荐 `10+`）
- SQLite：`3.35+`（项目默认数据库）
- Docker（可选部署）：`24+`
- Docker Compose（可选部署）：`v2+`

可使用以下命令检查版本：

```bash
python3 --version
node -v
npm -v
mysql --version
docker --version
docker compose version
```

## 目录结构

```text
.
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── api.py
│   │   └── pages.py
│   └── services/
│       └── runninghub_client.py
├── templates/
│   └── front.html
├── app.py
├── run.py
├── wsgi.py
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

## 环境配置

1. 按环境复制对应模板（每个环境一个 `.env` 文件）：

```bash
cp .env.dev.example .env.dev
cp .env.test.example .env.test
cp .env.prod.example .env.prod
```

2. 编辑对应文件，设置后端 API Key（生产环境务必使用独立密钥和密文管理）：

```env
RUNNINGHUB_API_KEY=你的真实Key
RUNNINGHUB_API_HOST=www.runninghub.cn
TASK_TIMEOUT_SECONDS=600
TASK_POLL_INTERVAL_SECONDS=5
```

3. 启动时选择环境文件（默认会优先读 `.env.{APP_ENV}`，找不到再回退 `.env`）：

```bash
# 开发环境
APP_ENV=dev python3 run.py

# 测试环境
APP_ENV=test python3 run.py

# 生产环境（建议配合 gunicorn/systemd 或 docker）
APP_ENV=prod python3 run.py

# 或显式指定文件（最高优先级）
APP_ENV_FILE=.env.prod python3 run.py
```
