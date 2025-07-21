# Деплой чат-додатку

Цей проект можна задеплоїти на різні хмарні платформи. Виберіть одну з наведених нижче опцій:

## 🚀 Render

1. **Зареєструйтесь на Render**: https://render.com
2. **Підключіть GitHub репозиторій**
3. **Створіть новий Web Service**
4. **Налаштування**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
   - Environment: `Node`
5. **Додайте змінні середовища**:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_NAME`

## 🚀 Heroku

1. **Встановіть Heroku CLI**
2. **Зареєструйтесь на Heroku**: https://heroku.com
3. **Виконайте команди**:
```bash
heroku create your-chat-app
heroku config:set NODE_ENV=production
heroku config:set DATABASE_HOST=your-db-host
heroku config:set DATABASE_PORT=3306
heroku config:set DATABASE_USERNAME=your-username
heroku config:set DATABASE_PASSWORD=your-password
heroku config:set DATABASE_NAME=your-database
git push heroku main
```

## 🚀 Vercel

1. **Зареєструйтесь на Vercel**: https://vercel.com
2. **Підключіть GitHub репозиторій**
3. **Налаштуйте змінні середовища в Vercel Dashboard**
4. **Деплой відбудеться автоматично**

## 🚀 DigitalOcean App Platform

1. **Зареєструйтесь на DigitalOcean**: https://digitalocean.com
2. **Створіть новий App**
3. **Підключіть GitHub репозиторій**
4. **Налаштуйте змінні середовища**
5. **Створіть базу даних MySQL**

## 🚀 AWS Elastic Beanstalk

1. **Встановіть AWS CLI та EB CLI**
2. **Налаштуйте AWS credentials**
3. **Виконайте команди**:
```bash
eb init
eb create production
eb deploy
```

## 🚀 Google Cloud Run

1. **Встановіть Google Cloud SDK**
2. **Налаштуйте проект**:
```bash
gcloud config set project your-project-id
gcloud builds submit --tag gcr.io/your-project-id/chat-app
gcloud run deploy chat-app --image gcr.io/your-project-id/chat-app --platform managed
```

## 🔧 Загальні налаштування

### Змінні середовища

Для всіх платформ потрібно налаштувати:

```env
NODE_ENV=production
PORT=3000
DATABASE_HOST=your-database-host
DATABASE_PORT=3306
DATABASE_USERNAME=your-database-username
DATABASE_PASSWORD=your-database-password
DATABASE_NAME=your-database-name
```

### База даних

Рекомендується використовувати:
- **PlanetScale** (MySQL)
- **Supabase** (PostgreSQL)
- **AWS RDS** (MySQL/PostgreSQL)
- **Google Cloud SQL** (MySQL/PostgreSQL)

### Health Check

Всі платформи використовують endpoint `/health` для перевірки стану додатку.

## 📝 Після деплою

1. **Перевірте health check**: `https://your-app-url/health`
2. **Тестуйте API**: `https://your-app-url/messages`
3. **Налаштуйте WebSocket підключення** для чату

## 🔍 Моніторинг

- Перевіряйте логи додатку
- Налаштуйте алерти для помилок
- Моніторте використання ресурсів 