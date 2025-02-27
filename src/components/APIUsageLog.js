import React, { useEffect, useState } from 'react';
import Layout from "./Layout";
import axios from "axios";
import InteractiveTable from './interactiveTable';
import PageTitle from "./pageTitle";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Chip, Button, Box, Typography, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import DailyChartGraph from './dailyDataGraph';
import Chart from "react-apexcharts";
import jsPDF from 'jspdf';
import { toast } from 'react-hot-toast';

// Add model name mapping
const modelNameMapping = {
    "gpt-4-1106-preview": "HippoAI_V1",
    "gpt-4o": "HippoAI_V2",
    "gpt-3.5-turbo": "HippoAI_Basic"
};

const getFriendlyModelName = (modelName) => {
    return modelNameMapping[modelName] || modelName;
};

const APIUsageLog = () => {
    const [search, setSearch] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [apiCustomers, setApiCustomers] = useState([]);
    const [apiUsage, setApiUsage] = useState([]);
    const [apiLogs, setApiLogs] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [apiKeyDict, setApiKeyDict] = useState({});
    const [selectedUser, setSelectedUser] = useState("");
    const [totalUsagePercentage, setTotalUsagePercentage] = useState(0);
    const [users, setUsers] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [availableMonths, setAvailableMonths] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const API_BASE_URL = process.env.REACT_APP_NODE_API_URL || 'https://dashboard-api-woad.vercel.app';
    const monthlyServerCost = 100;
    const [rateLimitUsage, setRateLimitUsage] = useState({
        used: 0,
        limit: 0,
        overageCount: 0,
        overageCost: 0,
        baseCost: 0,
        totalCost: 0
    });
    const [dailyPingRates, setDailyPingRates] = useState([]);
    const [tokenBreakdown, setTokenBreakdown] = useState({
        daily: [],
        monthly: {
            api_calls: 0
        }
    });
    const [modelUsage, setModelUsage] = useState({
        total_calls: 0,
        models: {},
        daily: []
    });
    const [billDialog, setBillDialog] = useState({
        open: false,
        html: '',
        loading: false,
        error: null
    });

    const fetchUsageData = async () => {
        try {
            let endpoint = `${API_BASE_URL}/api/usage?page=${currentPage}`;
            if (search) endpoint += `&search=${search}`;
            if (perPage) endpoint += `&perPage=${perPage}`;
            if (selectedUser) endpoint += `&customer=${selectedUser}`;
            if (selectedMonth) endpoint += `&month=${selectedMonth}`;

            const response = await axios.get(endpoint);
            const data = response.data;

            // Update existing state
            setApiLogs(data.chatLogs);
            setApiCustomers(data.apiCustomers);
            setApiUsage(data.usageEntries);
            setAvailableMonths(data.months.map((month) => month._id));
            setTotalUsagePercentage(data.totalUsagePercentageForSelectedCustomer);
            setModelUsage(data.usage);

            // Calculate usage metrics for selected customer
            const customer = data.apiCustomers.find(c => c.api_key === selectedUser);
            setSelectedCustomer(customer);
            
            if (customer) {
                const monthlyLimit = customer.rate_limit.monthly_limit;
                const usedCount = data.usage.total_calls;
                const overageCount = Math.max(0, usedCount - monthlyLimit);
                
                // Calculate base monthly cost and any overage charges
                const baseCost = customer.rate_limit.base_cost_month;
                const overageCost = overageCount * customer.rate_limit.overage_charge_per_use;

                setRateLimitUsage({
                    used: usedCount,
                    limit: monthlyLimit,
                    overageCount,
                    overageCost,
                    baseCost,
                    totalCost: baseCost + overageCost
                });

                // Process daily usage for the chart
                setDailyPingRates(data.usage.daily.map(day => ({
                    date: day.date,
                    count: day.total_calls
                })));

                // Process token breakdown
                setTokenBreakdown({
                    daily: data.usage.daily.map(day => ({
                        date: day.date,
                        api_calls: day.total_calls,
                        ...Object.entries(day.models).reduce((acc, [model, stats]) => ({
                            ...acc,
                            [`${model}_calls`]: stats.calls,
                            [`${model}_tokens`]: stats.input_tokens + stats.output_tokens
                        }), {})
                    })),
                    monthly: {
                        api_calls: data.usage.total_calls,
                        ...Object.entries(data.usage.models).reduce((acc, [model, stats]) => ({
                            ...acc,
                            [`${model}_calls`]: stats.calls,
                            [`${model}_tokens`]: stats.input_tokens + stats.output_tokens
                        }), {})
                    }
                });
            }

            // Update API key dictionary
            const tempDict = {};
            data.apiCustomers.forEach((customer) => {
                tempDict[customer.api_key] = customer.customer_name;
            });
            setApiKeyDict(tempDict);

        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUsageData();
    }, [search, perPage, currentPage, selectedUser, selectedMonth]);

    const handleNextPage = () => setCurrentPage(currentPage + 1);
    const handlePreviousPage = () => setCurrentPage(currentPage - 1);
    const handleCheckboxChange = (e) => {
        const userId = e.target.value;
        setSelectedUserIds(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };
    const handleAllCheckboxChange = (e) => {
        setSelectedUserIds(e.target.checked ? apiCustomers.map(user => user.customer_id) : []);
    };
    const handleUserChange = (e) => {
        const value = e.target.value;
        setSelectedUser(value);
        setSelectedUserIds(value ? [value] : []);
        if (!value) {
            setSelectedCustomer(null);
            setRateLimitUsage({
                used: 0,
                limit: 0,
                overageCount: 0,
                overageCost: 0,
                baseCost: 0,
                totalCost: 0
            });
        }
    };

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

    const handleGenerateBill = async (sendEmail = false) => {
        if (!selectedUser || !selectedMonth) return;
        console.log('selectedUser', selectedUser);
        console.log('selectedMonth', selectedMonth);
        setBillDialog(prev => ({ ...prev, loading: true, error: null }));
        try {
            const response = await axios.get(`${API_BASE_URL}/api/usage/bill`, {
                params: {
                    customer_key: selectedUser,
                    month: selectedMonth,
                    send_email: sendEmail
                }
            });

            setBillDialog(prev => ({
                ...prev,
                open: true,
                html: response.data.html,
                loading: false
            }));

            if (sendEmail && response.data.email_sent) {
                toast.success('Bill sent successfully to customer email!');
            }
        } catch (error) {
            console.error('Error generating bill:', error);
            setBillDialog(prev => ({
                ...prev,
                loading: false,
                error: 'Failed to generate bill. Please try again.'
            }));
            toast.error('Failed to generate bill');
        }
    };

    const handleCloseBillDialog = () => {
        setBillDialog(prev => ({ ...prev, open: false }));
    };

    const renderBillDialog = () => (
        <Dialog
            open={billDialog.open}
            onClose={handleCloseBillDialog}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                Monthly Usage Bill
                {billDialog.loading && <LinearProgress />}
            </DialogTitle>
            <DialogContent>
                {billDialog.error ? (
                    <Typography color="error">{billDialog.error}</Typography>
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: billDialog.html }} />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseBillDialog}>Close</Button>
                <Button 
                    onClick={() => handleGenerateBill(true)} 
                    color="primary"
                    disabled={billDialog.loading}
                >
                    Send to Customer
                </Button>
                <Button
                    onClick={() => {
                        const printWindow = window.open('', '_blank');
                        printWindow.document.write(billDialog.html);
                        printWindow.document.close();
                        printWindow.print();
                    }}
                    color="primary"
                    disabled={billDialog.loading}
                >
                    Print
                </Button>
            </DialogActions>
        </Dialog>
    );

    const renderExportSection = () => (
        <div className="row mb-4">
            <div className="col">
                <Button 
                    variant="contained" 
                    onClick={() => handleGenerateBill(false)}
                    disabled={!selectedUser || !selectedMonth || billDialog.loading}
                    style={{ marginRight: '10px' }}
                >
                    Generate Bill
                </Button>
                <Button 
                    variant="outlined" 
                    onClick={() => handleGenerateBill(true)}
                    disabled={!selectedUser || !selectedMonth || billDialog.loading}
                >
                    Generate & Send Bill
                </Button>
            </div>
        </div>
    );

    const renderRateLimitSection = () => {
        // Calculate tax
        const HST_RATE = 0.13; // Ontario HST rate (13%)
        const taxAmount = rateLimitUsage.totalCost * HST_RATE;
        const finalTotal = rateLimitUsage.totalCost + taxAmount;

        return (
            <div className="card card-info">
                <div className="card-header">
                    <h3 className="card-title">Usage and Billing Summary</h3>
                </div>
                <div className="card-body">
                    <Box sx={{ width: '100%', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Monthly Usage: {rateLimitUsage.used} / {rateLimitUsage.limit} API calls
                        </Typography>
                        <LinearProgress 
                            variant="determinate" 
                            value={(rateLimitUsage.used / rateLimitUsage.limit) * 100}
                            sx={{ height: 10, borderRadius: 5 }}
                        />
                    </Box>
                    <Typography>
                        Base Monthly Cost: ${rateLimitUsage.baseCost.toFixed(2)}
                        <br />
                        <small className="text-muted">
                            Includes up to {rateLimitUsage.limit} API calls
                        </small>
                    </Typography>
                    {rateLimitUsage.overageCount > 0 && (
                        <Typography color="error">
                            Overage: {rateLimitUsage.overageCount} API calls over limit
                            <br />
                            Additional cost at ${selectedCustomer?.rate_limit?.overage_charge_per_use}/call: 
                            ${rateLimitUsage.overageCost.toFixed(2)}
                        </Typography>
                    )}
                    <Typography sx={{ mt: 2 }}>
                        Subtotal: ${rateLimitUsage.totalCost.toFixed(2)}
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                        HST (13%): ${taxAmount.toFixed(2)}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                        Total (including tax): ${finalTotal.toFixed(2)}
                    </Typography>
                </div>
            </div>
        );
    };

    const renderUsageGraphs = () => (
        <div className="card card-primary">
            <div className="card-header">
                <h3 className="card-title">API Usage Metrics</h3>
            </div>
            <div className="card-body">
                <Chart
                    options={{
                        chart: { id: 'daily-ping-rate' },
                        xaxis: {
                            categories: dailyPingRates.map(d => d.date),
                            title: { text: 'Date' }
                        },
                        yaxis: {
                            title: { text: 'Number of API Calls' }
                        },
                        title: { text: 'Daily API Call Rate' }
                    }}
                    series={[{
                        name: 'API Calls',
                        data: dailyPingRates.map(d => d.count)
                    }]}
                    type="line"
                    height={350}
                />
            </div>
        </div>
    );

    const renderCombinedUsageBreakdown = () => {
        // Transform model names for display
        const transformedModels = Object.entries(modelUsage.models).reduce((acc, [model, stats]) => {
            acc[getFriendlyModelName(model)] = stats;
            return acc;
        }, {});

        // Calculate tax
        const HST_RATE = 0.13; // Ontario HST rate (13%)
        const taxAmount = rateLimitUsage.totalCost * HST_RATE;
        const finalTotal = rateLimitUsage.totalCost + taxAmount;

        return (
            <div className="card card-info">
                <div className="card-header">
                    <h3 className="card-title">Usage Breakdown</h3>
                </div>
                <div className="card-body">
                    {/* Monthly Summary */}
                    <div className="mb-4">
                        <h4>Monthly Summary</h4>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Total API Calls</th>
                                        <th>Base Cost</th>
                                        <th>Overage Cost</th>
                                        <th>Subtotal</th>
                                        <th>HST (13%)</th>
                                        <th>Total (with tax)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{modelUsage.total_calls}</td>
                                        <td>${rateLimitUsage.baseCost.toFixed(2)}</td>
                                        <td>${rateLimitUsage.overageCost.toFixed(2)}</td>
                                        <td>${rateLimitUsage.totalCost.toFixed(2)}</td>
                                        <td>${taxAmount.toFixed(2)}</td>
                                        <td className="font-weight-bold">${finalTotal.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Model Distribution */}
                    <div className="mb-4">
                        <h4>Model Distribution</h4>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Model</th>
                                        <th>API Calls</th>
                                        <th>% of Total</th>
                                        <th>Input Tokens</th>
                                        <th>Output Tokens</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(transformedModels).map(([model, stats]) => (
                                        <tr key={model}>
                                            <td>{model}</td>
                                            <td>{stats.calls}</td>
                                            <td>{((stats.calls / modelUsage.total_calls) * 100).toFixed(2)}%</td>
                                            <td>{stats.input_tokens}</td>
                                            <td>{stats.output_tokens}</td>
                                        </tr>
                                    ))}
                                    <tr className="font-weight-bold">
                                        <td>Total</td>
                                        <td>{modelUsage.total_calls}</td>
                                        <td>100%</td>
                                        <td>{Object.values(modelUsage.models).reduce((sum, stats) => sum + stats.input_tokens, 0)}</td>
                                        <td>{Object.values(modelUsage.models).reduce((sum, stats) => sum + stats.output_tokens, 0)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Daily Breakdown */}
                    <div>
                        <h4>Daily Breakdown</h4>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Total Calls</th>
                                        {Object.keys(transformedModels).map(model => (
                                            <th key={model}>{model}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {modelUsage.daily.map(day => {
                                        const transformedModelsDay = Object.entries(day.models).reduce((acc, [model, stats]) => {
                                            acc[getFriendlyModelName(model)] = stats;
                                            return acc;
                                        }, {});
                                        return (
                                            <tr key={day.date}>
                                                <td>{new Date(day.date).toLocaleDateString()}</td>
                                                <td>{day.total_calls}</td>
                                                {Object.keys(transformedModels).map(model => (
                                                    <td key={model}>{transformedModelsDay[model]?.calls || 0}</td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Layout>
            <div className="content-wrapper">
                <PageTitle title="API Usage Dashboard" />
                <section className="content">
                    <div className="container-fluid">
                        {/* Customer Selection */}
                        <div className="row mb-4">
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>API Customer</label>
                                    <select
                                        className="form-control"
                                        value={selectedUser}
                                        onChange={handleUserChange}
                                    >
                                        <option value="">Select a customer</option>
                                        {apiCustomers.map((customer) => (
                                            <option key={customer._id} value={customer.api_key}>
                                                {customer.customer_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label>Month</label>
                                    <select
                                        className="form-control"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                    >
                                        {availableMonths.map((month) => (
                                            <option key={month} value={month}>{month}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Usage Overview */}
                        <div className="row">
                            <div className="col-md-6">
                                {selectedUser && renderRateLimitSection()}
                            </div>
                            <div className="col-md-6">
                                {renderUsageGraphs()}
                            </div>
                        </div>

                        {/* Combined Usage Breakdown */}
                        {selectedUser && (
                            <div className="row mt-4">
                                <div className="col-12">
                                    {renderCombinedUsageBreakdown()}
                                </div>
                            </div>
                        )}

                        {/* Replace Export Button section with new one */}
                        {renderExportSection()}

                        {/* Add Bill Dialog */}
                        {renderBillDialog()}

                        {/* Chat Logs */}
                        <div className="card card-primary">
                            <div className="card-header">
                                <h3 className="card-title">API Chat Logs</h3>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Customer</th>
                                                <th>Question</th>
                                                <th style={{minWidth: '500px'}}>Answer</th>
                                                <th>Sources</th>
                                                <th>Response Mode</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {apiLogs.map((log) => (
                                                <tr key={log._id}>
                                                    <td>{new Date(log.datetime).toLocaleString()}</td>
                                                    <td>{apiKeyDict[log.api_key]}</td>
                                                    <td>{log.question}</td>
                                                    <td>
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm]}
                                                            components={{
                                                                table: ({ node, ...props }) => (
                                                                    <table style={{ border: '1px solid black' }} {...props} />
                                                                )
                                                            }}
                                                        >
                                                            {log.answer}
                                                        </ReactMarkdown>
                                                    </td>
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
                </section>
            </div>
        </Layout>
    );
};

export default APIUsageLog;