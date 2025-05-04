import React, { useState, useEffect } from 'react';
import { Box ,TextField } from '@mui/material';
import axios from 'axios';
import './EventSummary.css';


const EventSummary = () => {
  const [showModal, setShowModal] = useState(false);
  const [eventHistory, setEventHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);


  const email = localStorage.getItem('email');


  const [formData, setFormData] = useState({
    s_reg_no: '',
    stud_name: '',
    start_year: '',
    end_year: '',
    event_id: '',
    category: '',
    event_name: '',
    e_organisers: '',
    start_date: '',
    end_date: ''
  });


  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);


  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/student-details/${email}`);
        const data = await res.json();
        if (res.ok) {
          const updatedData = {
            s_reg_no: data.reg_no,
            stud_name: data.user_name || data.name || '',
            start_year: data.start_year || '',
            end_year: data.end_year || ''
          };
          setFormData((prev) => ({ ...prev, ...updatedData }));
          fetchEventHistory(data.reg_no);
        } else {
          alert('Student not found.');
        }
      } catch (error) {
        console.error('Error fetching student details:', error);
        alert('Something went wrong.');
      }
    };
    if (email) {
      loadStudentData();
    }
  }, [email]);


  const fetchEventHistory = async (regNo) => {
    try {
      const res = await fetch(`http://localhost:5000/event-history/${regNo}`);
      const data = await res.json();
      if (res.ok) setEventHistory(data);
      else alert('Failed to fetch event history.');
    } catch (error) {
      console.error('Error fetching event history:', error);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const resetForm = () => {
    setFormData((prev) => ({
      ...prev,
      event_id: '',
      category: '',
      event_name: '',
      e_organisers: '',
      start_date: '',
      end_date: ''
    }));
    setDescription('');
    setImage(null);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const fdata = new FormData();
    Object.entries(formData).forEach(([key, value]) => fdata.append(key, value));
    fdata.append('description', description);
    fdata.append('image', image);
    fdata.append('status', 'pending');
    try {
      const res = await axios.post('http://localhost:5000/submit-in-eventhistory', fdata, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.status === 201) {
        alert('Event summary submitted successfully!');
        const regNo = formData.s_reg_no;
        resetForm();
        setShowModal(false);
        fetchEventHistory(regNo);
      } else {
        alert(`Submission failed: ${res.data.error}`);
      }
    } catch (error) {
      console.error('Error submitting event summary:', error);
      alert('Something went wrong during submission.');
    }
  };


  const filteredEvents = eventHistory
    .filter(event => event.status === 'approved' || event.status === 'rejected')
    .filter((event) => {
      const query = searchQuery.toLowerCase();
      return (
        event.event_name.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query)
      );
    });


  const handleCardClick = (event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };


  return (
    <div className="eventsummarypage">
      <div className="search-add-wrapper">
      <div className='searchNadd'>
        <div className='search-bar'>
          <TextField
            label="Search..."
            variant="outlined"
            fullWidth
            margin="normal"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div>
        <button onClick={() => setShowModal(true)} className='add-btn'>
          Add Event Summary
        </button></div>
      </div>
      </div>


      <div className="outerbox">
        <div className="mainbox">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, idx) => (
              <div
                className="event-card"
                key={event.event_id || idx}
                onClick={() => handleCardClick(event)}
              >
                <h3>{event.event_name}</h3>
                <p><strong>Category:</strong> {event.category}</p>
                <p><strong>Status:</strong> {event.status}</p>
              </div>
            ))
          ) : (
            <p>No matching event found.</p>
          )}
        </div>
      </div>


      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Add Event Summary</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" name="s_reg_no" value={formData.s_reg_no} readOnly />
              <input type="text" name="stud_name" value={formData.stud_name} readOnly />
              <input type="text" name="start_year" value={formData.start_year} readOnly />
              <input type="text" name="end_year" value={formData.end_year} readOnly />
              <input type="text" name="event_id" value={formData.event_id} onChange={handleChange} placeholder="Event ID" required />
              <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Category" required />
              <input type="text" name="event_name" value={formData.event_name} onChange={handleChange} placeholder="Event Name" required />
              <input type="text" name="e_organisers" value={formData.e_organisers} onChange={handleChange} placeholder="Organisers" required />
              <Box display="flex" gap={2} width="100%">
  <TextField
    type="date"
    name="start_date"
    label="Start Date"
    value={formData.start_date}
    onChange={handleChange}
    required
    InputLabelProps={{
      shrink: true, // Keeps the label above even when input is filled
    }}
    fullWidth
  />


  <TextField
    type="date"
    name="end_date"
    label="End Date"
    value={formData.end_date}
    onChange={handleChange}
    required
    InputLabelProps={{
      shrink: true, // Keeps the label above even when input is filled
    }}
    fullWidth
  />
</Box>




              <textarea
                placeholder="Enter event description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                required
              />
              <div className="modal-buttons">
                <button type="submit">Submit</button>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {showDetailModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Event Details</h2>
            <p><strong>Event Name:</strong> {selectedEvent.event_name}</p>
            <p><strong>Category:</strong> {selectedEvent.category}</p>
            <p><strong>Organisers:</strong> {selectedEvent.e_organisers}</p>
            <p><strong>Start Date:</strong> {selectedEvent.start_date}</p>
            <p><strong>End Date:</strong> {selectedEvent.end_date}</p>
            <p><strong>Description:</strong> {selectedEvent.description}</p>
            <p><strong>Status:</strong> {selectedEvent.status}</p>
            {selectedEvent.status === 'rejected' && selectedEvent.rejection_reason && (
              <p><strong>Rejection Reason:</strong> {selectedEvent.rejection_reason}</p>
            )}
            {selectedEvent.image && (
              <img
                src={`http://localhost:5000/${selectedEvent.image}`}
                alt="Event"
                style={{
                  width: "100%",
                  maxHeight: "300px",
                  objectFit: "contain",
                  marginTop: "10px",
                }}
              />
            )}
            <div className="modal-buttons">
              <button onClick={() => setShowDetailModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventSummary;