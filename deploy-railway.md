# Деплой на Railway

## Швидкий старт

1. **Зареєструйтесь на Railway**: https://railway.app
2. **Натисніть "Start a New Project"**
3. **Виберіть "Deploy from GitHub repo"**
4. **Виберіть ваш репозиторій**
5. **Railway автоматично виявить Dockerfile і задеплоїть**

## Налаштування бази даних

1. **Додайте MySQL базу даних**:
   - Натисніть "New Service" → "Database" → "MySQL"
   - Railway автоматично створить змінні середовища

2. **Налаштуйте змінні середовища**:
   - Перейдіть в налаштування вашого додатку
   - В розділі "Variables" додайте:

```env
NODE_ENV=production
PORT=3000
DATABASE_HOST=your-mysql-host
DATABASE_PORT=3306
DATABASE_USERNAME=your-mysql-username
DATABASE_PASSWORD=your-mysql-password
DATABASE_NAME=your-mysql-database
```

## Перевірка роботи

Після деплою перевірте:

- **Головна сторінка**: `https://your-app-name.railway.app`
- **Health check**: `https://your-app-name.railway.app/health`
- **API**: `https://your-app-name.railway.app/messages`

## Логи та дебаг

- Перейдіть в розділ "Deployments" для перегляду логів
- Якщо є помилки, перевірте змінні середовища
- Переконайтеся, що база даних правильно налаштована

## Оновлення

Railway автоматично деплоїть нові коміти з GitHub. Просто запушіть зміни:

```bash
git add .
git commit -m "Update app"
git push origin main
``` 