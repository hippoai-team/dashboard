import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from 'react-toastify'; 
import axios from "axios";
import "../styles/AuthStyles.css";
import { useAuth } from "../context/auth";
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import LoadingButton from '@mui/lab/LoadingButton';


function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://pendium.health/">
        Pendium Health
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();
const Login = () => {
    const navigate = useNavigate();
    const [auth, setAuth] = useAuth();
    const [loading, setLoading] = useState(false);

    const location = useLocation();

    useEffect(() => {
        console.log(auth);
        if(auth.isAuthenticated) {
            navigate('/dashboard');
        }
    }, [auth, navigate]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const rememberMe = formData.get('rememberMe');
        
        
        
        
        try {
            const res = await axios.post('https://dashboard-api-woad.vercel.app/admin/login', {
                email,
                password,
                rememberMe
                
            });

            if(res && res.data.success) {
                toast.success(res.data && res.data.message);
                setAuth({
                    ...auth,
                    user: res.data.user,
                    token: res.data.token,
                    isAuthenticated: true
                })
                localStorage.setItem("hippo_admin_auth", JSON.stringify(res.data));
                setLoading(false);
                navigate(location.state || '/dashboard');
            } else {
                toast.error(res.data.message);
                setLoading(false);
            }

        } catch (error) {
            console.log(error);
            toast.error('something went wrong: ' + error.response.data.message);
            setLoading(false);
        }
    }


    return (
        <ThemeProvider theme={defaultTheme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <img
          src="/hippo_lock_o.png"
          alt="Hippo"
          width={50}
          height={60}
          onClick={() => window.location.href="/" }
          style = {{cursor: 'pointer'}}
        />
           
            <Typography component="h1" variant="h5">
              Admin Panel Login
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <FormControlLabel
              id = 'rememberMe'
              name='rememberMe'
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <LoadingButton
              type="submit"
              fullWidth
              loading={loading}
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </LoadingButton>
            
            </Box>
            </Box>
            <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>

        
    );
};

export default Login;
