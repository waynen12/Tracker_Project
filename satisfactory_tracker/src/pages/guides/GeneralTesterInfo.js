import React from "react";
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";

const GeneralTesterInfo = () => {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        🛠️ General Tester Information
      </Typography>
      
      <Typography variant="h6" gutterBottom>
        🔹 What We Need You to Test
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="✅ Dependency Tree – Ensure accurate recipe selection and production calculations." />
        </ListItem>
        <ListItem>
          <ListItemText primary="✅ Tracker Page – Verify save file uploads and production data accuracy." />
        </ListItem>
        <ListItem>
          <ListItemText primary="✅ Bug Reporting – Test GitHub issue submission works as expected." />
        </ListItem>
      </List>
      
      <Typography variant="h6" gutterBottom>
        📌 Where to Report Issues & Feedback
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="🪲 **Bugs & Technical Issues** – Report via the in-app 'Report a Bug' feature." />
        </ListItem>
        <ListItem>
          <ListItemText primary="💬 **General Feedback** – Share ideas and suggestions in the Discord server." />
        </ListItem>
      </List>
      
      <Typography variant="h6" gutterBottom>
        ⚠️ Testing Guidelines
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="✅ Be as detailed as possible when reporting issues." />
        </ListItem>
        <ListItem>
          <ListItemText primary="✅ Test across different browsers (Chrome, Firefox, Edge, etc.)." />
        </ListItem>
        <ListItem>
          <ListItemText primary="✅ If a feature isn’t working, refresh the page and check again before reporting." />
        </ListItem>
        <ListItem>
          <ListItemText primary="❌ Avoid reporting game-related issues (this tool only analyzes save files)." />
        </ListItem>
      </List>
      
      <Typography variant="h6" gutterBottom>
        📸 Screenshots & GIFs (Coming Soon)
      </Typography>
      <Typography variant="body2">
        Step-by-step visuals will be added to clarify testing procedures.
      </Typography>
    </Box>
  );
};

export default GeneralTesterInfo;
