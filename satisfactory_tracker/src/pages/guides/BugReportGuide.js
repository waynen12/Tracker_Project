import React from "react";
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";

const BugReportGuide = () => {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        🪲 Bug Reporting Guide 🪳
      </Typography>

      <Typography variant="h6" gutterBottom>
        Overview
      </Typography>
      <Typography variant="body1">
        The Bug Reporting system allows testers to submit issues directly to GitHub.
        This helps track and resolve bugs efficiently.
      </Typography>

      <Typography variant="h6" gutterBottom>
        🔹 How to Submit an Issue, Enhancement or Question
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="1️⃣ Click on the 'Report an Issue' button on the top right or in the menu." />
        </ListItem>
        <ListItem>
          <ListItemText primary="2️⃣ Enter a clear and concise title." />
        </ListItem>
        <ListItem>
          <ListItemText primary="3️⃣ Provide a detailed description of the issue, including steps to reproduce it." />
        </ListItem>
        <ListItem>
          <ListItemText primary="4️⃣ Select relevant labels such as 'Bug', 'Enhancement' or 'Question'." />
        </ListItem>
        <ListItem>
          <ListItemText primary="5️⃣ Click 'Submit' – your issue will be automatically posted to GitHub!" />
        </ListItem>
      </List>

      <Typography variant="h6" gutterBottom>
        🔍 What to Include in a Good Bug Report
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="✅ **Steps to Reproduce** – Describe exactly how to trigger the bug." />
        </ListItem>
        <ListItem>
          <ListItemText primary="✅ **Expected vs. Actual Behavior** – What should happen vs. what actually happens." />
        </ListItem>
        <ListItem>
          <ListItemText primary="✅ **Screenshots or Logs** – If applicable, attach screenshots or error messages." />
        </ListItem>
      </List>

      <Typography variant="h6" gutterBottom>
        ❌ Common Issues & Troubleshooting
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="⚠️ Forgot something? Edit your issue directly on GitHub after submission using the link in the confirmation message." />
        </ListItem>
      </List>

      <Typography variant="h6" gutterBottom>
        📸 Screenshots & GIFs (Coming Soon)
      </Typography>
      <Typography variant="body2">
        We'll include visuals for a smoother reporting experience!
      </Typography>
    </Box>
  );
};

export default BugReportGuide;