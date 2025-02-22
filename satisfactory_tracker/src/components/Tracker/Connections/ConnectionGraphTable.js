import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography, CircularProgress } from "@mui/material";
import axios from "axios";
import { API_ENDPOINTS } from "../../../apiConfig";

const ConnectionGraphTable = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnectionGraph = async () => {
      setLoading(true);
      try {
        const response = await axios.get(API_ENDPOINTS.connection_graph);
        setGraphData(response.data || { nodes: [], links: [] });
      } catch (error) {
        console.error("Error fetching connection_graph:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConnectionGraph();
  }, []);

  // Columns for nodes
  const nodeColumns = [
    { field: "id", headerName: "Node ID", flex: 1 },
  ];

  // Columns for links
  const linkColumns = [
    { field: "source", headerName: "Source", flex: 1 },
    { field: "target", headerName: "Target", flex: 1 },
  ];

  // Flatten the arrays into DataGrid-friendly rows
  const nodeRows = graphData.nodes.map((node, index) => ({
    id: index,              // DataGrid row unique ID
    ...node                // node.id, etc.
  }));

  const linkRows = graphData.links.map((link, index) => ({
    id: index,
    source: link.source,
    target: link.target
  }));

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      <Box sx={{ display: "flex", width: "100%" }}>
        <Typography variant="h6">connection_graph: Nodes</Typography>
        <DataGrid 
          density="compact"
          rows={nodeRows}
          columns={nodeColumns}
        />
      </Box>
      <Box sx={{ display: "flex", width: "100%" }}>
        <Typography variant="h6">connection_graph: Links</Typography>
        <DataGrid 
          density="compact"
          rows={linkRows}
          columns={linkColumns}
        />
      </Box>
    </Box>
  );
};

export default ConnectionGraphTable;

