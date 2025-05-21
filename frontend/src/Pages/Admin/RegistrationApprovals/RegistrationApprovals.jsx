import React, { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Divider,
  TextField
} from '@mui/material';
import axios from 'axios';
import './registrationApprovals.css';


const RegistrationApprovals = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');


  const handleOpenModal = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
    setShowRejectionInput(false);
    setRejectionReason('');
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setShowRejectionInput(false);
    setRejectionReason('');
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'approved':
        return <Chip label="Approved" color="success" size="small" />;
      case 'rejected':
        return <Chip label="Rejected" color="error" size="small" />;
      default:
        return <Chip label="Pending" color="warning" size="small" />;
    }
  };


  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/fetch-registrations-admin');
      const pendingEvents = response.data.filter(event => event.reg_status === 'pending');
    setAllEvents(pendingEvents);
    } catch (error) {
      console.error('Error fetching registration data:', {
        message: error.message,
        response: error.response?.data
      });
      alert('Failed to load data. Please check console for details.');
    }
  };
  useEffect(() => {
    fetchData();
  }, []);


  const handleApprove = async () => {
    try {
      await axios.post('http://localhost:5000/approve-registration', {
        id: selectedEvent.id, // Use correct unique ID field
        reg_status: 'approved'
      });
      fetchData();
      handleCloseModal();
    } catch (err) {
      alert('Approval failed.');
      console.error(err);
    }
  };








  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }








    try {
      await axios.post('http://localhost:5000/reject-registration', {
        id: selectedEvent.id, // Use correct unique ID field
        reg_status: 'rejected',
        reg_rej_reason: rejectionReason
      });
      fetchData();
      handleCloseModal();
    } catch (err) {
      alert('Rejection failed.');
      console.error(err);
    }
  };








  return (
    <div className="registration-container">
      <div className="all-events-box" style={{ padding: '15px', borderRadius: '8px' }}>
        <Typography variant="h6" gutterBottom>ALL REGISTRATION EVENTS ({allEvents.length})</Typography>
        <div className="grid-two-columns" style={{ maxHeight: '600px', overflowY: 'auto', marginTop: '10px' }}>
          {allEvents.map(event => (
            <Card
              key={event.event_id}
              onClick={() => handleOpenModal(event)}
              style={{ marginBottom: '10px', cursor: 'pointer' }}
            >
              <CardContent>
                <Typography variant="subtitle1">{event.event_name}</Typography>
                <Typography variant="body2">Category: {event.category}</Typography>
                <Typography variant="caption" display="block">
                  Student: {event.user_name}
                </Typography>
                {getStatusChip(event.reg_status)}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        {selectedEvent && (
          <>
            <DialogTitle>
              {selectedEvent.event_name} - {selectedEvent.category}
              <div style={{ marginTop: '8px' }}>
                {getStatusChip(selectedEvent.reg_status)}
              </div>
            </DialogTitle>
            <DialogContent dividers>
              <div style={{ padding: '16px' }}>
                {/* Student Details */}
                <Typography variant="h6" gutterBottom>Student Details</Typography>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <Typography variant="subtitle2">Name</Typography>
                    <Typography>{selectedEvent.user_name}</Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2">Registration Number</Typography>
                    <Typography>{selectedEvent.reg_no}</Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2">Department</Typography>
                    <Typography>{selectedEvent.dept}</Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2">Batch Year</Typography>
                    <Typography>{selectedEvent.end_year}</Typography>
                  </div>
                </div>

                <Divider style={{ margin: '24px 0' }} />

                {/* Event Details */}
                <Typography variant="h6" gutterBottom>Event Details</Typography>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <Typography variant="subtitle2">Event ID</Typography>
                    <Typography>{selectedEvent.event_id}</Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2">Event Name</Typography>
                    <Typography>{selectedEvent.event_name}</Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2">Category</Typography>
                    <Typography>{selectedEvent.category}</Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2">Status</Typography>
                    <Typography>{selectedEvent.reg_status}</Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2">Start Date</Typography>
                    <Typography>
                      {new Date(selectedEvent.start_date).toLocaleDateString()}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="subtitle2">End Date</Typography>
                    <Typography>
                      {new Date(selectedEvent.end_date).toLocaleDateString()}
                    </Typography>
                  </div>
                </div>


                {/* Description */}
                {selectedEvent.description && (
                  <>
                    <Divider style={{ margin: '24px 0' }} />
                    <Typography variant="h6" gutterBottom>Description</Typography>
                    <Typography>{selectedEvent.description}</Typography>
                  </>
                )}


                {/* Rejection Reason View */}
                {selectedEvent.reg_status === 'rejected' && selectedEvent.reg_rej_reason && (
                  <>
                    <Divider style={{ margin: '24px 0' }} />
                    <Typography variant="h6" gutterBottom>Rejection Reason</Typography>
                    <Typography color="error">{selectedEvent.reg_rej_reason}</Typography>
                  </>
                )}


                {/* Rejection Reason Input */}
                {showRejectionInput && (
                  <>
                    <Divider style={{ margin: '24px 0' }} />
                    <TextField
                      fullWidth
                      multiline
                      label="Rejection Reason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </>
                )}
              </div>
            </DialogContent>


            <DialogActions>
              {selectedEvent.reg_status === 'pending' && (
                <>
                  <Button onClick={handleApprove} color="success" variant="contained">
                    Approve
                  </Button>
                  {!showRejectionInput ? (
                    <Button onClick={() => setShowRejectionInput(true)} color="error" variant="contained">
                      Reject
                    </Button>
                  ) : (
                    <Button onClick={handleReject} color="error" variant="contained">
                      Submit Rejection
                    </Button>
                  )}
                </>
              )}
              <Button onClick={handleCloseModal} color="primary" variant="outlined">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
};


export default RegistrationApprovals;