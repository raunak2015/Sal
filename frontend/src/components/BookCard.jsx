import React from 'react';
import { Book, Tag, Layers, CheckCircle } from 'lucide-react';

const BookCard = ({ book, onRent, isAdmin, onEdit }) => {
  return (
    <div className="glass-panel p-6 flex flex-col gap-4 transition-all hover:shadow-2xl hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div className="w-16 h-20 bg-blue-100 rounded-lg flex items-center justify-center text-2xl shadow-inner overflow-hidden flex-shrink-0">
          {(book.coverIcon && (book.coverIcon.includes('.png') || book.coverIcon.includes('.jpg'))) ? (
            <img src={book.coverIcon} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <span>{book.coverIcon || "📚"}</span>
          )}
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${book.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {book.quantity > 0 ? 'Available' : 'Out of Stock'}
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-slate-800 line-clamp-1">{book.title}</h3>
        <p className="text-slate-500 font-medium text-sm mt-1">by {book.author}</p>
      </div>

      <div className="mt-2 pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          <Layers size={16} className="text-blue-500" />
          {book.quantity} Left
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          <Tag size={16} className="text-blue-500" />
          ₹{book.rentCost}/day
        </div>
      </div>

      <div className="mt-2">
        {isAdmin ? (
          <button 
            onClick={() => onEdit(book)}
            className="w-full py-2.5 rounded-lg border-2 border-blue-100 text-blue-600 font-bold hover:bg-blue-50 transition-colors"
          >
            Edit Book
          </button>
        ) : (
          <button 
            onClick={() => onRent(book)}
            disabled={book.quantity === 0}
            className={`w-full py-2.5 rounded-lg font-bold transition-all shadow-md ${
              book.quantity === 0 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200 active:translate-y-0.5'
            }`}
          >
            {book.quantity === 0 ? 'Unavailable' : 'Rent Book'}
          </button>
        )}
      </div>
    </div>
  );
};

export default BookCard;
