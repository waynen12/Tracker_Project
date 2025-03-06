import React, { useState } from "react";
import { Box, Typography, Tabs, Tab, Paper } from "@mui/material";
import DependencyTreeGuide from "./guides/DependencyTreeGuide";
import TrackerPageGuide from "./guides/TrackerPageGuide";
import BugReportGuide from "./guides/BugReportGuide";
import GeneralTesterInfo from "./guides/GeneralTesterInfo";
import { useTheme } from '@mui/material/styles';

const HelpPage = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        background: theme.palette.background,
        padding: theme.spacing(4),
        minHeight: "100vh",
        display: "flex",        
        gap: theme.spacing(4),
      }}
    >
      {/* Sidebar Navigation */}
      <Paper sx={{ minWidth: 250, padding: 2, marginRight: 2 }}>
        <Tabs
          orientation="vertical"
          value={activeTab}
          onChange={handleChange}
          sx={{ borderRight: 1, borderColor: "divider" }}
        >
          <Tab label="Dependency Tree Guide" />
          <Tab label="Tracker Page Guide" />
          <Tab label="Bug Reporting Guide" />
          <Tab label="General Tester Info" />
        </Tabs>
      </Paper>

      {/* Content Section */}
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Box sx={{ flexGrow: 1, padding: 2 }}>
          {activeTab === 0 && <DependencyTreeGuide />}
          {activeTab === 1 && <TrackerPageGuide />}
          {activeTab === 2 && <BugReportGuide />}
          {activeTab === 3 && <GeneralTesterInfo />}
        </Box>
      </Box>
    </Box>
  );
};

export default HelpPage;
