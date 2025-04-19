import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import BlockchainService from './BlockchainService';
import { ethers } from 'ethers';

const TherapistBookingPage = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [bookingStatus, setBookingStatus] = useState(null);
  const [userAppointments, setUserAppointments] = useState([]);
  const [showAppointments, setShowAppointments] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  useEffect(() => {
    async function initializeBlockchain() {
      try {
        const initialized = await BlockchainService.initialize();
        if (initialized) {
          setConnectionStatus('Connected');
          loadTherapists();
        } else {
          setConnectionStatus('Connection Failed');
          // Not showing error message in UI
        }
      } catch (err) {
        console.error('Blockchain initialization error:', err);
        setConnectionStatus('Connection Error');
        // Not showing error message in UI
        setLoading(false);
      }
    }

    initializeBlockchain();
  }, []);

  const loadTherapists = async () => {
    try {
      setLoading(true);
      const therapistList = await BlockchainService.getAllTherapists();
      setTherapists(therapistList);
      setLoading(false);
    } catch (err) {
      console.error('Error loading therapists:', err);
      // Not showing error message in UI
      setLoading(false);
    }
  };

  const loadUserAppointments = async () => {
    try {
      setLoading(true);
      const appointments = await BlockchainService.getClientAppointments();
      setUserAppointments(appointments);
      setShowAppointments(true);
      setLoading(false);
    } catch (err) {
      console.error('Error loading appointments:', err);
      // Not showing error message in UI
      setLoading(false);
    }
  };

  const handleTherapistSelect = (therapist) => {
    setSelectedTherapist(therapist);
    setBookingStatus(null);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    
    if (!selectedTherapist || !selectedDate || !startTime || !endTime) {
      // Not showing validation errors in UI
      return;
    }

    try {
      setLoading(true);
      setBookingStatus(null);

      // Convert date and times to timestamps
      const startDateTime = new Date(`${selectedDate}T${startTime}`);
      const endDateTime = new Date(`${selectedDate}T${endTime}`);
      
      if (startDateTime >= endDateTime) {
        // Not showing validation errors in UI
        setLoading(false);
        return;
      }

      const startTimestamp = Math.floor(startDateTime.getTime() / 1000);
      const endTimestamp = Math.floor(endDateTime.getTime() / 1000);

      const txHash = await BlockchainService.bookAppointment(
        selectedTherapist.id,
        startTimestamp,
        endTimestamp
      );

      // Reset form but don't show success message
      setSelectedDate('');
      setStartTime('');
      setEndTime('');
      
      // Reload user appointments
      await loadUserAppointments();
      
    } catch (err) {
      console.error('Booking error:', err);
      // Not showing error message in UI
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      setLoading(true);
      const txHash = await BlockchainService.cancelAppointment(appointmentId);
      
      // No success message shown
      
      // Reload appointments
      await loadUserAppointments();
    } catch (err) {
      console.error('Cancellation error:', err);
      // Not showing error message in UI
    } finally {
      setLoading(false);
    }
  };

  // Format date for the input element
  const formatDateForInput = (date) => {
    return format(date, 'yyyy-MM-dd');
  };

  // Get today's date in the format for the date input min attribute
  const today = formatDateForInput(new Date());

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Therapist Booking System</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-lg">
          Blockchain Connection Status: <span className={`font-bold ${connectionStatus === 'Connected' ? 'text-green-600' : 'text-red-600'}`}>
            {connectionStatus}
          </span>
        </p>
      </div>
      
      {/* Error messages removed */}
      
      {/* Status messages removed */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Therapist List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Available Therapists</h2>
          
          {loading && therapists.length === 0 ? (
            <p className="text-gray-600">Loading therapists...</p>
          ) : therapists.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {therapists.map((therapist) => (
                <li 
                  key={therapist.id}
                  className={`py-4 cursor-pointer hover:bg-gray-50 ${selectedTherapist?.id === therapist.id ? 'bg-blue-50' : ''}`}
                  onClick={() => handleTherapistSelect(therapist)}
                >
                  <h3 className="text-lg font-medium">{therapist.name}</h3>
                  <p className="text-gray-600">{therapist.specialization}</p>
                  <p className="text-gray-800 font-medium mt-1">{therapist.hourlyRate} ETH/hour</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No therapists available.</p>
          )}
        </div>
        
        {/* Middle Column - Booking Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Book an Appointment</h2>
          
          {selectedTherapist ? (
            <form onSubmit={handleBookAppointment}>
              <div className="mb-4">
                <p className="font-medium">Selected Therapist:</p>
                <p>{selectedTherapist.name} - {selectedTherapist.specialization}</p>
                <p className="font-medium mt-1">{selectedTherapist.hourlyRate} ETH/hour</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Date:</label>
                <input
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Start Time:</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">End Time:</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              {startTime && endTime && selectedDate && (
                <div className="mb-4 p-3 bg-blue-50 rounded">
                  <p className="font-medium">Estimated Cost:</p>
                  {(() => {
                    try {
                      const start = new Date(`${selectedDate}T${startTime}`);
                      const end = new Date(`${selectedDate}T${endTime}`);
                      const hours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));
                      const rate = parseFloat(selectedTherapist.hourlyRate);
                      const totalCost = hours * rate;
                      return <p>{totalCost.toFixed(6)} ETH</p>;
                    } catch (err) {
                      return <p>Please select valid times</p>;
                    }
                  })()}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-400"
              >
                {loading ? 'Processing...' : 'Book Appointment'}
              </button>
            </form>
          ) : (
            <p className="text-gray-600">Please select a therapist to book an appointment.</p>
          )}
        </div>
        
        {/* Right Column - User's Appointments */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Appointments</h2>
          
          {!showAppointments ? (
            <button
              onClick={loadUserAppointments}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-green-400 mb-4"
            >
              {loading ? 'Loading...' : 'Show My Appointments'}
            </button>
          ) : loading ? (
            <p className="text-gray-600">Loading your appointments...</p>
          ) : userAppointments.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {userAppointments.map((appointment) => (
                <li key={appointment.id} className="py-4">
                  <h3 className="text-lg font-medium">{appointment.therapistName}</h3>
                  <p className="text-gray-600">
                    {format(new Date(appointment.startTime), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-gray-600">
                    {format(new Date(appointment.startTime), 'h:mm a')} - 
                    {format(new Date(appointment.endTime), 'h:mm a')}
                  </p>
                  <p className={`${appointment.isCancelled ? 'text-red-600' : 'text-green-600'} font-medium`}>
                    {appointment.isCancelled ? 'Cancelled' : 'Active'}
                  </p>
                  
                  {!appointment.isCancelled && (
                    <button
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="mt-2 bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">You don't have any appointments yet.</p>
          )}
          
          {showAppointments && (
            <button
              onClick={loadUserAppointments}
              className="mt-4 w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
            >
              Refresh Appointments
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TherapistBookingPage;