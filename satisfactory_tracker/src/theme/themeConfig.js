import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { dark } from '@mui/material/styles/createPalette';
import logToBackend from "../services/logService";

export const USE_THEME = 'dark'; // 'light' or 'dark'

// Color Palettes
// export const THEME_LIGHT = {
//     // Primary color palette
//     primary_main: '#3a3e61', // #3a3e61 
//     primary_contrastText: '#FFFFFF', // White text on primary background #FFFFFF
//     // Secondary color palette
//     secondary_main: '#264431', // #0F705C #264431
//     secondary_contrastText: '#FFFFFF', // White text on secondary background #FFFFFF
//     // Background color palette
//     background_default: '#264431', // #264431
//     background_mid: '#32527b', // Blue Violet for mid-level components #32527b
//     background_paper: '#364b61', // Medium dark shade of cyan-blue #364b61
//     background_dropdown: '#FFFFFF', // White background for dropdowns #FFFFFF
//     background_tabs: '#1E1E1E', // Dark Gray for tabs #1E1E1E
//     // Text color palette
//     text_primary: '#FFFFFF', // White text for general use #FFFFFF
//     text_secondary: '#DDA0DD', // Plum for secondary text #DDA0DD #FFFFFF
//     text_disabled: '#C4C4C4', // Disabled text color #C4C4C4
//     text_dropdown: '#000000', // Black text for dropdowns #000000
//     // Button color palette
//     button_main: '#264431', // #0F705C #264431
//     button_contrastText: '#FFFFFF', // White text on primary background #FFFFFF
//     button_hover: '#1d3a2a', // Hover color #1d3a2a
//     button_disabled: '#1d3a2a', // Disabled button color #1d3a2a
//     button_disabledText: '#264431', // White text on disabled button #264431
//     // Progress indicator color palette
//     progressIndicator_main: '#0bc260', // #0bc260

//     // Typography
//     typography_fontFamily: 'Arial, sans-serif',
//     typography_h1: { fontSize: '48px', fontWeight: 700 },
//     typography_h2: { fontSize: '32px', fontWeight: 600 },
//     typography_h3: { fontSize: '20px', fontWeight: 600 },
//     typography_body1: { fontSize: '18px' },
//     typography_body2: { fontSize: '16px' },
//     typography_body3: { fontSize: '14px' },
//     typography_body4: { fontSize: '12px' },

//     // Spacing
//     spacing: 4, // Default spacing unit

//     border_tabs: "2px solid #FFFFFF", // White border for selected tab


//     // Components
//     components_MuiCssBaseline_select: {
//         padding: "4px",
//         borderRadius: "8px",
//         border: "1px solid #C4C4C4", // Using the disabled text color
//         backgroundColor: "#FFFFFF",
//         color: "#000000",
//         "&:focus": {
//             borderColor: "#8A2BE2", // Blue Violet focus color
//             outline: "none",
//         },
//     },
//     components_MuiCssBaseline_body: {
//         background: `linear-gradient(to right, #364b61, #3e596c)`,
//         color: '#FFFFFF',
//         a: {
//             color: '#3a3e61', // #3a3e61
//             textDecoration: 'none',
//             '&:hover': {
//                 textDecoration: 'underline',
//             },
//         },
//     },

//     components_MuiTable_root: {
//         backgroundColor: "#364b61", // Default background for the whole table
//         color: "#FFFFFF", // Default text color
//     },
//     components_MuiTableHead_root: {
//         position: "sticky", //  Makes the header stick
//         top: 0, //  Keeps it at the top when scrolling
//         zIndex: 2, //  Ensures it stays above other rows
//         backgroundColor: "#264431", //  Ensures background color remains visible #264431
//     },
//     components_MuiTableRow_root: {
//         height: "15px", //  Sets row height
//         "&:nth-of-type(even)": {
//             backgroundColor: "#3e596c",
//         },
//         "&:hover": {
//             backgroundColor: "#3a3e61",
//         },
//     },

//     components_MuiTableCell_root: {
//         padding: "1px 4px", //  Controls cell padding (affects row height)
//         color: "#FFFFFF",
//         borderBottom: "1px solid #8A2BE2",
//         fontSize: "14px", //  Sets a default font size for table cells
//         fontFamily: "Arial, sans-serif", //  Ensure font consistency
//     },

