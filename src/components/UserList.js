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
import ChartGraph from "./chartGraph";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import InactiveUserTable from "./inactiveUserTable";
const UserList = () => {
    const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Initialize currentPage state
  const [perPage, setPerPage] = useState(20); // Initialize perPage state
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
    const [dateRange, setDateRange] = useState("last_week");
    const [dateCountObj, setDateCountObj] = useState({});
    const [userList, setUserList] = useState([]);
    const [weeklyActiveUsers, setWeeklyActiveUsers] = useState([]);
    const [descriptions, setDescriptions] = useState({});
    const [totalClickedSources, setTotalClickedSources] = useState(0);
    const [totalSavedSources, setTotalSavedSources] = useState(0);
    const [totalFollowupUsage, setTotalFollowupUsage] = useState(0);
    const [savedSourceTypeCounts, setSavedSourceTypeCounts] = useState({'guidelines': 0, 'drugs': 0, 'bugs': 0, 'pearls': 0, 'general': 0});
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
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
const cohortList = ['A', 'B', 'C', 'D', 'E', 'none'];
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

        if (startDate && endDate) {
            setDateRange('');
            endpoint += `&dateRangeStart=${startDate}&dateRangeEnd=${endDate}`;
        } else if (dateRange) {
            endpoint += `&dateRange=${dateRange}`;
        }
      const response = await axios.get(endpoint);
        setUsers(response.data.users.sort((a, b) => new Date(a.signup_date) - new Date(b.signup_date)));
        setTotalUsers(response.data.totalUsers);
        setTotalUsageCount(response.data.totalUsageCount);
        setTotalFeedbackCount(response.data.totalFeedbackCount);
        setDailyActiveUsers(response.data.dailyActiveUsers);
        setChurnData(response.data.churnData);
        setQueriesByUserAndWeek(response.data.queriesByUserAndWeek);
        setWeekOverWeekChanges(response.data.weekOverWeekChanges);
        setTotalIds(response.data.totalUsers);
        setWeeklyActiveUsers(response.data.weeklyActiveUsers);
        setDescriptions(response.data.descriptions);
        setTotalClickedSources(response.data.totalClickedSources);
        setTotalSavedSources(response.data.totalSavedSources);
        setTotalFollowupUsage(response.data.totalFollowUpCount);
        setSavedSourceTypeCounts(response.data.savedSourceTypeCounts);
       
        
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }

    , [currentPage, perPage, search, statusFilter, cohortFilter, selectedUser, selectedUserGroup, selectedDate, dateRange, startDate, endDate]);

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
         const handleDateRangeChange= (e) => {
        setDateRange(e.target.value);
        setSelectedDate('');
        setStartDate('');
        setEndDate('');
    }
        
        const handleDateChange = (e) => {
            setSelectedDate(e.target.value);
        }

