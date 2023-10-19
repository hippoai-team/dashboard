import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useHistory
import { toast } from 'react-toastify'; // Import toast from react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import Layout from './Layout';
import {Link} from 'react-router-dom'


function AddUser() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    status:"not_signed_up",
  });

  const API_BASE_URL = process.env.NODE_API_URL || 'https://dashboard-api-woad.vercel.app'
  console.log(process.env.REACT_APP_NODE_API_URL)
  const toastDuration = 2000; // 2 seconds or any duration you want
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending formData:", formData);
      const response = await axios.post(
        `${API_BASE_URL}/api/betalist/store`,
        formData
      );

      if (response.status === 201) {
        // Show success toast
        toast.success("User successfully added to beta list!", {
          autoClose: toastDuration,
        });

        // Navigate to sources page after toast disappears
        setTimeout(() => {
          navigate("/betalist");
        }, toastDuration);
      } else {
        // Show error toast
        toast.error("Failed to create source: " + response.data.error, {
          autoClose: toastDuration,
        });
      }
    } catch (error) {
      toast.error("There was an exception: " + error.response.data.error, {
        autoClose: toastDuration,
      });
    }
  };

  return (
    <Layout>
      <div className="content-wrapper">
        <div className="card">
          <div className="card-header">Add a New Beta User</div>
          <div className="card-body">
            {/* Consider adding a component or logic here for rendering errors */}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="optional name"
                  onChange={handleChange}
                />
              </div>
              <div className="email">
                <label htmlFor="email">Email</label>
                <input
                  type="text"
                  name="email"
                  placeholder="Email"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="profession">
                <label htmlFor="profession">Profession</label>
                <select name="profession" className="form-control" onChange={handleChange}>
                  <option value="family_physician">Family Physican</option>
                  <option value="specialist_physician">Specialist Physician</option>
                  <option value="medical_student">Medical Student</option>
                    <option value="resident">Resident</option>
                    <option value="nurse">Nurse Practiotioner/RN</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="other">Other</option>
                </select>
              </div>

              <br></br>
            

              <button type="submit" className="btn btn-primary btn-block">
                Add
              </button>
              <Link to="/betalist" className="btn btn-danger btn-block">
                Cancel
              </Link>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AddUser;
