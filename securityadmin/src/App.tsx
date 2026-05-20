import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';

import UserForm from './pages/UserForm';
import Dashboard from './pages/Dashboard';
import { ManageSystemPrivileges } from './pages/ManageSystemPrivileges';
import ManageWidgets from './pages/ManageWidgets';
import ManageUserModules from './pages/ManageUserModules';
import ManageSystemConfiguration from './pages/ManageSystemConfiguration';
import ManageUserRestriction from './pages/ManageUserRestriction';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import ManageUsers from './pages/ManageUsers';
function App() {
    return (
        <BrowserRouter basename="/admin">
            <ToastContainer position="top-center" autoClose={3000} />
            <Routes>
                <Route path="/" element={<DashboardLayout />}>
                    // <Route index element={<ManageUsers />} />
                    <Route path="privileges" element={<ManageSystemPrivileges />} />
                    <Route path="managesyscon" element={<ManageSystemConfiguration />} />
                    <Route path="/users/widgets/:id" element={<ManageWidgets />} />

                    <Route path="users" element={<ManageUsers />} />

                    <Route path="/users/modules/:id" element={<ManageUserModules />} />
                    <Route path="manageuserres" element={<ManageUserRestriction />} />
                    <Route path="users/add" element={<UserForm />} />
                    <Route path="users/edit/:id" element={<UserForm />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
export default App;