/// This file contains the AlertContext which is used to show alerts in the app.
/// The AlertProvider component is used to wrap the app and
/// the useAlert hook is used to access the showAlert function.


import React, { createContext, useState, useContext } from "react";
import { Snackbar, Alert as MuiAlert } from "@mui/material";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState({ open: false, severity: "info", message: "" });

    const showAlert = (severity, message) => {
        setAlert({ open: true, severity, message });
    };

    const closeAlert = () => {
        setAlert({ ...alert, open: false });
    };

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <Snackbar
                open={alert.open}
                autoHideDuration={6000}
                onClose={closeAlert}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <MuiAlert onClose={closeAlert} severity={alert.severity} elevation={6} variant="filled">
                    {alert.message}
                </MuiAlert>
            </Snackbar>
        </AlertContext.Provider>
    );
};

export const useAlert = () => useContext(AlertContext);
