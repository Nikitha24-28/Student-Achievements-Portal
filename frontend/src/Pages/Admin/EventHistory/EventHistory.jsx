import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Button,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  TablePagination,
  Menu,
  MenuItem,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  Chip,
} from "@mui/material";
import axios from "axios";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import DownloadIcon from "@mui/icons-material/Download";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import "./EventHistory.css";


const EventHistory = () => {
  const [eventHistory, setEventHistory] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRegNo, setFilterRegNo] = useState("");
  const [filterCategory, setFilterCategory] = useState([]);
  const [filterEventId, setFilterEventId] = useState([]);
  const [filterEndYear, setFilterEndYear] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const open = Boolean(anchorEl);


  const categories = [
    "Hackathon",
    "Health",
    "Business",
    "Environment",
    "Quiz",
    "Tech",
    "Education",
    "Science",
    "Info",
    "Internship",
    "Patent filing",
    "Paper presentation",
    "Workshop",
    "Pitch desk"
    // Add more categories as needed
  ];


  const eventIds = Array.from({ length: 85 }, (_, index) => index + 1); // Event ID from 1 to 85


  const years = Array.from({ length: 10 }, (_, index) => 2021 + index); // End Year from 2021 to 2030


  useEffect(() => {
    fetchAllEventHistory();
  }, []);


  const fetchAllEventHistory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/approve-event-history");
      const approvedEvents = response.data.filter(event => event.status === 'approved');
      setEventHistory(approvedEvents);
      setFilteredData(approvedEvents);
    } catch (error) {
      console.error("Error fetching event history:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleSearch = () => {
    let filtered = eventHistory;


    // Apply filtering based on input fields
    if (filterRegNo) {
      filtered = filtered.filter((ev) => ev.s_reg_no.toLowerCase().includes(filterRegNo.toLowerCase()));
    }
    if (filterCategory.length > 0) {
      filtered = filtered.filter((ev) => filterCategory.includes(ev.category));
    }
    if (filterEventId.length > 0) {
      filtered = filtered.filter((ev) => filterEventId.includes(ev.event_id));
    }
    if (filterEndYear.length > 0) {
      filtered = filtered.filter((ev) => filterEndYear.includes(ev.end_year));
    }


    setFilteredData(filtered);
  };


  const handleDownloadClick = (event) => {
    setAnchorEl(event.currentTarget);
  };


  const handleClose = () => {
    setAnchorEl(null);
  };


  const exportToExcel = () => {
    const dataToExport = filteredData.map((row) => ({
      "Reg No": row.s_reg_no || "N/A",
      "Student Name": row.stud_name || "N/A",
      "End Year": row.end_year || "N/A",
      "Event Name": row.event_name || "N/A",
      "Category": row.category || "N/A",
      "Organisers": row.e_organisers || "N/A",
      "Start Date": row.start_date || "N/A",
      "End Date": row.end_date || "N/A",
    }));


    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Event History");


    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "Event_History.xlsx");
    handleClose();
  };


  const exportToPDF = () => {
    if (!filteredData || filteredData.length === 0) {
      alert("No data to export.");
      handleClose();
      return;
    }


    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Event History", 14, 22);


    const tableColumn = [
      "Reg No",
      "Student Name",
      "End Year",
      "Event Name",
      "Category",
      "Organisers",
      "Start Date",
      "End Date",
    ];


    const tableRows = filteredData.map((row) => [
      row.s_reg_no || "N/A",
      row.stud_name || "N/A",
      row.end_year || "N/A",
      row.event_name || "N/A",
      row.category || "N/A",
      row.e_organisers || "N/A",
      row.start_date || "N/A",
      row.end_date || "N/A",
    ]);


    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [22, 160, 133] },
      margin: { top: 30 },
    });


    doc.save("Event_History.pdf");
    handleClose();
  };


  const handleOpenFilterModal = () => {
    setOpenFilterModal(true);
  };


  const handleCloseFilterModal = () => {
    setOpenFilterModal(false);
  };


  const handleFilter = () => {
    handleSearch();
    handleCloseFilterModal();
  };


  return (
    <Box className="event-history-container" >
      <Box display="flex" gap={2} alignItems="center" mb={2}>
        <TextField
          label="Search by Reg No"
          variant="outlined"
          size="small"
          value={filterRegNo}
          onChange={(e) => setFilterRegNo(e.target.value)}
        />
        <Button
          variant="outlined"
          sx={{color:"#8013bd" , borderColor:"#8013bd"}}
          startIcon={<FilterAltIcon />}
          onClick={handleOpenFilterModal}
        >
          Filter
        </Button>
        <IconButton onClick={handleDownloadClick}>
          <DownloadIcon sx={{color:"#8013bd"}}/>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <MenuItem onClick={exportToExcel}>Download as Excel</MenuItem>
          <MenuItem onClick={exportToPDF}>Download as PDF</MenuItem>
        </Menu>
      </Box>


      <Modal
        open={openFilterModal}
        onClose={handleCloseFilterModal}
        aria-labelledby="filter-modal-title"
        aria-describedby="filter-modal-description"
      >
        <Box
        sx={{
          p: 4,
          width: 600, // You can adjust this value as per your requirement
          margin: "auto",  // Centers the modal horizontally
          backgroundColor: "white",
          borderRadius: 2,
          position: "absolute", // Ensures the modal is centered on the screen
          top: "50%", // Moves it vertically to the center
          left: "50%", // Moves it horizontally to the center
          transform: "translate(-50%, -50%)", // Adjusts it so it's perfectly centered
        }}>
          <Typography variant="h6" id="filter-modal-title">Filter Events</Typography>
          <Box mt={2}>
            <TextField
              label="Reg No"
              variant="outlined"
              size="small"
              fullWidth
              value={filterRegNo}
              onChange={(e) => setFilterRegNo(e.target.value)}
            />
          </Box>
          <Box mt={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Category</InputLabel>
              <Select
                multiple
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Category"
              >
                {categories.map((category) => (
                  <MuiMenuItem key={category} value={category}>
                    {category}
                  </MuiMenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box mt={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Event ID</InputLabel>
              <Select
                multiple
                value={filterEventId}
                onChange={(e) => setFilterEventId(e.target.value)}
                label="Event ID"
              >
                {eventIds.map((id) => (
                  <MuiMenuItem key={id} value={id}>
                    {id}
                  </MuiMenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box mt={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>End Year</InputLabel>
              <Select
                multiple
                value={filterEndYear}
                onChange={(e) => setFilterEndYear(e.target.value)}
                label="End Year"
              >
                {years.map((year) => (
                  <MuiMenuItem key={year} value={year}>
                    {year}
                  </MuiMenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button onClick={handleCloseFilterModal} color="secondary">Cancel</Button>
            <Button onClick={handleFilter} color="primary">Apply Filter</Button>
          </Box>
        </Box>
      </Modal>


      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#7209b7" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>Reg No</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>Student Name</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>End Year</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>Event Name</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>Category</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>Start Date</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>End Date</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "white" }}>Organisers</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      height: 70,
                      backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#ffffff",
                    }}
                  >
                    <TableCell>{row.s_reg_no}</TableCell>
                    <TableCell>{row.stud_name}</TableCell>
                    <TableCell>{row.end_year}</TableCell>
                    <TableCell>{row.event_name}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.start_date}</TableCell>
                    <TableCell>{row.end_date}</TableCell>
                    <TableCell>{row.e_organisers}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 15]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
          />
        </TableContainer>
      )}
    </Box>
  );
};


export default EventHistory;