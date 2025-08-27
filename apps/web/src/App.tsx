import { Routes, Route, Link } from 'react-router-dom';
import Restaurant from './pages/public/Restaurant';
import Menu from './pages/public/Menu';
import Plate from './pages/public/Plate';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import MenuCrud from './pages/admin/MenuCrud';
import Feedback from './pages/admin/Feedback';
import Settings from './pages/admin/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/r/:slug" element={<Restaurant />} />
      <Route path="/r/:slug/menu" element={<Menu />} />
      <Route path="/r/:slug/plate/:id" element={<Plate />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<Dashboard />} />
      <Route path="/admin/menu" element={<MenuCrud />} />
      <Route path="/admin/feedback" element={<Feedback />} />
      <Route path="/admin/settings" element={<Settings />} />
    </Routes>
  );
}
