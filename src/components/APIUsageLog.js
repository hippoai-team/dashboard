import React, { useEffect, useState } from 'react';
import Layout from "./Layout";
import axios from "axios";
import InteractiveTable from './interactiveTable';
import PageTitle from "./pageTitle";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Chip, Button } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import DailyChartGraph from './dailyDataGraph';
import Chart from "react-apexcharts";
import jsPDF from 'jspdf';
const APIUsageLog = () => {

    const [search, setSearch] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [apiCustomers, setApiCustomers] = useState([]);
    const [apiUsage, setApiUsage] = useState([]);
    const [apiLogs, setApiLogs] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [apiKeyDict, setApiKeyDict] = useState({});//[customer_id: api_key
    const [selectedUser, setSelectedUser] = useState("");
    const [users, setUsers] = useState([]);
    //set as current month yyyy-mm
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [availableMonths, setAvailableMonths] = useState([]);
    const API_BASE_URL = process.env.REACT_APP_NODE_API_URL ||'https://dashboard-api-woad.vercel.app';

    const fetchLogs = async () => {
        try {
            let endpoint = `${API_BASE_URL}/api/usage?page=${currentPage}`;
            if (search) {
                endpoint += `&search=${search}`;
            }
            if (perPage) {
                endpoint += `&perPage=${perPage}`;
            }
            if (currentPage) {
                endpoint += `&page=${currentPage}`;
            }
            if (selectedUser) {
                endpoint += `&customer=${selectedUser}`;
            }
            if (selectedMonth) {
                endpoint += `&month=${selectedMonth}`;
            }
            const response = await axios.get(endpoint);
            const data = await response
            console.log(data.data);
            setApiLogs(data.data.chatLogs);
            setApiCustomers(data.data.apiCustomers);
            setApiUsage(data.data.usageEntries);
            setAvailableMonths(data.data.months.map((month) => month._id));
            //make a dict of customer_id: api_key
            const tempDict = {};
            data.data.apiCustomers.forEach((customer) => {
                tempDict[customer.api_key] = customer.customer_name;
            });
            setApiKeyDict(tempDict);
            
        } catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        fetchLogs();
    }
    , [search, perPage, currentPage, selectedUser, selectedMonth]);

    const handleNextPage = () => {
        setCurrentPage(currentPage + 1);
    };
    const handlePreviousPage = () => {
        setCurrentPage(currentPage - 1);
    };
    const handleCheckboxChange = (e) => {
        const userId = e.target.value;
        if (selectedUserIds.includes(userId)) {
            setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
        } else {
            setSelectedUserIds([...selectedUserIds, userId]);
        }
    }
    const handleAllCheckboxChange = (e) => {
        if (e.target.checked) {
            setSelectedUserIds(apiCustomers.map((user) => user.customer_id));
        }
        else {
            setSelectedUserIds([]);
        }
    }
    const handleUserChange = (e) => {
        setSelectedUser(e.target.value);
        if (e.target.value) {
            setSelectedUserIds([e.target.value]);
        }
        else {
            setSelectedUserIds([]);
        }

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

    const exportToPDF = () => {
        const exportableContent = document.getElementById('exportableContent');
        const pdf = new jsPDF('p', 'pt', 'letter');
        pdf.html(exportableContent, {
            callback: (pdf) => {
                pdf.save('api-usage.pdf');
            }
        });
    }

        return (
            <Layout>
              <div className="content-wrapper">
                <PageTitle title="API Dashboard" />
    
                <section className="content">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-12">
                                    <div className="card card-primary">
                                        <div className="card-header">
                                            <h3 className="card-title">API Customers</h3>
                                        </div>
                    {/* Your code for filters and statistics */}
                    <div className="card">
           
                      <div className="card-body mt-4">
                        <div className="row">
                          
        
        
                          <div className="col-2">
                           
                          </div>
                        </div>
                        <div className="card-header">
                            <InteractiveTable
                           dataSource={apiCustomers}
                           columns={[
                             { dataIndex: 'customer_name', title: 'Name' },
                             { dataIndex: 'customer_email', title: 'Email' },
                             { dataIndex: 'api_key', title: 'API Key' },
                             { dataIndex: 'customer_id', title: 'Customer ID' },
                             { dataIndex: 'date_created', title: 'Date Created' },
                             { dataIndex: 'date_expires', title: 'Date Expires' },
                             { dataIndex: 'status', title: 'Status' },
                             { dataIndex: 'permissions', title: 'Permissions' },
                             { dataIndex: 'rate_limit', title: 'Rate Limit' },
                           ]}

                           selectedIds={selectedUserIds}
                           setSelectedIds={setSelectedUserIds}
                           handleCheckboxChange={handleCheckboxChange}
                           handleAllCheckboxChange={handleAllCheckboxChange}
                           totalEntries={totalUsers}
                           handleNextPage={handleNextPage}
                           handlePreviousPage={handlePreviousPage}
       
                            />
                            </div>
                            <div className="card card-secondary">

                            <div className="card-header">
                                            <h3 className="card-title">API Usage</h3>
                                        </div>
                                        </div>
                        <div className="row">
                                  <div className="col-md-2">
                                                <div className="form-group">
                                                    <label>API Customers</label>
                                                    <select
                                                        className="form-control"
                                                        value={selectedUser}
                                                        onChange={handleUserChange}
                                                    >
                                                        <option value="" disabled selected>Select a customer</option>
                                                        {apiCustomers.map((user) => (
                                                            <option key={user._id} value={user.api_key}>{user.customer_name}</option>
                                                        ))}
                                                        
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                    <label>Month</label>
                                                    <select
                                                        className="form-control"
                                                        value={selectedMonth}
                                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                                    >
                                                        <option value="" disabled selected>Select a customer</option>
                                                        {availableMonths.map((month) => (
                                                            <option value={month}>{month}</option>

                                                        ))}
                                                        
                                                    </select>
                                                </div>
                                            </div>
                        
                     
                           <div id="exportableContent">
                               <Chart
                                   options={{
                                       chart: {
                                           id: 'api-usage-chart'
                                       },
                                       xaxis: {
                                           categories: apiUsage
                                               .map(entry => entry._id.date)
                                       },
                                       yaxis: [{
                                           title: {
                                               text: 'Total Cost'
                                           },
                                           labels: {
                                               formatter: function (val) {
                                                   return val.toFixed(2);
                                               }
                                           }
                                       }],
                                       tooltip: {
                                           y: {
                                               formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
                                                   const entry = apiUsage[dataPointIndex]
                                                   return `${value.toFixed(2)} (Tokens: ${seriesIndex === 0 ? entry.total_input_count : entry.total_output_count}, Model: ${entry._id.model})`;
                                               }
                                           }
                                       }
                                   }}
                                   series={[
                                       {
                                           name: 'Total Input Cost',
                                           data: apiUsage
                                               .map(entry => entry.total_input_cost)
                                       },
                                       {
                                           name: 'Total Output Cost',
                                           data: apiUsage
                                               .map(entry => entry.total_output_cost)
                                       }
                                   ]}
                                   type="bar"
                                   height="350"
                               />
                               <table className="table">
                                   <thead>
                                       <tr>
                                           <th>Date</th>
                                           <th>Total Input Tokens</th>
                                           <th>Total Output Tokens</th>
                                           <th>Total Input Cost</th>
                                           <th>Total Output Cost</th>
                                           <th>Total Cost</th>
                                       </tr>
                                   </thead>
                                   <tbody>
                                       {apiUsage.map((entry) => (
                                           <tr key={entry._id.date}>
                                               <td>{entry._id.date}</td>
                                               <td>{entry.total_input_count}</td>
                                               <td>{entry.total_output_count}</td>
                                               <td>{entry.total_input_cost.toFixed(2)}</td>
                                               <td>{entry.total_output_cost.toFixed(2)}</td>
                                               <td>{(entry.total_input_cost + entry.total_output_cost).toFixed(2)}</td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                               <div style={{ fontSize: '24px', margin: '20px 0' }}>
                                   <strong>Total Cost for the Month: </strong>
                                   {apiUsage.reduce((acc, entry) => acc + entry.total_input_cost + entry.total_output_cost, 0).toFixed(2)}
                               </div>
                           </div>
                     </div>
                     
                    </div>
                    
                    </div>
                    <div className="card card-primary">
                                        <div className="card-header">
                                            <h3 className="card-title">API Chat Logs</h3>
                                            </div>
                    <div className="table-responsive">

                            <table className="table table-bordered table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>
                                                            Customer
                                                        </th>
                                                        <th>Question</th>
                                                        <th style={{minWidth: '500px'}}>Answer</th>
                                                        <th>Sources</th>
                                                        <th>Response Mode</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    
                                                    {apiLogs.map((log) => (
                                                        <tr key={log._id}>
                                                            <td>{new Date(log.datetime).toLocaleString("en-US", { timeZone: "America/New_York" })}</td>
                                                            <td>{apiKeyDict[log.api_key]}</td>
                                                            <td>{log.question}</td>
                                                            <td>
                                                                
                                                                <ReactMarkdown
                                                                remarkPlugins={[remarkGfm]}
                                                                children={log.answer}
                                                                components={{
                                                                    table: ({ node, ...props }) => (
                                                                      <table style={{ border: '1px solid black' }} {...props} />
                                                                    )}}
                                                                >{log.answer}</ReactMarkdown></td>

                                                            <td>
                                                               
                                                                {log.sources && createSourceChips(log.sources.source_documents)}
                                                            
                                                                
                                                            </td>
                                                            <td>{log.response_mode}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
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


export default APIUsageLog;