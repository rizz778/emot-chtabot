// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TherapistBooking is Ownable, ReentrancyGuard {
    struct Therapist {
        uint256 id;
        string name;
        string specialization;
        uint256 hourlyRate;
        bool isActive;
    }
    
    struct Appointment {
        uint256 id;
        uint256 therapistId;
        address client;
        uint256 startTime;
        uint256 endTime;
        bool isPaid;
        bool isCancelled;
    }
    
    mapping(uint256 => Therapist) public therapists;
    mapping(uint256 => Appointment) public appointments;
    mapping(uint256 => mapping(uint256 => bool)) public therapistAvailability; // therapistId => timestamp => isBooked
    
    uint256 public therapistCount;
    uint256 public appointmentCount;
    
    event TherapistAdded(uint256 indexed id, string name, string specialization, uint256 hourlyRate);
    event TherapistUpdated(uint256 indexed id, string name, string specialization, uint256 hourlyRate, bool isActive);
    event AppointmentBooked(uint256 indexed id, uint256 indexed therapistId, address indexed client, uint256 startTime, uint256 endTime);
    event AppointmentCancelled(uint256 indexed id, uint256 indexed therapistId, address indexed client);
    event AppointmentPaid(uint256 indexed id, uint256 amount);
    
    constructor() Ownable() {}
    
    function addTherapist(string memory _name, string memory _specialization, uint256 _hourlyRate) external onlyOwner {
        therapistCount++;
        therapists[therapistCount] = Therapist(therapistCount, _name, _specialization, _hourlyRate, true);
        
        emit TherapistAdded(therapistCount, _name, _specialization, _hourlyRate);
    }
    
    function updateTherapist(uint256 _id, string memory _name, string memory _specialization, uint256 _hourlyRate, bool _isActive) external onlyOwner {
        require(_id > 0 && _id <= therapistCount, "Invalid therapist ID");
        
        Therapist storage therapist = therapists[_id];
        therapist.name = _name;
        therapist.specialization = _specialization;
        therapist.hourlyRate = _hourlyRate;
        therapist.isActive = _isActive;
        
        emit TherapistUpdated(_id, _name, _specialization, _hourlyRate, _isActive);
    }
    
    function bookAppointment(uint256 _therapistId, uint256 _startTime, uint256 _endTime) external payable nonReentrant {
        require(_therapistId > 0 && _therapistId <= therapistCount, "Invalid therapist ID");
        require(therapists[_therapistId].isActive, "Therapist is not available");
        require(_startTime > block.timestamp, "Cannot book in the past");
        require(_endTime > _startTime, "End time must be after start time");
        
        // Check if therapist is available for the time slot
        for (uint256 t = _startTime; t < _endTime; t += 1 hours) {
            require(!therapistAvailability[_therapistId][t], "Time slot is already booked");
            therapistAvailability[_therapistId][t] = true;
        }
        
        // Calculate cost
        uint256 hourCount = (_endTime - _startTime) / 1 hours;
        uint256 cost = hourCount * therapists[_therapistId].hourlyRate;
        require(msg.value >= cost, "Insufficient payment");
        
        // Book appointment
        appointmentCount++;
        appointments[appointmentCount] = Appointment(
            appointmentCount,
            _therapistId,
            msg.sender,
            _startTime,
            _endTime,
            true,
            false
        );
        
        emit AppointmentBooked(appointmentCount, _therapistId, msg.sender, _startTime, _endTime);
        emit AppointmentPaid(appointmentCount, msg.value);
        
        // Refund excess amount
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
    }
    
    function cancelAppointment(uint256 _appointmentId) external nonReentrant {
        Appointment storage appointment = appointments[_appointmentId];
        
        require(appointment.id > 0, "Appointment does not exist");
        require(appointment.client == msg.sender, "Not the appointment owner");
        require(!appointment.isCancelled, "Appointment already cancelled");
        require(appointment.startTime > block.timestamp, "Cannot cancel past appointments");
        
        // Free up time slots
        for (uint256 t = appointment.startTime; t < appointment.endTime; t += 1 hours) {
            therapistAvailability[appointment.therapistId][t] = false;
        }
        
        appointment.isCancelled = true;
        
        // Refund payment
        if (appointment.isPaid) {
            uint256 hourCount = (appointment.endTime - appointment.startTime) / 1 hours;
            uint256 cost = hourCount * therapists[appointment.therapistId].hourlyRate;
            
            // Apply cancellation policy: 50% refund if cancelled less than 24 hours before
            uint256 refundAmount = cost;
            if (appointment.startTime - block.timestamp < 24 hours) {
                refundAmount = cost / 2;
            }
            
            payable(appointment.client).transfer(refundAmount);
        }
        
        emit AppointmentCancelled(_appointmentId, appointment.therapistId, appointment.client);
    }
    
    function getTherapistAppointments(uint256 _therapistId) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count appointments for this therapist
        for (uint256 i = 1; i <= appointmentCount; i++) {
            if (appointments[i].therapistId == _therapistId && !appointments[i].isCancelled) {
                count++;
            }
        }
        
        // Create array of appointment IDs
        uint256[] memory therapistAppointments = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= appointmentCount; i++) {
            if (appointments[i].therapistId == _therapistId && !appointments[i].isCancelled) {
                therapistAppointments[index] = i;
                index++;
            }
        }
        
        return therapistAppointments;
    }
    
    function getClientAppointments() external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count appointments for this client
        for (uint256 i = 1; i <= appointmentCount; i++) {
            if (appointments[i].client == msg.sender && !appointments[i].isCancelled) {
                count++;
            }
        }
        
        // Create array of appointment IDs
        uint256[] memory clientAppointments = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= appointmentCount; i++) {
            if (appointments[i].client == msg.sender && !appointments[i].isCancelled) {
                clientAppointments[index] = i;
                index++;
            }
        }
        
        return clientAppointments;
    }
}