//     components_MuiCssBaseline_head: {
//         fontWeight: "bold",
//         textTransform: "uppercase",
//         backgroundColor: "#264431", //  Header background color #3a3e61
//         color: "#FFFFFF",
//         padding: "14px 16px", //  Increase header row height
//         fontSize: "16px", //  Larger font size for headers
//         position: "sticky", //  Ensures column headers remain visible
//         top: 0, //  Keeps it at the top
//         zIndex: 3, //  Higher than rows to prevent overlap
//     },
//     components_MuiDataGrid_defaultProps: {
//         rowHeight: 40,
//         pageSize: 25,
//         pageSizeOptions: [10, 25, 100, { value: -1, label: 'All' }],
//         checkboxSelection: true,
//         disableSelectionOnClick: true,
//         sortingOrder: ['asc', 'desc'],
//         slots: {
//             toolbar: GridToolbar,
//         },
//         slotProps: {
//             toolbar: { showQuickFilter: true },
//         },
//     },
//     components_MuiDataGrid_root: {
//         backgroundColor: "#364b61", //  Default background color #364b61
//         borderRadius: "8px",
//         color: "#FFFFFF",
//         border: `1px solid #8A2BE`, //  Border color #C4C4C4
//     },
//     components_MuiDataGrid_columnHeaders: {
//         backgroundColor: "#264431", //  Header background color #264431
//         color: "#FFFFFF",
//         fontSize: "16px",
//         fontWeight: "bold",
//         textTransform: "uppercase",
//     },
//     components_MuiDataGrid_row: {
//         "&:nth-of-type(even)": {
//             backgroundColor: "#3e596c", //  Alternating row color #3e596c
//         },
//         "&:hover": {
//             backgroundColor: "#3a3e61", //  Hover effect color #8A2BE2
//         },
//     },

//     components_MuiDataGrid_cell: {
//         borderColor: "#264431 !important", //  Purple cell borders
//     },

//     components_MuiDataGrid_footerContainer: {
//         backgroundColor: "#264431", //  Footer background color #264431
//         color: "#FFFFFF",
//     },

//     components_MuiDataGrid_toolbar: {
//         backgroundColor: "#264431", //  Toolbar background color #264431
//         color: "#FFFFFF",
//     },

//     components_MuiButton_root: {
//         borderRadius: 8,
//         textTransform: 'none',
//     },
//     components_MuiButton_containedPrimary: {
//         backgroundColor: '#264431', // #264431
//         color: '#FFFFFF', // White text color #FFFFFF
//         '&:hover': {
//             backgroundColor: '#1d3a2a', // #1d3a2a
//         },
//     },
//     components_MuiButton_containedSecondary: {
//         backgroundColor: '#264431', // #264431
//         color: '#FFFFFF', // White text color #FFFFFF
//         '&:hover': {
//             backgroundColor: '#1d3a2a', // #1d3a2a
//         },
//     },
//     components_MuiButton_outlinedPrimary: {
//         backgroundColor: '#264431', // #264431
//         color: '#FFFFFF', // White text color #FFFFFF
//         '&:hover': {
//             backgroundColor: '#1d3a2a', // #2a2e51
//         },
//     },
//     components_MuiButton_outlinedSecondary: {
//         backgroundColor: '#264431', // #264431
//         color: '#FFFFFF', // White text color #FFFFFF
//         '&:hover': {
//             backgroundColor: '#1d3a2a', // #1d3a2a
//         },
//     },

//     components_MuiTextField_root: {
//         '& .MuiOutlinedInput-root': {
//             '& fieldset': {
//                 borderColor: '#8A2BE2', // Blue Violet border color #8A2BE2
//             },
//             '&:hover fieldset': {
//                 borderColor: '#DDA0DD', // Plum border color #DDA0DD
//             },
//             '&.Mui-focused fieldset': {
//                 borderColor: '#FFFFFF',   // White border color #FFFFFF
//             },
//         },
//     },
//     components_MuiTextField_input: {
//         color: '#FFFFFF', // White text color #FFFFFF
//     },

//     components_MuiTabList_root: {
//         "& .MuiTab-root": {
//             fontSize: "1rem", // Larger text
//             fontWeight: "bold", // Make the text bold
//             border: "2px solid transparent", // Default border
//             borderRadius: "8px", // Rounded corners
//             padding: "12px 24px",
//             margin: "4px",
//             transition: "0.3s",
//             color: "#FFFFFF", // White text
//         },
//         "& .MuiTab-root.Mui-selected": {
//             borderColor: "#FFFFFF", // White outline for the selected tab
//             backgroundColor: "rgba(255,255,255,0.1)", // Slight highlight
//         },
//         "& .MuiTab-root:hover": {
//             borderColor: "#888888", // Gray outline on hover
//         },
//     },

