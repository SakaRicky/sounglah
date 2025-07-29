import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import classes from './Login.module.scss';
import { Loader } from '@mantine/core';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access
  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(username, password);
      
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      console.log("🚀 ~ handleSubmit ~ err:", err);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.loginPageBg}>
      <div className={classes.card}>
        <h1 className={classes.title}>Log in</h1>
        {error && (
          <div className={classes.error}>{error}</div>
        )}
        <form onSubmit={handleSubmit} className={classes.form} autoComplete="on">
          <div className={classes.formGroup}>
            <label htmlFor="username" className={classes.label}>
              Email
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={classes.input}
              required
              autoComplete="username"
              disabled={loading}
            />
          </div>
          <div className={classes.formGroup}>
            <label htmlFor="password" className={classes.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={classes.input}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className={classes.button}
            disabled={loading}
          >
            {loading ? <Loader size={24} color="white" /> : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
} 