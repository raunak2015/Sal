const KEYS = {
  BOOKS: 'sal_library_books',
  REQUESTS: 'sal_library_requests',
  USER: 'sal_library_user'
};

const DEFAULT_BOOKS = [
  { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", quantity: 5, rentCost: 50, coverIcon: "📚" },
  { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", quantity: 3, rentCost: 45, coverIcon: "📖" },
  { id: 3, title: "1984", author: "George Orwell", quantity: 4, rentCost: 40, coverIcon: "📕" },
  { id: 4, title: "Pride and Prejudice", author: "Jane Austen", quantity: 2, rentCost: 55, coverIcon: "📗" },
  { id: 5, title: "The Catcher in the Rye", author: "J.D. Salinger", quantity: 3, rentCost: 48, coverIcon: "📘" }
];

export const initStorage = () => {
  if (!localStorage.getItem(KEYS.BOOKS)) {
    localStorage.setItem(KEYS.BOOKS, JSON.stringify(DEFAULT_BOOKS));
  }
  if (!localStorage.getItem(KEYS.REQUESTS)) {
    localStorage.setItem(KEYS.REQUESTS, JSON.stringify([]));
  }
};

export const getBooks = () => JSON.parse(localStorage.getItem(KEYS.BOOKS)) || [];
export const saveBooks = (books) => localStorage.setItem(KEYS.BOOKS, JSON.stringify(books));

export const getRequests = () => JSON.parse(localStorage.getItem(KEYS.REQUESTS)) || [];
export const saveRequests = (requests) => localStorage.setItem(KEYS.REQUESTS, JSON.stringify(requests));

export const getUser = () => JSON.parse(localStorage.getItem(KEYS.USER)) || null;
export const saveUser = (user) => localStorage.setItem(KEYS.USER, JSON.stringify(user));
export const clearUser = () => localStorage.removeItem(KEYS.USER);
