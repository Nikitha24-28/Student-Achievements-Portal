import * as React from 'react';
import axios from "axios";
import '../Approvals/Approvals.css'
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, CircularProgress, Typography, Snackbar, Alert
} from '@mui/material';


const Approvals = () => {
  const [pendingEvents, setPendingEvents] = React.useState([]);
  const [selectedEvent, setSelectedEvent] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });


  React.useEffect(() => {
    axios.get("http://localhost:5000/fetch-pending-events")
      .then(res => {
        setPendingEvents(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load events.");
        setLoading(false);
      });
  }, []);


  const formatKey = (key) =>
    key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());


  const openModal = (event) => {
    setSelectedEvent(event);
    setOpen(true);
  };
  const closeModal = () => {
    setSelectedEvent(null);
    setOpen(false);
  };


  const handleStatusUpdate = (id, status) => {
    axios.put(`http://localhost:5000/update-event-status/${id}`, { status })
      .then(() => {
        setPendingEvents(prev => prev.filter(e => e.event_id !== id));
        setSnackbar({
          open: true,
          message: `Event ${status === 'approved' ? 'approved' : 'rejected'} successfully!`,
          severity: 'success'
        });
        closeModal();
      })
      .catch(() => {
        setSnackbar({
          open: true,
          message: "Failed to update event status.",
          severity: 'error'
        });
      });
  };


  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };


  if (loading)
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}><CircularProgress /></div>;


  if (error)
    return <Typography color="error" align="center">{error}</Typography>;


  return (
    <div className='approvalspage' style={{ padding: '2rem', marginTop:"20px" }}>


      {pendingEvents.length === 0 ? (
        <Typography>No pending events.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
          <TableHead >
          <TableRow sx={{ backgroundColor: '#7209b7' }}>
    <TableCell sx={{ color: '#fff' }}><strong>Event ID</strong></TableCell>
    <TableCell sx={{ color: '#fff' }}><strong>Event Name</strong></TableCell>
    <TableCell sx={{ color: '#fff' }}><strong>Category</strong></TableCell>
    <TableCell sx={{ color: '#fff' }}><strong>Action</strong></TableCell>
  </TableRow>
</TableHead>
            <TableBody>
              {pendingEvents.map(event => (
                <TableRow key={event.event_id}>
                  <TableCell>{event.event_id}</TableCell>
                  <TableCell>{event.event_name}</TableCell>
                  <TableCell>{event.category}</TableCell>
                  <TableCell>
                    <button className='viewButton' onClick={() => openModal(event)}>View</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}


      <Dialog open={open} onClose={closeModal} fullWidth>
        <DialogTitle><strong>Event Details</strong></DialogTitle>
        <DialogContent dividers>
          {selectedEvent && Object.entries(selectedEvent).map(([key, val]) => (
            key !== "status" && (
              <p key={key} gutterBottom className='modal-texts'>
                <strong>{formatKey(key)}:</strong> {val || 'N/A'}
              </p>
            )
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} color="secondary">Cancel</Button>
          <Button onClick={() => handleStatusUpdate(selectedEvent.event_id, 'rejected')} color="error">
            Reject
          </Button>
          <Button onClick={() => handleStatusUpdate(selectedEvent.event_id, 'approved')} color="primary">
            Approve
          </Button>
        </DialogActions>
      </Dialog>


      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
      >
        <Alert severity={snackbar.severity} onClose={handleSnackbarClose}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};


export default Approvals;