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
import FlagIcon from '@mui/icons-material/Flag';


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
                alignSelf: "center",
                justifyContent: "center",
                gap: theme.spacing(4),
                textAlign: "center",
                // maxWidth: "800px",
            }}
        >
            {/* 📖 About Section */}
            <Box sx={{ maxWidth: "100vh" }}>
                <Typography variant="h2" gutterBottom>
                    What is Satisfactory Tracker?
                </Typography>
                <Typography variant="body1">
                    Satisfactory Tracker helps you optimize and manage your factory production by providing your actual progress towards your goals.
                    <br /><br />
                    - Do you want detailed reports on your factory's production? You've come to the right place!
                    <br />
                    - Are you looking for a way to track your progress and see how close you are to your goals? You're in the right place!
                    <br />
                    - Would you like to export your factory data and use Excel to analyse it? You can do that here!
                    <br />
                    - Do you want calculators, planners and interactive maps?                    
                    err... you can't get those here, but here are some excellent sites where you can!:
                    <br />
                    <Link href="https://satisfactory-calculator.com/en/production-planner" target="_blank" color="primary" underline="hover">
                        Satisfactory Calculator
                    </Link>
                    <br />
                    <Link href="https://www.satisfactorytools.com/1.0/" target="_blank" color="primary" underline="hover">
                        Satisfactory Tools
                    </Link> 
                </Typography>
            </Box>

            {/* 🎯 Key Features */}
            <Grid2 container spacing={4} justifyContent="center" >
                {[
                    {
                        icon: <FlagIcon fontSize="large" />,
                        title: "Set your Goals",
                        description: "Choose the parts you want to make, and select any alternative recipes you want to use. \n \nGet dependancy information for any part to help you plan your factory.",
                    },
                    {
                        icon: <TrackChangesIcon fontSize="large" />,
                        title: "Track your Progress",
                        description: "Upload your save file to get detailed reports about your factory. \n \nSee how your actual production compares to your target production for each part.",
                    },
                    {
                        icon: <InsightsIcon fontSize="large" />,
                        title: "Gain Insights",
                        description: "Understand how each part of your factory interacts and find the bottlenecks using the Conveyor and Pipe Network reports. \n \nGain insight into your factory configuration and the parts you're making using the Machine report.",
                    },
                ].map((feature, index) => (
                    <Grid2 item xs={12} sm={4} key={index}>
                        <Card sx={{ backgroundColor: theme.palette.secondary.main }}>
                            <CardContent sx={{ color: theme.palette.primary.contrastText }}>
                                {feature.icon}
                                <Typography variant="h5">{feature.title}</Typography>
                                <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                                    {feature.description}
                                </Typography>
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
                <Box sx={{ maxWidth: "600px", marginTop: theme.spacing(4), alignSelf: "center", textAlign: "center" }}>
                    <Typography variant="h4" component="span">
                        1️⃣ Create an Account <br /> <br />
                    </Typography>
                    {/* <Typography variant="body2">
                        <Box component="span" sx={{ pl: 8 }}>– Create an account and log in.</Box> <br />  <br />
                    </Typography> */}
                    <Typography variant="h4" component="span">
                        2️⃣ Add Parts and Recipes <br /> <br />
                    </Typography>
                    {/* <Typography variant="body2">
                        <Box component="span" sx={{ pl: 8 }}>– Choose the parts you want to track & any alternate recipes you want to use.</Box> <br />  <br />
                    </Typography> */}
                    <Typography variant="h4" component="span">
                        3️⃣ Use your Tracker <br /> <br />
                    </Typography>
                    {/* <Typography variant="body2">
                        <Box component="span" sx={{ pl: 8 }}>– Upload your save file to see detailed reports about your factory.</Box> <br />  <br />                        
                    </Typography> */}
                </Box>
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
                        <FavoriteIcon sx={{ color: "pink", fontSize: 30 }} />
                        <Typography variant="h3">Contribute</Typography>
                        <Typography variant="body2">
                            Want to support my work and help cover the costs of running the server? <br />
                            Check out the PayPal and Patreon links in the menu on the top left.
                            <br /><br />
                            You can also join the Satisfactory Tracker Discord and explore the GitHub project.
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
                                <StarIcon sx={{ color: "gold", fontSize: 30 }} />
                                <Typography variant="body2">
                                    "I had no idea I had so many mk1 conveyor belts I hadn't upgraded. Thanks, Satisfactory Tracker!"
                                </Typography>
                                <Typography variant="caption">- Future User</Typography>
                            </CardContent>
                        </Card>
                    </Grid2>
                    <Grid2 item xs={12} sm={6}>
                        <Card sx={{ backgroundColor: theme.palette.secondary.main }}>
                            <CardContent sx={{ color: theme.palette.primary.contrastText }}>
                                <StarIcon sx={{ color: "gold", fontSize: 30 }} />
                                <Typography variant="body2">
                                    "Satisfactory Tracker completely changed my life!"
                                </Typography>
                                <Typography variant="caption">- Future User</Typography>
                            </CardContent>
                        </Card>
                    </Grid2>
                    <Grid2 item xs={12} sm={6}>
                        <Card sx={{ backgroundColor: theme.palette.secondary.main }}>
                            <CardContent sx={{ color: theme.palette.primary.contrastText }}>
                                <StarIcon sx={{ color: "gold", fontSize: 30 }} />
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
