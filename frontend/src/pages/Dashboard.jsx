import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Folder, Plus, User as UserIcon } from 'lucide-react';
import API from '../api/axios';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('userInfo');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userStr);
    setUserInfo(user);
    fetchProjects();
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/dashboard/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

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
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Dashboard</h2>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <Plus size={20} /> New Project
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Projects</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Tasks</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">To Do</h3>
            <p className="text-2xl font-bold text-gray-700">{stats.statusCounts?.todo || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">In Progress</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.statusCounts?.['in-progress'] || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Done</h3>
            <p className="text-2xl font-bold text-green-600">{stats.statusCounts?.done || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Overdue</h3>
            <p className="text-2xl font-bold text-red-600">{stats.overdueTasksCount}</p>
          </div>
        </div>
      )}

      <h3 className="text-xl font-bold text-gray-800 mb-4">Your Projects</h3>

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
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center text-gray-500">
                    <UserIcon size={16} className="mr-1.5" />
                    <span>Admin: {project.admin?.name || 'You'}</span>
                  </div>
                  {stats && (
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                      {stats.tasksPerProject?.[project._id] || 0} Tasks
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {stats && stats.tasksPerUser && Object.keys(stats.tasksPerUser).length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Tasks per User</h3>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {Object.entries(stats.tasksPerUser).map(([userName, count]) => (
                <li key={userName} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <UserIcon size={18} className="text-gray-400 mr-3" />
                    <span className="font-medium text-gray-900">{userName}</span>
                  </div>
                  <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs font-semibold">
                    {count} {count === 1 ? 'Task' : 'Tasks'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
