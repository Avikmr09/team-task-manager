import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Folder, Plus, User as UserIcon } from 'lucide-react';
import API from '../api/axios';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
      return;
    }
    fetchProjects();
  }, [navigate]);

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      const { data } = await API.post('/projects', { name: newProjectName });
      setProjects([...projects, data]);
      setNewProjectName('');
      setIsCreating(false);
    } catch (error) {
      alert('Failed to create project');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Your Projects</h2>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <Plus size={20} /> New Project
        </button>
      </div>

      {isCreating && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 mb-6 shadow-sm">
          <form onSubmit={handleCreateProject} className="flex gap-4">
            <input 
              type="text" 
              placeholder="Project Name" 
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              autoFocus
            />
            <button type="submit" className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 font-medium transition-colors">Create</button>
            <button type="button" onClick={() => setIsCreating(false)} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 font-medium transition-colors">Cancel</button>
          </form>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <Folder className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
          <p className="mt-1 text-gray-500">Get started by creating a new project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Link to={`/project/${project._id}`} key={project._id} className="block group">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{project.name}</h3>
                  <Folder className="text-blue-500" size={24} />
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <UserIcon size={16} className="mr-1.5" />
                  <span>Admin: {project.admin?.name || 'You'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
