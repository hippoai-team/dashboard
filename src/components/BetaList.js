// src/components/UserList.js
import React, { useState, useEffect, useReducer } from "react";
import axios from "axios";
import { Link, useRevalidator } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./Layout";

const BetaList = () => {
    const navigate = useNavigate();
    const [ids, setIds] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1); // Initialize currentPage state
    const [perPage, setPerPage] = useState(10); // Initialize perPage state
    const [selectedIds, setSelectedIds] = useState([]);
    const [totalIds, setTotalIds] = useState(0); // Initialize totalUsers state
    const toastDuration = 1000; // 2 seconds
    const [statusFilter, setStatusFilter] = useState("");
    const [statusCounts, setStatusCounts] = useState({
      signed_up: 0,
      logged_in: 0,
      used_hippo: 0,
      never_used_hippo: 0,
      never_signed_up: 0,
    });
    const [totalUsers, setTotalUsers] = useState(0);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [users, setUsers] = useState([]);
    const [user, setUser] = useState({
        email: "",
        status: "",
      });

    const API_BASE_URL = process.env.REACT_APP_NODE_API_URL ||'https://dashboard-api-woad.vercel.app';
    
    const fetchUsers = async () => {
        // Base endpoint
        let endpoint = `${API_BASE_URL}/api/betalist?page=${currentPage}`;
    
        // If there's a search query, append it to the endpoint
        if (search) {
          endpoint += `&search=${search}`;
        }
    
    
        if (perPage) {
          endpoint += `&perPage=${perPage}`;
        }
    
        if (statusFilter) {
          endpoint += `&status=${statusFilter}`;
        }
    
        try {
          // Make a GET request to the endpoint using async/await
          const response = await axios.get(endpoint);
    
          // Destructure the response data
        const { totalBetaUsers, statusCounts, betaUsers } = response.data;
          console.log('betaUsers',betaUsers);
          // Use the response data to update users state
          setTotalUsers(totalBetaUsers);
          setStatusCounts(statusCounts);
          setUsers(betaUsers);

        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
    
      // useEffect for fetching users on initial load and when currentPage changes
      useEffect(() => {
        fetchUsers();
      }, [currentPage, search, perPage, statusFilter]);
      
      const handleSearchChange = (e) => {
        setSearch(e.target.value);
      };
    
      const handleCheckboxChange = (event, userId) => {
        if (event.target.checked) {
          setSelectedUserIds((prevSelected) => [...prevSelected, userId]);
        } else {
          setSelectedUserIds((prevSelected) =>
            prevSelected.filter((id) => id !== userId)
          );
        }
      };
    
      const handleAllCheckboxChange = (event) => {
        if (event.target.checked) {
          const allUserIds = users.map((user) => user._id);
          setSelectedUserIds(allUserIds);
        } else {
          setSelectedUserIds([]);
        }
      };
    
      const handleDeleteSelected = () => {
        axios
          .delete(`${API_BASE_URL}/api/users/delete-multiple`, {
            data: { userIds: selectedUserIds },
          })
          .then((response) => {
            // Display success toast
            toast.success("Selected users deleted successfully!", {
              autoClose: toastDuration,
            });
    
            // Refresh the list after the toast disappears
            setTimeout(() => {
              fetchUsers();
              setSelectedUserIds([]); // Clear the selectedUserIds state
            }, toastDuration);
          })
          .catch((error) => {
            // Display error toast
            toast.error("Error deleting selected users!", {
              autoClose: toastDuration,
            });
            console.error("Error deleting selected users:", error);
          });
      };
    
      // Function to handle clicking the "Next" button
      const handleNextPage = () => {
        setCurrentPage(currentPage + 1);
      };
    
      // Function to handle clicking the "Previous" button
      const handlePreviousPage = () => {
        if (currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      };
    
      const handleDelete = async (userId) => {
        try {
          const response = await axios.delete(
            `${API_BASE_URL}/api/betalist/destroy/${userId}`
          );
    
          if (response.status === 200) {
            // Display success toast
            toast.success("User successfully deleted!", {
              autoClose: toastDuration,
            });
    
            // Refresh the list after the toast disappears
            setTimeout(() => {
              fetchUsers();
            }, toastDuration);
          } else {
            console.error("Failed to delete user:", response.data);
          }
        } catch (error) {
          // Display error toast
          toast.error("Error deleting the user!", { autoClose: toastDuration });
          console.error("Error deleting the user:", error);
        }
      };

      return (
        <Layout>
          <div className="">
            <div className="main-panel">
              <div className="content-wrapper">
                {/* Your code for filters and statistics */}
                <div className="card">
                  <div className="card-header">
                    <h1>Users</h1>
                  </div>
                  <div className="card-body mt-4">
                    <div className="row">
                      <div className="col-4">
                        <form onSubmit={(e) => e.preventDefault()}>
                          <div className="input-group">
                            <div className="input-group-prepend">
                              <span className="input-group-text">
                                <i className="fas fa-search"></i>
                              </span>
                            </div>
                            <input
                              type="search"
                              name="search"
                              className="form-control"
                              placeholder="Search Fields"
                              value={search}
                              onChange={handleSearchChange} // <-- Add this line
                            />
                          </div>
                          {/* <button type='submit' className="btn btn-primary mt-2 rounded-pill">Search</button> */}
                        </form>
                      </div>
    
                      <div className="col-4">
                        <form onSubmit={(e) => e.preventDefault()}>
                          <div className="form-group">
                            <select
                              name="status_filter"
                              className="form-control"
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value)}
                            >
                              <option value="">Status Filter</option>
                              <option value="signed_up">Signed Up</option>
                              <option value="logged_in">Logged In</option>
                              <option value="used">Used Hippo</option>
                              <option value="not_used">Not Used Hippo</option>
                              <option value="not_signed_up">Never signed up</option>
                            </select>
                          </div>
                        </form>
                      </div>
                      
                      <div className="col-4">
                        <form onSubmit={(e) => e.preventDefault()}>
                          <div className="form-group">
                            <select
                              name="per_page"
                              className="form-control"
                              value={perPage}
                              onChange={(e) => setPerPage(e.target.value)}
                            >
                              <option value="10">10 per page</option>
                              <option value="20">20 per page</option>
                              <option value="50">50 per page</option>
                              <option value="100">100 per page</option>
                            </select>
                          </div>
                        </form>
                      </div>
                      
    
                      <div className="col-2"></div>
    
                      <div className="col-2">
                        <Link
                          to="/betalist/add"
                          className="btn btn-primary btn-lg rounded-pill"
                        >
                          <i className="fas fa-plus mr-2"></i>Add User
                        </Link>
                      </div>
                    </div>
    
                    <div className="mt-3">
                      <div className="row">
                        <div className="col">
                          <h3>Statistics</h3>
                          <p>Total number of beta testers = {totalUsers}</p>
                          <ul>
                            <li>Signed Up: {statusCounts.signed_up}</li>
                            <li>Logged in: {statusCounts.logged_in}</li>
                            <li>Used Hippo: {statusCounts.used_hippo}</li>
                            <li>Never used Hippo: {statusCounts.never_used_hippo}</li>
                            <li>Never Signed up: {statusCounts.never_signed_up}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
    
                    <div className="row">
                      <div className="col">
                        <button
                          className="btn btn-dark mb-2"
                          onClick={handleDeleteSelected}
                          disabled={selectedUserIds.length === 0}
                        >
                          Delete Selected
                        </button>
                        
                      </div>
                    </div>
    
                    {/* Table with all columns */}
                    <div className="table-responsive">
                      <table
                        className="table table-borderless table-hover"
                        style={{ tableLayout: "fixed" }}
                      >
                        <thead>
                          <tr className="table-active">
                            <th style={{ width: "10px" }}>
                              <input type="checkbox" id="select_all_ids" 
                              onChange={handleAllCheckboxChange}
                              checked={selectedIds.length === users.length}
                              />
                            </th>
                            <th style={{ width: "10px" }}>Edit</th>
                            <th style={{ width: "10px" }}>Delete</th>
                            <th style={{ width: "70px" }}>Email</th>
                            <th style={{ width: "70px" }}>Status</th>
                            
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user._id}>
                              <td>
                                <input
                                  type="checkbox"
                                  name={`ids[${user._id}]`}
                                  className="checkbox_ids"
                                  value={user._id}
                                  checked={selectedUserIds.includes(user._id)}
                                  onChange={(e) => handleCheckboxChange(e, user._id)}
                                />
                              </td>
                              <td>
                                <Link
                                  to={`/betalist/edit/${user._id}`}
                                  className="btn btn-success"
                                >
                                  <i className="fas fa-pencil-alt"></i>
                                </Link>
                              </td>
                              <td>
                                <button
                                  onClick={() => handleDelete(user._id)}
                                  className="btn btn-danger"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </td>

                              
                                <td>{user.email}</td>
                                <td>{user.status}</td>
                             
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
    
                    {/* Pagination controls */}
                    <div className="row mt-4">
                      <div className="col">
                        <button
                          className="btn btn-dark mb-2"
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                        <button
                          className="btn btn-dark mb-2 ml-2"
                          onClick={handleNextPage}
                          disabled={users.length < 5} // Disable if there are no more pages
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      );
    };
    
    export default BetaList;
    