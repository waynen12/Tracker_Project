import React, { useEffect, useState, useContext } from "react";
import axios from 'axios';
import { API_ENDPOINTS } from "../apiConfig";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Box, Stack } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import { UserContext } from '../UserContext';

const HomePage = () => {
    const { user, token, login, logout } = useContext(UserContext);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
          // Send stored token to the server to log in the user automatically
          axios.post(API_ENDPOINTS.check_login, {
            token: token
          }, { withCredentials: true })
          .then(response => {
            console.log("User logged in automatically:", response.data);
            setIsLoggedIn(true);
          })
          .catch(error => {
            console.error("Error logging in automatically:", error);
            if (error.response && error.response.status === 401) {
              // Token has expired or is invalid, clear localStorage
              logout();
            }
            setIsLoggedIn(false);
          });
        }
      }, [token, logout]);
    
    return (
        <Box
            sx={{
                background: "linear-gradient(to right, #0A4B3E, #000000)",
                //backgroundcolor: "background.default",
                padding: 4,
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
            }}
        >
            {/* Welcome Message */}
            <Typography variant="h1" color="primary" gutterBottom>
                Satisfactory Tracker
            </Typography>

            {/* Navigation Buttons */}
            <Stack spacing={2} direction="row">
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => navigate("/data")}
                    disabled={!isLoggedIn}
                    sx={{
                        opacity: isLoggedIn ? 1 : 0.5,
                        cursor: isLoggedIn ? "pointer" : "not-allowed",
                    }}
                >
                    Manage Data
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => navigate("/dependencies")}
                    disabled={!isLoggedIn} // Disable if not logged in
                    sx={{
                        opacity: isLoggedIn ? 1 : 0.5,
                        cursor: isLoggedIn ? "pointer" : "not-allowed",
                    }}
                >
                    Dependencies
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => navigate("/tracker")}
                    disabled={!isLoggedIn} // Disable if not logged in
                    sx={{
                        opacity: isLoggedIn ? 1 : 0.5,
                        cursor: isLoggedIn ? "pointer" : "not-allowed",
                    }}
                >
                    Tracker
                </Button>
            </Stack>
        </Box>
    );
};

export default HomePage;
