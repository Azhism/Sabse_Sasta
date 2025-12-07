import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { RegisterRequest, LoginRequest } from '../types';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const data: RegisterRequest = req.body;
    console.log('Registration request:', { email: data.email, userType: data.userType, hasPassword: !!data.password, hasFullName: !!data.fullName });
    const result = await AuthService.register(data);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Registration error:', error.message);
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

router.post('/google', async (req: Request, res: Response) => {
  try {
    const { idToken, userType = 'customer' } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'idToken is required' });
    }

    const result = await AuthService.googleAuth(idToken, userType);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/request-reset', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const result = await AuthService.requestPasswordReset(email);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reset', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and newPassword are required' });

    const result = await AuthService.resetPassword(token, newPassword);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

