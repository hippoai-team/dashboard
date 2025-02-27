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
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
//spinner
import CircularProgress from '@mui/material/CircularProgress';

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
    const [filterOutAdmin, setFilterOutAdmin] = useState(true);
    const [expandedIds, setExpandedIds] = useState([]);
    const toastDuration = 3000;
    const [feedbackPlotObject, setFeedbackPlotObject] = useState({series: [], labels: []});//[yes, no
    const [feedbackMap, setFeedbackMap] = useState({});
    const [hasFeedback, setHasFeedback] = useState(false);
    const [feedbackBreakdown, setFeedbackBreakdown] = useState({ positive: 0, negative: 0 });
    const [feedbackCategories, setFeedbackCategories] = useState({});
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
        if (filterOutAdmin) {
            endpoint += `&filterOutAdmin=true`;
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
        if (hasFeedback) {
            endpoint += `&hasFeedback=true`;
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
                feedbackMap,
                feedbackBreakdown,
                feedbackCategories
            } = res.data;
            console.log('chatLogs', chatLogs)
            setChatLogs(chatLogs);
            setTotalLogs(totalCount);
            setCurrentPage(page);
            setUserList(users);
            setDateCountObj(dateCountObj);
            setFeedBackCount(totalFeedback);
            setLoading(false);
            setNumChatsClickedSources(numChatsWithClickedSources);
            setFeedbackMap(feedbackMap);
            setFeedbackBreakdown(feedbackBreakdown);
            setFeedbackCategories(feedbackCategories);
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
    }, [currentPage, perPage, search, selectedUser, selectedDate, dateRange, userRatingFilter, selectedUserGroup, startDate, endDate, filterOutAdmin, hasFeedback]);

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

    const handleExpand = (id) => {
        setExpandedIds(expandedIds.includes(id) ? expandedIds.filter(i => i !== id) : [...expandedIds, id]);
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

    const handleFilterOutAdminChange = (e) => {
        setFilterOutAdmin(e.target.checked);
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
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>Has Feedback</label>
                                                    <select
                                                        className="form-control"
                                                        value={hasFeedback}
                                                        onChange={(e) => setHasFeedback(e.target.value === 'true')}
                                                    >
                                                        <option value="false">All</option>
                                                        <option value="true">With Feedback Only</option>
                                                    </select>
                                                </div>
                                            </div>
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
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={filterOutAdmin}
                                                        onChange={handleFilterOutAdminChange}
                                                        name="filterOutAdmin"
                                                        color="primary"
                                                    />
                                                }
                                                label="Filter Admin"
                                            />
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
                                                        <th>Thread UUID</th>
                                                        <th>Query</th>
                                                        <th style={{minWidth: '500px'}}>Response</th>
                                                        <th>Sources</th>
                                                        <th>Feedback</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {loading ? (
                                                        <tr>
                                                            <td colSpan="7" style={{textAlign: 'center'}}>
                                                                <CircularProgress />
                                                                <Typography variant="body1" style={{marginLeft: '10px'}}>
                                                                    Fetching data...
                                                                </Typography>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        chatLogs
                                                            .flatMap((chatLog) => 
                                                                chatLog.chat_history.map((history, index) => ({
                                                                    ...history,
                                                                    email: chatLog.email,
                                                                    thread_uuid: chatLog.thread_uuid,
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
                                                                        <a href={`https://hippo.pendium.health/chat?thread_id=${history.thread_uuid}`} target="_blank" rel="noopener noreferrer">
                                                                            {history.thread_uuid}
                                                                        </a>
                                                                    </td>
                                                                    <td>
                                                                        {history.query}
                                                                    </td>
                                                                    <td>
                                                                        <div>
                                                                            <Button 
                                                                                variant="outlined" 
                                                                                onClick={() => handleExpand(history.id)}
                                                                            >
                                                                                {expandedIds.includes(history.id) ? 'Collapse' : 'Expand'}
                                                                            </Button>
                                                                            <div>
                                                                                {expandedIds.includes(history.id) ? (
                                                                                    <ReactMarkdown
                                                                                        remarkPlugins={[remarkGfm]}
                                                                                        components={{
                                                                                            table: ({ node, ...props }) => (
                                                                                                <table style={{ border: '1px solid black' }} {...props} />
                                                                                            )
                                                                                        }}
                                                                                    >
                                                                                        {history.response}
                                                                                    </ReactMarkdown>
                                                                                ) : (
                                                                                    <>
                                                                                        <ReactMarkdown
                                                                                            remarkPlugins={[remarkGfm]}
                                                                                            components={{
                                                                                                table: ({ node, ...props }) => (
                                                                                                    <table style={{ border: '1px solid black' }} {...props} />
                                                                                                )
                                                                                            }}
                                                                                        >
                                                                                            {history.response.split('\n').slice(0, 4).join('\n')}
                                                                                        </ReactMarkdown>
                                                                                        {history.response.split('\n').length > 4 && '...'}
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        {history.sources.map((source) => {
                                                                            console.log('user email and source', history.email, source);
                                                                            if (!source.message.title) {
                                                                                console.log(source);
                                                                                return null;
                                                                            }
                                                                            return (
                                                                                <div key={source.message.source_id} style={{marginBottom: '5px'}}>
                                                                                    <Chip 
                                                                                        label={source.message.title} 
                                                                                        variant="outlined" 
                                                                                        onClick={() => window.open(source.message.source_url, '_blank')}
                                                                                    />
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </td>
                                                                    <td>
                                                                        {feedbackMap[`${history.thread_uuid}-${history.uuid}`] && (
                                                                            <div>
                                                                                {feedbackMap[`${history.thread_uuid}-${history.uuid}`].isLiked !== undefined && (
                                                                                    <Chip 
                                                                                        label={feedbackMap[`${history.thread_uuid}-${history.uuid}`].isLiked ? "👍 Liked" : "👎 Disliked"}
                                                                                        color={feedbackMap[`${history.thread_uuid}-${history.uuid}`].isLiked ? "success" : "error"}
                                                                                        style={{marginBottom: '5px'}}
                                                                                    />
                                                                                )}
                                                                                {Object.entries(feedbackMap[`${history.thread_uuid}-${history.uuid}`].feedback || {}).map(([key, value]) => {
                                                                                    if (key === '_id' || !value) return null;
                                                                                    if (key === 'other' && value) {
                                                                                        return (
                                                                                            <div key={key} style={{marginTop: '5px'}}>
                                                                                                <Typography variant="caption">
                                                                                                    Other: {value}
                                                                                                </Typography>
                                                                                            </div>
                                                                                        );
                                                                                    }
                                                                                    if (value === true) {
                                                                                        return (
                                                                                            <Chip 
                                                                                                key={key}
                                                                                                label={key.replace(/([A-Z])/g, ' $1').trim()}
                                                                                                size="small"
                                                                                                style={{margin: '2px'}}
                                                                                            />
                                                                                        );
                                                                                    }
                                                                                    return null;
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-3">
                                                <NumDisplay 
                                                    title="Total Feedback"
                                                    value={feedbackBreakdown.positive + feedbackBreakdown.negative}
                                                    sx={{
                                                        backgroundColor: alpha('#2196F3', 0.1),
                                                        color: '#2196F3',
                                                        margin: '10px'
                                                    }}
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <NumDisplay 
                                                    title="Positive Feedback"
                                                    value={feedbackBreakdown.positive}
                                                    sx={{
                                                        backgroundColor: alpha('#4CAF50', 0.1),
                                                        color: '#4CAF50',
                                                        margin: '10px'
                                                    }}
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <NumDisplay 
                                                    title="Negative Feedback"
                                                    value={feedbackBreakdown.negative}
                                                    sx={{
                                                        backgroundColor: alpha('#f44336', 0.1),
                                                        color: '#f44336',
                                                        margin: '10px'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        {feedbackCategories && Object.keys(feedbackCategories).length > 0 && (
                                            <div className="row mt-3">
                                                <div className="col-12">
                                                    <Typography variant="h6" component="div">
                                                        Feedback Categories Breakdown
                                                    </Typography>
                                                    <div className="d-flex flex-wrap">
                                                        {Object.entries(feedbackCategories)
                                                            .filter(([key]) => key !== '_id')
                                                            .map(([category, count]) => (
                                                                <div key={category} className="m-2">
                                                                    <Chip
                                                                        label={`${category.replace(/([A-Z])/g, ' $1').trim()}: ${count}`}
                                                                        color="primary"
                                                                        variant="outlined"
                                                                    />
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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
