import React from "react";
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";

const TrackerPageGuide = () => {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        📖 Tracker Page Guide
      </Typography>
      
      <Typography variant="h6" gutterBottom>
        Overview
      </Typography>
      <Typography variant="body1">
        The Tracker Page allows you to upload your Satisfactory save file and analyze your factory’s progress.
        This page helps you:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="✔️ Upload a save file to track factory production." />
        </ListItem>
        <ListItem>
          <ListItemText primary="✔️ View detailed reports on your current and target production." />
        </ListItem>
        <ListItem>
          <ListItemText primary="✔️ Analyze conveyor and pipe networks." />
        </ListItem>
      </List>
      
      <Typography variant="h6" gutterBottom>
        🔹 How to Use
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="1️⃣ Click 'Upload Save File' to import your factory data." />
        </ListItem>
        <ListItem>
          <ListItemText primary="2️⃣ Select a `.sav` file from your computer." />
        </ListItem>
        <ListItem>
          <ListItemText primary="3️⃣ Wait for the system to process the data (this may take a few seconds)." />
        </ListItem>
        <ListItem>
          <ListItemText primary="4️⃣ Navigate through the tabs to explore your factory’s stats, conveyors, and pipes." />
        </ListItem>
      </List>
      
      <Typography variant="h6" gutterBottom>
        📊 Key Features
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="✅ **Production Reports** – See real-time vs. target production." />
        </ListItem>
        <ListItem>
          <ListItemText primary="✅ **Save File Data** – Inspect machine and item data from your save file." />
        </ListItem>
        <ListItem>
          <ListItemText primary="✅ **Conveyor & Pipe Networks** – Identify bottlenecks in logistics." />
        </ListItem>
      </List>
      
      <Typography variant="h6" gutterBottom>
        🚀 Pro Tips
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="💡 If upload fails, ensure your `.sav` file is valid and from the latest game version." />
        </ListItem>
        <ListItem>
          <ListItemText primary="💡 Click on any column headers to sort data for better analysis." />
        </ListItem>
        <ListItem>
          <ListItemText primary="💡 Use the Conveyor/Pipe tabs to troubleshoot inefficiencies in your factory." />
        </ListItem>
      </List>
      
      <Typography variant="h6" gutterBottom>
        📸 Screenshots & GIFs (Coming Soon)
      </Typography>
      <Typography variant="body2">
        Step-by-step visuals will be added to make navigation easier!
      </Typography>
    </Box>
  );
};

export default TrackerPageGuide;