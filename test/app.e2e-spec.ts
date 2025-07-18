import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/messages (GET)', () => {
    it('should return messages with pagination', () => {
      return request(app.getHttpServer())
        .get('/messages')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('messages');
          expect(res.body.data).toHaveProperty('total');
          expect(res.body.data).toHaveProperty('limit');
          expect(res.body.data).toHaveProperty('offset');
          expect(Array.isArray(res.body.data.messages)).toBe(true);
        });
    });

    it('should return messages for specific room', () => {
      return request(app.getHttpServer())
        .get('/messages?room=general&limit=5&offset=0')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.limit).toBe(5);
          expect(res.body.data.offset).toBe(0);
        });
    });
  });

  describe('/messages (POST)', () => {
    it('should create a new message', () => {
      const createMessageDto = {
        content: 'Test message from E2E test',
        userId: 'test-user',
        room: 'general',
      };

      return request(app.getHttpServer())
        .post('/messages')
        .send(createMessageDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.content).toBe(createMessageDto.content);
          expect(res.body.data.userId).toBe(createMessageDto.userId);
          expect(res.body.data.room).toBe(createMessageDto.room);
          expect(res.body.data).toHaveProperty('timestamp');
        });
    });

    it('should create message with default values', () => {
      const createMessageDto = {
        content: 'Test message without optional fields',
      };

      return request(app.getHttpServer())
        .post('/messages')
        .send(createMessageDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.userId).toBe('anonymous');
          expect(res.body.data.room).toBe('general');
        });
    });

    it('should validate required fields', () => {
      const invalidMessageDto = {
        userId: 'test-user',
        room: 'general',
      };

      return request(app.getHttpServer())
        .post('/messages')
        .send(invalidMessageDto)
        .expect(400);
    });
  });
});
