// src/components/UserList.js
import React, { useState, useEffect, useReducer } from "react";
import axios from "axios";
import { Link, useRevalidator } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./Layout";
import InteractiveTable from "./interactiveTable";
import NumDisplay from "./numDisplay";
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import ChartGraph from "./chartGraph";
import Grid from '@mui/material/Grid';
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
      used_hippo: 0,
      never_used_hippo: 0,
      not_signed_up: 0,
    });
    const [totalUsers, setTotalUsers] = useState(0);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [users, setUsers] = useState([]);


      const API_BASE_URL = process.env.NODE_API_URL ||'http://localhost:8080';
      const chartOptions = {
        chart: {
          id: "basic-bar",
        },
       
      };
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
          .delete(`${API_BASE_URL}/api/betalist/delete-multiple`, {
            headers: {
              "Content-Type": "application/json",
            },
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

      const handleInviteSelected = () => {
        axios
          .post(`${API_BASE_URL}/api/betalist/emailInviteToUsers`, {
            headers: {
              "Content-Type": "application/json",
            },

            data: { userIds: selectedUserIds },
          })
          .then((response) => {
            // Display message from the server
            const message = response.data.message;
            toast.success(message, {
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
            toast.error("Error inviting selected users!", {
              autoClose: toastDuration,
            });
            console.error("Error inviting selected users:", error);
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

      const handleInvite = async (email,resend) => {
        if (resend) {
          //ask for confirmation
          if (!window.confirm("Are you sure you want to resend the invite?")) {
            return;
          }
        }
        
        try {
          const response = await axios.post(
            `${API_BASE_URL}/api/betalist/emailInviteToUser/${email}`
          );
    
          if (response.status === 200) {
            // Display success toast
            console.log('response',response.data);
            const toastMessage = response.data;
            toast.success(toastMessage, {
              autoClose: toastDuration,
            });
    
            // Refresh the list after the toast disappears
            setTimeout(() => {
              fetchUsers();
            }, toastDuration);
          } else {
            console.error("Failed to invite user:", response.data);
          }
        } catch (error) {
          // Display error toast
          toast.error("Error inviting the user!", { autoClose: toastDuration });
          console.error("Error inviting the user:", error);
        }
      }

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
                       
                      </div>
                    </div>
                    <Grid container spacing={3} alignItems="center">
                  <Grid item xs>
                      <ChartGraph series={[statusCounts.signed_up, statusCounts.not_signed_up]} labels={['Signed Up','Never Signed Up']} title="Beta Testers" options={chartOptions} type="donut" width="380" height="300"/>
                  </Grid>
                  <Grid item xs>

                     <ChartGraph series={[statusCounts.used_hippo, statusCounts.never_used_hippo]} labels={['Used Hippo','Never Used Hippo']} title="Beta Testers" options={chartOptions} type="donut" width="380" height="300"/>
                  </Grid>
                  <Grid item xs>
                    <NumDisplay title="Total Beta Testers" value={totalUsers} />
                    </Grid>
                </Grid>
                   
                    <div className="mt-3">
                      <div className="row">
                        <div className="col">
                          <h3>Statistics</h3>
                          <p>Total number of beta testers = {totalUsers}</p>
                          <ul>
                            <li>Signed Up: {statusCounts.signed_up}</li>
                            <li>Used Hippo: {statusCounts.used_hippo}</li>
                            <li>Never used Hippo: {statusCounts.never_used_hippo}</li>
                            <li>Never Signed up: {statusCounts.not_signed_up}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <Button
                          variant="contained"
                          color="primary"
                          component={Link}
                          to="/betalist/add"
                          className="btn btn-primary btn-lg rounded-pill"
                          startIcon={<AddIcon />}
                          sx={{ ml: 1 , marginBottom: 2}}
                        >
                          Add User
                        </Button>
                    <div className="row">
                      
                      <div className="col">
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={handleDeleteSelected}
                          disabled={selectedUserIds.length === 0}
                          sx={{ mr: 1 , marginBottom: 2}}
                        >
                          Delete Selected
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleInviteSelected}
                          disabled={selectedUserIds.length === 0}
                          sx={{ ml: 1 , marginBottom: 2}}
                        >
                          Invite Selected
                        </Button>
                      </div>
                    </div>
                    <InteractiveTable 
                    dataSource={users}
                    columns={[
                      { dataIndex: 'invite_sent', title: 'Invite Sent' },
                      { dataIndex: 'name', title: 'Name' },
                      { dataIndex: 'email', title: 'Email' },
                      { dataIndex: 'status', title: 'Status' },
                      { dataIndex: 'usage', title: 'Usage' },
                    ]}
                    actionButtons={[
                      { label: 'Edit', onClick: (user) => navigate(`/betalist/edit/${user._id}`) },
                      { label: 'Delete', onClick: (user) => handleDelete(user._id) },
                      { label: 'Invite', onClick: (user) => handleInvite(user.email,user.invite_sent) },
                    ]}
                    selectedIds={selectedUserIds}
                    setSelectedIds={setSelectedUserIds}
                    handleCheckboxChange={handleCheckboxChange}
                    handleAllCheckboxChange={handleAllCheckboxChange}

                    />

                    {/* Table with all columns */}
                
    
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      );
    };
    
    export default BetaList;
    