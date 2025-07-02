# 📁 Express-ts-api

A Basic Node.js **(EXPRESS+typeScript+PSQL)** project to mange **users**

---

## ✅ Requirements

    Node.js v24
    npm
    Docker
    postgres (if you do not want to use docker postgres)
    pm2 (optional, for production background process)

## 🔧 Environment Setup (`.env`)

Create a `.env` file in the project root with the following contents:

```env
PORT=3030
NODE_ENV=development
#NODE_ENV=production
DB_NAME=express
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=127.0.0.1
DB_PORT=5444
JWT_SECRET=
ACCESS_TOKEN_EXPIRATION = 30m
REFRESH_TOKEN_EXPIRATION = 7d
CREATE_ADMIN=true
ADMIN_NAME=
ADMIN_MAIL=
ADMIN_PASSWORD=
ADMIN_PHONENUMBER=
```



## 🚀 Getting Started


### 1. Clone the code base

```code
git clone https://github.com/Fahad4654/express-ts-api.git
```

### 2. Docker postgres Setup (configure the `docker-compose.yml` file according to `.env` file )
``` code 
cd express-ts-api
docker compose up -d
```
### 3.Install Node.js v24 (using NVM)


```code
nvm install 24
nvm use 24
```

### 4. Install dependencies

```code 
npm install
```

### 5. Run the express-ts-api manually

```code
npm run dev
```


## ⚙️ Running in Background with PM2 (Recommended for Production)

```code
nvm install 24
npm install
npm install -g pm2@latest
npm run build
pm2 start build/server.js --name express-ts-api
pm2 save                                         # Save the process list
pm2 startup                                      # Auto-start on system boot (follow PM2's instructions)
pm2 log express-ts-api                           # to watch the log
```