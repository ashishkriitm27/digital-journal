// frontend/src/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard({ user, onLogout }) {
  // Form ke liye states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('☕ Personal');
  const [content, setContent] = useState('');
  
  // Update mode track karne ke liye states
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Entries data list state
  const [entries, setEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('🌐 All');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/entries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(response.data.entries);
    } catch (error) {
      console.error("Entries load error:", error);
    }
  };

  // Create YA Update handle karne ka master function
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      alert("Bhai, Title aur Content zaroori hain!");
      return;
    }

    const token = localStorage.getItem('token');

    try {
      if (isEditing) {
        // =============== UPDATE MODE ===============
        const response = await axios.put(`http://localhost:5000/api/entries/${editId}`, 
          { title, category, content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.status === 200) {
          setIsEditing(false);
          setEditId(null);
        }
      } else {
        // =============== CREATE MODE ===============
        await axios.post('http://localhost:5000/api/entries', 
          { title, category, content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Form reset aur list fresh reload
      setTitle('');
      setContent('');
      setCategory('☕ Personal');
      fetchEntries();

    } catch (error) {
      console.error("Submit error:", error);
      alert("Kuch gadbad ho gayi!");
    }
  };

  // Kisi entry ko edit form mein load karna
  const handleEditClick = (entry) => {
    setIsEditing(true);
    setEditId(entry._id);
    setTitle(entry.title);
    setCategory(entry.category);
    setContent(entry.content);
    
    // Smooth scroll back to form for mobile users
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Entry Delete karne ka function
  const handleDelete = async (id) => {
    if (!window.confirm("Kya sach mein yeh entry delete karni hai?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/entries/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEntries(); // Delete hone ke baad list refresh
    } catch (error) {
      console.error("Delete error:", error);
      alert("Delete nahi ho paya!");
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === '🌐 All') return matchesSearch;
    return entry.category === activeFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#070b13] text-white font-sans selection:bg-blue-500/30">
      
      {/* HEADER / NAVBAR */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></span>
          <h1 className="text-xl font-black tracking-wider text-slate-100">DIGITAL.JOURNAL</h1>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-full shadow-lg">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full border border-cyan-500/50 object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold">{user?.name?.[0]}</div>
          )}
          <span className="text-xs font-semibold tracking-wide text-slate-300">{user?.name || "User"}</span>
          <div className="w-[1px] h-4 bg-slate-700"></div>
          <button onClick={onLogout} className="text-xs font-bold text-rose-400 hover:text-rose-500 transition duration-200 cursor-pointer">Logout</button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: FORM */}
        <section className="lg:col-span-4 bg-[#0d1527] border border-slate-800/80 p-6 rounded-2xl shadow-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <span>{isEditing ? "✏️" : "✨"}</span> {isEditing ? "Edit Entry" : "New Entry"}
            </h2>
            <p className="text-xs text-slate-400">{isEditing ? "Modify your thoughts." : "Capture your insights instantly."}</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Title</label>
              <input 
                type="text" 
                placeholder="Write title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#131e36] border border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-cyan-500/50 transition text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#131e36] border border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-cyan-500/50 transition cursor-pointer text-slate-200"
              >
                <option value="☕ Personal">☕ Personal</option>
                <option value="📈 Growth">📈 Growth</option>
                <option value="🧠 Learning">🧠 Learning</option>
                <option value="💡 Idea">💡 Idea</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Content</label>
              <textarea 
                rows="5"
                placeholder="Write your thoughts here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-[#131e36] border border-slate-700/50 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-cyan-500/50 transition resize-none text-white"
              ></textarea>
            </div>

            <div className="flex gap-2">
              <button 
                type="submit" 
                className={`w-full font-bold text-sm py-3 rounded-xl transition duration-200 shadow-md cursor-pointer ${
                  isEditing ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-500' : 'bg-white text-slate-950 hover:bg-slate-200'
                }`}
              >
                {isEditing ? "Update Entry ✓" : "Publish Entry →"}
              </button>
              {isEditing && (
                <button 
                  type="button" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditId(null);
                    setTitle('');
                    setContent('');
                    setCategory('☕ Personal');
                  }}
                  className="bg-slate-800 text-slate-300 font-bold text-sm px-4 rounded-xl hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* RIGHT COLUMN: RECENT REFLECTIONS */}
        <section className="lg:col-span-8 space-y-6">
          {/* SEARCH & FILTERS */}
          <div className="bg-[#0d1527] border border-slate-800/80 p-4 rounded-xl space-y-4 shadow-md">
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400 text-sm">🔍</span>
              <input 
                type="text" 
                placeholder="Search title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#070b13] border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-hidden focus:border-slate-700 transition text-white"
              />
            </div>
            
            <div className="flex items-center gap-2 text-xs flex-wrap">
              {['🌐 All', '☕ Personal', '📈 Growth', '🧠 Learning', '💡 Idea'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    activeFilter === filter ? 'bg-cyan-400 text-slate-950 font-bold' : 'bg-[#131e36] text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* LIST */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold tracking-tight text-slate-200">Recent Reflections</h3>
              <span className="bg-[#131e36] text-cyan-400 border border-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-md">
                Found: {filteredEntries.length}
              </span>
            </div>

            {filteredEntries.length === 0 ? (
              <div className="border border-dashed border-slate-800 rounded-2xl py-24 flex flex-col items-center justify-center text-center bg-[#0d1527]/30">
                <p className="text-slate-500 text-sm">No matching entries found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredEntries.map((entry) => (
                  <div key={entry._id} className="bg-[#0d1527] border border-slate-800/60 p-5 rounded-2xl shadow-md space-y-3 relative group">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-[#131e36] text-slate-400 border border-slate-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">
                          {entry.category}
                        </span>
                        <h4 className="text-base font-bold text-slate-100 mt-2">{entry.title}</h4>
                      </div>
                      
                      {/* ACTION BUTTONS (Edit & Delete) */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditClick(entry)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs transition cursor-pointer"
                          title="Edit Entry"
                        >
                          ✏️
                        </button>
                        
                        {/* BUG FIXED: Editing ke time trash icon block ho jayega aur disabled style dikhegi */}
                        <button 
                          onClick={() => handleDelete(entry._id)}
                          disabled={isEditing}
                          className={`p-1.5 rounded-lg text-xs transition ${
                            isEditing 
                              ? 'bg-slate-900 text-slate-600 cursor-not-allowed opacity-40' 
                              : 'bg-slate-800 hover:bg-rose-950 text-rose-400 cursor-pointer'
                          }`}
                          title={isEditing ? "Cannot delete while editing" : "Delete Entry"}
                        >
                          🗑️
                        </button>
                        
                        <span className="text-[10px] text-slate-500 font-medium ml-2">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{entry.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}