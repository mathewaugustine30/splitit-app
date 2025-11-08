import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { CloseIcon } from './icons';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (user: User) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, currentUser, onUpdateUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (currentUser && isOpen) {
      setName(currentUser.name);
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setAvatarUrl(currentUser.avatarUrl);
    }
  }, [currentUser, isOpen]);

  const handleChangeAvatar = () => {
    // Simulate uploading a new avatar by generating a new random one
    setAvatarUrl(`https://picsum.photos/seed/${Date.now()}/100`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        alert("Name cannot be empty.");
        return;
    }
    const updatedUser: User = {
      ...currentUser,
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      avatarUrl,
    };
    onUpdateUser(updatedUser);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-md relative max-h-full overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <img src={avatarUrl} alt="Your avatar" className="w-24 h-24 rounded-full ring-4 ring-primary ring-opacity-50" />
            <button
              type="button"
              onClick={handleChangeAvatar}
              className="text-sm font-medium text-secondary hover:underline"
            >
              Change Avatar
            </button>
          </div>
          <div>
            <label htmlFor="profileName" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="profileName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="profileEmail" className="block text-sm font-medium text-gray-700">Email (optional)</label>
            <input
              type="email"
              id="profileEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="profilePhone" className="block text-sm font-medium text-gray-700">Phone (optional)</label>
            <input
              type="tel"
              id="profilePhone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="123-456-7890"
            />
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg mr-2 hover:bg-gray-300 transition-colors">Cancel</button>
            <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400" disabled={!name.trim()}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;