import * as React from 'react';
import axios from "axios";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow,
  TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Alert
} from '@mui/material';
import '../Events/Events.css';


const columns = [
  { id: 'event_id', label: 'Event ID', minWidth: 100 },
  { id: 'event_name', label: 'Event Name', minWidth: 150 },
  { id: 'category', label: 'Category', minWidth: 120 },
  { id: 'start_date', label: 'Start Date', minWidth: 120 },
  { id: 'end_date', label: 'End Date', minWidth: 120 },
  { id: 'location', label: 'Location', minWidth: 120 },
  { id: 'website_link', label: 'Website URL', minWidth: 150 },
  { id: 'mode', label: 'Mode of Event', minWidth: 100 },
  { id: 'organization', label: 'Conducted by', minWidth: 100 },
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
    const interval = setInterval(fetchApprovedEvents, 5000); // auto-refresh every 5 sec
    return () => clearInterval(interval);
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


  const handleAddEvent = () => {
    axios.post("http://localhost:5000/submit-for-approval", newEvent)
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


      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Event</DialogTitle>
        <DialogContent>
          {Object.keys(newEvent).map((key) => (
            <TextField
              key={key}
              name={key}
              label={key.replace('_', ' ').toUpperCase()}
              fullWidth
              margin="dense"
              type={key.includes("date") ? "date" : "text"}
              value={newEvent[key]}
              onChange={handleInputChange}
              InputLabelProps={key.includes("date") ? { shrink: true } : {}}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button onClick={handleAddEvent} color="primary">Submit for Approval</Button>
        </DialogActions>
      </Dialog>


      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>


      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: '70vh' }}>
          <Table stickyHeader>
              <TableHead sx={{ backgroundColor: "#7209b7" }}>
              <TableRow sx={{ backgroundColor: '#7209b7' }}>
                {columns.map(column => (
                  <TableCell
                    key={column.id}
                    style={{ minWidth: column.minWidth, color: '#fff', fontWeight: 'bold', fontSize:'15px' }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEvents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => (
                <TableRow
                  key={row.event_id}
                  hover
                  sx={{
                    height: 72,
                    '& td': {
                      paddingTop: 2,
                      paddingBottom: 2,
                      fontSize: '15px',
                    }
                  }}
                >
                  {columns.map(column => (
                    <TableCell key={column.id}>
                      {column.id === 'website_link'
                        ? <a href={row[column.id]} target="_blank" rel="noopener noreferrer">Visit</a>
                        : row[column.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
    </main>
  );
};

export default Events;