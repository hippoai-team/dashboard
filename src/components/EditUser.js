import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import { toast } from 'react-toastify'; // Import toast from react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import Layout from './Layout';
import {Link} from 'react-router-dom'
import { TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

function EditUser() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: '',
    role: ''
  });

  const navigate = useNavigate();
  const { id } = useParams(); // This captures the ID from the URL
  const toastDuration = 2000; // 2 seconds or any duration you want
  const API_BASE_URL = process.env.REACT_APP_NODE_API_URL || 'https://dashboard-api-woad.vercel.app';



  // Load source data when component mounts
  useEffect(() => {
    
    const fetchUser = async () => {
      try {
        console.log('hello')
        const response = await axios.get(`${API_BASE_URL}/api/users/${id}`);
        setFormData(response.data);
      } catch (error) {
        toast.error('Error fetching source data: ' + error.message);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    console.log('formdata',formData)
    e.preventDefault();
    try {
      const response = await axios.put(`${API_BASE_URL}/api/users/edit/${id}`, formData);
      if (response.status === 200) {
        toast.success("Source successfully updated!", {
          autoClose: toastDuration,
        });

        // Navigate to sources page after toast disappears
        setTimeout(() => {
          navigate("/users");
        }, toastDuration);
      } else {
        toast.error("Failed to update source: " + response.data.error, {
          autoClose: toastDuration,
        });
      }
    } catch (error) {
      toast.error('There was an exception: ' + error.message);
    }
  };

  return (
    <Layout>
    <div className="content-wrapper">
        <div className="card">
            <div className="card-header">Edit Source</div>
            <div className="card-body">
      <FormControl fullWidth style={{marginBottom: '1rem'}}>
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          variant="outlined"
          fullWidth
          style={{marginBottom: '1rem'}}
          InputLabelProps={{shrink: true}}
        />

        <div style={{marginBottom: '1rem'}}>
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            fullWidth
            InputLabelProps={{shrink: true}}
          />
        </div>

        <FormControl fullWidth style={{marginBottom: '1rem'}}>
          <InputLabel>Status</InputLabel>
          <Select
            value={formData.status}
            onChange={handleChange}
            name="status"
            fullWidth
            style={{marginBottom: '1rem'}}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="deactivated">Deactivated</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth style={{marginBottom: '1rem'}}>
          <InputLabel>Role</InputLabel>
          <Select
            
            value={formData.role}
            onChange={handleChange}
            name="role"
            fullWidth
            style={{marginBottom: '1rem'}}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          fullWidth
          style={{marginTop: '1rem'}}
        >
          Update User
        </Button>
      </FormControl>
      </div>
      </div>
      </div>
      </Layout>
      
    );

}

export default EditUser;