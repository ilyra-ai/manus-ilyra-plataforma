import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile, updateUserProfile, exportUserData, deleteUserData } from '../../services/authService';
import { pdfExportService } from '../../services/pdfExportService';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
        setFormData({
          username: data.username,
          email: data.email,
        });
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setMessage('Failed to load profile.');
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(formData);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      // Re-fetch profile to show updated data
      const data = await getUserProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to update user profile:', error);
      setMessage('Failed to update profile.');
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportUserData();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const link = document.createElement('a');
      link.href = jsonString;
      link.download = 'ilyra_user_data.json';
      link.click();
      setMessage('User data exported successfully!');
    } catch (error) {
      console.error('Failed to export user data:', error);
      setMessage('Failed to export data.');
    }
  };

  const handleExportMetricsPdf = async () => {
    try {
      const blob = await exportMetricsPdf();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ilyra_metrics_report_${profile.username}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setMessage("Relatório PDF de métricas exportado com sucesso!");
    } catch (error) {
      console.error("Falha ao exportar relatório PDF de métricas:", error);
      setMessage("Falha ao exportar relatório PDF de métricas.");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.')) {
      try {
        await deleteUserData();
        setMessage('Account deleted successfully. You will be logged out.');
        logout(); // Log out after successful deletion
      } catch (error) {
        console.error('Failed to delete account:', error);
        setMessage('Failed to delete account.');
      }
    }
  };

  if (!profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="user-profile-container">
      <h2>User Profile</h2>
      {message && <p className="message">{message}</p>}

      {!isEditing ? (
        <div>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Member Since:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
          <button onClick={handleExportData}>Export My Data (LGPD)</button>
          <button onClick={handleExportMetricsPdf}>Export Metrics PDF</button>
          <button onClick={handleDeleteAccount} style={{ backgroundColor: 'red' }}>Delete Account (LGPD)</button>
        </div>
      ) : (
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
};

export default UserProfile;

