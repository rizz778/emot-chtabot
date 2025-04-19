// migrations/2_deploy_therapist_booking.js

const TherapistBooking = artifacts.require('TherapistBooking');
const { ethers } = require('ethers');

module.exports = async function(deployer, network, accounts) {
  // Deploy the contract
  await deployer.deploy(TherapistBooking);
  const therapistBookingInstance = await TherapistBooking.deployed();
  
  console.log(`TherapistBooking deployed at: ${therapistBookingInstance.address}`);
  
  // Add sample therapists (only in development or test networks)
  if (network === 'development' || network === 'test' || network === 'ganache') {
    console.log('Adding sample therapists...');
    
    // Convert ETH to wei for hourly rates
    const rateToWei = (eth) => ethers.parseEther(eth.toString()).toString();
    
    try {
      // Sample therapists data
      const therapists = [
        { name: "Dr. Rithik Khandelwal", specialization: "Cognitive Behavioral Therapy", hourlyRate: rateToWei(0.05) },
        { name: "Dr. Smita Chauhan", specialization: "Family Therapy", hourlyRate: rateToWei(0.04) },
        { name: "Dr. Ritika Hemrajani", specialization: "Trauma Recovery", hourlyRate: rateToWei(0.06) },
        { name: "Dr. Rohit Saxena", specialization: "Anxiety and Depression", hourlyRate: rateToWei(0.045) },
      ];
      
      // Add each therapist
      for (const therapist of therapists) {
        await therapistBookingInstance.addTherapist(
          therapist.name,
          therapist.specialization,
          therapist.hourlyRate
        );
        console.log(`Added therapist: ${therapist.name}`);
      }
      
      console.log('Sample therapists added successfully!');
    } catch (error) {
      console.error('Error adding sample therapists:', error);
    }
  }
};