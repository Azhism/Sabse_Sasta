import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const tokenFromQuery = searchParams.get('token') || '';
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(tokenFromQuery);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.requestPasswordReset({ email });
      toast({ title: 'Reset requested', description: 'Check console or your email for the reset link.' });
      setEmail('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Request failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const submitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.resetPassword({ token, newPassword });
      toast({ title: 'Password reset', description: 'You can now login with your new password.' });
      navigate('/auth');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Reset failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-6">
          {!token ? (
            <form onSubmit={requestReset} className="space-y-4">
              <h3 className="text-lg font-semibold">Request Password Reset</h3>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</Button>
            </form>
          ) : (
            <form onSubmit={submitNewPassword} className="space-y-4">
              <h3 className="text-lg font-semibold">Set a New Password</h3>
              <div>
                <Label htmlFor="token">Token</Label>
                <Input id="token" value={token} onChange={(e) => setToken(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Saving...' : 'Reset password'}</Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
