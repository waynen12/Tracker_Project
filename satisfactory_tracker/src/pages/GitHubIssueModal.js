import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, TextField, Button, Alert, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import axios from "axios";
import { API_ENDPOINTS } from "../apiConfig";
import { UserContext } from '../context/UserContext';
import logToBackend from "../services/logService";

const GitHubIssueModal = ({ open, onClose }) => {
  const { user } = React.useContext(UserContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [labels, setLabels] = useState(["bug"]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [browserInfo, setBrowserInfo] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  // Function to extract browser & OS from User-Agent
  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;

    let browser = "Unknown";
    if (userAgent.includes("Chrome")) browser = "Google Chrome";
    if (userAgent.includes("Firefox")) browser = "Mozilla Firefox";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browser = "Safari";
    if (userAgent.includes("Edge")) browser = "Microsoft Edge";

    let os = "Unknown OS";
    if (userAgent.includes("Windows")) os = "Windows";
    if (userAgent.includes("Mac OS")) os = "Mac OS";
    if (userAgent.includes("Linux")) os = "Linux";

    return `Browser: ${browser} | OS: ${os} | Page: ${window.location.href}`;
  };

  // Inside `useEffect()`, replace the old `setBrowserInfo`
  useEffect(() => {
    setBrowserInfo(getBrowserInfo());
  }, []);

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    let uploadedImageUrl = "";

    // ✅ Upload image if one is selected
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);

      try {
        const uploadResponse = await axios.post(API_ENDPOINTS.upload_screenshot, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        uploadedImageUrl = uploadResponse.data.image_url;
        setImageUrl(uploadedImageUrl);
      } catch (error) {
        setError("Failed to upload screenshot.");
        return;
      }
    }

    // ✅ Include the tester's username in the issue description
    const issueDescription = `
### Issue Reported by: ${user?.username || "Unknown"}
---
${description}

---

**Browser Info:**  
${browserInfo}
`;

    try {
      const response = await axios.post(API_ENDPOINTS.github_issue, {
        title,
        description: issueDescription,
        labels
      });

      setSuccessMessage(response.data.issue_url);
      setTitle("");
      setDescription("");
      setLabels(["bug"]);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to create issue.");
      logToBackend("Failed to create GitHub issue", error);
    }
  };



  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        bgcolor: "background.paper", padding: 4, borderRadius: 3, boxShadow: 24,
        width: "500px", maxWidth: "90%" // 🔹 Responsive width
      }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>Report an Issue</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Issue created successfully! {" "}
            <a href={successMessage} target="_blank" rel="noopener noreferrer">
              View it here.
            </a>
          </Alert>
        )}


        {/* 🔹 Restrict issue reporting to logged-in users */}
        {!user ? (
          <Alert severity="warning">⚠️ You must be logged in to report an issue.</Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField fullWidth required label="Title" value={title} onChange={(e) => setTitle(e.target.value)} margin="normal" />

            <TextField fullWidth required label="Detailed Description" multiline rows={4} value={description} onChange={(e) => setDescription(e.target.value)} margin="normal" />

            <FormControl fullWidth margin="normal">
              <InputLabel>Labels</InputLabel>
              <Select multiple value={labels} onChange={(e) => setLabels(e.target.value)}>
                <MenuItem value="bug">Bug</MenuItem>
                <MenuItem value="enhancement">Enhancement</MenuItem>
                <MenuItem value="question">Question</MenuItem>
              </Select>
            </FormControl>

            {/* ✅ Image Upload Field */}
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ marginTop: "10px" }} />

            {/* 🔹 Display Browser & URL Info */}
            <Typography variant="body2" sx={{ mt: 2, color: "gray", fontSize: "0.9rem" }}>
              <strong>Browser Info:</strong>
              <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word", fontSize: "0.8rem", background: "#f4f4f4", padding: "8px", borderRadius: "4px" }}>
                {browserInfo}
              </pre>
            </Typography>

            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, backgroundColor: "#ff5722", "&:hover": { backgroundColor: "#e64a19" } }}>
              Submit
            </Button>
          </form>
        )}
      </Box>
    </Modal>
  );
};

export default GitHubIssueModal;
