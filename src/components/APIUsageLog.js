import React, { useEffect, useState } from 'react';
import Layout from "./Layout";
import axios from "axios";
import InteractiveTable from './interactiveTable';
import PageTitle from "./pageTitle";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Chip, Button } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';

const APIUsageLog = () => {
    const [chatLogs, setChatLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [apiCustomers, setApiCustomers] = useState([]);
    const [apiUsage, setApiUsage] = useState([]);
    const [apiLogs, setApiLogs] = useState([]);
    const [customerFilter, setCustomerFilter] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [apiKeyDict, setApiKeyDict] = useState({});//[customer_id: api_key
    
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
            if (customerFilter) {
                endpoint += `&customer=${customerFilter}`;
            }
            const response = await axios.get(endpoint);
            const data = await response
            console.log(data.data);
            setApiLogs(data.data.chatLogs);
            setApiCustomers(data.data.apiCustomers);
            setApiUsage(data.data.usageEntries);
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
    , []);

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
                                                            <td>{log.datetime}</td>
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
                                                               
                                                                {log.sources && createSourceChips(log.sources)}
                                                            
                                                                
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