import React, { useState, useEffect, useCallback, useContext } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Grid2,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import { useMaterialReactTable } from "use-material-react-table";
import { CheckCircle, ErrorOutline } from "@mui/icons-material";
import TrackerHeader from "../components/Tracker/TrackerHeader";
import TrackerTables from "../components/Tracker/TrackerTables";
import ModifiersPanel from "../components/Tracker/ModifiersPanel";
import ExportShareButtons from "../components/Tracker/ExportShareButtons";
import axios from "axios";
import { API_ENDPOINTS } from "../apiConfig";
import logToBackend from "../services/logService";
import { useTheme } from "@mui/material/styles";
import { useAlert } from "../context/AlertContext";
import { UserContext } from '../UserContext';

const TrackerPage = () => {
  const theme = useTheme();
  const { user } = useContext(UserContext);
  const { showAlert } = useAlert();
  const [trackerData, setTrackerData] = useState([]);
  const [trackerReports, setTrackerReports] = useState([]);
  const [userSaveData, setUserSaveData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({});
  const [modifiers, setModifiers] = useState({}); // Stores user-specified modifiers
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState({}); // Stores calculated reports
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null); // true = success, false = error
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);

  const fetchUserSaveData = async () => {
    const logFetchSaveMessage = "TrackerPage: Fetching user_save data";
    // logToBackend(logFetchSaveMessage, "INFO");

    try {
      setLoading(true);
      // const userId = user; // Replace with the actual logged-in user ID
      // const latestSaveFile = userSaveData.length ? userSaveData[0].sav_file_name : null; // Get the latest save file
      // logToBackend("TrackerPage: Latest save file" + userSaveData.length + "User ID" + {userId}, "INFO");

      // if (!latestSaveFile) {
      //   console.warn("No save file found, skipping API request.");
      //   logToBackend("TrackerPage: No save file found, skipping API request", "WARN");
      //   return;
      // }

      // logToBackend("TrackerPage: Fetching user_save data", "INFO");
      // const response = await axios.get(API_ENDPOINTS.user_save, {
      //   params: { sav_file_name: latestSaveFile },
      // });
      const response = await axios.get(API_ENDPOINTS.user_save);
      setUserSaveData(response.data);
      const logSaveDataResponse = ("TrackerPage: User Save Data Set" + { userSaveData });
      // logToBackend(logSaveDataResponse, "INFO");
    } catch (error) {
      console.error("Error fetching user_save data:", error);
    } finally {
      setLoading(false);
    }
  };


  // Fetch user tracker data on mount
  useEffect(() => {
    fetchUserSaveData();
  }, []);

  // Fetch user tracker data on mount
  useEffect(() => {
    const fetchTrackerData = async () => {
      const logTrackerDataMessage = "TrackerPage: Fetching tracker data";
      // logToBackend(logTrackerDataMessage, "INFO");
      try {
        setIsLoading(true);
        const response = await axios.get(API_ENDPOINTS.tracker_data); // Example endpoint
        setTrackerData(response.data);
        calculateReports(response.data); // Calculate reports on data fetch
        const logTrackerDataResponse = ("TrackerPage: Tracker data fetched" + { response } + "Tracker Data Set" + { trackerData });
        // logToBackend(logTrackerDataResponse, "INFO");

      } catch (error) {
        console.error("Error fetching tracker data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrackerData();
  }, []);


  useEffect(() => {
    const fetchTrackerReports = async () => {
      setLoading(true);
      try {
        const response = await axios.get(API_ENDPOINTS.tracker_reports);
        setTrackerReports(response.data);
      } catch (error) {
        console.error("Error fetching tracker reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackerReports();
  }, []);

  // Handle updates to modifiers and totals
  const handleModifiersChange = (updatedModifiers) => {
    setModifiers(updatedModifiers);
    recalculateTotals(updatedModifiers);
  };

  const recalculateTotals = (modifiers) => {
    const updatedTotals = {}; // Perform calculations here
    setTotals(updatedTotals);
  };

  // Calculation function for reports
  const calculateReports = (data) => {
    const totalParts = data.reduce((acc, part) => acc + (part.base_demand || 0), 0);
    const totalPartsPerMinute = data.reduce((acc, part) => acc + (part.base_demand_pm || 0), 0);
    const totalMachines = data.reduce(
      (acc, part) => acc + Math.ceil((part.base_demand || 0) / (part.base_supply || 1)),
      0
    );
    const byproducts = data.reduce((acc, part) => acc + (part.byproduct_supply || 0), 0);

    setReports({
      totalParts,
      totalPartsPerMinute,
      totalMachines,
      byproducts,
    });
  };

  // Recalculate reports when trackerData or modifiers change
  useEffect(() => {
    calculateReports(trackerData);
  }, [trackerData, modifiers]);

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles) => {
    // logToBackend("TrackerPage: File dropped" + { acceptedFiles }, "INFO");
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    console.log("Uploading file:", file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setUploadStatus(null);
      setUploadSuccess(null);
      setProgress(0);

      // Send file to backend
      const logOnDropMessage = "TrackerPage: Uploading save file" + file + formData;
      // logToBackend(logOnDropMessage, "INFO");
      const response = await axios.post(API_ENDPOINTS.upload_sav, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });

      setUploadStatus(response.data.message || "Upload successful!");
      setUploadSuccess(true);
      setUploading(false);

      // Start polling for processing status
      if (response.data.processing_id) {
        setProcessing(true);
        fetchUserSaveData();
        pollProcessingStatus(response.data.processing_id);
      }
      showAlert("success", "File uploaded successfully!");

    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus("Upload failed. Please try again.");
      setUploadSuccess(false);
      setUploading(false);
      const logerrorMessage = "TrackerPage: File upload failed" + error;
      logToBackend(logerrorMessage, "ERROR");
      showAlert("error", "File upload failed. Please try again.");
    }
  }, []);

  const pollProcessingStatus = async (processingId) => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.processing_status}/${processingId}`);
      if (response.data.status === "completed") {
        setProcessing(false);
      } else {
        setTimeout(() => pollProcessingStatus(processingId), 2000); // Poll every 2 seconds
      }
    } catch (error) {
      console.error("Error fetching processing status:", error);
      setProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ".sav",
    multiple: false,
  });

  // ✅ Define columns for DataGrid
  const columns = [
    { field: "id", headerName: "ID", width: 80 }, // ✅ use the user_save.id
    { field: "part_name", headerName: "Part Name", width: 180 }, // ✅ use the user_save.recipe_id to get the recipe.part_id from the recipe table and then the part.part_name from the part table
    { field: "recipe_name", headerName: "Recipe", width: 200 }, // ✅ use the user_save.recipe_id to get the recipe.recipe_name from the recipe table
    { field: "machine_name", headerName: "Machine", width: 200 }, // ✅ use the user_save.machine_id to get the machine.machine_name from the machine table
    { field: "machine_level", headerName: "Machine Level", width: 200 }, // ✅ use the user_save.machine_id to get the machine.machine_level_id from the machine_table and then the machine_level.machine_level from the machine_level table
    { field: "resource_node_purity", headerName: "Node Purity", width: 200 }, // ✅ use the user_save.resource_node_id to get the resource_node.node_purity_id from the resource_node table and then the node_purity.node_purity from the node_purity table
    { field: "machine_power_modifier", headerName: "Power Modifier", width: 150 }, // ✅ use the user_save.machine_power_modifier
    { field: "created_at", headerName: "Created", width: 180 }, // ✅ use the user_save.created_at
    { field: "sav_file_name", headerName: "Save File", width: 180 }, // ✅ use the user_save.sav_file_name
  ];

  // const table = useMaterialReactTable({
  //   rows: {userSaveData},
  //   columns: {columns},
  //   enablePagination: false,
  //   enableBottomToolbar: false, //hide the bottom toolbar as well if you want
  // });
  
  return (
    <Box sx={{
      padding: 4,
      // background: "linear-gradient(to right, #000000, #0F705C)",
      background: `linear-gradient(to right, ${theme.palette.background.linearGradientLeft}, ${theme.palette.background.linearGradientRight})`,
      color: "#CCFFFF",
    }}
    >

      <Typography variant="h1" color="primary.contrastText" gutterBottom>
        My Tracker
      </Typography>

      <TrackerHeader />

      <Typography variant="h2" color="contrastText" gutterBottom>
        Save File
      </Typography>

      {/* Drag and Drop Zone */}
      <Box
        {...getRootProps()}
        sx={{
          ...theme.components.Dropzone.styleOverrides.root,
          ...(isDragActive && theme.components.Dropzone.styleOverrides.active),
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "50px",
          width: "20%",
        }}
      >
        <input {...getInputProps()} />

        {/* Animated Upload State */}
        {uploading ? (
          <>
            <CircularProgress color="progressIndicator.main" />
            <LinearProgress variant="determinate" value={progress} sx={{ width: "100%", mt: 1 }} />
          </>
        ) : uploadSuccess === true ? (
          <CheckCircle sx={{ fontSize: 50, color: theme.palette.progressIndicator.main }} />
        ) : uploadSuccess === false ? (
          <ErrorOutline sx={{ fontSize: 50, color: "red" }} />
        ) : (
          <Typography variant="body3">
            {isDragActive
              ? "Drop the save file here..."
              : "Drag & drop a Satisfactory save file here, or click to select one."}
          </Typography>
        )}
      </Box>

      

      {/* DataGrid Displaying user_save Table */}
      <Box sx={{ height: 600, width: "100%", mt: theme.spacing(4) }}>
        {/* <useMaterialReactTable table={table} /> */}
        <DataGrid rows={userSaveData} columns={columns} />
          {/* //<DataGrid
          // rowHeight={40}
          // pageSizeOptions={[10, 25, 100, { value: -1, label: 'All' }]}
          // disableSelectionOnClick
          // sortingOrder={['asc', 'desc']}
          // slots={{ toolbar: GridToolbar }}
          // slotProps={{ toolbar: { showQuickFilter: true } }}
          // loading={loading}
          // checkboxSelection */}
        
      </Box>

      <Grid2 container spacing={2}>
        <Grid2 item xs={8}>
          {/* Main tables section */}
          <TrackerTables
            trackerData={trackerData}
            totals={totals}
            isLoading={isLoading}
          />
        </Grid2>
      </Grid2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Part</TableCell>
              <TableCell>Recipe</TableCell>
              <TableCell>Target Quantity</TableCell>
              <TableCell>Dependency Tree</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trackerReports.map((report) => (
              <TableRow key={report.part_id}>
                <TableCell>{report.part_name}</TableCell>
                <TableCell>{report.recipe_name}</TableCell>
                <TableCell>{report.target_quantity}</TableCell>
                <TableCell>
                  <pre style={{ whiteSpace: "pre-wrap" }}>
                    {JSON.stringify(report.tree, null, 2)}
                  </pre>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TrackerPage;
