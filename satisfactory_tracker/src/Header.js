// Use this file to compare proposed changes before implementing them
import React, { useEffect, useContext, useState } from 'react';
import { ReactComponent as DiscordIcon } from './assets/icons/discord-icon.svg';
import { ReactComponent as GitHubIcon } from './assets/icons/github-mark-white.svg';
import { Box, Typography, Button, IconButton, Tooltip, Menu, MenuItem, Divider } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from './apiConfig';
import { UserContext } from './UserContext';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import HomeIcon from '@mui/icons-material/Home';
import TableViewIcon from '@mui/icons-material/TableView';
import TuneIcon from '@mui/icons-material/Tune';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import FavoriteIcon from '@mui/icons-material/Favorite'; // Contribute Icon
import ForumIcon from '@mui/icons-material/Forum'; // Discord Alternative
import CodeIcon from '@mui/icons-material/Code';
import { Comment, Discord, AttachMoney } from '@mui/icons-material';
import PaidIcon from '@mui/icons-material/Paid';
import { useTheme } from '@mui/material/styles';

axios.defaults.withCredentials = true;

const Header = () => {
    const theme = useTheme();
    const { user, logout } = React.useContext(UserContext); // Access user and logout function
    const navigate = useNavigate();

    // Dropdown state
    const [anchorEl, setAnchorEl] = useState(null);
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            logout();
            navigate('/login');
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    const handleLogin = () => {
        try {
            navigate('/login'); // Navigate to login page
        } catch (error) {
            console.error("Error during login:", error);
        }
    };

    return (
        <Box sx={{ 
            width: '100%',
            padding: theme.spacing(2),
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between', // Distribute items: banner on the left, user section on the right
            position: 'sticky',  // Makes it stay at the top
            top: 0,  // Sticks to the top
            zIndex: 1000,  // Ensures it stays above other content
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" // Optional: Adds a shadow for better visibility
        }}>
            {/* Left Section: Banner & Navigation Links */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, width: "fit-content" }}>  
                {/* Banner Image */}
                <Tooltip title="Satisfactory Tracker - Home">
                    <a href="/">
                        <img
                            src="images/Satisfactory_Tracker_Banner.png"
                            alt="Banner"
                            style={{ height: '60px', maxWidth: '100%' }}
                        />
                    </a>
                </Tooltip>
                {/* </Box> */}

                {/* Navigation Buttons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: "fit-content", width: "fit-content",  whiteSpace: "nowrap" }}>
                    <Button
                        variant="outlined"
                        fontSize="small"
                        startIcon={<HomeIcon />}
                        //color= {theme.palette.secondary.main}
                        component={Link}
                        to="/"
                        //onClick={handleHomeClick}
                        // sx={{
                        //     color: 'primary.contrastText',
                        //     backgroundColor: "secondary.main",
                        //     borderColor: 'primary.contrastText',
                        //     '&:hover': {
                        //         borderColor: 'primary.contrastText',
                        //     },
                        // }}
                    >
                        Home
                    </Button>
                    <Button
                        variant="outlined"
                        // fontSize="small"
                        startIcon={<TableViewIcon />}
                        // backgroundColor="secondary.main"
                        // color="secondary.contrastText"
                        component={Link}
                        to="/data"
                        //onClick={handleDataManagementClick}
                        // sx={{
                        //     color: 'primary.contrastText',
                        //     backgroundColor: "secondary.main",
                        //     borderColor: 'primary.contrastText',
                        //     '&:hover': {
                        //         borderColor: 'primary.contrastText',
                        //     },
                        // }}
                    >
                        Data Management
                    </Button>
                    <Button
                        variant="outlined"
                        fontSize="small"
                        startIcon={<TuneIcon />}
                        // backgroundColor="secondary.main"
                        // color="secondary.contrastText"
                        component={Link}
                        to="/dependencies"
                        //onClick={handleDependenciesClick}
                        // sx={{
                        //     color: 'primary.contrastText',
                        //     backgroundColor: "secondary.main",
                        //     borderColor: 'primary.contrastText',
                        //     '&:hover': {
                        //         borderColor: 'primary.contrastText',
                        //     },
                        // }}
                    >
                        Dependencies
                    </Button>
                    <Button
                        variant="outlined"
                        fontSize="small"
                        startIcon={<AssessmentIcon />}
                        // backgroundColor="secondary.main"
                        // color="secondary.contrastText"
                        component={Link}
                        to="/tracker"
                        //onClick={handleTrackerClick}
                        // sx={{
                        //     color: 'primary.contrastText',
                        //     backgroundColor: "secondary.main",
                        //     borderColor: 'primary.contrastText',
                        //     '&:hover': {
                        //         borderColor: 'primary.contrastText',
                        //     },
                        // }}
                    >
                        Tracker
                    </Button>
                </Box>
            </Box>

            {/* Right Section: User Info & Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: "fit-content" }}>


                {/* Settings & User Info */}
                {user ? (
                    <>
                        {/* // <Box */}
                        {/* //     sx={{
                    //         display: 'flex',
                    //         justifyContent: 'flex-end', // Align items to the right
                    //         alignItems: 'center',
                    //         gap: 0,
                    //     }}
                    // > */}
                        <Typography variant="h2">
                            Welcome, {user.username}!
                        </Typography>
                        {/* Contribute Dropdown */}
                        <Tooltip title="Contribute">
                            <IconButton onClick={handleMenuOpen} color="inherit">
                                <FavoriteIcon />
                            </IconButton>
                        </Tooltip>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                            {/* Section 1 - Help make the site better */}
                            <MenuItem disabled><b>Help make the site better</b></MenuItem>
                            <MenuItem component="a" href="https://your-discord-link.com" target="_blank">
                                <DiscordIcon style={{ width: 24, height: 24, marginRight: 8 }} />
                                Join Discord
                            </MenuItem>
                            <MenuItem component="a" href="https://github.com/your-repo" target="_blank">
                                <GitHubIcon
                                    style={{
                                        width: 24,
                                        height: 24,
                                        marginRight: 8,
                                        overflow: "visible",
                                        verticalAlign: "middle"
                                    }}
                                />
                                GitHub Repository
                            </MenuItem>
                            <MenuItem component="a" href="https://your-feedback-form.com" target="_blank">
                                <Comment sx={{ marginRight: 1 }} /> Leave a Comment
                            </MenuItem>

                            <Divider />

                            {/* Section 2 - Support me */}
                            <MenuItem disabled><b>Support me</b></MenuItem>
                            <MenuItem component="a" href="https://paypal.me/your-link" target="_blank">
                                <AttachMoney sx={{ marginRight: 1 }} /> Donate through PayPal
                            </MenuItem>
                            <MenuItem component="a" href="https://patreon.com/your-link" target="_blank">
                                <PaidIcon sx={{ marginRight: 1 }} /> Pledge on Patreon
                            </MenuItem>
                        </Menu>

                        <Tooltip title="Settings" arrow>
                            <IconButton
                                component={Link} to="/"
                                color="inherit"
                                aria-label="clickable-button"
                            // TODO: onClick={hanldeSettings}
                            >
                                <SettingsIcon />

                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Logout" arrow>
                            <IconButton
                                component={Link} to="/"
                                color="inherit"
                                aria-label="clickable-button"
                                onClick={handleLogout}
                            >
                                <LogoutIcon />

                            </IconButton>
                        </Tooltip>
                    </>
                ) : (
                    <>
                        <Typography variant="h3">Not Logged In</Typography>
                        <Button
                            variant="outlined"
                            startIcon={<LoginIcon />}
                            onClick={handleLogin}
                            // sx={{
                            //     color: 'primary.contrastText',
                            //     backgroundColor: 'secondary.main',
                            //     borderColor: 'primary.contrastText',
                            //     '&:hover': {
                            //         borderColor: 'primary.contrastText',
                            //     },
                            // }}
                        >
                            Login
                        </Button>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default Header;
