import React, { useEffect, useState, useMemo } from "react";
import { ForceGraph2D } from "react-force-graph";
import axios from "axios";
import { API_ENDPOINTS } from "../../apiConfig";
import { Box, Typography, LinearProgress, CircularProgress } from "@mui/material";
import logToBackend from "../../services/logService";
import { useAlert } from "../../context/AlertContext";
import { useTheme } from "@mui/material/styles";
import { useUserContext } from "../../context/UserContext";
import ConnectionGraphTable from "./Connections/ConnectionGraphTable";
import FinalGraphDataTable from "./Connections/FinalGraphDataTable";
import MachineMetadataTable from "./Connections/MachineMetadataTable";
import UpdatedLinksTable from "./Connections/UpdatedLinksTable";
import { Water } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";




const ConnectionData = () => {
    const theme = useTheme();
    const [tableData, setTableData] = useState([]);
    const { graphData, setGraphData } = useUserContext();
    const [totalRecords, setTotalRecords] = useState(0);
    const [loadedRecords, setLoadedRecords] = useState(0);
    const [updateQueue, setUpdateQueue] = useState([]);
    const [updatedLinks, setUpdatedLinks] = useState([]);
    const [loading, setLoading] = useState(false)//(!graphData);
    const { showAlert } = useAlert();

    const machineIcons = {
        Miner: require("../../assets/icons/buildings/Miner_Mk1.png"),
        Smelter: require("../../assets/icons/buildings/Smelter.png"),
        Constructor: require("../../assets/icons/buildings/Constructor.png"),
        Assembler: require("../../assets/icons/buildings/Assembler.png"),
        Manufacturer: require("../../assets/icons/buildings/Manufacturer.png"),
        ConveyorMK6: require("../../assets/icons/buildings/Conveyor_Belt_Mk6.png"),
        Blender: require("../../assets/icons/buildings/Blender.png"),
        PipelineMK1: require("../../assets/icons/buildings/Pipeline_Mk1.png"),
        PipelineMK2: require("../../assets/icons/buildings/Pipeline_Mk2.png"),
        Converter: require("../../assets/icons/buildings/Converter.png"),
        Refinery: require("../../assets/icons/buildings/Refinery.png"),
        Foundry: require("../../assets/icons/buildings/Foundry.png"),
        ConveyorMK2: require("../../assets/icons/buildings/Conveyor_Belt_Mk2.png"),
        ConveyorMK3: require("../../assets/icons/buildings/Conveyor_Belt_Mk3.png"),
        ConveyorMK4: require("../../assets/icons/buildings/Conveyor_Belt_Mk4.png"),
        ConveyorMK5: require("../../assets/icons/buildings/Conveyor_Belt_Mk5.png"),
        ConveyorMK6: require("../../assets/icons/buildings/Conveyor_Belt_Mk6.png"),
        ConveyorLiftMK1: require("../../assets/icons/buildings/Conveyor_Lift_Mk1.png"),
        ConveyorLiftMK2: require("../../assets/icons/buildings/Conveyor_Lift_Mk2.png"),
        ConveyorLiftMK3: require("../../assets/icons/buildings/Conveyor_Lift_Mk3.png"),
        ConveyorLiftMK4: require("../../assets/icons/buildings/Conveyor_Lift_Mk4.png"),
        ConveyorLiftMK5: require("../../assets/icons/buildings/Conveyor_Lift_Mk5.png"),
        ConveyorLiftMK6: require("../../assets/icons/buildings/Conveyor_Lift_Mk6.png"),
        Merger: require("../../assets/icons/buildings/Conveyor_Merger.png"),
        Splitter: require("../../assets/icons/buildings/Conveyor_Splitter.png"),
        SmartSplitter: require("../../assets/icons/buildings/Smart_Splitter.png"),
        Storage: require("../../assets/icons/buildings/Storage_Container.png"),
        MinerMk2: require("../../assets/icons/buildings/Miner_Mk2.png"),
        MinerMk3: require("../../assets/icons/buildings/Miner_Mk3.png"),
        OilExtractor: require("../../assets/icons/buildings/Oil_Extractor.png"),
        Packager: require("../../assets/icons/buildings/Packager.png"),
        ParticleAccelerator: require("../../assets/icons/buildings/Particle_Accelerator.png"),
        SpaceElevator: require("../../assets/icons/buildings/Space_Elevator.png"),
        PipelineJunction: require("../../assets/icons/buildings/Pipeline_Junction.png"),
        AWESOME_Sink: require("../../assets/icons/buildings/AWESOME_Sink.png"),
        Nuclear_Power_Plant: require("../../assets/icons/buildings/Nuclear_Power_Plant.png"),
        Quantum_Encoder: require("../../assets/icons/buildings/Quantum_Encoder.png"),
        Water_Extractor: require("../../assets/icons/buildings/Water_Extractor.png"),
        Unknown: require("../../assets/icons/default.png")
    };
    const cachedIcons = useMemo(() => machineIcons, []);

    const partIcons = {
        "Iron Ingot": "/icons/parts/Iron_Ingot.png",
        "Iron Rod": "/icons/parts/Iron_Rod.png",
        "Iron Ore": "/icons/parts/Iron_Ore.png",
        "Screw": "/icons/parts/Screw.png",
    };

    const getMachineType = (nodeId) => {
        // logToBackend("Node ID: " + nodeId, "INFO");
        if (nodeId.includes("Miner")) return "Miner";
        if (nodeId.includes("Smelter")) return "Smelter";
        if (nodeId.includes("Constructor")) return "Constructor";
        if (nodeId.includes("Assembler")) return "Assembler";
        if (nodeId.includes("Manufacturer")) return "Manufacturer";
        if (nodeId.includes("ConveyorBeltMk6")) return "ConveyorMK6";
        if (nodeId.includes("Blender")) return "Blender";
        if (nodeId.includes("PipelineMk1")) return "PipelineMK1";
        if (nodeId.includes("PipelineMk2")) return "PipelineMK2";
        if (nodeId.includes("Converter")) return "Converter";
        if (nodeId.includes("Refinery")) return "Refinery";
        if (nodeId.includes("Foundry")) return "Foundry";
        if (nodeId.includes("ConveyorBeltMk2")) return "ConveyorMK2";
        if (nodeId.includes("ConveyorBeltMk3")) return "ConveyorMK3";
        if (nodeId.includes("ConveyorBeltMk4")) return "ConveyorMK4";
        if (nodeId.includes("ConveyorBeltMk5")) return "ConveyorMK5";
        if (nodeId.includes("ConveyorBeltMk6")) return "ConveyorMK6";
        if (nodeId.includes("ConveyorLiftMk1")) return "ConveyorLiftMK1";
        if (nodeId.includes("ConveyorLiftMk2")) return "ConveyorLiftMK2";
        if (nodeId.includes("ConveyorLiftMk3")) return "ConveyorLiftMK3";
        if (nodeId.includes("ConveyorLiftMk4")) return "ConveyorLiftMK4";
        if (nodeId.includes("ConveyorLiftMk5")) return "ConveyorLiftMK5";
        if (nodeId.includes("ConveyorLiftMk6")) return "ConveyorLiftMK6";
        if (nodeId.includes("Merger")) return "Merger";
        if (nodeId.includes("Splitter")) return "Splitter";
        if (nodeId.includes("SmartSplitter")) return "SmartSplitter";
        if (nodeId.includes("Storage")) return "Storage";
        if (nodeId.includes("MinerMk2")) return "MinerMk2";
        if (nodeId.includes("MinerMk3")) return "MinerMk3";
        if (nodeId.includes("OilExtractor")) return "OilExtractor";
        if (nodeId.includes("Packager")) return "Packager";
        if (nodeId.includes("ParticleAccelerator")) return "ParticleAccelerator";
        if (nodeId.includes("SpaceElevator")) return "SpaceElevator";
        if (nodeId.includes("PipelineJunction")) return "PipelineJunction";
        if (nodeId.includes("AWESOME_Sink")) return "AWESOME_Sink";
        if (nodeId.includes("Nuclear_Power_Plant")) return "Nuclear_Power_Plant";
        if (nodeId.includes("Quantum_Encoder")) return "Quantum_Encoder";
        if (nodeId.includes("Water_Extractor")) return "Water_Extractor";
        return "Unknown";
    };

    const getMachineIcon = (machineData) => {
        return machineData.icon_path || "../../assets/icons/default.png";
    };

    const getPartIcon = (partData) => {
        return partData.icon_path || "/icons/default.png";
    };

    const totalRecordsToLoad = (graphData) => {
        return graphData.links.length;
    };

    useEffect(() => {
        if (graphData.nodes.length > 0 && graphData.links.length > 0) { return; }
        const fetchGraphData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(API_ENDPOINTS.connection_graph);
                const { nodes, links } = response.data;

                setGraphData({ nodes, links });
                setTotalRecords(links.length);  // ✅ Only track links since they take longest to load
                setLoading(false);
            } catch (error) {
                console.error("❌ Error fetching preprocessed graph:", error);
                showAlert("error", "Failed to load graph data!");
                setLoading(false);
            }
        };

        fetchGraphData();
    }, [graphData]);

    return (
        <Box>
            {loading ? (
                <Box sx={{ textAlign: "center", padding: 2 }}>
                    <Typography variant="body1">Loading graph data...</Typography>
                    <Typography variant="body1_italic" sx={{ display: "block" }}>This may take a few moments </Typography>
                    <Typography variant="body1_underline" sx={{ color: "red", display: "block" }}>DO NOT REFRESH YOUR BROWSWER</Typography>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={theme.trackerPageStyles.reportBox}>
                {/* <Box sx={{ height: 600, width: "100%" }}> */}
                    <DataGrid density="compact"
                        rows={graphData.links.map((link, index) => ({
                            id: `link-${index}`,
                            type: link.type === "pipe" ? "Pipe" : "Conveyor",
                            source_component: link.source_component,
                            source_level: link.source_level,
                            source_reference_id: link.source_reference_id,
                            target_component: link.target_component,
                            target_level: link.target_level,
                            target_reference_id: link.target_reference_id,
                            info: link.label,
                            info: link.label,
                            produced_item: link.produced_item,
                            conveyor_speed: link.conveyor_speed,
                        }))}
                        columns={[
                            { field: "id", headerName: "ID", width: 150 },
                            { field: "type", headerName: "Type", width: 150 },
                            { field: "source_component", headerName: "Source", width: 180 },
                            { field: "source_level", headerName: "Source Level", width: 120 },
                            { field: "source_reference_id", headerName: "Source ID", width: 150 },
                            { field: "target_component", headerName: "Target", width: 180 },
                            { field: "target_level", headerName: "Target Level", width: 120 },
                            { field: "target_reference_id", headerName: "Target ID", width: 150 },
                            { field: "produced_item", headerName: "Produced Item", width: 200 },
                            { field: "conveyor_speed", headerName: "Conveyor Speed", width: 200 },
                            { field: "info", headerName: "Details", flex: 1 },
                            
                        ]}                        
                    />
                </Box>
            )}
        </Box>
    );
}

export default ConnectionData;