import {GoogleLogin} from 'react-google-login';

const handleGoogleSuccess = async (response) => {
    const { tokenId } = response;
    const res = await fetch("https://emot-chtabot-1.onrender.com/api/auth/google/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenId }),
    });
  
    const data = await res.json();
    console.log(data);
  };
  
  const handleGoogleFailure = (error) => {
    console.error("Google Sign-In Failed", error);
  };
  
  <GoogleLogin
    clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
    buttonText="Login with Google"
    onSuccess={handleGoogleSuccess}
    onFailure={handleGoogleFailure}
    cookiePolicy={"single_host_origin"}
  />;