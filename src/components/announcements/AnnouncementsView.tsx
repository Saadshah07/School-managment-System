import React, { useState } from 'react';
import { Bell, Plus, Calendar, User, Tag, AlertCircle, X } from 'lucide-react';
import type { Announcement } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  onRefresh: () => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({ announcements, onRefresh }) => {
  const { currentRole, currentUser } = useAuth();
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState<'All' | 'Teachers' | 'Students' | 'Parents'>('All');
  const [priority, setPriority] = useState<'Normal' | 'Important' | 'Urgent'>('Normal');

  const canPost = ['super_admin', 'school_admin', 'principal'].includes(currentRole);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAnnouncement({
        title,
        content,
        targetRole,
        priority,
        author: currentUser?.name || 'School Administration'
      });
      setIsNewOpen(false);
      setTitle('');
      setContent('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to post announcement.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Campus Broadcasts & Notice Board</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Official circulars, examination schedules, campus events, and academic updates
          </p>
        </div>

        {canPost && (
          <button
            onClick={() => setIsNewOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post Circular</span>
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map(anc => (
          <div
            key={anc.id}
            className={`bg-white rounded-2xl p-5 border shadow-xs transition-all ${
              anc.priority === 'Urgent' ? 'border-rose-200 bg-rose-50/20' :
              anc.priority === 'Important' ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200/80'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  anc.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                  anc.priority === 'Important' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {anc.priority}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  Target: {anc.targetRole}
                </span>
                <h3 className="text-sm font-bold text-slate-800">{anc.title}</h3>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {anc.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {anc.date}
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-700 leading-relaxed font-normal">
              {anc.content}
            </p>
          </div>
        ))}
      </div>

      {/* Post Modal */}
      {isNewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Post New Circular / Notice</h3>
              <button onClick={() => setIsNewOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Midterm Examination Guidelines"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Audience</label>
                  <select
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="All">All School</option>
                    <option value="Teachers">Teachers</option>
                    <option value="Students">Students</option>
                    <option value="Parents">Parents</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Content *</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write official announcement details..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewOpen(false)}
                  className="px-4 py-2 text-slate-600 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