const prepareDataWeekOverWeek = (queriesByUserAndWeek, title,ylabel) => {
const totalQueriesByWeek = {};
const labels = Object.keys(queriesByUserAndWeek);

// Initialize a userSeries object
const userSeries = {};

Object.keys(queriesByUserAndWeek).forEach(week => {
  totalQueriesByWeek[week] = 0;
  Object.keys(queriesByUserAndWeek[week]).forEach(user => {
    totalQueriesByWeek[week] += queriesByUserAndWeek[week][user];
    if (!userSeries[user]) userSeries[user] = [];
    userSeries[user].push(queriesByUserAndWeek[week][user]);
  });
});


const series = [
    {
      name: 'Total Queries',
      data: Object.values(totalQueriesByWeek),
    },
    ...Object.keys(userSeries).map(user => ({
      name: user,
      data: userSeries[user],
    }))
  ];

  const options = {
        chart: {
          id: 'week-by-week-usage',
          type: 'line',
          height: 350,
          zoom: {
            autoScaleYaxis: true,
          },
        },
        colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0'], // Add more colors if you have more users
        dataLabels: {
          enabled: false,
        },
        markers: {
          size: 0,
        },
        title: {
          text: title || 'Week Over Week Usage',
          align: 'left',
        },
        xaxis: {
          type: 'category',
          categories: [], // Will be filled dynamically by the labels prop
          title: {
            text: 'Week',
          },
        },
        yaxis: {
          title: {
            text: ylabel || 'Queries',
          },
        },
        tooltip: {
          shared: true,
          intersect: false,
          x: {
            show: true,
          },
        },
        legend: {
          horizontalAlign: 'left',
        },
      };

        return {series,labels,options};
    }

        
    const exportToCSV = (userData) => {
      let csvContent = "data:text/csv;charset=utf-8," 
      + [
          "ID",
          "Email",
          "Name",
          "Signup Date",
          "Num Logins",
          "Status",
          "Usage",
          "Follow Up Usage",
          "Feedback Count",
          "Source Click Count",
          "Nav Saved Sources",
          "Nav Threads",
          "Thread Count",
          "Sources Count"
      ].join(",") + "\n"
      + users.map(user => {
          
          return [
              user._id,
              user.email,
              user.name,
              user.signup_date,
              user.num_logins,
              user.status,
              user.usage,
              user.follow_up_usage,
              user.feedback_count,
              user.sourceClickCount,
              user.nav_saved_sources,
              user.nav_threads,
              
              user.threadCount,
              user.sourcesCount
          ].join(",");
      }).join("\n");
  
      var encodedUri = encodeURI(csvContent);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "user_data.csv");
      document.body.appendChild(link); // Required for FF
  
      link.click(); // This will download the data file named "user_data.csv".
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
                                  <h3 className="card-title">Users: Group: <strong>'{selectedUserGroup}'</strong> Date Range: <strong>'{dateRange}'</strong> {selectedUser ? <strong>`User: ${selectedUser}`</strong> : ''} {selectedDate ? `Date: ${selectedDate}` : ''}</h3>
                              </div>
                              <div className="card-body">
                                  <Grid container spacing={3}>
                                      
                                      <Grid item xs={12} sm={6} md={3}>
                                          <NumDisplay title="Total Users" value={totalUsers} />
                                      </Grid>
                                      <Grid item xs={12} sm={6} md={3}>
                                          <NumDisplay title="Total Feedback" value={totalFeedbackCount} description={descriptions.totalFeedbackDescription} />
                                      </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <NumDisplay title="Total Usage" value={totalUsageCount} description={descriptions.totalUsageDescription} />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <NumDisplay title="Followup Count" value={totalFollowupUsage} />
                                            </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <NumDisplay 
                                            title="Churn Rate" 
                                            description={descriptions.churnDescription}
                                            value={churnData['totalChurnRate']} />

                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <NumDisplay 
                                            title="Churn Per Week" 
                                            description={descriptions.churnDescription}
                                            value={churnData['churnPerWeek']} />
                                            </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <NumDisplay title="Clicked Sources" value={totalClickedSources}/>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <NumDisplay title="Saved Sources" value={totalSavedSources} />
                                            </Grid>    
                                          <Grid item xs={12} sm={6} md={5}>
                                            <NumDisplay title={Object.keys(savedSourceTypeCounts)} value={Object.values(savedSourceTypeCounts)} description={'Saved Source Type Counts'} />
                                            </Grid>
                                            
                                  </Grid>
                                  <div className="row">
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
                                                    <label>Date Range</label>
                                                    <select
                                                        className="form-control"
                                                        value={dateRange}
                                                        onChange={(e) => handleDateRangeChange(e)}
                                                    >
                                                        <option value="all_time">All Time</option>
                                                        <option value="last_week">Last Week</option>
                                                        <option value="last_month">Last Month</option>
                                                        <option value="last_year">Last Year</option>
                                                    </select>
                                                </div>
                                              </div>
                                               <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label>Start Date</label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={startDate}
                                                            onChange={(e) => setStartDate(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="form-group">
                                                        <label>End Date</label>
                                                        <input
                                                            type="date"
                                                            className="form-control"
                                                            value={endDate}
                                                            onChange={(e) => setEndDate(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                              </div>
                                  <Grid container spacing={3}>
                                      
                                      <Grid item xs={12} md={6}>
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
                                            description={descriptions.dailyActiveUsersDescription}
                                            userData={dailyActiveUsers}

                                            
                                          />
                                         <ChartGraph title="Week Over Week Usage"
                                            options={prepareDataWeekOverWeek(queriesByUserAndWeek, 'Week Over Week Usage', 'Queries').options}
                                            series={prepareDataWeekOverWeek(queriesByUserAndWeek).series}
                                            labels={prepareDataWeekOverWeek(queriesByUserAndWeek).labels}
                                            type="line"
                                            width="100%"
                                            height={350}
                                            description={descriptions.weeklyTurnOverRateDescription}
                                       
                                            />
                                      </Grid>
                                      <Grid item xs={12} md={6}>
                                      <ChartGraph title="Weekly Active Users"
                                            options={chartOptions}
                                            series={[
                                                {
                                                    name: 'Weekly Active Users',
                                                    data: Object.keys(weeklyActiveUsers).map(entry => weeklyActiveUsers[entry].count)
                                                },
                                                {
                                                    name: 'Change',
                                                    data: Object.keys(weeklyActiveUsers).map((entry, index) => {
                                                        if (index === 0) {
                                                            return 0;
                                                        }
                                                        return weeklyActiveUsers[entry].count - weeklyActiveUsers[Object.keys(weeklyActiveUsers)[index - 1]].count;
                                                    })
                                                }
                                            ]}
                                            labels={Object.keys(weeklyActiveUsers).map(dateStr => new Date(dateStr).getTime())}
                                            type="bar"
                                            width="100%"
                                            height={350}
                                            userData={weeklyActiveUsers}
                                            description={descriptions.weeklyActiveUsersDescription}
                                            
                                          />
                                          
                                          <ChartGraph title="Week Over Week Changes"
                                            options={prepareDataWeekOverWeek(weekOverWeekChanges, 'Week Over Week Changes', 'Change').options}
                                            series={prepareDataWeekOverWeek(weekOverWeekChanges).series}
                                            labels={prepareDataWeekOverWeek(weekOverWeekChanges).labels}
                                            type="line"
                                            width="100%"
                                            height={350}
                                            description='The graph below shows the difference in the number of queries made by each user from week to week. '
                                            />
                                      </Grid>
                                  </Grid>
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
                                                    <label>Date Range</label>
                                                    <select
                                                        className="form-control"
                                                        value={dateRange}
                                                        onChange={(e) => setDateRange(e.target.value)}
                                                    >
                                                        <option value="all_time">All Time</option>
                                                        <option value="last_week">Last Week</option>
                                                        <option value="last_month">Last Month</option>
                                                        <option value="last_year">Last Year</option>
                                                    </select>
                                                </div>
                                              </div>

                                        </div>
                                        <div className="row">
                                            <div className="col-md-2">
                                                <Button
                                                    variant="contained" 
                                                    color="primary" 
                                                    onClick={exportToCSV}
                                                    style={{marginBottom: '10px'}}
                                                >
                                                    Export to CSV
                                                </Button>
                                            </div>
                                        </div>

                                <div className="card-body">
                                    <InteractiveTable dataSource={users} columns={[
                                        { dataIndex: 'email', title: 'Email' },
                                        { dataIndex: 'signup_date', title: 'Signup Date' },
                                        { dataIndex: 'status', title: 'Status' },
                                        { dataIndex: 'usage', title: 'Usage' },
                                        { dataIndex: 'sourcesCount', title: 'Sources' },
                                        { dataIndex: 'threadCount', title: 'Threads' },
                                        { dataIndex: 'follow_up_usage', title: 'Followup Usage' },
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
                                      <InactiveUserTable churnData={churnData} />


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
