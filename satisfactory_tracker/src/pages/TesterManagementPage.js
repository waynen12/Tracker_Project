import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Alert } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { API_ENDPOINTS } from "../apiConfig";

const TesterManagementPage = () => {
  const [testers, setTesters] = useState([]);
  const [error, setError] = useState("");
  const [emailContent, setEmailContent] = useState(""); // New state for generated email text

  useEffect(() => {
    fetchTesters();
  }, []);

  const fetchTesters = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.tester_requests);
      setTesters(response.data);
    } catch (error) {
      setError("Failed to load tester requests.");
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await axios.post(`${API_ENDPOINTS.tester_approve}/${id}`);
      const tempPassword = response.data.temp_password;
      const tester = testers.find(t => t.id === id);

      // ✅ Generate email content
      const emailText = `
Hello ${tester.username},

Congratulations! You have been approved as a tester for Satisfactory Tracker.

You can now log in to your account using the following credentials:

🔹 **Email**: ${tester.email}  
🔹 **Temporary Password**: ${tempPassword}  

For security reasons, you will be required to change your password upon first login.  
Login here: [Insert Website URL]

Welcome aboard and happy tracking! 🎉

Best,  
The Satisfactory Tracker Team`;

      setEmailContent(emailText); // Store email text for display
      setTesters(testers.map(t => t.id === id ? { ...t, is_approved: true, reviewed_at: new Date().toISOString() } : t));
    } catch (error) {
      setError("Failed to approve tester.");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(`${API_ENDPOINTS.tester_reject}/${id}`);
      setTesters(testers.map(t =>
        t.id === id ? { ...t, is_approved: false, reviewed_at: new Date().toISOString() } : t
      ));
    } catch (error) {
      setError("Failed to reject tester.");
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "username", headerName: "Username", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "fav_thing", headerName: "Favorite Thing", width: 250 },
    { field: "reason", headerName: "Reason", width: 250 },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => {
        if (params.row.is_approved) return "✅ Approved";
        if (!params.row.is_approved && params.row.reviewed_at) return "❌ Rejected";
        return "⏳ Pending";
      },
    },
    { field: "reviewed_at", headerName: "Reviewed At", width: 150, renderCell: (params) => params.value ? new Date(params.value).toLocaleString() : "Pending" },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <>
          {!params.row.is_approved && !params.row.reviewed_at && (
            <Button variant="contained" color="success" onClick={() => handleApprove(params.row.id)} sx={{ marginRight: 1 }}>
              Approve
            </Button>
          )}
          {!params.row.reviewed_at && (
            <Button variant="contained" color="error" onClick={() => handleReject(params.row.id)}>
              Reject
            </Button>
          )}
        </>
      ),
    },
  ];

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>Tester Management</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Box sx={{ height: 500, width: "100%" }}>
        <DataGrid rows={testers} columns={columns} pageSize={5} />
      </Box>
      {/* ✅ Show email text when a tester is approved */}
      {emailContent && (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h6">Generated Email:</Typography>
          <textarea
            value={emailContent}
            readOnly
            style={{ width: "100%", height: "150px", padding: "10px", fontSize: "14px" }}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{ marginTop: 1 }}
            onClick={() => navigator.clipboard.writeText(emailContent)}
          >
            Copy to Clipboard
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TesterManagementPage;
