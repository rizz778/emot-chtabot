import { ethers } from "ethers";
import TherapistBookingABI from '../contracts/TherapistBooking.json'; // This will be in build/contracts after compilation


class BlockchainService {
  constructor() {
    this.contractAddress = "0x9953d9249674E37eF34174cdE4cd4B28E75C18d3"; // Replace after deployment
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error("Please install MetaMask to use this application");
    }

    try {
      // Force MetaMask to switch to Ganache Network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x539' }] // 0x539 = 1337 in Hexadecimal (Ganache Chain ID)
      }).catch(async (error) => {
        if (error.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x539',
              chainName: 'Ganache Localhost',
              rpcUrls: ['http://127.0.0.1:7545'],
              nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18
              }
            }]
          });
        }
      });

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.provider = new ethers.BrowserProvider(window.ethereum);
      console.log("Provider:", this.provider);

      this.signer = await this.provider.getSigner();
      console.log("Signer Address:", await this.signer.getAddress());

      const network = await this.provider.getNetwork();
      console.log("Connected Network:", network.chainId);

      this.contract = new ethers.Contract(
        this.contractAddress,
        TherapistBookingABI.abi,
        this.signer
      );

      this.isInitialized = true;

      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      return true;
    } catch (error) {
      console.error("Failed to initialize blockchain connection:", error);
      return false;
    }
  }
  async getAllTherapists() {
    if (!this.isInitialized) await this.initialize();
    try {
      const therapistCount = Number(await this.contract.therapistCount());
      console.log("Raw therapist count:", therapistCount);
      const therapists = [];
  
      for (let i = 1; i <= therapistCount; i++) {
        console.log(`Fetching therapist ID: ${i}`);
        const therapist = await this.contract.therapists(i);
        console.log(`Raw therapist data for ID ${i}:`, therapist);
        
        // Deep inspect the therapist object
        console.log(`Therapist ID ${i} details:`, {
          id: therapist.id,
          idType: typeof therapist.id,
          name: therapist.name,
          nameType: typeof therapist.name,
          specialization: therapist.specialization,
          hourlyRate: therapist.hourlyRate,
          hourlyRateType: typeof therapist.hourlyRate,
          isActive: therapist.isActive,
          isActiveType: typeof therapist.isActive
        });
        
        if (therapist.name === "" || !therapist.isActive) {
          console.log(`Skipping therapist ID ${i}: inactive or empty name`);
          continue;
        }
  
        try {
          const formattedRate = ethers.formatEther(therapist.hourlyRate);
          console.log(`Formatted hourly rate for ID ${i}: ${formattedRate}`);
          
          therapists.push({
            id: therapist.id.toString(),
            name: therapist.name,
            specialization: therapist.specialization,
            hourlyRate: formattedRate
          });
        } catch (error) {
          console.error(`Error formatting hourly rate for therapist ID ${i}:`, error);
          // Try fallback method if formatting fails
          therapists.push({
            id: therapist.id.toString(),
            name: therapist.name,
            specialization: therapist.specialization,
            hourlyRate: therapist.hourlyRate.toString() // Just convert to string without formatting
          });
        }
      }
      
      console.log("Processed therapists:", therapists);
      return therapists;
    } catch (error) {
      console.error("Error fetching therapists:", error);
      return [];
    }
  }
  async bookAppointment(therapistId, startTime, endTime) {
    if (!this.isInitialized) await this.initialize();
    const therapist = await this.contract.therapists(therapistId);
    const hours = Math.ceil((endTime - startTime) / (60 * 60));
    const hourlyRate = ethers.parseEther(therapist.hourlyRate.toString()); // Convert hourlyRate to string
    const cost = hourlyRate * BigInt(hours); // Perform multiplication with BigInt


    const tx = await this.contract.bookAppointment(
      therapistId,
      startTime,
      endTime,
      { value: cost }
    );

    await tx.wait();
    return tx.hash;
  }

  async getClientAppointments() {
    if (!this.isInitialized) await this.initialize();
    const appointmentIds = await this.contract.getClientAppointments();
    const ids = Array.from(appointmentIds);
    const appointments = [];

    for (const id of ids) {
      if (id.toString() === "0") continue;
      const appointment = await this.contract.appointments(id);
      const therapist = await this.contract.therapists(appointment.therapistId);

      appointments.push({
        id: id.toString(),
        therapistId: appointment.therapistId.toString(),
        therapistName: therapist.name,
        startTime: new Date(Number(appointment.startTime) * 1000),
        endTime: new Date(Number(appointment.endTime) * 1000),
        isPaid: appointment.isPaid,
        isCancelled: appointment.isCancelled
      });
    }
    return appointments;
  }

  async cancelAppointment(appointmentId) {
    if (!this.isInitialized) await this.initialize();
    const tx = await this.contract.cancelAppointment(appointmentId);
    await tx.wait();
    return tx.hash;
  }
}

export default new BlockchainService();