//     components_Dropzone_root: {
//         border: '2px dashed #8A2BE2', // Blue Violet border #8A2BE2
//         padding: '20px',
//         textAlign: 'center',
//         cursor: 'pointer',
//         backgroundColor: '#364b61', // Medium dark shade of cyan-blue #364b61
//         transition: 'background-color 0.3s ease-in-out',
//         color: '#FFFFFF', // White text color   #FFFFFF
//     },
//     components_Dropzone_active: {
//         backgroundColor: '#8A2BE2', // Blue Violet when dragging #8A2BE2
//         borderColor: '#DDA0DD', // Plum border color #DDA0DD
//     },
//     trackerPageStyles: {
//         tabsContainer: {
//             borderBottom: 2,
//             borderColor: "primary.main",
//             backgroundColor: "#1E1E1E",
//             borderRadius: "8px",
//             padding: "8px",
//             display: "flex",
//             justifyContent: "center",
//         },
//         tabList: {
//             "& .MuiTab-root": {
//                 fontSize: "1rem",
//                 fontWeight: "bold",
//                 border: "2px solid transparent",
//                 borderRadius: "8px",
//                 padding: "12px 24px",
//                 margin: "4px",
//                 transition: "0.3s",
//                 color: "#FFFFFF",
//             },
//             "& .MuiTab-root.Mui-selected": {
//                 borderColor: "#FFFFFF",
//                 backgroundColor: "rgba(255,255,255,0.1)",
//             },
//             "& .MuiTab-root:hover": {
//                 borderColor: "#888888",
//             },
//         },
//         tabPanelBox: {
//             display: "flex",
//             justifyContent: "space-between",
//             gap: 4,
//             width: "100%",
//         },
//         chartBox: {
//             width: "50%",
//             minWidth: 600,
//         },
//         reportBox: {
//             width: "100%",
//             minWidth: 600,
//             mt: 4,
//         },
//         trackerBox: {
//             border: "2px solid #ddd",
//             borderRadius: "8px",
//             padding: "16px",
//             backgroundColor: "#1E1E1E",
//             width: "50%",
//         },
//     },
// };

