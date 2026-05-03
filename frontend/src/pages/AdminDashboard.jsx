import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import BookCard from '../components/BookCard';
import { fetchBooksApi, createBookApi, updateBookApi, deleteBookApi, fetchRequestsApi, updateRequestApi } from '../utils/api';
import { BookOpen, Users, Clock, AlertCircle, Plus, Layers, XCircle, Library } from 'lucide-react';

const AdminDashboard = () => {
  const [books, setBooks] = useState([]);
  const [requests, setRequests] = useState([]);
  
  // Modal states
  const [showBookModal, setShowBookModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Book Form State
  const [bookForm, setBookForm] = useState({
    title: '', author: '', quantity: 1, rentCost: 50, coverIcon: '📚'
  });

  // Approve Form State
  const [approveCost, setApproveCost] = useState(0);

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
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // --- Book Management ---
  const handleEditBook = (book) => {
    setEditingBook(book);
    setBookForm(book);
    setShowBookModal(true);
  };

  const handleAddBookClick = () => {
    setEditingBook(null);
    setBookForm({ title: '', author: '', quantity: 1, rentCost: 50, coverIcon: '📚' });
    setShowBookModal(true);
  };

  const saveBook = async (e) => {
    e.preventDefault();
    try {
      if (editingBook) {
        const updatedBook = await updateBookApi(editingBook._id || editingBook.id, bookForm);
        setBooks(books.map(b => (b._id || b.id) === (editingBook._id || editingBook.id) ? updatedBook : b));
      } else {
        const newBook = await createBookApi(bookForm);
        setBooks([...books, newBook]);
      }
      setShowBookModal(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving book');
    }
  };

  const deleteBook = async (id) => {
    if(window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBookApi(id);
        setBooks(books.filter(b => (b._id || b.id) !== id));
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting book');
      }
    }
  };

  // --- Request Management ---
  const openApproveModal = (req) => {
    const book = books.find(b => (b._id || b.id) === req.bookId);
    setSelectedRequest(req);
    setApproveCost(book ? book.rentCost * req.rentalDays : 0);
    setShowApproveModal(true);
  };

  const approveRequest = async (e) => {
    e.preventDefault();
    
    try {
      const updatedReq = await updateRequestApi(selectedRequest._id || selectedRequest.id, {
        status: 'Approved - Payment Pending Offline',
        approvedCost: approveCost
      });

      setRequests(requests.map(r => (r._id || r.id) === (updatedReq._id || updatedReq.id) ? updatedReq : r));

      // Decrease book quantity
      const updatedBooks = books.map(b => {
        if ((b._id || b.id) === selectedRequest.bookId && b.quantity > 0) {
          return { ...b, quantity: b.quantity - 1 };
        }
        return b;
      });
      setBooks(updatedBooks);
      setShowApproveModal(false);
    } catch (error) {
      alert('Error approving request');
    }
  };

  const rejectRequest = async (id) => {
    const reason = window.prompt("Enter reason for rejection:");
    if (reason === null) return; // Cancelled

    try {
      const updatedReq = await updateRequestApi(id, {
        status: 'Rejected',
        rejectionReason: reason || 'Not specified'
      });
      setRequests(requests.map(r => (r._id || r.id) === (updatedReq._id || updatedReq.id) ? updatedReq : r));
    } catch (error) {
      alert('Error rejecting request');
    }
  };

  // Stats
  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const totalBooks = books.reduce((acc, book) => acc + book.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Navbar title="Admin Portal" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-panel p-6 flex items-center gap-4 border-l-4 border-l-blue-500">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><BookOpen size={24} /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Books</p>
              <p className="text-2xl font-bold text-slate-800">{totalBooks}</p>
            </div>
          </div>
          <div className="glass-panel p-6 flex items-center gap-4 border-l-4 border-l-indigo-500">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><Layers size={24} /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Unique Titles</p>
              <p className="text-2xl font-bold text-slate-800">{books.length}</p>
            </div>
          </div>
          <div className="glass-panel p-6 flex items-center gap-4 border-l-4 border-l-yellow-500">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl"><AlertCircle size={24} /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Pending Requests</p>
              <p className="text-2xl font-bold text-slate-800">{pendingCount}</p>
            </div>
          </div>
          <div className="glass-panel p-6 flex items-center gap-4 border-l-4 border-l-green-500">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl"><Users size={24} /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Requests</p>
              <p className="text-2xl font-bold text-slate-800">{requests.length}</p>
            </div>
          </div>
        </div>

        {/* Requests Management */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="text-blue-600" /> Manage Rental Requests
          </h3>

          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 font-semibold text-slate-600">Student Info</th>
                    <th className="p-4 font-semibold text-slate-600">Book Requested</th>
                    <th className="p-4 font-semibold text-slate-600">Duration</th>
                    <th className="p-4 font-semibold text-slate-600">Status</th>
                    <th className="p-4 font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-slate-500">No requests to show.</td></tr>
                  ) : (
                    requests.map(req => (
                      <tr key={req._id || req.id} className="hover:bg-slate-50/50">
                        <td className="p-4">
                          <p className="font-bold text-slate-800">{req.studentName}</p>
                          <p className="text-xs text-slate-500">{req.studentId} | {req.studentEmail}</p>
                          <p className="text-xs text-slate-500">{req.studentPhone}</p>
                        </td>
                        <td className="p-4 font-medium text-slate-700">{req.bookName}</td>
                        <td className="p-4 text-slate-600">{req.rentalDays} Days</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            req.status.includes('Approved') ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {req.status === 'Pending' ? 'Pending' : (req.status.includes('Approved') ? 'Approved' : 'Rejected')}
                          </span>
                        </td>
                        <td className="p-4">
                          {req.status === 'Pending' ? (
                            <div className="flex gap-2">
                              <button onClick={() => openApproveModal(req)} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-bold hover:bg-green-200 transition-colors">Approve</button>
                              <button onClick={() => rejectRequest(req._id || req.id)} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors">Reject</button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm italic">Processed</span>
                          )}
                        </td>
                      </tr>
                    )).reverse()
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Books Management */}
        <div className="space-y-6 pt-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Library className="text-blue-600" /> Library Inventory
            </h3>
            <button 
              onClick={handleAddBookClick}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={18} /> Add Book
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map(book => (
              <div key={book._id || book.id} className="relative group">
                <BookCard book={book} isAdmin={true} onEdit={handleEditBook} />
                <button 
                  onClick={() => deleteBook(book._id || book.id)}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                >
                  <XCircle size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Approve Request Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Approve Request</h3>
            <p className="text-slate-500 mb-6 text-sm">Review and set final rental cost.</p>
            
            <div className="bg-slate-50 p-4 rounded-xl mb-6 space-y-2 border border-slate-100">
              <p className="text-sm"><span className="font-semibold">Student:</span> {selectedRequest?.studentName}</p>
              <p className="text-sm"><span className="font-semibold">Book:</span> {selectedRequest?.bookName}</p>
              <p className="text-sm"><span className="font-semibold">Duration:</span> {selectedRequest?.rentalDays} days</p>
            </div>

            <form onSubmit={approveRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Final Rental Cost (₹)</label>
                <input 
                  type="number" 
                  required 
                  min="0"
                  value={approveCost} 
                  onChange={e => setApproveCost(Number(e.target.value))} 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-lg font-bold text-green-700 bg-green-50" 
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowApproveModal(false)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-200">
                  Confirm Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit/Add Book Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
            <form onSubmit={saveBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Book Title</label>
                <input type="text" required value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Author</label>
                <input type="text" required value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Quantity</label>
                  <input type="number" min="0" required value={bookForm.quantity} onChange={e => setBookForm({...bookForm, quantity: Number(e.target.value)})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Rent Cost/Day (₹)</label>
                  <input type="number" min="0" required value={bookForm.rentCost} onChange={e => setBookForm({...bookForm, rentCost: Number(e.target.value)})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Cover Icon (Emoji)</label>
                <input type="text" value={bookForm.coverIcon} onChange={e => setBookForm({...bookForm, coverIcon: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xl" />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowBookModal(false)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200">
                  Save Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
