import React, { useState, useEffect } from 'react';
import BlockchainService from './BlockchainService.jsx';

function TherapistBookingPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [therapists, setTherapists] = useState([]);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [myAppointments, setMyAppointments] = useState([]);

  // Initialize blockchain connection
  useEffect(() => {
    async function connectToBlockchain() {
      try {
        console.log("Connecting to blockchain...");
        const connected = await BlockchainService.initialize();
        setIsConnected(connected);
        
        if (connected) {
          console.log("Blockchain connected successfully!");
          loadTherapists();
          loadAppointments();
        } else {
          console.log("Failed to connect to blockchain.");
        }
      } catch (err) {
        console.error("Error connecting to blockchain:", err);
        setError(err.message);
      }
    }
    
    connectToBlockchain();
  }, []);

  // Load therapists from the blockchain
  const loadTherapists = async () => {
    try {
      console.log("Loading therapists...");
      setIsLoading(true);
      const therapistList = await BlockchainService.getAllTherapists();
      console.log("Therapists loaded:", therapistList);
      setTherapists(therapistList);
    } catch (err) {
      console.error("Failed to load therapists:", err);
      setError("Failed to load therapists: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load user's appointments
  const loadAppointments = async () => {
    try {
      console.log("Loading appointments...");
      setIsLoading(true);
      const appointments = await BlockchainService.getClientAppointments();
      console.log("Appointments loaded:", appointments);
      setMyAppointments(appointments);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setError("Failed to load appointments: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle booking submission
  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!selectedTherapist || !bookingDate || !bookingTime) {
      console.log("Booking details are incomplete.");
      setError("Please fill in all booking details");
      return;
    }
    
    try {
      console.log("Booking appointment...");
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      // Calculate start and end times in Unix timestamp (seconds)
      const [hours, minutes] = bookingTime.split(':').map(Number);
      const startDate = new Date(bookingDate);
      startDate.setHours(hours, minutes, 0, 0);
      
      const startTime = Math.floor(startDate.getTime() / 1000);
      const endTime = startTime + (duration * 60 * 60); // Add hours in seconds
      
      console.log("Booking details:", {
        therapistId: selectedTherapist.id,
        startTime,
        endTime,
      });
      
      // Book appointment on blockchain
      const txHash = await BlockchainService.bookAppointment(
        selectedTherapist.id,
        startTime,
        endTime
      );
      
      console.log("Appointment booked successfully! Transaction:", txHash);
      setSuccessMessage(`Appointment booked successfully! Transaction: ${txHash}`);
      
      // Reset form
      setSelectedTherapist(null);
      setBookingDate('');
      setBookingTime('');
      setDuration(1);
      
      // Reload appointments
      await loadAppointments();
    } catch (err) {
      console.error("Failed to book appointment:", err);
      setError("Failed to book appointment: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId) => {
    try {
      console.log("Cancelling appointment:", appointmentId);
      setIsLoading(true);
      
      const txHash = await BlockchainService.cancelAppointment(appointmentId);
      
      console.log("Appointment cancelled successfully! Transaction:", txHash);
      setSuccessMessage(`Appointment cancelled successfully! Transaction: ${txHash}`);
      
      // Reload appointments
      await loadAppointments();
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      setError("Failed to cancel appointment: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Connect to MetaMask if not connected
  const connectWallet = async () => {
    try {
      console.log("Connecting wallet...");
      const connected = await BlockchainService.initialize();
      setIsConnected(connected);
      
      if (connected) {
        console.log("Wallet connected successfully!");
        loadTherapists();
        loadAppointments();
      } else {
        console.log("Failed to connect wallet.");
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err.message);
    }
  };

  return (
    <div className="therapist-booking-page">
      <h1>Book a Therapist Session</h1>
      
      {!isConnected ? (
        <div className="connect-wallet">
          <p>Please connect your wallet to access the booking system.</p>
          <button onClick={connectWallet}>Connect Wallet</button>
        </div>
      ) : (
        <div className="booking-container">
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          
          <div className="booking-form-container">
            <h2>Book a New Appointment</h2>
            <form onSubmit={handleBooking}>
              <div className="form-group">
                <label>Select Therapist:</label>
                <select 
                  value={selectedTherapist ? selectedTherapist.id : ''} 
                  onChange={(e) => {
                    const id = e.target.value;
                    const therapist = therapists.find(t => t.id === id);
                    setSelectedTherapist(therapist);
                  }}
                  required
                >
                  <option value="">-- Select a Therapist --</option>
                  {therapists.map(therapist => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.name} - {therapist.specialization} (ETH {therapist.hourlyRate}/hour)
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Date:</label>
                <input 
                  type="date" 
                  value={bookingDate} 
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Time:</label>
                <input 
                  type="time" 
                  value={bookingTime} 
                  onChange={(e) => setBookingTime(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Duration (hours):</label>
                <select 
                  value={duration} 
                  onChange={(e) => setDuration(Number(e.target.value))}
                  required
                >
                  {[1, 2, 3, 4].map(h => (
                    <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Total Cost:</label>
                <p>
                  {selectedTherapist 
                    ? `ETH ${(parseFloat(selectedTherapist.hourlyRate) * duration).toFixed(4)}`
                    : 'Select a therapist to see cost'
                  }
                </p>
              </div>
              
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Book Appointment'}
              </button>
            </form>
          </div>
          
          <div className="my-appointments">
            <h2>My Appointments</h2>
            {myAppointments.length === 0 ? (
              <p>You don't have any appointments yet.</p>
            ) : (
              <ul className="appointments-list">
                {myAppointments.map(appointment => (
                  <li key={appointment.id} className="appointment-item">
                    <div className="appointment-details">
                      <h3>Appointment with {appointment.therapistName}</h3>
                      <p>Date: {appointment.startTime.toLocaleDateString()}</p>
                      <p>Time: {appointment.startTime.toLocaleTimeString()} - {appointment.endTime.toLocaleTimeString()}</p>
                      <p>Status: {appointment.isCancelled ? 'Cancelled' : 'Active'}</p>
                    </div>
                    {!appointment.isCancelled && (
                      <button 
                        onClick={() => handleCancelAppointment(appointment.id)}
                        disabled={isLoading}
                      >
                        Cancel Appointment
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TherapistBookingPage;