export const THEME_LIGHT = {
    // Primary color palette
    primary_main: '#FFFFFF', // #FFFFFF
    primary_secondary: '#191924', // Dark Gray #1E1E2E
    primary_contrastText: '#FFFFFF', // White text on primary background #FFFFFF
    // Secondary color palette
    secondary_main: '#0A3D62', // Deep Ocean Blue #0A3D62
    secondary_contrastText: '#FFFFFF', // White text on secondary background #FFFFFF
    // Background color palette
    background_default: '#FFFFFF', // Light background #FFFFFF
    background_mid: '#F0F0F0', // Light gray background #F0F0F0
    background_paper: '#FFFFFF', // White paper color #FFFFFF
    background_dropdown: '#1E1E1E', // Dark Gray for dropdowns #1E1E1E
    background_tabs: '#1E1E1E', // Dark Gray for tabs #1E1E1E
    // Text color palette
    text_primary: '#FFFFFF', // White text for general use #FFFFFF
    text_secondary: '#A6A6A6', // Light Gray for secondary text #A6A6A6
    text_disabled: '#757575', // Muted Gray for disabled text #757575
    text_dropdown: '#FFFFFF', // White text for dropdowns 
    // Button color palette
    button_main: '#242424', // Dark Gray #242424
    button_contrastText: '#FFFFFF', // White text on buttons #FFFFFF
    button_hover: '#333333', // Dark Charcoal hover color #333333
    button_disabled: '#383838', // Dark Gray for disabled buttons #383838
    button_disabledText: '#A6A6A6', // Light Gray for disabled text #A6A6A6 
    // Progress indicator color palette
    progressIndicator_main: '#8A2BE2', // Vibrant Purple #8A2BE2

    // Typography
    typography_fontFamily: 'Arial, sans-serif',
    typography_h1: { fontSize: '48px', fontWeight: 700 },
    typography_h2: { fontSize: '32px', fontWeight: 600 },
    typography_h3: { fontSize: '20px', fontWeight: 600 },
    typography_body1: { fontSize: '18px' },
    typography_body2: { fontSize: '16px' },
    typography_body3: { fontSize: '14px' },
    typography_body4: { fontSize: '12px' },

    // Spacing
    spacing: 4, // Default spacing unit

    border_tabs: "2px solid #FFFFFF", // White border for selected tab


    // Components
    components_MuiCssBaseline_select: {
        padding: "4px",
        borderRadius: "8px",
        border: "1px solid '#757575'", // Using the disabled text color #757575
        backgroundColor: "#000000", // Black background #000000
        color: "#FFFFFF", // White text color #FFFFFF
        "&:focus": {
            borderColor: '#333333', // Dark Charcoal focus color #333333
            outline: "none",
        },
    },
    components_MuiCssBaseline_body: {
        background: `linear-gradient(to right, #242424, #1E1E2E)`,
        color: '#FFFFFF',
        a: {
            color: '#8A2BE2', // Blue Violet #8A2BE2
            textDecoration: 'none',
            '&:hover': {
                textDecoration: 'underline',
            },
        },
    },

    components_MuiTable_root: {
        backgroundColor: "#242424", // Default background for the whole table #242424
        color: "#FFFFFF", // Default text color #FFFFFF
    },
    components_MuiTableHead_root: {
        position: "sticky", //  Makes the header stick
        top: 0, //  Keeps it at the top when scrolling
        zIndex: 2, //  Ensures it stays above other rows
        backgroundColor: "#1E1E2E", //  Ensures background color remains visible #1E1E2E
    },
    components_MuiTableRow_root: {
        height: "15px", //  Sets row height
        "&:nth-of-type(even)": {
            backgroundColor: "#2C2C3C", //  Alternating row color #3e596c
        },
        "&:hover": {
            backgroundColor: "#393939", //  Hover effect color #393939
        },
    },

    components_MuiTableCell_root: {
        padding: "1px 4px", //  Controls cell padding (affects row height)
        color: "#FFFFFF",
        borderBottom: "1px solid #1E1E2E",
        fontSize: "14px", //  Sets a default font size for table cells
        fontFamily: "Arial, sans-serif", //  Ensure font consistency
    },

    components_MuiTableCell_head: {
        fontWeight: "bold",
        textTransform: "uppercase",
        backgroundColor: '#1E1E2E', //  Header background color #3a3e61
        color: "#FFFFFF",
        padding: "14px 16px", //  Increase header row height
        fontSize: "16px", //  Larger font size for headers
        position: "sticky", //  Ensures column headers remain visible
        top: 0, //  Keeps it at the top
        zIndex: 3, //  Higher than rows to prevent overlap
    },

    components_MuiDataGrid_defaultProps: {
        rowHeight: 40,
        pageSize: 25,
        pageSizeOptions: [10, 25, 100, { value: -1, label: 'All' }],
        checkboxSelection: true,
        disableSelectionOnClick: true,
        sortingOrder: ['asc', 'desc'],
        slots: {
            toolbar: GridToolbar,
        },
        slotProps: {
            toolbar: { showQuickFilter: true },
        },
    },
    components_MuiDataGrid_root: {
        backgroundColor: "#242424", //  Darker Gray background color #242424
        borderRadius: "8px",
        color: "#FFFFFF", // White text color #FFFFFF
        border: `1px solid #1E1E2E`, //  Border color #C4C4C4
    },
    components_MuiDataGrid_columnHeaders: {
        backgroundColor: "#1E1E2E", //  Header background color #264431
        color: "#FFFFFF",   // White text color #FFFFFF
        fontSize: "16px",
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    components_MuiDataGrid_row: {
        "&:nth-of-type(even)": {
            backgroundColor: '#2C2C3C', //  Alternating row color #3e596c
        },
        "&:hover": {
            backgroundColor: '#393939', //  Hover effect color #8A2BE2
        },
    },
    components_MuiDataGrid_cell: {
        borderColor: "#1E1E2E !important", //  Purple cell borders #8A2BE2
    },

    components_MuiDataGrid_columnSeparator: {
        color: "#1E1E2E !important", //  Purple column separator color #8A2BE2
    },
    components_MuiDataGridfooter_Container: {
        backgroundColor: "#1E1E2E", //  Footer background color #264431
        color: "#FFFFFF", // White text color #FFFFFF
    },
    components_MuiDataGrid_toolbar: {
        backgroundColor: "#1E1E2E", //  Toolbar background color #264431
        color: "#FFFFFF", // White text color #FFFFFF
    },

    components_MuiButton_root: {
        borderRadius: 8,
        textTransform: 'none',
    },
    components_MuiButton_containedPrimary: {
        backgroundColor: '#242424', // #264431
        color: '#FFFFFF', // White text color #FFFFFF
        '&:hover': {
            backgroundColor: '#333333', // #1d3a2a
        },
    },
    components_MuiButton_containedSecondary: {
        backgroundColor: '#242424', // #264431
        color: '#FFFFFF', // White text color #FFFFFF
        '&:hover': {
            backgroundColor: '#333333', // #1d3a2a
        },
    },
    components_MuiButton_outlinedPrimary: {
        backgroundColor: '#242424', // #264431
        color: '#FFFFFF', // White text color #FFFFFF
        '&:hover': {
            backgroundColor: '#333333', // #2a2e51
        },
    },
    components_MuiButton_outlinedSecondary: {
        backgroundColor: '#242424', // #264431
        color: '#FFFFFF', // White text color #FFFFFF
        '&:hover': {
            backgroundColor: '#333333', // #1d3a2a
        },
    },

    components_MuiTextField_root: {
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: '#8A2BE2', // Blue Violet border color #8A2BE2
            },
            '&:hover fieldset': {
                borderColor: '#DDA0DD', // Plum border color #DDA0DD
            },
            '&.Mui-focused fieldset': {
                borderColor: '#FFFFFF',   // White border color #FFFFFF
            },
        },
    },
    components_MuiTextField_input: {
        color: '#FFFFFF', // White text color #FFFFFF
    },


    components_Dropzone_root: {
        border: '2px dashed #8A2BE2', // Blue Violet border #8A2BE2
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: '#242424', // Dark Gray background #242424
        transition: 'background-color 0.3s ease-in-out',
        color: '#FFFFFF', // White text color   #FFFFFF
        borderRadius: "8px",
        width: "100%",
        maxWidth: 600,
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    components_Dropzone_active: {
        backgroundColor: '#6F1E96', // #6F1E96
        borderColor: '#DDA0DD', // Plum border color #DDA0DD
    },
    trackerPageStyles: {
        tabsContainer: {
            borderBottom: 2,
            borderColor: "#FFFFFF", // White border color #FFFFFF
            backgroundColor: "#1E1E1E", // Dark Gray background #1E1E1E
            borderRadius: "8px",
            padding: "2px",
            display: "flex",
            justifyContent: "center",
        },
        tabList: {
            "& .MuiTab-root": {
                fontSize: "1rem",
                fontWeight: "bold",
                border: "2px solid transparent",
                borderRadius: "8px",
                padding: "12px 24px",
                margin: "4px",
                transition: "0.3s",
                color: "#FFFFFF",   // White text color #FFFFFF
            },
            "& .MuiTab-root.Mui-selected": {
                borderColor: "#FFFFFF", // White outline for the selected tab #FFFFFF
                backgroundColor: "rgba(255,255,255,0.1)",
            },
            "& .MuiTab-root:hover": {
                borderColor: "#888888", // Gray outline on hover #888888
            },
        },
        tabPanelBox: {
            display: "flex",
            justifyContent: "space-between",
            gap: 4,
            width: "100%",
        },
        chartBox: {
            width: "50%",
            minWidth: 600,
            mt: 4,
        },
        reportBox: {
            width: "100%",
            minWidth: 600,
            mt: 4,
        },
        trackerBox: {
            border: "2px solid #ddd",
            borderRadius: "8px",
            padding: "16px",
            backgroundColor: "#1E1E1E", // Dark Gray background #1E1E1E
            width: "100%",
        },
    },
};

