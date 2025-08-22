import request from 'supertest';
import express from 'express';
import { validateZod, registerSchema } from '../src/utils/zodValidator';

const app = express();
app.use(express.json());
app.post('/register', validateZod(registerSchema), (req, res) => {
  res.status(200).json({ message: 'Valid!' });
});

describe('POST /register Zod validation', () => {
  it('should return 200 for valid input', async () => {
    const res = await request(app).post('/register').send({
      email: 'test@example.com',
      mobile: '12345678',
      password: 'password',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Valid!');
  });

  it('should return 400 for invalid input', async () => {
    const res = await request(app).post('/register').send({
      email: 'not-an-email',
      mobile: '123',
      password: 'pw',
      firstName: '',
      lastName: '',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBeDefined();
  });
});
