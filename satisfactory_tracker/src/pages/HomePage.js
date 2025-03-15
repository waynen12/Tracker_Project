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
import TesterRequestModal from "./TesterRequestModal";




const HomePage = () => {
    const theme = useTheme();
    const { user, token, login, logout } = useContext(UserContext);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const [testerModalOpen, setTesterModalOpen] = useState(false);
    const [testerCount, setTesterCount] = useState(0);
    const [isRegistrationOpen, setRegistrationStatus] = useState(false);



    useEffect(() => {
        if (token) {
            axios.post(API_ENDPOINTS.check_login, { token }, { withCredentials: true })
                .then(response => {
                    // console.log("User logged in automatically:", response.data);
                    setIsLoggedIn(true);
                })
                .catch(error => {
                    // console.error("Error logging in automatically:", error);
                    if (error.response?.status === 401) {
                        logout();
                    }
                    setIsLoggedIn(false);
                });
        }
    }, [token, logout]);

    useEffect(() => {
        const fetchAdminSettings = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.get_admin_setting("test_settings", "registration_button", "boolean"));
                setRegistrationStatus(response.data.value === "true" || response.data.value === true);

            } catch (error) {
                console.error("Error fetching admin settings:", error);
            }
        };
        fetchAdminSettings();
    }, []);

    useEffect(() => {
        // Fetch the total number of tester applications
        const fetchTesterCount = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.tester_count);
                setTesterCount(response.data.count || 0);
            } catch (error) {
                console.error("Error fetching tester count:", error);
            }
        };
        fetchTesterCount();
    }, []);

    return (
        <Box
            sx={{
                background: theme.palette.background,
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
            {/* 🚧 Testing Phase Notice */}
            <Card sx={{ backgroundColor: theme.palette.secondary.main, padding: theme.spacing(2), maxWidth: "800px" }}>
                {isRegistrationOpen  ? (
                    <CardContent sx={{ color: theme.palette.primary.contrastText }}>
                        <Typography variant="h1" gutterBottom>
                            🚧 Closed Testing Phase 🚧
                        </Typography>
                        <Typography variant="body1">
                            I'm be looking for a small number of dedicated Satisfactory players to help in a closed Beta test.
                            <br />
                            If you’d like to participate, register below!
                            <br />
                            You'll get an email if you've been selected when the testing phase begins.
                        </Typography>
                    </CardContent>
                ) : (
                    <CardContent sx={{ color: theme.palette.primary.contrastText }}>
                        <Typography variant="h1" gutterBottom>
                            🚧 Closed Testing Phase 🚧
                        </Typography>
                        <Typography variant="body1">
                            We are currently conducting closed Beta testing.
                            <br />
                            Tester registration is closed.
                            <br />
                            Keep an eye out for the public release!
                        </Typography>
                    </CardContent>
                )}
                <Button
                    variant="contained"
                    color="#242424"
                    sx={{ marginTop: theme.spacing(2), backgroundColor: "#000080" }}
                    onClick={() => setTesterModalOpen(true)}
                    disabled={!isRegistrationOpen}
                >
                    Register to become a tester
                </Button>

                {user?.role === "admin" && (
                    <>
                        <Typography variant="body2" sx={{ marginTop: theme.spacing(1) }}>
                            {testerCount} testers have applied so far!
                        </Typography>
                    </>
                )}            
        </Card>

            {/* 🔍 What is Satisfactory Tracker? */ }
    <Box sx={{ maxWidth: "100vh" }}>
        <Typography variant="h2" gutterBottom>
            What is Satisfactory Tracker?
        </Typography>
        <Typography variant="body1">
            Satisfactory Tracker helps you optimize and manage your factory production by providing your actual progress towards your goals.
            <br /><br />
            - Get <strong> detailed production reports</strong> to analyze your factory's performance.
            <br />
            - <strong>Track your progress</strong> and compare actual vs. target production.
            <br />
            - Export your factory data to <strong>Excel for advanced analysis.</strong>.
            <br />
            - View <strong>conveyor and pipe networks</strong> to identify bottlenecks.
        </Typography>
    </Box>

    {/* 🎯 Key Features */ }
    <Grid2 container spacing={4} justifyContent="center">
        {[
            {
                icon: <FlagIcon fontSize="large" />,
                title: "Set your Goals",
                description: "Set the alternative recipes you want to use. Track your own list of parts or set a Project Assembly Phase as your goal.\n \n Use dependency breakdowns of parts to help you plan.",
            },
            {
                icon: <TrackChangesIcon fontSize="large" />,
                title: "Track your Progress",
                description: "Upload your save file to get detailed reports on your factory’s performance.\n \nSee how your actual production compares to your target production for each part.",
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

    {/* 🎬 Call to Action */ }
    <Box sx={{ maxWidth: "800px", marginTop: theme.spacing(4) }}>

        {user ? (
            <Typography variant="body1">
                Welcome, {user.username}!
            </Typography>
        ) : (
            <Typography variant="body1">
                Want to help? Register to become a tester!
            </Typography>
        )}
    </Box>

    {/* 📝 Tester Request Modal */ }
    <TesterRequestModal open={testerModalOpen} onClose={() => setTesterModalOpen(false)} />
        </Box >
    );
};

export default HomePage;
