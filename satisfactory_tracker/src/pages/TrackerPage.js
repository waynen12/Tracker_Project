import React, { useState, useEffect, useCallback, useContext } from "react";
import { useDropzone } from "react-dropzone";
import { Box, Grid2, Typography, CircularProgress, LinearProgress, Tabs, Tab } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
// import { useMaterialReactTable } from "use-material-react-table";
import { CheckCircle, ErrorOutline, East } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import TrackerHeader from "../components/Tracker/TrackerHeader";
import TrackerTables from "../components/Tracker/TrackerTables";
import axios from "axios";
import { API_ENDPOINTS } from "../apiConfig";
import { UserContext, useUserContext } from "../context/UserContext";
import logToBackend from "../services/logService";
import ProductionChart from "../components/Tracker/ProductionChart";
import MachineChart from "../components/Tracker/MachineChart";
import MachineGraph from "../components/Tracker/MachineGraph";
import { useTheme } from "@mui/material/styles";
import { useAlert } from "../context/AlertContext";
import { motion } from "framer-motion";


const TrackerPage = () => {
  const theme = useTheme();
  const { user } = useContext(UserContext);
  const { showAlert } = useAlert();
  const [trackerData, setTrackerData] = useState([]);
  const [trackerTreeData, setTrackerTreeData] = useState([]);
  const [trackerReports, setTrackerReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({});
  const [modifiers, setModifiers] = useState({}); // Stores user-specified modifiers
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState({ partProduction: {}, machineUsage: {} });
  const [flattenedTreeData, setFlattenedTreeData] = useState([]);
  const [userSaveData, setUserSaveData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null); // true = success, false = error
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [machineUsageReports, setMachineUsageReports] = useState([]);
  const hasUploadedSaveFile = userSaveData.length > 0;
  const isDataReady = userSaveData.length > 0 &&
    Object.keys(reports.partProduction).length > 0 &&
    Object.keys(reports.machineUsage).length > 0;
  const [activeTab, setActiveTab] = useState("1"); // Track the selected tab
  const uploadedFileName = hasUploadedSaveFile ? userSaveData[0]?.sav_file_name : "";
  const { resetGraphData } = useUserContext();


  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const fetchTrackerReports = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.tracker_reports);
      setTrackerReports(response.data);

      setFlattenedTreeData(flattenDependencyTrees(response.data));

      return response.data;

    } catch (error) {
      console.error("Error fetching tracker reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const flattenDependencyTrees = (reports) => {
    let flattened = [];
    reports.forEach((report, reportIndex) => {
      if (!report.tree) return;

      const traverseTree = (node, parent = "Root", level = 0) => {
        Object.keys(node).forEach((key, index) => {
          const item = node[key];
          const rowId = `${reportIndex}-${key}-${index}`;
          flattened.push({
            id: rowId,
            parent,
            node: key,
            level,
            requiredQuantity: item["Required Quantity"] || 0,
            producedIn: item["Produced In"] || "N/A",
            machines: item["No. of Machines"] || 0,
            recipe: item["Recipe"] || "N/A",
          });
          if (item.Subtree) {
            traverseTree(item.Subtree, key, level + 1);
          }
        });
      };
      traverseTree(report.tree);
    });

    return flattened;
  };



  const fetchData = async () => {
    try {
      setLoading(true);
      const [trackerRes, saveRes] = await Promise.all([
        fetchTrackerReports(),
        fetchUserSaveData()
      ]);

      //Ensure both reports update state correctly without overwriting each other
      const productionData = await fetchProductionReport(trackerRes, saveRes);
      const machineData = await fetchMachineUsageReport(trackerRes, saveRes);

      setReports(prevReports => ({
        ...prevReports,
        partProduction: productionData,
        machineUsage: machineData
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductionReport = async (trackerData, saveData) => {
    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.production_report, {
        trackerData,
        saveData
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching production report:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchMachineUsageReport = async (trackerData, saveData) => {
    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.machine_report, {
        trackerData,
        saveData
      });

      setMachineUsageReports(response.data);


      return response.data;

    } catch (error) {
      console.error("Error fetching machine usage report:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackerData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.tracker_data);
      setTrackerData(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching tracker data:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSaveData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.user_save);
      setUserSaveData(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching user_save data:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "parent", headerName: "Parent Part", flex: 1 },
    { field: "node", headerName: "Ingredient", flex: 1 },
    { field: "level", headerName: "Level", flex: 0.5, type: "number" },
    { field: "requiredQuantity", headerName: "Required Quantity", flex: 1, type: "number" },
    { field: "producedIn", headerName: "Produced In", flex: 1 },
    { field: "machines", headerName: "No. of Machines", flex: 1, type: "number" },
    { field: "recipe", headerName: "Recipe Name", flex: 1 },
  ];

  // Handle updates to modifiers and totals
  const handleModifiersChange = (updatedModifiers) => {
    setModifiers(updatedModifiers);
    recalculateTotals(updatedModifiers);
  };

  const recalculateTotals = (modifiers) => {
    const updatedTotals = {}; // Perform calculations here
    setTotals(updatedTotals);
  };


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
      resetGraphData();

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

      // // Start polling for processing status
      // if (response.data.processing_id) {
      //   setProcessing(true);
      //   fetchUserSaveData();
      //   pollProcessingStatus(response.data.processing_id);
      // }
      showAlert("success", "File uploaded successfully!");
      fetchData();

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

  //  Define columns for DataGrid
  const userColumns = [
    { field: "id", headerName: "ID", width: 80 }, //  use the user_save.id
    { field: "part_name", headerName: "Part Name", width: 180 }, //  use the user_save.recipe_id to get the recipe.part_id from the recipe table and then the part.part_name from the part table
    { field: "recipe_name", headerName: "Recipe", width: 200 }, //  use the user_save.recipe_id to get the recipe.recipe_name from the recipe table
    { field: "machine_name", headerName: "Machine", width: 200 }, //  use the user_save.machine_id to get the machine.machine_name from the machine table
    { field: "machine_level", headerName: "Machine Level", width: 200 }, //  use the user_save.machine_id to get the machine.machine_level_id from the machine_table and then the machine_level.machine_level from the machine_level table
    { field: "resource_node_purity", headerName: "Node Purity", width: 200 }, //  use the user_save.resource_node_id to get the resource_node.node_purity_id from the resource_node table and then the node_purity.node_purity from the node_purity table
    { field: "machine_power_modifier", headerName: "Power Modifier", width: 150 }, //  use the user_save.machine_power_modifier
    { field: "base_supply_pm", headerName: "Base Supply PM", width: 200 }, //  use the user_save.base_supply_pm
    { field: "actual_ppm", headerName: "Actual PPM", width: 200 }, //  use the user_save.actualPPM
    { field: "created_at", headerName: "Created", width: 180 }, //  use the user_save.created_at
    { field: "sav_file_name", headerName: "Save File", width: 180 }, //  use the user_save.sav_file_name
  ];

  return (
    <Box sx={{
      borderBottom: 2, // Thicker bottom border 
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      width: "100%",
      padding: 4,
      background: theme.palette.background,
    }}
    >
      <Typography variant="h1" gutterBottom>
        My Tracker
      </Typography>

      <TrackerHeader />

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" sx={{ textAlign: "left", fontWeight: "bold" }}>
          {hasUploadedSaveFile
            ? "Drag & drop a new Satisfactory save file here, or click to select one.\n This will overwrite your current save file."
            : "Drag & drop a Satisfactory save file below, or click to select one."
          }
        </Typography>


        <Box sx={theme.trackerPageStyles.tracker_Drop_Zone_Arrow}>
          <East fontSize="large" />
        </Box>
        {/* Drag and Drop Zone */}
        <Box
          {...getRootProps()}
          sx={{
            ...theme.components.Dropzone.styleOverrides.root,
            ...(isDragActive && theme.components.Dropzone.styleOverrides.active),
          }}
        >
          <input {...getInputProps()} />

          {/* Animated Upload State */}
          {uploading ? (
            <>
              <CircularProgress color="progressIndicator.main" />
            </>
          ) : uploadSuccess === true ? (
            <CheckCircle sx={{ fontSize: 50, color: "success.main" }} />
          ) : uploadSuccess === false ? (
            <ErrorOutline sx={{ fontSize: 50, color: "red" }} />
          ) : hasUploadedSaveFile ? (
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "success.main" }}>
              Current save file <br />
              {uploadedFileName}
            </Typography>
          ) : (
            <Typography variant="body3">
              Drop your Satisfactory save file here...
            </Typography>
          )}
        </Box>
      </Box>
      {/* Tabs Container */}
      <TabContext value={activeTab}>
        <Box sx={theme.trackerPageStyles.tabsContainer}>
          <TabList onChange={handleChange} aria-label="Tracker Sections" sx={theme.trackerPageStyles.tabList}>
            <Tab label="Charts" value="1" />
            <Tab label="Save File Data" value="2" />
            <Tab label="Machine Graph" value="3" />
            <Tab label="Main Tables" value="4" />
            <Tab label="Dependency Data" value="5" />
          </TabList>
        </Box>

        {/* Charts Panel */}
        <TabPanel value="1">
          {hasUploadedSaveFile ? (
            !isDataReady ? (
              // ✅ Show spinner while waiting for reports
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
                <CircularProgress size={60} color="primary" />
              </Box>
            ) : (
              // ✅ Show charts once data is ready
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Box sx={theme.trackerPageStyles.tabPanelBox}>
                  <Box sx={theme.trackerPageStyles.chartBox}>
                    <ProductionChart data={reports.partProduction} />
                  </Box>
                  <Box sx={theme.trackerPageStyles.chartBox}>
                    <MachineChart data={reports.machineUsage} />
                  </Box>
                </Box>
              </motion.div>
            )
          ) : (
            <Typography variant="h6" sx={{ textAlign: "center", mt: 4, color: "gray" }}>
              Upload a save file to generate reports.
            </Typography>
          )}
        </TabPanel>

        {/* User Save Data Panel */}
        <TabPanel value="2">
          <Box sx={theme.trackerPageStyles.trackerBox}>
            {loading ? (
              <CircularProgress />
            ) : (
              <>
                <Box sx={theme.trackerPageStyles.reportBox}>
                  <DataGrid rows={userSaveData} columns={userColumns} />
                </Box>
              </>
            )}
          </Box>
        </TabPanel>

        {/* Graph Panel */}
        <TabPanel value="3">
          <Box sx={theme.trackerPageStyles.tabPanelBox}>
            {loading ? (
              <CircularProgress />
            ) : (
              <>

                <Box sx={theme.trackerPageStyles.reportBox}>
                  <MachineGraph />
                </Box>
              </>
            )}
          </Box>
        </TabPanel>

        {/* Main Tables Section */}
        <TabPanel value="4">
          <Box sx={theme.trackerPageStyles.trackerBox}>
            {loading ? (
              <CircularProgress />
            ) : (
              <>
                <Box sx={theme.trackerPageStyles.reportBox}>
                  <TrackerTables
                    trackerData={trackerData}
                    totals={totals}
                    isLoading={isLoading} />
                </Box>

              </>
            )}
          </Box>
        </TabPanel>

        {/* Dependency Data Panel */}
        <TabPanel value="5">
          <Box sx={theme.trackerPageStyles.trackerBox}>
            {loading ? (
              <CircularProgress />
            ) : (
              <>
                <Box sx={theme.trackerPageStyles.reportBox}>
                  <DataGrid rows={flattenedTreeData} columns={columns} />
                </Box>

              </>
            )}
          </Box>
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export default TrackerPage;

