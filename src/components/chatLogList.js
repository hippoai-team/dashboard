// src/components/SourceList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./Layout";
import { Chip } from "@mui/material";
import { alpha, useTheme } from '@mui/material/styles';
import ChartGraph from "./chartGraph";
import NumDisplay from "./numDisplay";
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PageTitle from "./pageTitle";
//clippboard icon
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
const ChatLogList = () => {

    const API_BASE_URL = process.env.REACT_APP_NODE_API_URL ||'https://dashboard-api-woad.vercel.app';
    const navigate = useNavigate();
    const [chatLogs, setChatLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [perPage, setPerPage] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const [userList, setUserList] = useState([]);
    const [dateCountObj, setDateCountObj] = useState({});//[date: count
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedUserGroup, setSelectedUserGroup] = useState("");//[date: count
    const [selectedDate, setSelectedDate] = useState("");
    const [feedBackCount, setFeedBackCount] = useState([0, 0]);//[yes, no
    const [userRatingFilter, setUserRatingFilter] = useState("");
    const [averageQueryLength, setAverageQueryLength] = useState(0);
    const [numChatsClickedSources, setNumChatsClickedSources] = useState({});
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dateRange, setDateRange] = useState('last-week')
    const toastDuration = 3000;
    const [feedbackPlotObject, setFeedbackPlotObject] = useState({series: [], labels: []});//[yes, no
    const chartOptions = {
        chart: {
          id: "basic-bar",
        },
        labels: Object.keys(dateCountObj),
      };

    const cohortList = ['A', 'B', 'C', 'D', 'E', 'none']
    const fetchChatLogs = async () => {
        setLoading(true);
        let endpoint = `${API_BASE_URL}/api/chatlogs?page=${currentPage}`;
        if (perPage) {
            endpoint += `&perPage=${perPage}`;
        }
        if (search) {
            endpoint += `&search=${search}`;
          }
        if (selectedUser) {
            endpoint += `&user=${selectedUser}`;
            }
        if (selectedUserGroup) {
            endpoint += `&userGroup=${selectedUserGroup}`;
            }
        if (selectedDate) {
            endpoint += `&date=${selectedDate}`;
            }
        
        //add date range
        if (startDate && endDate) {
            setDateRange('');
            endpoint += `&dateRangeStart=${startDate}&dateRangeEnd=${endDate}`;
        } else if (dateRange) {
            endpoint += `&dateRange=${dateRange}`;
        }
        if (userRatingFilter=='exists') {
            endpoint += `&userRatingFilter=true`;
            }
        else if (userRatingFilter.length > 0) {
            endpoint += `&userRatingFilter=${userRatingFilter}`;
            }


    try {
        const res = await axios.get(endpoint);
        const { 
            chatLogs,
            totalCount,
            currentPage: page,
            dateCountObj,
            users,
            totalFeedback,
            numChatsWithClickedSources,

        } = res.data;
        console.log('chatLogs', chatLogs)
        setChatLogs(chatLogs);
        setTotalLogs(totalCount);
        setCurrentPage(page);
        setUserList(users);
        setDateCountObj(dateCountObj);
        console.log('dateCountObj', dateCountObj)
        setFeedBackCount(totalFeedback);
        setLoading(false);
        setNumChatsClickedSources(numChatsWithClickedSources);
        setAverageQueryLength(chatLogs.reduce((acc, log) => acc + log.query.split(' ').length, 0) / chatLogs.length);
        const chatLogsWithRating = chatLogs.filter(log => log.user_rating !== null);
        const chatLogsWithoutRating = chatLogs.filter(log => log.user_rating === null);

        const calculateAverageQueryLength = (logs) => {
            if (logs.length === 0) {
                return 0;
            }
            const totalQueryLength = logs.reduce((acc, log) => acc + log.query.split(' ').length, 0);
            return totalQueryLength / logs.length;
        }

        const averageQueryLengthWithRatingYes = calculateAverageQueryLength(chatLogsWithRating.filter(log => log.user_rating === 'Yes'));
        const averageQueryLengthWithRatingNo = calculateAverageQueryLength(chatLogsWithRating.filter(log => log.user_rating === 'No'));
        const averageQueryLengthWithoutRating = calculateAverageQueryLength(chatLogsWithoutRating);

        const series = [
            averageQueryLengthWithRatingYes,
            averageQueryLengthWithRatingNo,
            averageQueryLengthWithoutRating
        ];

        const labels = [
            'Rated - Helpful',
            'Rated - Not Helpful',
            'Without Rating'
        ];

        setFeedbackPlotObject({series, labels});
        
        console.log('feedbackPlotObject', feedbackPlotObject);

        }
    catch (err) {
        console.log(err);
        setLoading(false);
        }
    }

    useEffect(() => {
        fetchChatLogs();
    }, [currentPage, perPage, search, selectedUser, selectedDate, dateRange, userRatingFilter, selectedUserGroup, startDate, endDate]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    }

    const handlePerPageChange = (e) => {
        setPerPage(e.target.value);
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

    const handleDateRangeChange= (e) => {
        setDateRange(e.target.value);
        setSelectedDate('');
        setStartDate('');
        setEndDate('');
    }

    const handleNextPage = () => {
        if (currentPage < Math.ceil(totalLogs / perPage)) {
            setCurrentPage(currentPage + 1);
        }
    }

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    }

    const copyToClipboard = (array) => {
        const arrayToCopy = array.join(", ");
        navigator.clipboard.writeText(arrayToCopy);
    }

    const exportToCSV = async () => {
        console.log('chatLogs', chatLogs)
    
        let csvContent = "data:text/csv;charset=utf-8," 
        + [
            "Date",
            "User",
            "Query",
            "Query Length",
            "Response",
            "Sources",
            "User Rating",
            "User Feedback"
        ].join(",") + "\n"
        + chatLogs.map(e => {
            return [
                e.date,
                e.email,
                `"${e.query.replace(/"/g, '""')}"`,
                e.query.split(' ').length,
                `"${e.response.replace(/"/g, '""')}"`,
                `"${e.sources.map(source => `${source.title} - ${source.publisher}`).join('; ').replace(/"/g, '""')}"`, // Enclose in double quotes and escape internal quotes
                e.user_rating || '',
                ...Object.entries(e.feedback || {}).filter(([key, value]) => value === true).map(([key, value]) => `${key}: ${value}`)
            ].join(",");
        }).join("\n");
    
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "chat_logs.csv");
        document.body.appendChild(link); // Required for FF
    
        link.click(); // This will download the data file named "chat_logs.csv".
    }
    
    function createSourceChips(sources) {
        // Aggregate the sources by title and publisher
        const aggregatedSources = sources.reduce((acc, source) => {
            const key = `${source.title}-${source.publisher}`;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(source.source_num);
            return acc;
        }, {});
        // Create chip elements for each unique title and publisher
        return Object.entries(aggregatedSources).map(([key, sourceNums], index) => {
            const [title, publisher] = key.split('-');
            const label = `[${sourceNums.join('], [')}] - ${title} - ${publisher}`;
            return (
                <div key={index} style={{ marginBottom: '10px' }}>
                    <Chip 
                        label={label} 
                        variant="outlined" 
                        onClick={() => window.open(sources.find(source => source.source_num === sourceNums[0]).source, "_blank")}
                        style={{ backgroundColor: sources.find(source => source.source_num === sourceNums[0]).clicked ? 'green' : 'default' }}
                    />
                </div>
            );
        });
    }
    
    return (
        <Layout>
            <div className="content-wrapper">
                <PageTitle title="Chat Logs" />
                <section className="content">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12">
                                <div className="card card-primary">
                                    <div className="card-header">
                                        <h3 className="card-title">Chat Logs</h3>
                                    </div>
                                    <div className="card-body">
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
                                                        <option value="500">500</option>
                                                        <option value="1000">1000</option>
                                                       
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
                                                    

                                                        {userList.map((user) => (
                                                            <option key={user} value={user}>{user}</option>
                                                        ))}
                                                        
                                                    </select>
                                                </div>
                                            </div>
                                            {/* <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>User Group</label>
                                                    <select
                                                        className="form-control"
                                                        value={selectedUserGroup}
                                                        onChange={handleUserGroupChange}
                                                    >
                                                        <option value="">All</option>
                                                        <option value="beta">Beta</option>
                                                        {cohortList.map((cohort) => (
                                                            <option key={cohort} value={cohort}>Cohort {cohort}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div> */}
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>Date</label>
                                                    <select
                                                        className="form-control"
                                                        value={selectedDate}
                                                        onChange={handleDateChange}
                                                    >
                                                        <option value="">All</option>
                                                        {(() => {
                                                            const dates = [];
                                                            let startDateObj = new Date(startDate);
                                                            let endDateObj = new Date(endDate);
                                                            if (startDate && endDate) {
                                                                endDateObj.setDate(endDateObj.getDate() + 1);
                                                                for (let d = new Date(startDateObj); d <= endDateObj; d.setDate(d.getDate() + 1)) {
                                                                    dates.push(new Date(d).toLocaleDateString('en-US'));
                                                                }
                                                            } else {
                                                                const today = new Date();
                                                                let dateRangeDays = 7;
                                                                if (dateRange === 'last-week') {
                                                                    dateRangeDays = 7;
                                                                } else if (dateRange === 'last-month') {
                                                                    dateRangeDays = 30;
                                                                } else if (dateRange === 'last-year') {
                                                                    dateRangeDays = 365;
                                                                }
                                                                for (let i = 0; i < dateRangeDays; i++) {
                                                                    const date = new Date(today);
                                                                    date.setDate(today.getDate() - i);
                                                                    dates.push(date.toLocaleDateString('en-US'));
                                                                }
                                                            }
                                                            return dates.map((date) => (
                                                                <option key={date} value={date}>{date}</option>
                                                            ));
                                                        })()}
                                                        
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
                                                        <option value="all-time">All Time</option>
                                                        <option value="last-week">Last Week</option>
                                                        <option value="last-month">Last Month</option>
                                                        <option value="last-year">Last Year</option>
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
                                            {/* <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>User Rating</label>
                                                    <select
                                                        className="form-control"
                                                        onChange={(e) => setUserRatingFilter(e.target.value)}
                                                    >
                                                        <option value="">No Filter</option>
                                                        <option value="exists">Exists</option>
                                                        <option value="Yes">Helpful</option>
                                                        <option value="No">Not Helpful</option>
                                                    </select>
                                                </div>
                                            </div> */}
                                                            
                                        </div>
                                    <div className="row">
                                    <div className="col-md-4">
                                            <NumDisplay 
                                                title="Total Chats"
                                                value={totalLogs}
                                                sx={{
                                                    backgroundColor: alpha('#2196F3', 0.1),
                                                    color: '#2196F3',
                                                    margin: '10px'
                                                }}

                                                />
                                                </div>
                                        <div className="col-md-4">
                                            <NumDisplay
                                                title="Total Active Users"
                                                value={userList.length}
                                                sx={{
                                                    backgroundColor: alpha('#2196F3', 0.1),
                                                    color: '#2196F3',
                                                    margin: '10px'
                                                }}
                                                />
                                                </div>
                                              {/*  <div className="col-md-4">
                                           <NumDisplay
                                                title={["Positive Feedback", "Negative Feedback"]}
                                                value={feedBackCount}
                                                description={["Number of users who found the chatbot helpful", "Number of users who did not find the chatbot helpful"]}
                                                sx={{
                                                    backgroundColor: alpha('#2196F3', 0.1),
                                                    color: '#2196F3',
                                                    margin: '10px'
                                                }}
                                                />
                                                </div>
                                                <NumDisplay
                                                title="Average Query Length"
                                                value={averageQueryLength}
                                                description="Average length of queries from all chat logs"
                                                sx={{
                                                    backgroundColor: alpha('#2196F3', 0.1),
                                                    color: '#2196F3',
                                                    margin: '10px'
                                                }}
                                                />
                                                <NumDisplay
                                                title='% of Chats with Clicked Sources'
                                                value={numChatsClickedSources && 
                                                numChatsClickedSources.length > 0 && numChatsClickedSources.reduce((acc, source) => acc + source.totalChatsPercentage, 0).toFixed(2)}
                                                description="Percentage of chats with clicked sources since Nov 16"
                                                sx={{
                                                    backgroundColor: alpha('#2196F3', 0.1),
                                                    color: '#2196F3',
                                                    margin: '10px'
                                                }}
                                                />
                                                <NumDisplay
                                         
                                                title={numChatsClickedSources.length >0 &&
                                                numChatsClickedSources.map(source => `${source._id} % clicked`)}
                                                value={numChatsClickedSources.length >0 &&
                                                numChatsClickedSources.map(source => Math.round(source.totalClicksPercentage))}
                                                description={['Percentage of chats with clicked sources', 'Percentage of chats with clicked sources', 'Percantage of chats with clicked sources']}
                                                sx={{
                                                    backgroundColor: alpha('#2196F3', 0.1),
                                                    color: '#2196F3',
                                                    margin: '10px'
                                                }}
                                                />*/}
                                        </div>
                                 

                                    {/*<div className="row">
                                        
                                        <div className="col-md-6">
                                            <ChartGraph
                                                title="Daily Chat Log Count"
                                                height={350}
                                                options={chartOptions}
                                                series={[{
                                                    name: 'Count',
                                                    data: Object.entries(dateCountObj)
                                                        .sort(([a], [b]) => new Date(a) - new Date(b))
                                                        .map(([, obj]) => obj.count)
                                                }]}
                                                labels={Object.keys(dateCountObj).sort((a, b) => new Date(a) - new Date(b))}
                                                type="bar"
                                                width="100%"
                                                />
                                        </div>
                                        <div className="col-md-6">
                                            <ChartGraph
                                                title="Cumulative Chat Log Count"
                                                height={350}
                                                options={chartOptions}
                                                series={[{
                                                    name: 'Count',
                                                    data: Object.entries(dateCountObj)
                                                        .sort(([a], [b]) => new Date(a) - new Date(b))
                                                        .map(([, obj]) => obj.accumulativeCount)
                                                }]}
                                                labels={Object.keys(dateCountObj).sort((a, b) => new Date(a) - new Date(b))}
                                                type="line"
                                                width="100%"
                                                />
                                        </div>
                                        <div className="col-md-6">
                                            <ChartGraph
                                                title="Feedback"
                                                height={350}
                                                options={chartOptions}
                                                series={[{
                                                    name: 'Average Query Length',
                                                    data: feedbackPlotObject.series ? feedbackPlotObject.series : []
                                                }]}
                                
                                                labels={feedbackPlotObject.labels ? feedbackPlotObject.labels : []}
                                                type="bar"
                                                width="100%"
                                                />
                                                </div>
                                       
                                    </div>*/}
                            
                                        <div className="table-responsive">
                                            <div style={{padding: '10px'}}>
                                                <Typography variant="h6" component="div">
                                                    Chat Log Explorer
                                                </Typography>
                                            </div>
                                            <Button 
                                                variant="contained" 
                                                color="primary" 
                                                onClick={exportToCSV}
                                                style={{marginBottom: '10px'}}
                                            >
                                                Export to CSV
                                            </Button>
                                
                                            <table className="table table-bordered table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Time</th>
                                                        <th>
                                                            User
                                                            <Button 
                                                                variant="outlined" 
                                                                onClick={() => copyToClipboard(userList)}
                                                                style={{marginLeft: '10px'}}
                                                            >
                                                                <FileCopyIcon style={{fontSize: 'small'}}/>
                                                            </Button>
                                                        </th>
                                                        <th>Query</th>
                                                        <th style={{minWidth: '500px'}}>Response</th>
                                                        <th>Sources</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    
                                                    {chatLogs
                                                        .flatMap((chatLog) => 
                                                            chatLog.chat_history.map((history, index) => ({
                                                                ...history,
                                                                email: chatLog.email,
                                                                id: `${chatLog._id}-${index}`
                                                            }))
                                                        )
                                                        .sort((a, b) => {
                                                            const dateA = new Date(`${a.currentDate} ${a.currentTime}`);
                                                            const dateB = new Date(`${b.currentDate} ${b.currentTime}`);
                                                            return dateB - dateA;
                                                        })
                                                        .map((history) => (
                                                            <tr key={history.id}>
                                                                <td>{history.currentDate}</td>
                                                                <td>{history.currentTime}</td>
                                                                <td>{history.email}</td>
                                                                <td>
                                                                    {history.query}
                                                                </td>
                                                                <td>
                                                                    <ReactMarkdown
                                                                        remarkPlugins={[remarkGfm]}
                                                                        children={history.response}
                                                                        components={{
                                                                            table: ({ node, ...props }) => (
                                                                                <table style={{ border: '1px solid black' }} {...props} />
                                                                            )}}
                                                                    >{history.response}</ReactMarkdown>
                                                                </td>
                                                                <td>
                                                                    {history.sources.map((source) => (
                                                                        <Chip key={source.message.source_id} label={source.message.title} variant="outlined" style={{marginRight: '5px'}} onClick={() => window.open(source.message.source_url, '_blank')}/>
                                                                    ))}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }
                                                                
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-12 col-md-5">
                                                <div className="dataTables_info">
                                                    Showing {chatLogs.length} of {totalLogs} entries
                                                </div>
                                            </div>
                                            <div className="col-sm-12 col-md-7">
                                                <div className="dataTables_paginate paging_simple_numbers">
                                                    <ul className="pagination">
                                                        <li className="paginate_button page-item previous">
                                                            <button
                                                                className="page-link"
                                                                onClick={handlePrevPage}
                                                            >
                                                                Previous
                                                            </button>
                                                        </li>
                                                        <li className="paginate_button page-item next">
                                                            <button
                                                                className="page-link"
                                                                onClick={handleNextPage}
                                                            >
                                                                Next
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* /.card-body */}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );

}

export default ChatLogList;
