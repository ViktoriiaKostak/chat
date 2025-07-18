# Вирішення проблем деплою

## Проблема: "npm run build" не завершується успішно

### Рішення 1: Використання multi-stage Dockerfile

Якщо основний Dockerfile не працює, використовуйте `Dockerfile.multi`:

```bash
# В docker-compose.yml змініть:
dockerfile: Dockerfile.multi
target: production
```

### Рішення 2: Використання спрощеного Dockerfile

Якщо є проблеми з NestJS CLI, використовуйте `Dockerfile.simple`:

```bash
# В docker-compose.yml змініть:
dockerfile: Dockerfile.simple
```

### Рішення 3: Локальна збірка

```bash
# Збудуйте локально
npm install
npm run build

# Перевірте чи створився dist/src/main.js
ls -la dist/src/
```

## Проблема: Відсутні змінні середовища

### Рішення:

1. **Створіть .env файл**:
```bash
cp env.example .env
```

2. **Налаштуйте змінні для Railway**:
```env
NODE_ENV=production
PORT=3000
DATABASE_HOST=your-mysql-host
DATABASE_PORT=3306
DATABASE_USERNAME=your-mysql-username
DATABASE_PASSWORD=your-mysql-password
DATABASE_NAME=your-mysql-database
```

## Проблема: База даних не підключається

### Рішення:

1. **Перевірте змінні середовища**
2. **Переконайтеся, що база даних запущена**
3. **Перевірте мережеві налаштування**

## Проблема: Порт зайнятий

### Рішення:

```bash
# Перевірте що використовує порт 3000
lsof -i :3000

# Зупиніть процес або змініть порт в docker-compose.yml
```

## Проблема: Docker не може збудувати образ

### Рішення:

```bash
# Очистіть Docker кеш
docker system prune -a

# Перебудуйте образ
docker compose build --no-cache

# Або використовуйте спрощений Dockerfile
docker build -f Dockerfile.simple -t chat-app .
```

## Проблема: AWS Lambda не працює

### Рішення:

AWS Lambda є опціональним. Додаток працюватиме без нього. Просто не налаштовуйте AWS змінні середовища.

## Корисні команди для дебагу

```bash
# Переглянути логи
docker compose logs -f app

# Переглянути логи бази даних
docker compose logs -f mysql

# Зайти в контейнер
docker compose exec app sh

# Перевірити змінні середовища в контейнері
docker compose exec app env

# Перезапустити сервіси
docker compose restart
``` 