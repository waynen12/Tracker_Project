import React from "react";
import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const FinalGraphDataTable = ({ graphData }) => {
  // graphData = { nodes: [...], links: [...] }

  // Node columns
  const nodeColumns = [
    { field: "id", headerName: "Node ID", flex: 2 },
    { field: "color", headerName: "Color", flex: 1 },
    { field: "x", headerName: "X", type: "number", flex: 1 },
    { field: "y", headerName: "Y", type: "number", flex: 1 }
    // add more as needed (index, vx, vy, etc.)
  ];

  // Flatten node fields into row objects
  const nodeRows = (graphData.nodes || []).map((node, idx) => ({
    id: idx, // DataGrid unique row ID
    ...node  // So node.id => row.id, node.x => row.x, etc.
  }));

  // Link columns
  const linkColumns = [
    {
      field: "source",
      headerName: "Source",
      flex: 1
    },
    {
      field: "target",
      headerName: "Target",
      flex: 1
    },
    {
      field: "producedItem",
      headerName: "Produced Item",
      flex: 1
    },
    {
      field: "conveyorSpeed",
      headerName: "Conveyor Speed",
      type: "number",
      flex: 1
    },
    { field: "index", headerName: "Index", type: "number", flex: 1 }
  ];

  // Flatten link objects (esp. source/target)
  const linkRows = (graphData.links || []).map((link, idx) => ({
    id: idx,
    source:
      typeof link.source === "object"
        ? link.source.id
        : link.source,
    target:
      typeof link.target === "object"
        ? link.target.id
        : link.target,
    producedItem: link.producedItem,
    conveyorSpeed: link.conveyorSpeed,
    index: link.index
  }));

  return (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      <Box sx={{ display: "flex", width: "100%" }}>
        <Typography variant="h6">Final graphData: Nodes</Typography>
        <DataGrid
          density="compact"
          rows={nodeRows}
          columns={nodeColumns}
        />
      </Box>
      <Box sx={{ display: "flex", width: "100%" }}>
        <Typography variant="h6">Final graphData: Links</Typography>
        <DataGrid          
          density="compact"
          rows={linkRows}
          columns={linkColumns}
        />
      </Box>
    </Box>
  );
};

export default FinalGraphDataTable;
