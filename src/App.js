import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SourceList from './components/SourceList';
import BetaList from './components/BetaList';
import AddSource from './components/AddNewSource';
import AddBetaUser from './components/AddBetaUser';
import EditSource from './components/EditSource';
import EditBetaUser from './components/EditBetaUser';
import Dashboard from './components/Dashboard';
import UserList from './components/UserList';
import { ToastContainer } from 'react-toastify';
import Login from './Auth/Login';
import PrivateRoute from './components/Routes/Private';
import ChatLogList from './components/chatLogList';
import APIUsageLog from './components/APIUsageLog';
import EditUser from './components/EditUser';
import MasterSources from './components/masterSources';
function App() {
  return (
    console.log(process.env.NODE_API_URL),
    <Router>
        <div className="wrapper">

            <ToastContainer />

            <Routes>

                <Route path="/dashboard" element={<PrivateRoute />} >
                   <Route path='' element={<Dashboard />} />
                </Route>

                <Route path="/" element={<PrivateRoute />} >
                  <Route path='' element={<Dashboard />} />
                </Route>

                <Route path="/sources" element={<PrivateRoute />} >
                  <Route path='' element={<SourceList />} />
                </Route>
                <Route path="/mastersources" element={<PrivateRoute />} >
                  <Route path='' element={<MasterSources />} />
                </Route>
                <Route path="/betalist" element={<PrivateRoute />} >
                  <Route path='' element={<BetaList />} />
                </Route>

                <Route path="/chatlog" element={<PrivateRoute />} >
                  <Route path='' element={<ChatLogList />} />
                </Route>

                <Route path="/apilog" element={<PrivateRoute />} >
                  <Route path='' element={<APIUsageLog />} />
                </Route>

                <Route path="add-new" element={<PrivateRoute />} >
                  <Route path='' element={<AddSource />} />
                </Route>

                <Route path="/betalist/add" element={<PrivateRoute />} >
                  <Route path='' element={<AddBetaUser />} />
                </Route>

                <Route path="/sources/edit/:id" element={<PrivateRoute />} >
                  <Route path='' element={<EditSource />} />
                </Route>

                <Route path="/betalist/edit/:id" element={<PrivateRoute />} >
                  <Route path='' element={<EditBetaUser />} />
                </Route>

                <Route path="/users/edit/:id" element={<PrivateRoute />} >
                  <Route path='' element={<EditUser />} />
                </Route>

                


                <Route path="/users" element={<PrivateRoute />} >
                  <Route path='' element={<UserList />} />
                </Route>


                <Route path="/login" element={<Login />} />

            </Routes>

        </div>
      
    </Router>
  );
}

export default App;

