import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Feed from './components/Feed';
import Auth from './components/Auth';
import CreatePost from './components/CreatePost';
import Profile from './components/Profile';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}
