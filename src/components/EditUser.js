import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import { toast } from 'react-toastify'; // Import toast from react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import Layout from './Layout';
import {Link} from 'react-router-dom'

function EditUser() {
  const [formData, setFormData] = useState({
    // ... initial empty state
  });

  const navigate = useNavigate();
  const { id } = useParams(); // This captures the ID from the URL
  const toastDuration = 2000; // 2 seconds or any duration you want
  const API_BASE_URL = process.env.REACT_APP_NODE_API_URL || 'https://dashboard-api-woad.vercel.app';



  // Load source data when component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/betalist/${id}`);
        setFormData(response.data);
        console.log(response.data)
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
      const response = await axios.put(`${API_BASE_URL}/api/betalist/edit/${id}`, formData);
      if (response.status === 200) {
        toast.success("Source successfully updated!", {
          autoClose: toastDuration,
        });

        // Navigate to sources page after toast disappears
        setTimeout(() => {
          navigate("/betalist");
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
                    {/* Consider adding a component or logic here for rendering errors */}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Topic</label>
                            <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input type="text" name="email" className="form-control" value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="profession">
                <label htmlFor="profession">Profession</label>
                <select name="profession" className="form-control" onChange={handleChange}>
                  <option value="family_physician">Family Physican</option>
                  <option value="specialist_physician">Specialist Physician</option>
                  <option value="medical_student">Medical Student</option>
                    <option value="resident">Resident</option>
                    <option value="nurse">Nurse Practiotioner/RN</option>
                </select>
              </div>
              <div className="cohort">
                <label htmlFor="cohort">Cohort</label>
                <select name="cohort" className="form-control" onChange={handleChange} value={formData.cohort}>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="none">None</option>
                </select>
              </div>
                        <button type="submit" className="btn btn-primary btn-block">Update</button>
                        <Link to="/betalist" className="btn btn-danger btn-block">Cancel</Link>
                        
                    </form>
                </div>
            </div>
        </div>
      </Layout>
    );



}

export default EditUser;
