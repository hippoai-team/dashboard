import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "./Layout";
import InteractiveTable from "./interactiveTable";
import NumDisplay from "./numDisplay";
import PageTitle from "./pageTitle";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Grid from "@mui/material/Grid";
import DailyChartGraph from "./dailyDataGraph";
const UserList = () => {
    const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Initialize currentPage state
  const [perPage, setPerPage] = useState(10); // Initialize perPage state
  const [selectedIds, setSelectedIds] = useState([]);
  const [totalIds, setTotalIds] = useState(0); // Initialize totalUsers state
  const toastDuration = 1000; // 2 seconds
  const [statusFilter, setStatusFilter] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [cohortFilter, setCohortFilter] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [totalUsageCount, setTotalUsageCount] = useState(0);
  const [totalFeedbackCount, setTotalFeedbackCount] = useState(0);
  const [dailyActiveUsers, setDailyActiveUsers] = useState([]);
  const [churnData, setChurnData] = useState([]);
  const [queriesByUserAndWeek, setQueriesByUserAndWeek] = useState([]);
  const [weekOverWeekChanges, setWeekOverWeekChanges] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedUserGroup, setSelectedUserGroup] = useState("all");
    const [selectedDate, setSelectedDate] = useState("");
    const [dateRange, setDateRange] = useState("all-time");
    const [dateCountObj, setDateCountObj] = useState({});
    const [userList, setUserList] = useState([]);

    const chartOptions = {

            chart: {
              type: 'bar',
            },
            xaxis: {
              type: 'datetime',
              labels: {
                datetimeUTC: false,
                datetimeFormatter: {
                  year: 'yyyy',
                  month: 'MMM \'yy',
                  day: 'dd MMM',
                },
              }
            },
            tooltip: {
                x: {
                  formatter: (value, { series, seriesIndex, dataPointIndex, w }) => {
                    return new Date(value).toLocaleDateString();
                  },
                },
                y: {
                  formatter: (value, { series, seriesIndex, dataPointIndex, w }) => {
                    const date = w.globals.labels[dataPointIndex];
                    const users = w.config.userData[date]?.users || [];
                    return `Count: ${value} <br> Users: ${users.join(', ')}`;
                  }
                }
              }
            };
