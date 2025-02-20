import React, { useEffect, useState, useContext } from "react";
import { Box, Typography, Button, Stack, Grid2, Card, CardContent } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from "../apiConfig";
import { UserContext } from '../context/UserContext';
import { useTheme } from '@mui/material/styles';
import LoginIcon from "@mui/icons-material/Login";
import BuildIcon from "@mui/icons-material/Build";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import InsightsIcon from "@mui/icons-material/Insights";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import StarIcon from "@mui/icons-material/Star";
import FavoriteIcon from "@mui/icons-material/Favorite";


const HomePage = () => {
    const theme = useTheme();
    const { user, token, login, logout } = useContext(UserContext);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            axios.post(API_ENDPOINTS.check_login, { token }, { withCredentials: true })
                .then(response => {
                    console.log("User logged in automatically:", response.data);
                    setIsLoggedIn(true);
                })
                .catch(error => {
                    console.error("Error logging in automatically:", error);
                    if (error.response?.status === 401) {
                        logout();
                    }
                    setIsLoggedIn(false);
                });
        }
    }, [token, logout]);

    return (
        <Box
            sx={{
                background: theme.palette.background, //`linear-gradient(to right, ${theme.palette.background.linearGradientLeft}, ${theme.palette.background.linearGradientRight})`,
                padding: theme.spacing(4),
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: theme.spacing(4),
                textAlign: "center",
            }}
        >
            {/* 📖 About Section */}
            <Box sx={{ maxWidth: "800px" }}>
                <Typography variant="h2" gutterBottom>
                    What is Satisfactory Tracker?
                </Typography>
                <Typography variant="body1">
                    Satisfactory Tracker helps you optimize and manage your factory production by providing
                    your actual progress towards your goals. Choose the parts you want to make, select any alternative recipes
                    you want to use, and upload your save file to get detailed reports on your factory's efficiency.
                </Typography>
            </Box>

            {/* 🎯 Key Features */}
            <Grid2 container spacing={4} justifyContent="center">
                {[
                    { icon: <BuildIcon fontSize="large" />, title: "Manage Data", description: "Organize all your factory inputs, outputs, and machines in one place." },
                    { icon: <TrackChangesIcon fontSize="large" />, title: "Track Dependencies", description: "Understand how each part of your factory interacts and where optimizations can be made." },
                    { icon: <InsightsIcon fontSize="large" />, title: "Gain Insights", description: "Use detailed reports and dependency trees to maximize efficiency." },
                ].map((feature, index) => (
                    <Grid2 item xs={12} sm={4} key={index}>
                        <Card sx={{ backgroundColor: theme.palette.secondary.main }}>
                            <CardContent sx={{ color: theme.palette.primary.contrastText }}>
                                {feature.icon}
                                <Typography variant="h5">{feature.title}</Typography>
                                <Typography variant="body2">{feature.description}</Typography>
                        </CardContent>
                    </Card>
                </Grid2>                
                ))}
            </Grid2>

            {/* 📸 Screenshot or Image Section */}
            <Box sx={{ maxWidth: "800px", marginTop: theme.spacing(4) }}>
                <Typography variant="h3" gutterBottom>
                    See It in Action
                </Typography>
                <img
                    src="images/screenshot.png"
                    alt="App Screenshot"
                    style={{
                        width: "100%",
                        borderRadius: theme.shape.borderRadius,
                        boxShadow: `0 4px 10px ${theme.palette.primary.contrastText}`,
                    }}
                />
            </Box>

            {/* 🎬 Quick Demo / Getting Started Guide */}
            <Box sx={{ maxWidth: "800px", marginTop: theme.spacing(4) }}>
                <Typography variant="h3" gutterBottom>
                    Get Started in 3 Easy Steps
                </Typography>
                <Typography variant="body1">
                    1️⃣ **Sign Up & Log In** – Create an account and log in to start tracking. <br />
                    2️⃣ **Manage Your Data** – Add parts, recipes, and track dependencies. <br />
                    3️⃣ **Optimize & Improve** – Use reports to optimize your factory layout.
                </Typography>
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<PlayCircleOutlineIcon />}
                    sx={{ marginTop: theme.spacing(2) }}
                    onClick={() => window.open("https://your-demo-video-link.com", "_blank")}
                >
                    Watch Demo
                </Button>
            </Box>

            {/* 💙 Contribute Card */}
            <Grid2 item xs={12} sm={4}>
                <Card sx={{ backgroundColor: theme.palette.secondary.main }}>
                    <CardContent sx={{ color: theme.palette.primary.contrastText }}>
                        <FavoriteIcon sx={{ color: "pink", fontSize:30 }} />
                        <Typography variant="h5">Contribute</Typography>
                        <Typography variant="body2">
                            Want to support my work and help cover the costs of running the server?
                            Check out the **PayPal** or **Patreon** links in the top right.
                            <br /><br />
                            You can also join the **Satisfactory Tracker Discord** and explore the **GitHub project**.
                        </Typography>
                    </CardContent>
                </Card>
            </Grid2>

            {/* 💡 Testimonials (Future Feature) */}
            <Box sx={{ maxWidth: "800px", marginTop: theme.spacing(4) }}>
            <Typography variant="h3" gutterBottom>
                    What Users Say (Coming Soon)
                </Typography>
                <Grid2 container spacing={4} justifyContent="center">
                    <Grid2 item xs={12} sm={6}>
                    <Card sx={{ backgroundColor: theme.palette.secondary.main }}>
                        <CardContent sx={{ color: theme.palette.primary.contrastText }}>    
                            <StarIcon sx={{ color: "gold", fontSize:30 }} />
                            <Typography variant="body2">
                                "Satisfactory Tracker completely changed how I my life!"
                            </Typography>
                            <Typography variant="caption">- Future User</Typography>
                        </CardContent>
                        </Card>
                    </Grid2>
                    <Grid2 item xs={12} sm={6}>
                    <Card sx={{ backgroundColor: theme.palette.secondary.main }}>
                    <CardContent sx={{ color: theme.palette.primary.contrastText }}> 
                            <StarIcon sx={{ color: "gold", fontSize:30 }} />
                            <Typography variant="body2">
                                "The best tool for tracking progress in Satisfactory."
                            </Typography>
                            <Typography variant="caption">- Another Future User</Typography>
                            </CardContent>
                        </Card>
                    </Grid2>                    
                </Grid2>
            </Box>

            {/* 📩 Call to Action */}
            {!isLoggedIn && (
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<LoginIcon />}
                    onClick={() => navigate("/login")}
                >
                    Get Started Now!
                </Button>
            )}
        </Box>
    );
};

export default HomePage;
