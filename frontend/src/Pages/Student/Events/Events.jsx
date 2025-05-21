import * as React from 'react';
import axios from "axios";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow,
  TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Alert
} from '@mui/material';
import './Events.css';




const columns = [
  { id: 'event_id', label: 'Event ID', minWidth: 100 },
  { id: 'reg_button', label: 'Registration', minWidth: 100 },
  { id: 'event_name', label: 'Event Name', minWidth: 200 },
  { id: 'category', label: 'Category', minWidth: 150 },
  { id: 'eligible_dept', label: 'Eligible Departments', minWidth: 150 },
  { id: 'start_date', label: 'Start Date', minWidth: 150 },
  { id: 'end_date', label: 'End Date', minWidth: 150 },
  { id: 'location', label: 'Location', minWidth: 180 },
  { id: 'website_link', label: 'Website URL', minWidth: 150 },
  { id: 'mode', label: 'Mode of Event', minWidth: 100 },
  { id: 'organization', label: 'Conducted by', minWidth: 180 },
  { id: 'max_count', label: 'Max Count', minWidth: 150 },
  { id: 'accepted_count', label: 'Accepted Count', minWidth: 150 },
  { id: 'balance_count', label: 'Pending Count', minWidth: 150 },
];


const Events = () => {
  const [events, setEvents] = React.useState([]);
  const [filteredEvents, setFilteredEvents] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] = React.useState("success");
  const [newEvent, setNewEvent] = React.useState({
    event_name: "", category: "", start_date: "", end_date: "",
    location: "", website_link: "", mode: "", organization: ""
  });
  const [registeredEventIds, setRegisteredEventIds] = React.useState([]);
  const [registerModalOpen, setRegisterModalOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState(null);
  const [studentDetails, setStudentDetails] = React.useState(null);



  const fetchApprovedEvents = () => {
    setLoading(true);
    axios.get("http://localhost:5000/fetch-approved-events")
      .then(response => {
        setEvents(response.data);
        setFilteredEvents(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching approved events:", error);
        setLoading(false);
      });
  };


  React.useEffect(() => {
    fetchApprovedEvents();
    const interval = setInterval(fetchApprovedEvents, 5000); // auto-refresh
    return () => clearInterval(interval);
  }, []);




  React.useEffect(() => {
    const email = localStorage.getItem("email");
    axios.get(`http://localhost:5000/get-registered-events/${email}`)
      .then(res => {
        setRegisteredEventIds(res.data); // assume it returns an array of event_ids
      })
      .catch(err => {
        console.error(err);
      });
  }, []);


  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = events.filter(event => event.event_name.toLowerCase().includes(query));
    setFilteredEvents(filtered);
    setPage(0);
  };


  const handleClose = () => {
    setNewEvent({
      event_name: "", category: "", start_date: "", end_date: "",
      location: "", website_link: "", mode: "", organization: ""
    });
    setOpen(false);
  };


  const handleInputChange = (event) => {
    setNewEvent({ ...newEvent, [event.target.name]: event.target.value });
  };


  function getCurrentTime() {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000;
    const localTime = new Date(now.getTime() - offsetMs);
    return localTime.toISOString().slice(0, 19).replace('T', ' ');
  }


  const handleAddEvent = () => {
    const email = localStorage.getItem("email");
    const now = getCurrentTime();
    const eventData = {
      ...newEvent,
      event_created_by: email,
      event_created_at: now
    };


    axios.post("http://localhost:5000/submit-for-approval", eventData)
      .then(() => {
        setSnackbarMessage("Event submitted for approval!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        handleClose();
      })
      .catch((error) => {
        console.error("Error submitting event:", error);
        setSnackbarMessage("Failed to submit event.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };


  const handleRegisterClick = (event) => {
    const email = localStorage.getItem("email");
    axios.get(`http://localhost:5000/get-registration-info/${email}`)
      .then(res => {
        setStudentDetails(res.data);
        setSelectedEvent(event);
        setRegisterModalOpen(true);
      })
      .catch(err => {
        console.error("Failed to fetch student details:", err);
      });
  };


  const handleReject = (eventId) => {
    // Call backend to reject the registration (adjust URL and payload as per your API)
    axios.post("http://localhost:5000/reject-registration", { event_id: eventId })
      .then(() => {
        setSnackbarMessage("Registration rejected and accepted count updated.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
 
        // Update accepted_count and balance_count for the rejected event locally
        const updatedEvents = events.map(event => {
          if (event.event_id === eventId) {
            return {
              ...event,
              accepted_count: Math.max(0, event.accepted_count - 1),
              balance_count: event.balance_count + 1, // Optional, if pending count should increase back
            };
          }
          return event;
        });
        setEvents(updatedEvents);
        setFilteredEvents(updatedEvents);
      })
      .catch((error) => {
        setSnackbarMessage("Failed to reject registration.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        console.error(error);
      });
  };
 
  // Registration: Only decrease balance_count by 1
  const handleConfirmRegister = () => {
    if (!studentDetails || !selectedEvent) return;




    const formatDateTime = (date) => {
      const pad = (n) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };


    const regData = {
      student_id: studentDetails.reg_no,
      event_id: selectedEvent.event_id,
      status: "pending",
      registered_at: formatDateTime(new Date())
    };


    // First check if the student is already registered
    if (registeredEventIds.includes(selectedEvent.event_id)) {
      setSnackbarMessage("You have already registered for this event!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setRegisterModalOpen(false);
      return;
    }

    // Check if event is full
    if (selectedEvent.accepted_count >= selectedEvent.max_count) {
      setSnackbarMessage("This event is already full!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setRegisterModalOpen(false);
      return;
    }


    axios.post("http://localhost:5000/register-event", regData)
      .then(response => {
        setSnackbarMessage("Successfully registered for the event!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setRegisterModalOpen(false);
       
        // Update the local state to reflect the registration
        setRegisteredEventIds(prev => [...prev, selectedEvent.event_id]);
       
        // Update the events list to reflect the new counts
        const updatedEvents = events.map(event => {
          if (event.event_id === selectedEvent.event_id) {
            return {
              ...event,
              accepted_count: event.accepted_count + 1,
              balance_count: Math.max(0, event.balance_count - 1)
            };
          }
          return event;
        });
        setEvents(updatedEvents);
        setFilteredEvents(updatedEvents);




        // Refresh the events list to get the latest data
        fetchApprovedEvents();
      })
      .catch(error => {
        let errorMessage = "Failed to register for the event.";
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        setSnackbarMessage(errorMessage);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        if (errorMessage.includes("Date overlap")) {
          setRegisterModalOpen(false);
        }
      });
  };


  // Add a helper function to check if dates overlap
  const datesOverlap = (start1, end1, start2, end2) => {
    const s1 = new Date(start1);
    const e1 = new Date(end1);
    const s2 = new Date(start2);
    const e2 = new Date(end2);
    return (s1 <= e2) && (e1 >= s2);
  };


  return (
    <main className="main-content">
      <div className='eventspage'>
        <div className='searchNaddd'>
          <div className='searchbar'>
            <TextField
              label="Search by Event Name"
              variant="outlined"
              fullWidth
              margin="normal"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <button onClick={() => setOpen(true)} className='addeventbtn'>
            Add Event
          </button>
        </div>


        {/* Add Event Modal */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogContent>
            {Object.keys(newEvent).map((key, index) => (
              <TextField
                key={key}
                name={key}
                label={key.replace('_', ' ').toUpperCase()}
                fullWidth
                margin="dense"
                type={key.includes("date") ? "date" : "text"}
                value={newEvent[key]}
                onChange={handleInputChange}
                autoFocus={index === 0}
                InputLabelProps={key.includes("date") ? { shrink: true } : {}}
              />
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">Cancel</Button>
            <Button onClick={handleAddEvent} color="primary">Submit for Approval</Button>
          </DialogActions>
        </Dialog>


        {/* Snackbar */}
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
            {snackbarMessage}
          </Alert>
        </Snackbar>


        {/* Register Modal */}
        <Dialog open={registerModalOpen} onClose={() => setRegisterModalOpen(false)}>
          <DialogTitle>Register for Event</DialogTitle>
          <DialogContent dividers>
  {studentDetails && selectedEvent && (
    <div style={{ minWidth: 340 }}>
      {/* Student Details Section */}
      <div style={{ display: "flex", alignItems: "center", fontWeight: 600, color: "#8013bd", marginBottom: 8 }}>
        <span style={{ marginRight: 8 }}>👤</span> Student Details
      </div>
      <div style={{
        background: "#f9f9f9",
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
        border: "1px solid #e3e3e3"
      }}>
        <div style={{ marginBottom: 8 }}><span style={{ color: "#888" }}>Name:</span> <b>{studentDetails.user_name}</b></div>
        <div style={{ marginBottom: 8 }}><span style={{ color: "#888" }}>Reg No:</span> <b>{studentDetails.reg_no}</b></div>
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: "#888" }}>Department:</span>
          <span style={{ marginLeft: 4 }}>🏫</span> <b>{studentDetails.dept}</b>
        </div>
        <div><span style={{ color: "#888" }}>Batch of:</span> <b>{studentDetails.end_year}</b></div>
      </div>


      {/* Event Details Section */}
      <div style={{ display: "flex", alignItems: "center", fontWeight: 600, color: "#8013bd", marginBottom: 8 }}>
        <span style={{ marginRight: 8 }}>🏷️</span> Event Details
      </div>
      <div style={{
        background: "#f9f9f9",
        borderRadius: 8,
        padding: 16,
        marginBottom: 8,
        border: "1px solid #e3e3e3"
      }}>
        <div style={{ marginBottom: 8 }}><span style={{ color: "#888" }}>Event ID:</span> <b>#{selectedEvent.event_id}</b></div>
        <div style={{ marginBottom: 8 }}><span style={{ color: "#888" }}>Event Name:</span> <b>{selectedEvent.event_name}</b></div>
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: "#888" }}>Category:</span>
          <span style={{
            background: "#f5ecfe",
            color: "#8013bd",
            borderRadius: 12,
            padding: "2px 12px",
            fontSize: "0.9em",
            marginLeft: 8
          }}>{selectedEvent.category}</span>
        </div>
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: "#888" }}>Start Date:</span>
          <span style={{ marginLeft: 8, color: "#1976d2" }}>🕒</span>
          <b>{selectedEvent.start_date?.split('T')[0]}</b>
        </div>
        <div>
          <span style={{ color: "#888" }}>End Date:</span>
          <span style={{ marginLeft: 8, color: "#1976d2" }}>🕒</span>
          <b>{selectedEvent.end_date?.split('T')[0]}</b>
        </div>
      </div>
    </div>
  )}
</DialogContent>
          <DialogActions sx={{ justifyContent: "flex-end", gap: 2 }}>
  <Button onClick={() => setRegisterModalOpen(false)} style={{background:"#f5ecfe",color:"#8013bd",width:"50%"}} sx={{ fontWeight: 600 }}>Cancel</Button>
  <Button onClick={handleConfirmRegister} style={{background:"#f5ecfe",color:"#8013bd",width:"50%"}} sx={{ fontWeight: 600 }}>Confirm</Button>
</DialogActions>


        </Dialog>


        {/* Events Table */}
        <div>
          <Paper sx={{ width: '100%', overflow: 'auto' }}>
            <TableContainer className="responsive-table-wrapper" sx={{ maxHeight: '70vh', overflowX: 'auto' }}>
              <div style={{ width: 'max-content' }}>
                <Table stickyHeader sx={{ maxWidth: 1400 }}>
                  <TableHead>
                    <TableRow>
                      {columns.map(column => (
                        <TableCell
                          key={column.id}
                          style={{ minWidth: column.minWidth, color: '#fff', fontWeight: 'bold', fontSize: '15px' }}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEvents
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map(row => (
                        <TableRow key={row.event_id} hover>
                          {columns.map(column => (
                            <TableCell key={column.id}>
                              {column.id === 'reg_button' ? (
                                <button
                                  className='viewButton'
                                  onClick={() => handleRegisterClick(row)}
                                  disabled={row.balance_count === 0 || registeredEventIds.includes(row.event_id)}
                                  style={{
                                    cursor: row.balance_count === 0 || registeredEventIds.includes(row.event_id) ? 'not-allowed' : 'pointer',
                                    opacity: row.balance_count === 0 || registeredEventIds.includes(row.event_id) ? 0.6 : 1
                                  }}>
                                  {registeredEventIds.includes(row.event_id) ? "Registered" : (row.balance_count === 0 ? "Full" : "Register")}
                                </button>
                             
                             
                              ) : column.id === 'website_link' ? (
                                <a href={row[column.id]} target="_blank" rel="noopener noreferrer">Visit</a>
                              ) : column.id === 'start_date' || column.id === 'end_date' ? (
                                row[column.id]?.split('T')[0]
                              ) : (
                                row[column.id]
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 100]}
              component="div"
              count={filteredEvents.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, p) => setPage(p)}
              onRowsPerPageChange={e => {
                setRowsPerPage(+e.target.value);
                setPage(0);
              }}
            />
          </Paper>
        </div>
      </div>
    </main>
  );
};
export default Events;