export const THEME_DARK = {
    // Primary color palette
    primary_main: '#FFFFFF', // Deep Purple-Blue #1E1E2E 
    primary_secondary: '#191924', // Dark Gray #1E1E2E
    primary_contrastText: '#FFFFFF', // White text on primary background #FFFFFF
    // Secondary color palette
    secondary_main: '#0A3D62', // Deep Ocean Blue #0A3D62
    secondary_contrastText: '#FFFFFF', // White text on secondary background #FFFFFF
    // Background color palette
    background_default: '#121212', // Deep Black-Gray #121212
    background_mid: '#1A1A2E', // Dark Navy Blue #1A1A2E
    background_paper: '#242424', // Darker Gray #242424
    background_dropdown: '#1E1E1E', // Dark Gray for dropdowns #1E1E1E
    background_tabs: '#1E1E1E', // Dark Gray for tabs #1E1E1E
    // Text color palette
    text_primary: '#FFFFFF', // White text for general use #FFFFFF
    text_secondary: '#A6A6A6', // Light Gray for secondary text #A6A6A6
    text_disabled: '#757575', // Muted Gray for disabled text #757575
    text_dropdown: '#FFFFFF', // White text for dropdowns 
    // Button color palette
    button_main: '#242424', // Dark Gray #242424
    button_contrastText: '#FFFFFF', // White text on buttons #FFFFFF
    button_hover: '#333333', // Dark Charcoal hover color #333333
    button_disabled: '#383838', // Dark Gray for disabled buttons #383838
    button_disabledText: '#A6A6A6', // Light Gray for disabled text #A6A6A6 
    // Progress indicator color palette
    progressIndicator_main: '#8A2BE2', // Vibrant Purple #8A2BE2

    // Graphs
    graph_background: '#262626', // #262626

    // Spacing
    spacing: 4, // Default spacing unit

    border_tabs: "2px solid #FFFFFF", // White border for selected tab


    // Components
    components_MuiCssBaseline_select: {
        padding: "4px",
        borderRadius: "8px",
        border: "1px solid '#757575'", // Using the disabled text color #757575
        backgroundColor: "#000000",
        color: "#FFFFFF",
        "&:focus": {
            borderColor: '#333333', // Dark Charcoal focus color #333333
            outline: "none",
        },
    },
    components_MuiCssBaseline_body: {
        background: `linear-gradient(to right, #242424, #1E1E2E)`,
        color: '#FFFFFF',
        a: {
            color: '#8A2BE2', // Blue Violet #8A2BE2
            textDecoration: 'none',
            '&:hover': {
                textDecoration: 'underline',
            },
        },
    },

    components_MuiTable_root: {
        backgroundColor: "#242424", // Default background for the whole table #242424
        color: "#FFFFFF", // Default text color #FFFFFF
    },
    components_MuiTableHead_root: {
        position: "sticky", //  Makes the header stick
        top: 0, //  Keeps it at the top when scrolling
        zIndex: 2, //  Ensures it stays above other rows
        backgroundColor: "#1E1E2E", //  Ensures background color remains visible #1E1E2E
    },
    components_MuiTableRow_root: {
        height: "15px", //  Sets row height
        "&:nth-of-type(even)": {
            backgroundColor: "#2C2C3C", //  Alternating row color #3e596c
        },
        "&:hover": {
            backgroundColor: "#393939", //  Hover effect color #393939
        },
    },

    components_MuiTableCell_root: {
        padding: "1px 4px", //  Controls cell padding (affects row height)
        color: "#FFFFFF",
        borderBottom: "1px solid #1E1E2E",
        fontSize: "14px", //  Sets a default font size for table cells
        fontFamily: "Arial, sans-serif", //  Ensure font consistency
    },

    components_MuiTableCell_head: {
        fontWeight: "bold",
        textTransform: "uppercase",
        backgroundColor: '#1E1E2E', //  Header background color #3a3e61
        color: "#FFFFFF",
        padding: "14px 16px", //  Increase header row height
        fontSize: "16px", //  Larger font size for headers
        position: "sticky", //  Ensures column headers remain visible
        top: 0, //  Keeps it at the top
        zIndex: 3, //  Higher than rows to prevent overlap
    },

    components_MuiDataGrid_defaultProps: {
        rowHeight: 40,
        pageSize: 25,
        pageSizeOptions: [10, 25, 100, { value: -1, label: 'All' }],
        checkboxSelection: true,
        disableSelectionOnClick: true,
        sortingOrder: ['asc', 'desc'],
        slots: {
            toolbar: GridToolbar,
        },
        slotProps: {
            toolbar: { showQuickFilter: true },
        },
    },
    components_MuiDataGrid_root: {
        backgroundColor: "#242424", //  Darker Gray background color #242424
        borderRadius: "8px",
        color: "#FFFFFF",
        border: `1px solid #1E1E2E`, //  Border color #C4C4C4
    },
    components_MuiDataGrid_columnHeaders: {
        backgroundColor: "#1E1E2E", //  Header background color #264431
        color: "#FFFFFF",
        fontSize: "16px",
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    components_MuiDataGrid_row: {
        "&:nth-of-type(even)": {
            backgroundColor: '#2C2C3C', //  Alternating row color #3e596c
        },
        "&:hover": {
            backgroundColor: '#393939', //  Hover effect color #8A2BE2
        },
    },
    components_MuiDataGrid_cell: {
        borderColor: "#1E1E2E !important", //  Purple cell borders #8A2BE2
    },

    components_MuiDataGrid_columnSeparator: {
        color: "#1E1E2E !important", //  Purple column separator color #8A2BE2
    },
    components_MuiDataGridfooter_Container: {
        backgroundColor: "#1E1E2E", //  Footer background color #264431
        color: "#FFFFFF",
    },
    components_MuiDataGrid_toolbar: {
        backgroundColor: "#1E1E2E", //  Toolbar background color #264431
        color: "#FFFFFF",
    },

    components_MuiButton_root: {
        borderRadius: 8,
        textTransform: 'none',
    },
    components_MuiButton_containedPrimary: {
        backgroundColor: '#242424', // #264431
        color: '#FFFFFF', // White text color #FFFFFF
        '&:hover': {
            backgroundColor: '#333333', // #1d3a2a
        },
    },
    components_MuiButton_containedSecondary: {
        backgroundColor: '#242424', // #264431
        color: '#FFFFFF', // White text color #FFFFFF
        '&:hover': {
            backgroundColor: '#333333', // #1d3a2a
        },
    },
    components_MuiButton_outlinedPrimary: {
        backgroundColor: '#242424', // #264431
        color: '#FFFFFF', // White text color #FFFFFF
        '&:hover': {
            backgroundColor: '#333333', // #2a2e51
        },
    },
    components_MuiButton_outlinedSecondary: {
        backgroundColor: '#242424', // #264431
        color: '#FFFFFF', // White text color #FFFFFF
        '&:hover': {
            backgroundColor: '#333333', // #1d3a2a
        },
    },

    components_MuiTextField_root: {
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: '#8A2BE2', // Blue Violet border color #8A2BE2
            },
            '&:hover fieldset': {
                borderColor: '#DDA0DD', // Plum border color #DDA0DD
            },
            '&.Mui-focused fieldset': {
                borderColor: '#FFFFFF',   // White border color #FFFFFF
            },
        },
    },
    components_MuiTextField_input: {
        color: '#FFFFFF', // White text color #FFFFFF
    },

    
    components_Dropzone_root: {
        border: '2px dashed #8A2BE2', // Blue Violet border #8A2BE2
        padding: '5px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: '#242424', // Dark Gray background #242424
        transition: 'background-color 0.3s ease-in-out',
        color: '#FFFFFF', // White text color   #FFFFFF
        borderRadius: "8px",
        width: "100%",
        maxWidth: 400,
        minHeight: 80,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    components_Dropzone_active: {
        backgroundColor: '#6F1E96', // #6F1E96
        borderColor: '#DDA0DD', // Plum border color #DDA0DD
    },
    trackerPageStyles: {
        tabsContainer: {
            borderBottom: 2,
            borderColor: "#FFFFFF",
            backgroundColor: "#1E1E1E",
            borderRadius: "8px",
            padding: "8px",
            display: "flex",
            justifyContent: "center",
        },
        tabList: {
            "& .MuiTab-root": {
                fontSize: "1rem",
                fontWeight: "bold",
                border: "2px solid transparent",
                borderRadius: "8px",
                padding: "12px 24px",
                margin: "4px",
                transition: "0.3s",
                color: "#FFFFFF",
            },
            "& .MuiTab-root.Mui-selected": {
                borderColor: "#FFFFFF",
                backgroundColor: "rgba(255,255,255,0.1)",
            },
            "& .MuiTab-root:hover": {
                borderColor: "#888888",
            },
        },
        tabPanelBox: {
            display: "flex",
            justifyContent: "space-between",
            gap: 4,
            width: "100%",
        },
        chartBox: {
            width: "50%",
            minWidth: 600,
            mt: 4,
        },
        reportBox: {
            width: "100%",
            minWidth: 600,
            height: 600,
            mt: 4,
        },
        trackerBox: {
            border: "2px solid #ddd",
            borderRadius: "8px",
            padding: "16px",
            backgroundColor: "#1E1E1E",// #1E1E1E
            width: "100%",
        },
        tracker_Drop_Zone_Arrow: {
            color: '#FFFFFF', // White text color #FFFFFF
            textAlign: 'center',
            backgroundColor: '#242424', // Dark Gray background #242424
            borderRadius: "8px",
            width: "100%",
            maxWidth: 400,
            minHeight: 80,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
        },
    },
};

