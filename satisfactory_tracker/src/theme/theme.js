import { createTheme } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
const theme = createTheme({
  palette: {
    primary: {
      main: '#3a3e61', // #3a3e61 
      contrastText: '#FFFFFF', // White text on primary background #FFFFFF
    },
    secondary: {
      main: '#264431', // #0F705C #264431
      contrastText: '#FFFFFF', // White text on secondary background #FFFFFF
    },
    background: {
      default: '#264431', // #264431
      mid: '#32527b', // Blue Violet for mid-level components #32527b
      paper: '#364b61', // Medium dark shade of cyan-blue #364b61
      dropdown: '#FFFFFF', // White background for dropdowns #FFFFFF
    },
    text: {
      primary: '#FFFFFF', // White text for general use #FFFFFF
      secondary: '#DDA0DD', // Plum for secondary text #DDA0DD #FFFFFF
      disabled: '#C4C4C4', // Disabled text color #C4C4C4
      dropdown: '#000000', // Black text for dropdowns #000000
    },
    button: {
      main: '#264431', // #0F705C #264431
      contrastText: '#FFFFFF', // White text on primary background #FFFFFF
      hover: '#1d3a2a', // Hover color #1d3a2a
      disabled: '#1d3a2a', // Disabled button color #1d3a2a
      disabledText: '#264431', // White text on disabled button #264431
    },
    progressIndicator: {
      main: '#0bc260', // #0bc260
    }
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    h1: { fontSize: '48px', fontWeight: 700 },
    h2: { fontSize: '32px', fontWeight: 600 },
    h3: { fontSize: '20px', fontWeight: 600 },
    body1: { fontSize: '18px' },
    body2: { fontSize: '16px' },
    body3: { fontSize: '14px' },
    body4: { fontSize: '12px' },
  },

  spacing: 4, // Default spacing unit

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        select: {
          padding: "4px",
          borderRadius: "8px",
          border: "1px solid #C4C4C4", // Using the disabled text color
          backgroundColor: "#FFFFFF",
          color: "#000000",
          "&:focus": {
            borderColor: "#8A2BE2", // Blue Violet focus color
            outline: "none",
          },
        },
        body: {
          background: `linear-gradient(to right, #364b61, #3e596c)`,
          color: '#FFFFFF',
        },
        a: {
          color: '#3a3e61', // #3a3e61
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
      },
    },
    
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: "#364b61", // Default background for the whole table
          color: "#FFFFFF", // Default text color
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          position: "sticky", // ✅ Makes the header stick
          top: 0, // ✅ Keeps it at the top when scrolling
          zIndex: 2, // ✅ Ensures it stays above other rows
          backgroundColor: "#264431", // ✅ Ensures background color remains visible #264431
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          height: "15px", // ✅ Sets row height
          "&:nth-of-type(even)": {
            backgroundColor: "#3e596c",
          },
          "&:hover": {
            backgroundColor: "#3a3e61",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "1px 4px", // ✅ Controls cell padding (affects row height)
          color: "#FFFFFF",
          borderBottom: "1px solid #8A2BE2",
          fontSize: "14px", // ✅ Sets a default font size for table cells
          fontFamily: "Arial, sans-serif", // ✅ Ensure font consistency
        },
        head: {
          fontWeight: "bold",
          textTransform: "uppercase",
          backgroundColor: "#264431", // ✅ Header background color #3a3e61
          color: "#FFFFFF",
          padding: "14px 16px", // ✅ Increase header row height
          fontSize: "16px", // ✅ Larger font size for headers
          position: "sticky", // ✅ Ensures column headers remain visible
          top: 0, // ✅ Keeps it at the top
          zIndex: 3, // ✅ Higher than rows to prevent overlap
        },
      },
    },
    
    MuiDataGrid: {
      defaultProps: {
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
      styleOverrides: {
        root: {
          backgroundColor: "#364b61", // ✅ Default background color #364b61
          borderRadius: "8px",
          color: "#FFFFFF",
          border: `1px solid #8A2BE`, // ✅ Border color #C4C4C4
        },
        columnHeaders: {
          backgroundColor: "#264431", // ✅ Header background color #264431
          color: "#FFFFFF",
          fontSize: "16px",
          fontWeight: "bold",
          textTransform: "uppercase",
        },
        row: {
          "&:nth-of-type(even)": {
            backgroundColor: "#3e596c", // ✅ Alternating row color #3e596c
          },
          "&:hover": {
            backgroundColor: "#3a3e61", // ✅ Hover effect color #8A2BE2
          },
        },
        cell: {
          borderColor: "#8A2BE2 !important", // ✅ Purple cell borders
        },
        columnSeparator: {
          color: "#8A2BE2 !important", // ✅ Purple dividers between columns
        },
        footerContainer: {
          backgroundColor: "#264431", // ✅ Footer background color #264431
          color: "#FFFFFF",
        },
        toolbar: {
          backgroundColor: "#264431", // ✅ Toolbar background color #264431
          color: "#FFFFFF",        
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
        containedPrimary: {
          backgroundColor: '#264431', // #264431
          color: '#FFFFFF', // White text color #FFFFFF
          '&:hover': {
            backgroundColor: '#1d3a2a', // #1d3a2a
          },
        },
        containedSecondary: {
          backgroundColor: '#264431', // #264431
          color: '#FFFFFF', // White text color #FFFFFF
          '&:hover': {
            backgroundColor: '#1d3a2a', // #1d3a2a
          },
        },
        outlinedPrimary: {
          backgroundColor: '#264431', // #264431
          color: '#FFFFFF', // White text color #FFFFFF
          '&:hover': {
            backgroundColor: '#1d3a2a', // #2a2e51
          },
        },
        outlinedSecondary: {
          backgroundColor: '#264431', // #264431
          color: '#FFFFFF', // White text color #FFFFFF
          '&:hover': {
            backgroundColor: '#1d3a2a', // #1d3a2a
          },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
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
      },
    },
    Dropzone: {
      styleOverrides: {
        root: {
          border: '2px dashed #8A2BE2', // Blue Violet border #8A2BE2
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: '#364b61', // Medium dark shade of cyan-blue #364b61
          transition: 'background-color 0.3s ease-in-out',
          color: '#FFFFFF', // White text color   #FFFFFF
        },
        active: {
          backgroundColor: '#8A2BE2', // Blue Violet when dragging #8A2BE2
          borderColor: '#DDA0DD', // Plum border color #DDA0DD
        },
      },
    },
  },
});

export default theme;

