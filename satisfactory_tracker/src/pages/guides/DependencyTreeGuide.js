import React from "react";
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";

const DependencyTreeGuide = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom>
        📖 Dependency Tree Guide
      </Typography>
      
      <Typography variant="h6" gutterBottom>
        Overview
      </Typography>
      <Typography variant="body1">
        The Dependency Tree Page allows you to analyze your factory's production dependencies.
        It helps you:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="✔️ View production requirements for selected parts." />
        </ListItem>
        <ListItem>
          <ListItemText primary="✔️ Select and save alternate recipes." />
        </ListItem>
        <ListItem>
          <ListItemText primary="✔️ Track dependencies and bottlenecks." />
        </ListItem>
      </List>
      
      <Typography variant="h6" gutterBottom>
        🔹 How to Use
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="1️⃣ Select a part from the dropdown list." />
        </ListItem>
        <ListItem>
          <ListItemText primary="2️⃣ Choose a recipe (default is '_Standard')." />
        </ListItem>
        <ListItem>
          <ListItemText primary="3️⃣ Enter the target quantity you wish to produce." />
        </ListItem>
        <ListItem>
          <ListItemText primary="4️⃣ Click 'Generate Tree' to visualize dependencies." />
        </ListItem>
      </List>
      
      <Typography variant="h6" gutterBottom>
        🔄 Alternate Recipes
      </Typography>
      <Typography variant="body1">
        You can enable or disable alternative recipes in the "Alternate Recipes" tab.
        Changes are saved automatically, but you can reset them anytime.
      </Typography>
      
      <Typography variant="h6" gutterBottom>
        📌 Pro Tips
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="✅ Use the 'Expand All' button to quickly open the tree." />
        </ListItem>
        <ListItem>
          <ListItemText primary="✅ Collapse sections to focus on specific dependencies." />
        </ListItem>
        <ListItem>
          <ListItemText primary="✅ Add parts to the Tracker for long-term monitoring." />
        </ListItem>
      </List>
      
      <Typography variant="h6" gutterBottom>
        📸 Screenshots & GIFs (Coming Soon)
      </Typography>
      <Typography variant="body2">
        We'll include step-by-step visuals here to make it easier to follow!
      </Typography>
    </Box>
  );
};

export default DependencyTreeGuide;
