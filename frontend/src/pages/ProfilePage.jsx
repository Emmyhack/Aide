import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || { city: '', state: '', country: '' },
    interests: user?.interests || [],
    skills: user?.skills || [],
  });

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <h1 className="text-2xl font-bold">Profile Settings</h1>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-8">
                <img
                  src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3b82f6&color=fff`}
                  alt={user?.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                  <div className="mt-2">
                    <span className="badge badge-blue">Impact Score: {user?.stats?.impactScore || 0}</span>
                  </div>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={4}
                      className="input"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button onClick={handleSave} className="btn-primary">Save Changes</button>
                    <button onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">About</h3>
                    <p className="text-gray-600">{user?.bio || 'No bio provided yet.'}</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <button onClick={() => setIsEditing(true)} className="btn-primary">Edit Profile</button>
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