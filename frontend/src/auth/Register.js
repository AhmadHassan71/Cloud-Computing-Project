import React, { useState } from "react";
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";
import './Register.css';

// Import config
import config from '../config';

// Import shared components
import FormInput from '../components/shared/FormInput';
import Button from '../components/shared/Button';
import Alert from '../components/shared/Alert';
import Card from '../components/shared/Card';

const Register = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [generalError, setGeneralError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Reset errors
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');
        setGeneralError('');
        
        // Form validation
        let isValid = true;
        
        if (!email) {
            setEmailError('Email is required');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Please enter a valid email address');
            isValid = false;
        }
        
        if (!password) {
            setPasswordError('Password is required');
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            isValid = false;
        }
        
        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            isValid = false;
        }
        
        if (!isValid) return;
        
        setIsLoading(true);
        
        try {
            const response = await axios.post(`${config.apiUrl}${config.endpoints.auth.register}`, {
                email,
                password
            });
            
            // Show success message and navigate to login
            navigate('/', { state: { 
                registrationSuccess: true, 
                message: 'Registration successful! You can now log in with your credentials.' 
            }});
            
        } catch (error) {
            if (error.response) {
                // Server responded with an error
                if (error.response.data.messageEmail) {
                    setEmailError(error.response.data.messageEmail);
                }
                if (error.response.data.messagePw) {
                    setPasswordError(error.response.data.messagePw);
                }
                if (error.response.data.message) {
                    setGeneralError(error.response.data.message);
                }
            } else {
                // Network error or other issues
                setGeneralError('An error occurred. Please try again later.');
                console.error('Registration error:', error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-image-container">
                <div className="register-content">
                    <div className="brand-name">
                        <h1>Espresso Elegance</h1>
                        <p>Premium Coffee Shop Management</p>
                    </div>
                </div>
            </div>
            
            <div className="register-form-container">
                <div className="register-form-content">
                    <Card className="register-card">
                        <h2 className="register-title">Create an Account</h2>
                        <p className="register-subtitle">Join Espresso Elegance Management System</p>
                        
                        {generalError && (
                            <Alert 
                                type="error" 
                                message={generalError}
                            />
                        )}
                        
                        <form onSubmit={handleSubmit} className="register-form">
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
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={passwordError}
                                helpText="Password must be at least 6 characters"
                                required
                            />
                            
                            <FormInput
                                label="Confirm Password"
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                error={confirmPasswordError}
                                required
                            />
                            
                            <Button 
                                type="submit" 
                                variant="primary" 
                                fullWidth
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </Button>
                            
                            <div className="register-footer">
                                <p>
                                    Already have an account? <Link to="/">Sign in</Link>
                                </p>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Register;
