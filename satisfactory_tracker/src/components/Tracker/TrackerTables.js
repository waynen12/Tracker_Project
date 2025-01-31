import React from "react";
import { Box, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

const TrackerTables = ({ trackerData, totals, isLoading }) => {
  // Define columns for the DataGrid
  const columns = [
    { field: 'part_name', headerName: 'Part', flex: 1 },
    { field: 'quantity_needed', headerName: 'Quantity Needed', flex: 1, type: 'number' },
    { field: 'machines_required', headerName: 'Machines Required', flex: 1, type: 'number' },
    { field: 'parts_per_minute', headerName: 'Parts/Minute', flex: 1, type: 'number' },
    { field: 'time_to_complete', headerName: 'Time to Complete', flex: 1, type: 'string' },
  ];

  // Prepare rows for the DataGrid
  const rows = trackerData.map((row, index) => ({
    id: row.id || index, // Ensure a unique ID for each row
    part_name: row.part_name,
    quantity_needed: totals[row.id]?.quantity || row.quantity,
    machines_required: totals[row.id]?.machines || "N/A",
    parts_per_minute: totals[row.id]?.parts_per_minute || "N/A",
    time_to_complete: totals[row.id]?.time || "N/A",
  }));

  return (
    <Box>
      <Typography variant="h2" gutterBottom>
        Tracker Details
      </Typography>

      {isLoading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Box sx={{ height: 600, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            checkboxSelection
            disableSelectionOnClick
            sortingOrder={['asc', 'desc']}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default TrackerTables;
