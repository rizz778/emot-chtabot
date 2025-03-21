const TherapistBooking = artifacts.require("TherapistBooking");

module.exports = function(deployer) {
  deployer.deploy(TherapistBooking);
};