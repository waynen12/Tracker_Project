import React, { useState, useContext } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from "../apiConfig";
import { UserContext } from '../context/UserContext'; // Import the UserContext
import { useTheme } from '@mui/material/styles';

axios.defaults.withCredentials = true;

const LoginPage = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(UserContext); // Access the login function from the context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(API_ENDPOINTS.login, { email, password });

      // Extract user information from the response
      const userInfo = response.data.user;
      const authToken = response.data.token;

      // Update global user state using UserContext
      login(userInfo, authToken);

      // Navigate to the home page after successful login
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);

      // Redirect to change password page if the user must change their password
      if (error.response?.status === 403 && error.response?.data?.must_change_password) {
          navigate(`/change-password?user_id=${error.response.data.user_id}`);
          return;
      }

      setError(error.response?.data?.message || 'Login failed. Please try again.');
  } finally {
      setIsLoading(false);
  }
};


  return (
    <Box
      sx={{
        background: theme.palette.background, //'linear-gradient(to right, #0A4B3E, #000000)',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
      }}
    >
      <Box
        sx={{
          backgroundColor: 'background.paper',
          padding: 4,
          borderRadius: 2,
          boxShadow: 3,
          width: '100%',
          maxWidth: 400,
        }}
      >
        <Typography variant="h1" color="primary" align="center" gutterBottom>
          Login
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          Sign-ups are currently disabled.
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          If you would like to become a tester, use the <strong>'Request Tester Access'</strong> button on the main page or from the menu on the top left.
        </Typography>
        {/* <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          Don’t have an account?{' '} */}
          {/* <Button variant="text" onClick={() => navigate('/signup')} color="secondary">
            Sign up (Disabled)
          </Button> */}
        {/* </Typography> */}
      </Box>
    </Box>
  );
};

export default LoginPage;