const cohortList = ['A', 'B', 'C', 'D', 'none'];
  const API_BASE_URL = process.env.REACT_APP_NODE_API_URL ||'https://dashboard-api-woad.vercel.app';



  const fetchUsers = async () => {
    try {
        let endpoint = `${API_BASE_URL}/api/users?page=${currentPage}`;

        if (search) {
            endpoint += `&search=${search}`;
            }
        
        if (perPage) {
        endpoint += `&perPage=${perPage}`;
        }
    
        if (statusFilter) {
        endpoint += `&status=${statusFilter}`;
        }
        if (selectedUser) {
        endpoint += `&userFilter=${selectedUser}`;
        }
        if (selectedUserGroup) {
        endpoint += `&userGroupFilter=${selectedUserGroup}`;
        }
      const response = await axios.get(endpoint);
        setUsers(response.data.users);
        console.log(response.data)
        setTotalUsers(response.data.totalUsers);
        setTotalUsageCount(response.data.totalUsageCount);
        setTotalFeedbackCount(response.data.totalFeedbackCount);
        setDailyActiveUsers(response.data.dailyActiveUsers);
        setChurnData(response.data.churnData);
        setQueriesByUserAndWeek(response.data.queriesByUserAndWeek);
        setWeekOverWeekChanges(response.data.weekOverWeekChanges);
        setTotalIds(response.data.totalUsers);

    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }

    , [currentPage, perPage, search, statusFilter, cohortFilter, selectedUser, selectedUserGroup, selectedDate, dateRange]);

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

      const handleNextPage = () => {
        if (currentPage < Math.ceil(totalUsers / perPage)) {
            setCurrentPage(currentPage + 1);
        }
    }
    
      // Function to handle clicking the "Previous" button
      const handlePreviousPage = () => {
        if (currentPage > 1) {
            console.log("previous page clicked");
          setCurrentPage(currentPage - 1);
        }
      };

      const handleDelete = async (userId) => {
        try {
          const response = await axios.delete(
            `${API_BASE_URL}/api/users/delete/${userId}`
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

        const handlePerPageChange = (e) => {
            setPerPage(e.target.value);
        }

        const handleStatusChange = (e) => {
            setStatusFilter(e.target.value);
        }

        const handleCohortChange = (e) => {
            setCohortFilter(e.target.value);
        }

        const handleUserChange = (e) => {
            setSelectedUser(e.target.value);
        }

        const handleUserGroupChange = (e) => {
            setSelectedUserGroup(e.target.value);
        }
        
        const handleDateChange = (e) => {
            setSelectedDate(e.target.value);
        }

  return (
    <Layout>
    <div className="content-wrapper">
      <PageTitle title="Users" />

      <section className="content">
              <div className="container-fluid">
                  <div className="row">
                      <div className="col-12">
                          <div className="card card-primary">
                              <div className="card-header">
                                  <h3 className="card-title">Beta Users</h3>
                              </div>
                              <div className="card-body">
                                  <Grid container spacing={3}>
                                      <Grid item xs={12} sm={6} md={3}>
                                          <NumDisplay title="Total Users" value={totalUsers} />
                                      </Grid>
                                      <Grid item xs={12} sm={6} md={3}>
                                          <NumDisplay title="Total Feedback" value={totalFeedbackCount} />
                                      </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <NumDisplay title="Total Usage" value={totalUsageCount} />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <NumDisplay title="Churn Rate" value={churnData['totalChurnRate']} />

                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <NumDisplay title="Churn Per Week" value={churnData['churnPerWeek']} />
                                            </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            
                                        </Grid>                               
                                  </Grid>
                                  <DailyChartGraph title="Daily Active Users"
                                            options={chartOptions}
                                            series={[{
                                                name: 'Daily Active Users',
                                                data: Object.keys(dailyActiveUsers).map(entry => dailyActiveUsers[entry].count)
                                            }]}
                                            labels={Object.keys(dailyActiveUsers).map(dateStr => new Date(dateStr).getTime())}
                                            type="bar"
                                            width="100%"
                                            height={350}
                                            userData={dailyActiveUsers}
                                            
                                          />
                                        <div className="row">
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>Search</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Search"
                                                        value={search}
                                                        onChange={handleSearchChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>Per Page</label>
                                                    <select
                                                        className="form-control"
                                                        value={perPage}
                                                        onChange={handlePerPageChange}
                                                    >
                                                        <option value="10">10</option>
                                                        <option value="20">20</option>
                                                        <option value="50">50</option>
                                                        <option value="100">100</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>User</label>
                                                    <select
                                                        className="form-control"
                                                        value={selectedUser}
                                                        onChange={handleUserChange}
                                                    >
                                                        <option value="">All</option>
                                                    

                                                        {users.map((user) => (
                                                            <option key={user._id} value={user.email}>{user.name} - {user.email}</option>
                                                        ))}
                                                        
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>User Group</label>
                                                    <select
                                                        className="form-control"
                                                        value={selectedUserGroup}
                                                        onChange={handleUserGroupChange}
                                                    >
                                                        <option value="all">All</option>
                                                        <option value="beta">Beta</option>
                                                        {cohortList.map((cohort) => (
                                                            <option key={cohort} value={cohort}>Cohort {cohort}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>Date</label>
                                                    <select
                                                        className="form-control"
                                                        value={selectedDate}
                                                        onChange={handleDateChange}
                                                    >
                                                        <option value="">All</option>
                                                        {Object.keys(dateCountObj).map((date) => (
                                                            <option key={date} value={date}>{date}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>Date Range</label>
                                                    <select
                                                        className="form-control"
                                                        value={dateRange}
                                                        onChange={(e) => setDateRange(e.target.value)}
                                                    >
                                                        <option value="all-time">All Time</option>
                                                        <option value="last-week">Last Week</option>
                                                        <option value="last-month">Last Month</option>
                                                        <option value="last-year">Last Year</option>
                                                    </select>
                                                </div>
                                                </div>

                                        </div>
                                        
                                <div className="card-body">
                                    <InteractiveTable dataSource={users} columns={[
                                        { dataIndex: 'email', title: 'Email' },
                                        { dataIndex: 'signup_date', title: 'Signup Date' },
                                        { dataIndex: 'status', title: 'Status' },
                                        { dataIndex: 'usage', title: 'Usage' },
                                        { dataIndex: 'sourcesCount', title: 'Sources' },
                                        { dataIndex: 'threadsCount', title: 'Threads' },
                                        { dataIndex: 'sourceClickCount', title: 'Source Click Count' },
                                        { dataIndex: 'followup_usage', title: 'Followup Usage' },
                                        { dataIndex: 'num_logins', title: 'Number of Logins' },
                                        { dataIndex: 'feedback_count', title: 'Feedback Count' },
                                        { dataIndex: 'sourceClickCount', title: 'Source Click Count' },
                                        {dataIndex:'nav_threads', title: 'Navigated To Threads'},
                                        {dataIndex:'nav_saved_sources', title: 'Navigated To Saved Sources'},
                                    ]} 
                                    handleCheckboxChange={handleCheckboxChange}
                                    handleAllCheckboxChange={handleAllCheckboxChange}
                                    selectedIds={selectedUserIds}
                                    totalEntries={totalIds}
                                    currentPage={currentPage}
                                    perPage={perPage}
                                    handleNextPage={handleNextPage}
                                    handlePrevPage={handlePreviousPage}
                                    actionButtons={[
                                        { label: 'Edit', onClick: (user) => navigate(`/users/edit/${user._id}`) },
                                        { label: 'Delete', onClick: (user) => handleDelete(user._id) },
                                        
                                    ]}
                                    />
                                </div>  
                                </div>
                                </div>
                                </div>
                                </div>
                                </div>
                                </section>
                                </div>
                                </Layout>
    );
}

export default UserList;
