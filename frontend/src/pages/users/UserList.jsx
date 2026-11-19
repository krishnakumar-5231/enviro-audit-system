import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Shield, Mail, Building, Trash2 } from 'lucide-react';
import { userAPI, siteAPI } from '../../services/api';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Modal from '../../components/common/Modal';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Site Environmental Officer',
    department: '',
    phone: ''
  });

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await userAPI.getUsers({ page, limit: 10, search, role: roleFilter });
      if (res.data.success) {
        setUsers(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(1), 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await userAPI.createUser(formData);
      setModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'Site Environmental Officer', department: '', phone: '' });
      fetchUsers(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating user');
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await userAPI.deleteUser(userToDelete._id);
      setDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">User Management</h2>
          <p className="text-xs text-slate-500 mt-1">Manage system accounts, access levels, and role permissions.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add New User</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search users by name, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500"
        >
          <option value="">All Roles</option>
          <option value="Administrator">Administrator</option>
          <option value="Environmental Auditor">Environmental Auditor</option>
          <option value="Site Manager">Site Manager</option>
          <option value="Site Environmental Officer">Site Environmental Officer</option>
          <option value="Compliance Officer">Compliance Officer</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><LoadingSpinner /></div>
        ) : users.length === 0 ? (
          <EmptyState title="No users found" description="Try adjusting your search criteria." icon={Users} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 font-semibold">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Assigned Sites</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap font-medium text-slate-800">
                      {u.role}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {u.department || '—'}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {u.assignedSites?.map((s) => s.name).join(', ') || 'Global / None'}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge status={u.status || 'Active'} />
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setUserToDelete(u);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={pagination} onPageChange={(p) => fetchUsers(p)} />
      </div>

      {/* Add User Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create System User">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500"
            >
              <option value="Administrator">Administrator</option>
              <option value="Environmental Auditor">Environmental Auditor</option>
              <option value="Site Manager">Site Manager</option>
              <option value="Site Environmental Officer">Site Environmental Officer</option>
              <option value="Compliance Officer">Compliance Officer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
            >
              Save User
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete user ${userToDelete?.name}?`}
        confirmText="Delete User"
        danger
      />
    </div>
  );
}