export const COMMON_SETTINGS = {

    // Typography
    typography_fontFamily: 'Arial, sans-serif',
    typography_h1: { fontSize: '48px', fontWeight: 700 },
    typography_h1_italic: { fontSize: '48px', fontStyle: 'italic' },
    typography_h1_underline: { fontSize: '48px', textDecoration: 'underline' },
    typography_h2: { fontSize: '32px', fontWeight: 600 },
    typography_h2_italic: { fontSize: '32px', fontStyle: 'italic' },
    typography_h2_underline: { fontSize: '32px', textDecoration: 'underline' },
    typography_h3: { fontSize: '20px', fontWeight: 600 },
    typography_h3_italic: { fontSize: '20px', fontStyle: 'italic' },
    typography_h3_underline: { fontSize: '20px', textDecoration: 'underline' },
    typography_h4: { fontSize: '18px', fontWeight: 600 },
    typography_h4_italic: { fontSize: '18px', fontStyle: 'italic' },
    typography_h4_underline: { fontSize: '18px', textDecoration: 'underline' },
    typography_h5: { fontSize: '16px', fontWeight: 600 },
    typography_h5_italic: { fontSize: '16px', fontStyle: 'italic' },
    typography_h5_underline: { fontSize: '16px', textDecoration: 'underline' },
    typography_h6: { fontSize: '14px', fontWeight: 600 },
    typography_h6_italic: { fontSize: '14px', fontStyle: 'italic' },
    typography_h6_underline: { fontSize: '14px', textDecoration: 'underline' },
    typography_body1: { fontSize: '18px' },
    typography_body1_italic: { fontSize: '18px', fontStyle: 'italic' },
    typography_body1_underline: { fontSize: '18px', textDecoration: 'underline' },
    typography_body2: { fontSize: '16px' },
    typography_body2_italic: { fontSize: '16px', fontStyle: 'italic' },
    typography_body2_underline: { fontSize: '16px', textDecoration: 'underline' },
    typography_body3: { fontSize: '14px' },
    typography_body3_italic: { fontSize: '14px', fontStyle: 'italic' },
    typography_body3_underline: { fontSize: '14px', textDecoration: 'underline' },
    typography_body4: { fontSize: '12px' },
    typography_body4_italic: { fontSize: '12px', fontStyle: 'italic' },
    typography_body4_underline: { fontSize: '12px', textDecoration: 'underline' },

    trackerPageStyles: {
        tabsContainer: {
            borderBottom: 2,
            borderColor: "#FFFFFF",
            backgroundColor: "#1E1E1E",
            borderRadius: "8px",
            padding: "8px",
            display: "flex",
            justifyContent: "center",
        },
        tabList: {
            "& .MuiTab-root": {
                fontSize: "1rem",
                fontWeight: "bold",
                border: "2px solid transparent",
                borderRadius: "8px",
                padding: "12px 24px",
                margin: "4px",
                transition: "0.3s",
                color: "#FFFFFF",
            },
            "& .MuiTab-root.Mui-selected": {
                borderColor: "#FFFFFF",
                backgroundColor: "rgba(255,255,255,0.1)",
            },
            "& .MuiTab-root:hover": {
                borderColor: "#888888",
            },
        },
        tabPanelBox: {
            display: "flex",
            justifyContent: "space-between",
            gap: 4,
            width: "100%",
        },
        chartBox: {
            width: "50%",
            minWidth: 600,
            mt: 4,
        },
        reportBox: {
            width: "100%",
            minWidth: 600,
            mt: 4,
        },
        trackerBox: {
            display: "flex",
            flexDirection: "column",
            border: "2px solid #ddd",
            borderRadius: "8px",
            padding: "16px",
            backgroundColor: "#1E1E1E",
            width: "100%",
        },
        tracker_Drop_Zone_Arrow: {
            textAlign: 'left',
            borderRadius: "8px",
            width: "100%",
            maxWidth: 400,
            minHeight: 80,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"

        },
    },
    // Spacing
    spacing: 4, // Default spacing unit

};
