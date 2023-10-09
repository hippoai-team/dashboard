import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SourceList from './components/SourceList';
import AddSource from './components/AddSource';
import EditSource from './components/EditSource';
import Dashboard from './components/Dashboard';
import { ToastContainer } from 'react-toastify';
import Login from './Auth/Login';
import PrivateRoute from './components/Routes/Private';


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

                <Route path="/betalist" element={<PrivateRoute />} >
                  <Route path='' element={<BetaList />} />
                </Route>

                <Route path="/sources/add" element={<PrivateRoute />} >
                  <Route path='' element={<AddSource />} />
                </Route>

                <Route path="/sources/edit/:id" element={<PrivateRoute />} >
                  <Route path='' element={<EditSource />} />
                </Route>


                <Route path="/login" element={<Login />} />

            </Routes>

        </div>
      
    </Router>
  );
}

export default App;

