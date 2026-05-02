import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, Clock, AlertCircle, Plus, ArrowLeft, X } from 'lucide-react';
import API from '../api/axios';

const Project = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', status: 'todo', assignedTo: '' });
  const [userInfo, setUserInfo] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [newMemberId, setNewMemberId] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('userInfo');
    if (userStr) setUserInfo(JSON.parse(userStr));
    fetchProjectAndTasks();
    fetchAllUsers();
  }, [id]);

  const fetchProjectAndTasks = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/tasks/project/${id}`)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
      navigate('/dashboard');
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data } = await API.get('/auth/users');
      setAllUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberId) return;
    try {
      const { data } = await API.put(`/projects/${id}/members/add`, { userId: newMemberId });
      setProject(data);
      setNewMemberId('');
    } catch (error) {
      alert('Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      const { data } = await API.put(`/projects/${id}/members/remove`, { userId: memberId });
      setProject(data);
    } catch (error) {
      alert('Failed to remove member');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    try {
      const { data } = await API.post('/tasks', { ...newTask, projectId: id });
      setTasks([...tasks, data]);
      setNewTask({ title: '', description: '', priority: 'medium', status: 'todo', assignedTo: '' });
      setIsCreating(false);
    } catch (error) {
      alert('Failed to create task');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!project) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div>
      <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition-colors font-medium">
        <ArrowLeft size={18} className="mr-1" /> Back to Dashboard
      </button>

      <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <p className="text-gray-500 flex items-center">
              Admin: <span className="font-medium text-gray-700 ml-1">{project.admin.name}</span>
            </p>
          </div>
          {(userInfo?.role === 'admin' || project.admin._id === userInfo?._id) && (
            <button 
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <Plus size={20} /> Add Task
            </button>
          )}
        </div>
        
        {(userInfo?.role === 'admin' || project.admin._id === userInfo?._id) && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Manage Project Members</h3>
            <form onSubmit={handleAddMember} className="flex gap-3 max-w-md">
              <select 
                value={newMemberId}
                onChange={(e) => setNewMemberId(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a user...</option>
                {allUsers.filter(u => !project.members.some(m => m._id === u._id) && u._id !== project.admin._id).map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                Add
              </button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium flex items-center">
                {project.admin.name} <span className="ml-1 opacity-70">(Admin)</span>
              </span>
              {project.members.filter(m => m._id !== project.admin._id).map(m => (
                <span key={m._id} className="bg-gray-100 text-gray-700 text-xs pl-2.5 pr-1 py-1 rounded-full font-medium flex items-center">
                  {m.name}
                  <button onClick={() => handleRemoveMember(m._id)} className="ml-1 text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-red-50">
                    <X size={12} strokeWidth={3} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Create New Task</h3>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input 
                type="text" 
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select 
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={newTask.status}
                  onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <select 
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                <option value={project.admin._id}>{project.admin.name}</option>
                {project.members.filter(m => m._id !== project.admin._id).map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setIsCreating(false)} className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Cancel</button>
              <button type="submit" className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">Save Task</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* To Do Column */}
        <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center"><Circle size={18} className="mr-2 text-gray-500" /> To Do</h3>
          <div className="space-y-3">
            {tasks.filter(t => t.status === 'todo').map(task => (
              <TaskCard key={task._id} task={task} onStatusChange={updateTaskStatus} getPriorityColor={getPriorityColor} userInfo={userInfo} projectAdminId={project.admin._id} />
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <h3 className="font-bold text-blue-800 mb-4 flex items-center"><Clock size={18} className="mr-2 text-blue-500" /> In Progress</h3>
          <div className="space-y-3">
            {tasks.filter(t => t.status === 'in-progress').map(task => (
              <TaskCard key={task._id} task={task} onStatusChange={updateTaskStatus} getPriorityColor={getPriorityColor} userInfo={userInfo} projectAdminId={project.admin._id} />
            ))}
          </div>
        </div>

        {/* Done Column */}
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <h3 className="font-bold text-green-800 mb-4 flex items-center"><CheckCircle size={18} className="mr-2 text-green-500" /> Done</h3>
          <div className="space-y-3">
            {tasks.filter(t => t.status === 'done').map(task => (
              <TaskCard key={task._id} task={task} onStatusChange={updateTaskStatus} getPriorityColor={getPriorityColor} userInfo={userInfo} projectAdminId={project.admin._id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({ task, onStatusChange, getPriorityColor, userInfo, projectAdminId }) => {
  const isAdmin = userInfo?.role === 'admin' || projectAdminId === userInfo?._id;
  const isAssigned = task.assignedTo?._id === userInfo?._id;
  const canUpdateStatus = isAdmin || isAssigned;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-gray-900 leading-tight">{task.title}</h4>
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>
      {task.description && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>}
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <select 
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          disabled={!canUpdateStatus}
          className={`text-xs border rounded p-1.5 outline-none ${canUpdateStatus ? 'border-gray-200 bg-gray-50 text-gray-700 focus:ring-1 focus:ring-blue-500 cursor-pointer' : 'border-transparent bg-transparent text-gray-500 cursor-not-allowed appearance-none'}`}
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      {task.assignedTo && (
        <span className="text-xs text-gray-500 flex items-center bg-gray-100 px-2 py-1 rounded">
          {task.assignedTo.name}
        </span>
      )}
    </div>
  </div>
  );
};

export default Project;
