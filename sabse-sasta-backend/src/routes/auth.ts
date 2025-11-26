import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { RegisterRequest, LoginRequest } from '../types';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const data: RegisterRequest = req.body;
    const result = await AuthService.register(data);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const data: LoginRequest = req.body;
    const result = await AuthService.login(data);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

export default router;

