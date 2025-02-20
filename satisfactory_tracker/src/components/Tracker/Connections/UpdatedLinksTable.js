import React from "react";
import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const UpdatedLinksTable = ({ updatedLinks }) => {
  // updatedLinks is an array. Each element:
  // { source: {id: "..."} or string, target: {id: "..."} or string, producedItem: ..., conveyorSpeed: ...}

  const columns = [
    {
      field: "source",
      headerName: "Source",
      flex: 2
    },
    {
      field: "target",
      headerName: "Target",
      flex: 2
    },
    {
      field: "producedItem",
      headerName: "Produced Item",
      flex: 1
    },
    {
      field: "conveyorSpeed",
      headerName: "Conveyor Speed",
      flex: 1,
      type: "number"
    }
  ];

  const rows = updatedLinks.map((link, index) => ({
    id: index,
    source: typeof link.source === "object" ? link.source.id : link.source,
    target: typeof link.target === "object" ? link.target.id : link.target,
    producedItem: link.producedItem,
    conveyorSpeed: link.conveyorSpeed
  }));

  return (
    <Box sx={{ display: "flex", width: "100%", minHeight: 400 }}>
      <Typography variant="h6">updatedLinks Results</Typography>
      <DataGrid rows={rows} columns={columns}/>
    </Box>
  );
};

export default UpdatedLinksTable;
