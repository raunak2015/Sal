import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import BookCard from '../components/BookCard';
import { fetchBooksApi, fetchRequestsApi, createRequestApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Search, Library, Clock, CheckCircle, XCircle, Book } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRentModal, setShowRentModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    phone: '',
    duration: 7
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [booksData, requestsData] = await Promise.all([
          fetchBooksApi(),
          fetchRequestsApi()
        ]);
        setBooks(booksData);
        setRequests(requestsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    loadData();
  }, [user.email]);

  const handleRentClick = (book) => {
    setSelectedBook(book);
    setShowRentModal(true);
  };

  const submitRentRequest = async (e) => {
    e.preventDefault();
    try {
      const newRequest = await createRequestApi({
        studentId: formData.studentId,
        studentName: formData.studentName,
        studentPhone: formData.phone,
        bookId: selectedBook._id,
        bookName: selectedBook.title,
        rentalDays: formData.duration,
      });

      setRequests([newRequest, ...requests]);
      setShowRentModal(false);
      
      // Simple toast alert
      alert('Request sent to admin for approval');
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting request');
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar title="Student Portal" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="glass-panel p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-none">
          <h2 className="text-3xl font-bold mb-2">Welcome to the E-Library</h2>
          <p className="text-blue-100 max-w-2xl">Browse our collection of premium educational resources. Rent books easily and track your requests all in one place.</p>
        </div>

        {/* Books Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Library className="text-blue-600" /> Available Books
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by title or author..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="glass-panel p-12 text-center text-slate-500">
              <Book size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium">No books found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map(book => (
                <BookCard key={book._id || book.id} book={book} isAdmin={false} onRent={handleRentClick} />
              ))}
            </div>
          )}
        </div>

        {/* My Requests Section */}
        <div className="space-y-6 pt-8">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="text-blue-600" /> My Rental Requests
          </h3>

          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 font-semibold text-slate-600">Book Name</th>
                    <th className="p-4 font-semibold text-slate-600">Duration</th>
                    <th className="p-4 font-semibold text-slate-600">Date</th>
                    <th className="p-4 font-semibold text-slate-600">Status</th>
                    <th className="p-4 font-semibold text-slate-600">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-slate-500">No rental requests made yet.</td></tr>
                  ) : (
                    requests.map(req => (
                      <tr key={req._id || req.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-medium text-slate-800">{req.bookName}</td>
                        <td className="p-4 text-slate-600">{req.rentalDays} Days</td>
                        <td className="p-4 text-slate-600">{req.requestDate}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            req.status.includes('Approved') ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {req.status === 'Pending' && <Clock size={12} />}
                            {req.status.includes('Approved') && <CheckCircle size={12} />}
                            {req.status === 'Rejected' && <XCircle size={12} />}
                            {req.status === 'Pending' ? 'Pending' : (req.status.includes('Approved') ? 'Approved' : 'Rejected')}
                          </span>
                        </td>
                        <td className="p-4">
                          {req.status.includes('Approved') ? (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm">
                              <p className="font-bold text-blue-800 mb-1">Pay ₹{req.approvedCost} offline to admin</p>
                              <p className="text-blue-600 text-xs leading-relaxed">
                                Please visit Admin Office, Ground Floor, Sal College with this approval and pay cash. Your book will be issued after payment confirmation.
                              </p>
                            </div>
                          ) : req.status === 'Rejected' ? (
                            <p className="text-red-500 text-sm">{req.rejectionReason || 'No reason provided'}</p>
                          ) : (
                            <p className="text-slate-400 text-sm">Awaiting admin review</p>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Rent Modal */}
      {showRentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg p-8 animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Rent Book</h3>
            <form onSubmit={submitRentRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Book Name</label>
                <input type="text" value={selectedBook?.title} disabled className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                <input type="text" required value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Student ID</label>
                <input type="text" required value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} placeholder="e.g. SAL001" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Phone Number</label>
                <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Rental Duration (Days)</label>
                <select value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white">
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={21}>21 Days</option>
                  <option value={30}>30 Days</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">Estimated base cost: ₹{(selectedBook?.rentCost || 0) * formData.duration}</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowRentModal(false)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-200">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
