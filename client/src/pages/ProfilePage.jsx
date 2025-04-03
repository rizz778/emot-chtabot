import React, { useState,useEffect } from 'react';
import { User, Mail, Edit2, Save, Camera, X, Moon, Sun, Clock, Heart, Activity, Users, Music, BookOpen } from 'lucide-react';
import {Edit} from 'react-feather'; 

const ProfilePage = () => {
  // Mock user data based on the schema
  const [user, setUser] = useState({
    name: "John Doe",
    age: 25,
    gender: "Male",
    preferredLanguage: "English",
    currentMood: "Anxious",
    stressFrequency: "Often",
    diagnosedCondition: "None",
    triggers: ["Work Pressure", "Lack of Sleep"],
    sleepHours: 5,
    exerciseFrequency: "Rarely",
    hasSupportSystem: true,
    copingMechanisms: ["Music", "Meditation"],
    responsePreference: "Empathetic & Supportive",
    wantsAffirmations: true,
    wantsReminders: false,
    profilePicture: null
  });

  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  
  // State for loading and error feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  // Handle profile picture upload
  const [selectedPictureFile, setSelectedPictureFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
  const handlePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSaveError("Image size exceeds 5MB limit");
        return;
      }
      
      setSelectedPictureFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemovePicture = async () => {
    setSelectedPictureFile(null);
    setPreviewUrl(null);
    
    if (isEditing) {
      if (user.profilePicture && user.profilePicture.publicId) {
        try {
          setIsUploading(true);
          
          const token = localStorage.getItem('token'); // Retrieve token from localStorage
        if (!token) {
          console.error('No token found in localStorage');
          return;
        }

        // Call API to delete the profile picture from Cloudinary
        const response = await fetch('https://emot-chtabot-1.onrender.com/api/profile/delete-picture', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`, // Include token for authentication
          },
        });

          if (!response.ok) {
            throw new Error(`Failed to delete profile picture: ${response.statusText}`);
          }
          
          // Update local state to reflect removal
          setUser({
            ...user,
            profilePicture: {
              url: null,
              publicId: null
            }
          });
          
          setEditedUser({
            ...editedUser,
            profilePicture: {
              url: null,
              publicId: null
            }
          });
          
        } catch (error) {
          console.error('Error deleting profile picture:', error);
          setSaveError(error.message);
        } finally {
          setIsUploading(false);
        }
      } else {
        // Just update local state if there's no profile picture to delete on server
        setEditedUser({
          ...editedUser,
          profilePicture: {
            url: null,
            publicId: null
          }
        });
      }
    }
  };
  
  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({...editedUser, [name]: value});
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setEditedUser({...editedUser, [name]: checked});
  };
  
  const handleArrayInputChange = (field, value) => {
    setEditedUser({...editedUser, [field]: value.split(',').map(item => item.trim())});
  };
  
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({...editedUser, [name]: parseInt(value, 10)});
  };
  
  const uploadProfilePicture = async () => {
    if (!selectedPictureFile) return null;
    
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('profilePicture', selectedPictureFile);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      const response = await fetch('https://emot-chtabot-1.onrender.com/api/profile/upload-picture', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - let the browser set it with boundary
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload profile picture');
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };
  
  // Save profile changes to backend
  const saveChanges = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      
      // First upload the picture to Cloudinary if there's a new one
      let updatedProfilePicture = editedUser.profilePicture;
      
      if (selectedPictureFile) {
        updatedProfilePicture = await uploadProfilePicture();
      }
      
      // Prepare the data to be sent
      const profileData = {
        ...editedUser,
        profilePicture: updatedProfilePicture
      };
      
      const token = localStorage.getItem('token'); // Retrieve token from localStorage
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }

    // Make the API call to update the profile
    const response = await fetch('https://emot-chtabot-1.onrender.com/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include token for authentication
      },
      body: JSON.stringify(profileData),
    });
      
      if (!response.ok) {
        throw new Error(`Failed to save profile: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Update local state with the saved data
      setUser(result.userProfile);
      setIsEditing(false);
      setSelectedPictureFile(null);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  };
  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setEditedUser(user);
    setPreviewUrl(null);
    setSelectedPictureFile(null);
    setSaveError(null);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
      if (!token) {
        console.error('No token found in localStorage');
        return;
      }

      const response = await fetch('https://emot-chtabot-1.onrender.com/api/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Include token for authentication
        },
      });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.userProfile) {
            setUser(data.userProfile);
            setEditedUser(data.userProfile);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    
    fetchUserProfile();
  }, [])
  
  const getOptimizedImageUrl = (url, width = 300) => {
    if (!url) return null;
    
    // Check if it's a Cloudinary URL
    if (url.includes('cloudinary.com')) {
      // Extract base URL and file path
      const urlParts = url.split('/upload/');
      if (urlParts.length === 2) {
        // Add transformations between /upload/ and the rest of the path
        return `${urlParts[0]}/upload/w_${width},c_fill,g_face/${urlParts[1]}`;
      }
    }
    
    // Return original URL if not cloudinary or can't parse
    return url;
  };


  return (
    <div className="max-w-6xl mx-auto p-4 bg-purple-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header with mood indication */}
        <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white relative">
          <h1 className="text-2xl font-bold mb-2">My Wellness Profile</h1>
          <p className="text-sm opacity-80">
            Personalize how we support you on your emotional wellness journey
          </p>
          {!isEditing && (
            <button 
              onClick={() => {
                setIsEditing(true);
                setEditedUser(user);
                setPreviewUrl(null);
                setSelectedPictureFile(null);
              }} 
              className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
            >
              <Edit2 size={18} />
            </button>
          )}
        </div>
        
        {/* Status messages */}
        {saveError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p className="font-medium">Error</p>
            <p>{saveError}</p>
          </div>
        )}
        
        {saveSuccess && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
            <p className="font-medium">Success</p>
            <p>Your profile has been updated successfully.</p>
          </div>
        )}
        
        {/* Profile content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile picture and basic info */}
            <div className="md:w-1/3">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {isEditing ? (
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-pink-100 mx-auto">
                        {previewUrl ? (
                          <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
                        ) : user.profilePicture && user.profilePicture.url ? (
                          <img 
                            src={getOptimizedImageUrl(user.profilePicture.url, 300)} 
                            alt={user.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <User size={48} className="text-gray-400" />
                        )}
                      </div>
                      
                      <div className="absolute bottom-0 right-0 flex space-x-1">
                        <label className={`bg-pink-500 p-2 rounded-full text-white cursor-pointer hover:bg-pink-600 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <Camera size={16} />
                          <input 
                            type="file" 
                            accept="image/jpeg,image/png,image/gif" 
                            className="hidden" 
                            onChange={handlePictureUpload}
                            disabled={isUploading}
                          />
                        </label>
                        
                        {(previewUrl || (user.profilePicture && user.profilePicture.url)) && (
                          <button 
                            onClick={handleRemovePicture}
                            className={`bg-red-500 p-2 rounded-full text-white hover:bg-red-600 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isUploading}
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                      
                      {isUploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center">
                          <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-pink-100 mx-auto">
                      {user.profilePicture && user.profilePicture.url ? (
                        <img 
                          src={getOptimizedImageUrl(user.profilePicture.url, 300)} 
                          alt={user.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <User size={48} className="text-gray-400" />
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editedUser.name}
                      onChange={handleInputChange}
                      className="text-xl font-semibold text-center w-full border rounded p-1"
                    />
                  ) : (
                    <h2 className="text-xl font-semibold">{user.name}</h2>
                  )}
                  
                 
                </div>
                
                {/* Current emotional state */}
                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">Current State</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Mood:</span>
                    {isEditing ? (
                      <select
                        name="currentMood"
                        value={editedUser.currentMood}
                        onChange={handleInputChange}
                        className="border rounded p-1 text-sm w-32"
                      >
                        <option value="Happy">Happy</option>
                        <option value="Content">Content</option>
                        <option value="Neutral">Neutral</option>
                        <option value="Anxious">Anxious</option>
                        <option value="Sad">Sad</option>
                        <option value="Stressed">Stressed</option>
                        <option value="Overwhelmed">Overwhelmed</option>
                      </select>
                    ) : (
                      <span className={`text-sm font-medium px-2 py-1 rounded ${
                        user.currentMood === "Happy" || user.currentMood === "Content" 
                          ? "bg-green-100 text-green-800" 
                          : user.currentMood === "Neutral" 
                            ? "bg-purple-100 text-purple-800"
                            : "bg-amber-100 text-amber-800"
                      }`}>
                        {user.currentMood}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Profile details */}
            <div className="md:w-2/3">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={editedUser.age}
                        onChange={handleNumberChange}
                        className="w-full border rounded p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select
                        name="gender"
                        value={editedUser.gender}
                        onChange={handleInputChange}
                        className="w-full border rounded p-2"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
                      <select
                        name="preferredLanguage"
                        value={editedUser.preferredLanguage}
                        onChange={handleInputChange}
                        className="w-full border rounded p-2"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Japanese">Japanese</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sleep Hours</label>
                      <input
                        type="number"
                        name="sleepHours"
                        min="0"
                        max="24"
                        value={editedUser.sleepHours}
                        onChange={handleNumberChange}
                        className="w-full border rounded p-2"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stress Frequency</label>
                    <select
                      name="stressFrequency"
                      value={editedUser.stressFrequency}
                      onChange={handleInputChange}
                      className="w-full border rounded p-2"
                    >
                      <option value="Rarely">Rarely</option>
                      <option value="Sometimes">Sometimes</option>
                      <option value="Often">Often</option>
                      <option value="Very Often">Very Often</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Frequency</label>
                    <select
                      name="exerciseFrequency"
                      value={editedUser.exerciseFrequency}
                      onChange={handleInputChange}
                      className="w-full border rounded p-2"
                    >
                      <option value="Never">Never</option>
                      <option value="Rarely">Rarely</option>
                      <option value="Sometimes">Sometimes</option>
                      <option value="Often">Often</option>
                      <option value="Daily">Daily</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosed Condition (if any)</label>
                    <input
                      type="text"
                      name="diagnosedCondition"
                      value={editedUser.diagnosedCondition}
                      onChange={handleInputChange}
                      className="w-full border rounded p-2"
                      placeholder="Leave as 'None' if not applicable"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Triggers (comma separated)</label>
                    <input
                      type="text"
                      value={editedUser.triggers.join(", ")}
                      onChange={(e) => handleArrayInputChange('triggers', e.target.value)}
                      className="w-full border rounded p-2"
                      placeholder="Work Pressure, Lack of Sleep, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coping Mechanisms (comma separated)</label>
                    <input
                      type="text"
                      value={editedUser.copingMechanisms.join(", ")}
                      onChange={(e) => handleArrayInputChange('copingMechanisms', e.target.value)}
                      className="w-full border rounded p-2"
                      placeholder="Music, Meditation, Exercise, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Response Preference</label>
                    <select
                      name="responsePreference"
                      value={editedUser.responsePreference}
                      onChange={handleInputChange}
                      className="w-full border rounded p-2"
                    >
                      <option value="Empathetic & Supportive">Empathetic & Supportive</option>
                      <option value="Direct & Solution-Focused">Direct & Solution-Focused</option>
                      <option value="Educational & Informative">Educational & Informative</option>
                      <option value="Mix of Approaches">Mix of Approaches</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasSupportSystem"
                        name="hasSupportSystem"
                        checked={editedUser.hasSupportSystem}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-purple-600 rounded"
                      />
                      <label htmlFor="hasSupportSystem" className="ml-2 text-sm text-gray-700">
                        I have a support system (friends, family, professionals)
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="wantsAffirmations"
                        name="wantsAffirmations"
                        checked={editedUser.wantsAffirmations}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-purple-600 rounded"
                      />
                      <label htmlFor="wantsAffirmations" className="ml-2 text-sm text-gray-700">
                        Send me daily affirmations
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="wantsReminders"
                        name="wantsReminders"
                        checked={editedUser.wantsReminders}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-purple-600 rounded"
                      />
                      <label htmlFor="wantsReminders" className="ml-2 text-sm text-gray-700">
                        Send me wellness check-in reminders
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      disabled={isSaving}
                    >
                      <X size={16} className="inline mr-1" />
                      Cancel
                    </button>
                    <button
                      onClick={saveChanges}
                      disabled={isSaving}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 flex items-center"
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="inline mr-1" />
                          Save Profile
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <div className="flex items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 mr-3">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Age & Gender</p>
                          <p className="font-medium">{user.age} years, {user.gender}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 mr-3">
                          <Moon size={16} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Sleep</p>
                          <p className="font-medium">{user.sleepHours} hours/night</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 mr-3">
                          <Clock size={16} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Stress Frequency</p>
                          <p className="font-medium">{user.stressFrequency}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 mr-3">
                          <Activity size={16} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Exercise</p>
                          <p className="font-medium">{user.exerciseFrequency}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Emotional Context</h3>
                    
                    <div className="mt-4 space-y-4">
                      {user.diagnosedCondition && user.diagnosedCondition !== "None" && (
                        <div>
                          <p className="text-sm text-gray-500">Diagnosed Condition</p>
                          <p className="font-medium">{user.diagnosedCondition}</p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm text-gray-500">Triggers</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {user.triggers.map((trigger, index) => (
                            <span key={index} className="px-2 py-1 bg-pink-50 text-pink-600 rounded-full text-xs">
                              {trigger}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Coping Mechanisms</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {user.copingMechanisms.map((mechanism, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs">
                              {mechanism}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 mr-3">
                          <Users size={16} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Support System</p>
                          <p className="font-medium">{user.hasSupportSystem ? "Yes" : "No"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">App Preferences</h3>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Preferred Language</p>
                        <p className="font-medium">{user.preferredLanguage}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Response Style</p>
                        <p className="font-medium">{user.responsePreference}</p>
                      </div>
                      
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Preferences</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {user.wantsAffirmations && (
                            <span className="px-2 py-1 bg-pink-50 text-pink-600 rounded-full text-xs flex items-center">
                              <Heart size={12} className="mr-1" /> Daily Affirmations
                            </span>
                          )}
                          {user.wantsReminders && (
                            <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs flex items-center">
                              <Clock size={12} className="mr-1" /> Wellness Check-ins
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;