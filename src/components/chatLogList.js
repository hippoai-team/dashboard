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
//clippboard icon
import FileCopyIcon from '@mui/icons-material/FileCopy';

const ChatLogList = () => {

    const API_BASE_URL = process.env.NODE_API_URL ||'http://localhost:8080';
    const navigate = useNavigate();
    const [chatLogs, setChatLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const [userList, setUserList] = useState([]);
    const [dateCountObj, setDateCountObj] = useState({});//[date: count
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [userRatingFilter, setUserRatingFilter] = useState(false);
    const [dateRange, setDateRange] = useState('all-time')
    const toastDuration = 3000;
    const chartOptions = {
        chart: {
          id: "basic-bar",
        },
        labels: Object.keys(dateCountObj),
      };

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
        if (selectedDate) {
            endpoint += `&date=${selectedDate}`;
            }
        
        //add date range
        if (dateRange) {
            endpoint += `&dateRange=${dateRange}`;
            }

        if (userRatingFilter) {
            console.log('userRatingFilter', userRatingFilter);
            endpoint += `&userRatingFilter=${userRatingFilter}`;
            }

    try {
        const res = await axios.get(endpoint);
        const { 
            chatLogs,
            totalCount,
            currentPage: page,
            dateCountObj,
            users
        } = res.data;
        setChatLogs(chatLogs);
        setTotalLogs(totalCount);
        setCurrentPage(page);
        setUserList(users);
        setDateCountObj(dateCountObj);
        setLoading(false);
        console.log('dateCountObj', dateCountObj);


        }
    catch (err) {
        console.log(err);
        setLoading(false);
        }
    }

    useEffect(() => {
        fetchChatLogs();
    }, [currentPage, perPage, search, selectedUser, selectedDate, dateRange, userRatingFilter]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    }

    const handlePerPageChange = (e) => {
        setPerPage(e.target.value);
    }

    const handleUserChange = (e) => {
        setSelectedUser(e.target.value);
    }

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
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

    return (
        <Layout>
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-6">
                                <h1 className="m-0">Chat Logs</h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item">
                                        <Link to="/dashboard">Dashboard</Link>
                                    </li>
                                    <li className="breadcrumb-item active">Chat Logs</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12">
                                <div className="card card-primary">
                                    <div className="card-header">
                                        <h3 className="card-title">Chat Logs</h3>
                                    </div>
                                    <div className="row">
                                    <div className="col-md-6">
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
                                        <div className="col-md-6">
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
                                        </div>
                                    <div className="row">
                                        
                                        <div className="col-md-6">
                                            <ChartGraph
                                                title="Daily Chat Log Count"
                                                height={350}
                                                options={chartOptions}
                                                series={[{
                                                    name: 'Count',
                                                    data: Object.values(dateCountObj).map(obj => obj.count)
                                                }]}
                                                labels={Object.keys(dateCountObj)}
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
                                                    data: Object.values(dateCountObj).map(obj => obj.accumulativeCount)
                                                }]}
                                                labels={Object.keys(dateCountObj)}
                                                type="line"
                                                width="100%"
                                                />
                                        </div>
                                       
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
                                                        <option value="beta">Beta Users</option>
                                                        {userList.map((user) => (
                                                            <option key={user} value={user}>{user}</option>
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
                                            <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>User Rating Exists</label>
                                                    <input
                                                        type="checkbox"
                                                        className="form-control"
                                                        onChange={(e) => setUserRatingFilter(e.target.checked)}
                                                    />
                                                </div>
                                            </div>
                                                            
                                        </div>
                                        <div className="table-responsive">
                                            <table className="table table-bordered table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
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
                                                        <th>Feedback</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {chatLogs.map((chatLog) => (
                                                        <tr key={chatLog._id}>
                                                            <td>{chatLog.date}</td>
                                                            <td>{chatLog.email}</td>
                                                            <td>{chatLog.query}</td>
                                                            <td>{chatLog.response}</td>

                                                            <td>
                                                                {[...new Set(chatLog.sources.map(source => `${source.title} - ${source.publisher}`))].map((source, index) => (
                                                                    <div key={index} style={{marginBottom: '10px'}}>
                                                                        <Chip 
                                                                            label={source} 
                                                                            variant="outlined" 
                                                                            onClick={() => window.open(source.source, "_blank")}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </td>
                                                            <td>
                                                            {chatLog.user_rating && <Chip 
                                                                label={`Was Helpful: ${chatLog.user_rating}`} 
                                                                variant="outlined"
                                                                style={{ marginBottom:'5px',backgroundColor: chatLog.user_rating === 'Yes' ? 'green' : chatLog.user_rating === 'No' ? 'red' : 'green' }}
                                                                />}

                                                                {chatLog.feedback && Object.entries(chatLog.feedback)
                                                                    .filter(([key, value]) => value === true)
                                                                    .map(([key, value]) => (
                                                                        <div key={key} style={{marginBottom: '10px'}}>
                                                                        <Chip label={`${key}: ${value}`} variant="outlined" />
                                                                        </div>
                                                                    ))}
                                                            </td>
                                            
                                                        </tr>
                                                    ))}
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
