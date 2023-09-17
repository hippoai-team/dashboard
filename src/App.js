import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BookList from './components/BookList';
import AddBook from './components/AddBook';
import EditBook from './components/EditBook';
import Dashboard from './components/Dashboard';
import { ToastContainer } from 'react-toastify';
import Login from './Auth/Login';
import PrivateRoute from './components/Routes/Private';


function App() {
  return (
    <Router>
        <div className="wrapper">
           <h1> React frontend </h1>
            <ToastContainer />

            <Routes>

                <Route path="/dashboard" element={<PrivateRoute />} >
                   <Route path='/dashboard' element={<Dashboard />} />
                </Route>

    
                // <Route path={`${process.env.REACT_APP_API_URL}/dashboard`} element={<Dashboard />} />


                <Route path="/books" element={<PrivateRoute />} >
                  <Route path='' element={<BookList />} />
                </Route>

                <Route path="/books/add" element={<PrivateRoute />} >
                  <Route path='' element={<AddBook />} />
                </Route>

                <Route path="/books/edit/:id" element={<PrivateRoute />} >
                  <Route path='' element={<EditBook />} />
                </Route>


                <Route path="/login" element={<Login />} />

            </Routes>

        </div>
      
    </Router>
  );
}

export default App;

