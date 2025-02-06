import axios from 'axios'; 

const getVoices = async () => {
  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': 'sk_48bc738b361f075d3b492e693e86676cb726ccd4034bada2' // Replace with your actual API key
      }
    });

    console.log(response.data); // Output the voices list
  } catch (error) {
    console.error('Error fetching voices:', error.response ? error.response.data : error.message);
  }
};

getVoices();
