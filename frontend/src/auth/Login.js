import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";
import './Login.css';

// Import config
import config from '../config';

// Import shared components
import FormInput from '../components/shared/FormInput';
import Button from '../components/shared/Button';
import Alert from '../components/shared/Alert';
import Card from '../components/shared/Card';

const Login = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [generalError, setGeneralError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showTestingOptions, setShowTestingOptions] = useState(false);

    // Initialize with testing credentials if in testing mode
    useEffect(() => {
        if (config.testing.enabled) {
            setShowTestingOptions(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Reset errors
        setEmailError('');
        setPasswordError('');
        setGeneralError('');
        
        // Form validation
        let isValid = true;
        if (!email) {
            setEmailError('Email is required');
            isValid = false;
        }
        if (!password) {
            setPasswordError('Password is required');
            isValid = false;
        }
        
        if (!isValid) return;
        
        setIsLoading(true);
        
        try {
            const response = await axios.post(`${config.apiUrl}${config.endpoints.auth.login}`, {
                email,
                password
            });
            
            // Store token in localStorage for persistent auth
            localStorage.setItem('token', response.data.token);
            
            // Update authentication state
            if (setIsAuthenticated) {
                setIsAuthenticated(true);
            }
            
            // Redirect to items management page
            navigate('/allItems');
            
        } catch (error) {
            if (error.response) {
                // Server responded with an error
                setEmailError(error.response.data.messageEmail || '');
                setPasswordError(error.response.data.messagePw || '');
                setGeneralError(error.response.data.message || '');
            } else {
                // Network error or other issues
                setGeneralError('An error occurred. Please try again later.');
                console.error('Login error:', error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestMode = () => {
        // Use testing credentials
        setEmail(config.testing.credentials.email);
        setPassword(config.testing.credentials.password);
    };

    const handleUITestMode = () => {
        // Bypass backend authentication for UI testing only
        localStorage.setItem('token', 'test-token-for-ui-mode');
        
        // Update authentication state
        if (setIsAuthenticated) {
            setIsAuthenticated(true);
        }
        
        // Redirect to items management page
        navigate('/allItems');
    };

    return (
        <div className="login-page">
            <div className="login-image-container">
                <div className="login-content">
                    <div className="brand-name">
                        <h1>Espresso Elegance</h1>
                        <p>Premium Coffee Shop Management</p>
                    </div>
                </div>
            </div>
            
            <div className="login-form-container">
                <div className="login-form-content">
                    <Card className="login-card">
                        <h2 className="login-title">Welcome Back</h2>
                        <p className="login-subtitle">Sign in to your account</p>
                        
                        {generalError && (
                            <Alert 
                                type="error" 
                                message={generalError} 
                            />
                        )}
                        
                        <form onSubmit={handleSubmit} className="login-form">
                            <FormInput
                                label="Email Address"
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                error={emailError}
                                required
                            />
                            
                            <FormInput
                                label="Password"
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={passwordError}
                                required
                            />
                            
                            <Button 
                                type="submit" 
                                variant="primary" 
                                fullWidth
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </Button>
                            
                            <div className="login-footer">
                                <p>
                                    Don't have an account? <Link to="/register">Sign up</Link>
                                </p>
                            </div>
                        </form>
                        
                        {showTestingOptions && (
                            <div className="testing-options">
                                <h3>Testing Options</h3>
                                <p className="testing-notice">These options are for development and testing only</p>
                                
                                <div className="testing-buttons">
                                    <Button 
                                        variant="secondary" 
                                        size="small"
                                        onClick={handleTestMode}
                                    >
                                        Use Test Credentials
                                    </Button>
                                    
                                    <Button 
                                        variant="secondary" 
                                        size="small"
                                        onClick={handleUITestMode}
                                    >
                                        UI Test Mode (Skip Auth)
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Login;
