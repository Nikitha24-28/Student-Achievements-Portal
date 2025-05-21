import * as React from 'react';
import axios from "axios";
import './Approvals.css';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, CircularProgress, Typography,
  Snackbar, Alert, TextField
} from '@mui/material';


const Approvals = () => {
  const [pendingEvents, setPendingEvents] = React.useState([]);
  const [selectedEvent, setSelectedEvent] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });
  const [rejectionMode, setRejectionMode] = React.useState(false);
  const [approvalMode, setApprovalMode] = React.useState(false);
  const [editableEvent, setEditableEvent] = React.useState({});
  const [rejectionReason, setRejectionReason] = React.useState('');


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
    setEditableEvent({ ...event, eligible_dept: event.eligible_dept || '',max_count:event.max_count || "" }); // Add eligible_departments as editable field
    setRejectionMode(false);
    setApprovalMode(false);
    setRejectionReason('');
    setOpen(true);
  };


  const closeModal = () => {
    setSelectedEvent(null);
    setEditableEvent({});
    setRejectionMode(false);
    setApprovalMode(false);
    setRejectionReason('');
    setOpen(false);
  };


  const handleStatusUpdate = (id, status, rejection_reason = '') => {
    const confirmationBy = localStorage.getItem("email");
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000;
    const localTime = new Date(now.getTime() - offsetMs);
    const confirmationAt = localTime.toISOString().slice(0, 19).replace('T', ' ');


    axios.put(`http://localhost:5000/update-event-status/${id}`, {
      ...editableEvent,
      status,
      rejection_reason,
      confirmationBy,
      confirmationAt,
      eligible_dept: editableEvent.eligible_dept,
      max_count:editableEvent.max_count


    })
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


  const handleRejectClick = () => {
    setRejectionMode(true);
  };


  const handleConfirmReject = () => {
    if (rejectionReason.trim() === '') {
      setSnackbar({ open: true, message: 'Please enter a rejection reason.', severity: 'error' });
      return;
    }
    handleStatusUpdate(selectedEvent.event_id, 'rejected', rejectionReason);
  };


  const handleApproveClick = () => {
    setApprovalMode(true);
  };


  const handleConfirmApprove = () => {
    if (!editableEvent.eligible_dept || editableEvent.eligible_dept.trim() === '') {
      setSnackbar({ open: true, message: 'Please enter eligible departments.', severity: 'error' });
      return;
    }
    handleStatusUpdate(selectedEvent.event_id, 'approved');
  };


  const handleFieldChange = (key, value) => {
    setEditableEvent(prev => ({
      ...prev,
      [key]: value
    }));
  };


  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };


  if (loading)
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}><CircularProgress /></div>;


  if (error)
    return <Typography color="error" align="center">{error}</Typography>;


  return (
    <div className='approvalspage' style={{ padding: '2rem', marginTop: "20px" }}>


      {pendingEvents.length === 0 ? (
        <Typography>No pending events.</Typography>
      ) : (
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <TableContainer component={Paper}>
            <Table className="responsive-table">
              <TableHead>
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
        </div>
      )}


      <Dialog open={open} onClose={closeModal} fullWidth>
        <DialogTitle><strong>Event Details</strong></DialogTitle>
        <DialogContent dividers>
          {selectedEvent && Object.entries(editableEvent).map(([key, val]) => {
            const hiddenFields = ["status", "rejection_reason", "event_confirmation_by", "event_confirmed_at","accepted_count","balance_count"];
            if (hiddenFields.includes(key)) return null;


            return (
              <div key={key} style={{ marginBottom: '1rem' }}>
                {approvalMode ? (
                  <TextField
                    label={formatKey(key)}
                    fullWidth
                    type={key === "max_count" ? "number" : "text"}
                    value={val || ''}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                  />
                ) : (
                  <p className='modal-texts'>
                    <strong>{formatKey(key)}:</strong> {val || 'N/A'}
                  </p>
                )}
              </div>
            );
          })}


          {rejectionMode && (
            <TextField
              label="Rejection Reason"
              multiline
              rows={4}
              fullWidth
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              margin="normal"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} color="secondary">Cancel</Button>
          {rejectionMode ? (
            <Button onClick={handleConfirmReject} color="error">Confirm Reject</Button>
          ) : approvalMode ? (
            <Button onClick={handleConfirmApprove} color="primary">Confirm Approval</Button>
          ) : (
            <>
              <Button onClick={handleRejectClick} color="error">Reject</Button>
              <Button onClick={handleApproveClick} color="primary">Approve</Button>
            </>
          )}
        </DialogActions>
      </Dialog>


      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
        <Alert severity={snackbar.severity} onClose={handleSnackbarClose}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Approvals;