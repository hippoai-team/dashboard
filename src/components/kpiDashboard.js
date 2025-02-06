import React, { useState } from 'react';
import { 
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel, 
    Button, 
    Grid, 
    Paper, 
    Typography, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import Chart from 'react-apexcharts';
import axios from "axios";
import Layout from './Layout';
import PageTitle from './pageTitle';

const API_BASE_URL = process.env.REACT_APP_NODE_API_URL ||'https://dashboard-api-woad.vercel.app';

const KPIDashboard = () => {
    const [selectedKPIs, setSelectedKPIs] = useState([]);
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
    const [endDate, setEndDate] = useState(new Date());
    const [kpiData, setKpiData] = useState({});
    const [chartType, setChartType] = useState('line');
    const [chartTypes, setChartTypes] = useState({});
    const [histogramData, setHistogramData] = useState({});
    const [customBins, setCustomBins] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedCaseUser, setSelectedCaseUser] = useState(null);

    const kpiOptions = [
        'averageDailyQueries',
        'dailyActiveUsers',
        'weeklyUserEngagement',
        'userTurnoverRateWeekly',
        'churnRate',
        'totalQueries',
        'featureUseFrequencySaveSources',
        'featureUseFrequencyPrimaryLiteratureVsSource',
        'featureInteractionRateCalculator',
        'newUserSignups',
        'averageDailyQueriesDistribution',
        'tokenUsageDistribution',
        'featureInteractionsPerDay',
        'userRetentionMetrics',
        'stripeMetrics',
        'caseSubmissionAnalytics'
    ];
    const fetchKPIData = async () => {
        setSelectedUsers([]);
        try {
            let endpoint = `${API_BASE_URL}/api/kpi/get-kpi`
            const promises = selectedKPIs.map(kpi =>
                axios.get(endpoint, {
                    params: {
                        kpi: kpi,
                        startDate: startDate.toISOString(),
                        endDate: endDate.toISOString(),
                        bins: customBins
                    }
                })
            );
            const responses = await Promise.all(promises);
            const newKpiData = {};
            responses.forEach((response, index) => {
                newKpiData[selectedKPIs[index]] = response.data;
            });
            setKpiData(newKpiData);
            console.log('newKpiData',newKpiData)
        } catch (error) {
            console.error('Error fetching KPI data:', error);
        }
    };

    const handleKPIChange = (event) => {
        setSelectedKPIs(event.target.value);
    };
    const roundToOneDecimal = (value) => {
        return Number(value.toFixed(1));
    };
    const handleChartTypeChange = (kpi, newChartType) => {
        if (newChartType !== null) {
            setChartTypes(prevTypes => ({
                ...prevTypes,
                [kpi]: newChartType
            }));
        }
    };

    const renderChart = (kpi) => {
        const data = kpi.data;
        const kpi_name = kpi.kpi;
        if (!data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0)) {
            console.error(`No data available for KPI: ${kpi_name}`);
            return <div>No data available for {kpi_name}</div>;
        }

        let series = [];
        let categories = [];

        try {
            if (Array.isArray(data)) {
                categories = data.map(item => item.date || item.weekStart || 'Unknown');

                if (kpi_name === 'Feature Interactions Per Day') {
                    const interactionTypes = [...new Set(data.flatMap(day => Object.keys(day.interactions)))];
                    series = interactionTypes.map(interactionType => ({
                        name: interactionType,
                        data: data.map(day => day.interactions[interactionType] || 0)
                    }));
                } else {
                    const dataKeys = Object.keys(data[0]).filter(key => 
                        !['weekStart', 'weekEnd', 'date', 'year', 'week','month', '_id'].includes(key)
                    );

                    series = dataKeys.map(key => ({
                        name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                        data: data.map(item => roundToOneDecimal(item[key]))
                    }));
                }
            } else if (typeof data === 'object') {
                categories = Object.keys(data);
                series = [{
                    name: kpi_name,
                    data: Object.values(data).map(value => roundToOneDecimal(value))
                }];
            }

            const options = {
                chart: {
                    type: chartTypes[kpi_name] || 'line',
                    height: 350
                },
                xaxis: {
                    categories: categories,
                    labels: {
                        rotate: -45,
                        rotateAlways: false,
                        hideOverlappingLabels: true
                    }
                },
                title: {
                    text: kpi_name,
                    align: 'center'
                },
                noData: {
                    text: 'No data available'
                },
                yaxis: {
                    title: {
                        text: kpi_name
                    },
                    labels: {
                        formatter: function (value) {
                            return value?.toFixed(1);
                        }
                    }
                },
                legend: {
                    position: 'top',
                    horizontalAlign: 'center',
                    onItemClick: {
                        toggleDataSeries: true
                    },
                    onItemHover: {
                        highlightDataSeries: true
                    }
                },
                tooltip: {
                    x: {
                        formatter: function(val, opts) {
                            // Use the category value directly instead of accessing data
                            return categories[opts.dataPointIndex];
                        }
                    }
                },
                responsive: [{
                    breakpoint: 480,
                    options: {
                        legend: {
                            position: 'bottom',
                            offsetX: -10,
                            offsetY: 0
                        }
                    }
                }]
            };

            return (
                <>
                    <ToggleButtonGroup
                        value={chartTypes[kpi_name] || 'line'}
                        exclusive
                        onChange={(event, newType) => handleChartTypeChange(kpi_name, newType)}
                        aria-label="chart type"
                        size="small"
                        style={{ marginBottom: '1rem' }}
                    >
                        <ToggleButton value="line" aria-label="line chart">
                            Line
                        </ToggleButton>
                        <ToggleButton value="bar" aria-label="bar chart">
                            Bar
                        </ToggleButton>
                    </ToggleButtonGroup>
                    <Chart options={options} series={series} type={chartTypes[kpi_name] || 'line'} height={350} />
                </>
            );
        } catch (error) {
            console.error(`Error rendering chart for KPI ${kpi_name}:`, error);
            return <div>Error rendering chart for {kpi_name}</div>;
        }
    };

   const handleBarClick = (dataPointIndex, kpi) => {
        if (kpi.data[dataPointIndex].users) {
            const users = kpi.data[dataPointIndex].users;
            setSelectedUsers(users.map(user => ({
                userId: user.email,
                signupDate: user.signupDate,
                lastActive: user.lastActive, 
                daysActive: user.daysActive
            })));
            setShowUserModal(true);
        }
    };

    const renderHistogram = (kpi) => {
        const data = kpi.data;
        const kpi_name = kpi.kpi;
        if (!data || data.length === 0) {
            return <div>No data available for {kpi_name}</div>;
        }

        const series = [{
            name: 'Count',
            data: data.map(bin => bin.count)
        }];

        const options = {
            chart: {
                type: 'bar',
                height: 350,
                id: kpi_name,
                events: {
                    dataPointSelection: function(event, chartContext, config) {
                        handleBarClick(config.dataPointIndex, kpi);
                    }
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    endingShape: 'rounded'
                },
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            xaxis: {
                categories: data.map((bin, index) => {
                    const minValue = bin.min === "Other" ? "365+" : bin.min;
                    const maxValue = bin.max === "Other" || bin.max === "Infinity" || index === data.length - 1 
                        ? "+" 
                        : ` - ${bin.max}`;
                    
                    return `${minValue}${maxValue}`;
                }),
                title: {
                    text: 'Days'
                }
            },
            yaxis: {
                title: {
                    text: 'Number of Users'
                }
            },
            fill: {
                opacity: 1
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + " users"
                    }
                }
            },
            title: {
                text: kpi_name,
                align: 'center'
            }
        };

        const exportUsersToCSV = () => {
            const csvContent = [
                ['User Email', 'Signup Date', 'Last Active', 'Days Active'].join(','),
                ...selectedUsers.map(user => [
                    user.userId,
                    new Date(user.signupDate).toLocaleDateString(),
                    user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never active',
                    user.daysActive
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `users_${kpi_name}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        return (
            <>
                <Chart options={options} series={series} type="bar" height={350} />
                <Dialog 
                    open={showUserModal} 
                    onClose={() => setShowUserModal(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>Users in Selected Range</DialogTitle>
                    <DialogContent>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>User Email</TableCell>
                                        <TableCell>Signup Date</TableCell>
                                        <TableCell>Last Active</TableCell>
                                        <TableCell>Days Active</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedUsers.map((user, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{user.userId}</TableCell>
                                            <TableCell>{new Date(user.signupDate).toLocaleDateString()}</TableCell>
                                            <TableCell>{user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never active'}</TableCell>
                                            <TableCell>{user.daysActive}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={exportUsersToCSV}>Export to CSV</Button>
                        <Button onClick={() => setShowUserModal(false)}>Close</Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    };

    const renderRawData = (kpi) => {
        const data = kpi.data;
        const kpi_name = kpi.kpi;

        if (!data || (Array.isArray(data) && data.length === 0)) return null;

        if (kpi_name === 'Token Usage Distribution') {
            // Handle Token Usage Distribution separately
            return (
                <>
                    {Object.entries(data).map(([distributionType, distributionData]) => (
                        <div key={distributionType}>
                            <Typography variant="h6" gutterBottom>{distributionType}</Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Min</TableCell>
                                            <TableCell>Max</TableCell>
                                            <TableCell>Count</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {distributionData.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{row._id}</TableCell>
                                                <TableCell>{row.max === 'Infinity' ? '∞' : row.max}</TableCell>
                                                <TableCell>{row.count}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    ))}
                </>
            );
        }

        // For Feature Interactions Per Day, handle it separately
        if (kpi_name === 'Feature Interactions Per Day') {
            const headers = ['Date', ...new Set(data.flatMap(day => Object.keys(day.interactions)))];
            
            const exportToCSV = () => {
                const csvContent = [
                    headers.join(','),
                    ...data.map(day => [
                        day.date,
                        ...headers.slice(1).map(header => day.interactions[header] || 0)
                    ].join(','))
                ].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                if (link.download !== undefined) {
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', `${kpi_name}.csv`);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            };

            return (
                <>
                    <Button variant="contained" color="primary" onClick={exportToCSV} style={{ marginBottom: '1rem' }}>
                        Export to CSV
                    </Button>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {headers.map((header, index) => (
                                        <TableCell key={index}>{header}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.map((day, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        <TableCell>{day.date}</TableCell>
                                        {headers.slice(1).map((header, cellIndex) => (
                                            <TableCell key={cellIndex}>{day.interactions[header] || 0}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            );
        }

        // For other KPIs, use the existing logic
        const headers = Object.keys(data[0]);

        const exportToCSV = () => {
            const csvContent = [
                headers.join(','),
                ...data.map(row => headers.map(header => row[header]).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `${kpi_name}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        };

        return (
            <>
                <Button variant="contained" color="primary" onClick={exportToCSV} style={{ marginBottom: '1rem' }}>
                    Export to CSV
                </Button>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {headers.map((header, index) => (
                                    <TableCell key={index}>
                                        {header.replace(/([A-Z])/g, ' $1')
                                               .replace(/^./, str => str.toUpperCase())
                                               .trim()}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {headers.map((header, cellIndex) => (
                                        <TableCell key={cellIndex}>{row[header]}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </>
        );
    };

    const handleCustomBinsChange = (event) => {
        setCustomBins(event.target.value);
    };

    const isDistributionKPISelected = selectedKPIs.some(kpi => kpi.includes('Distribution'));

    const renderRetentionMetrics = (data) => {
        const { lifespanDistribution, daysToChurnDistribution, retentionCohorts, summary } = data;
        // Add bin min and max fields to days to churn distribution
        console.log('lifespan distribution',lifespanDistribution)
        daysToChurnDistribution.forEach((bin, index) => {
            if (bin._id === "365+") {
                bin.min = "365+";
                bin.max = "Infinity";
            } else {
                bin.min = bin._id;
                if (index < daysToChurnDistribution.length - 1) {
                    const nextBin = daysToChurnDistribution[index + 1];
                    bin.max = nextBin._id === "365+" ? "365" : nextBin._id;
                } else {
                    bin.max = "Infinity";
                }
            }
        });

        lifespanDistribution.forEach((bin, index) => {
            bin.min = bin._id;
            if (index < lifespanDistribution.length - 1) {
                bin.max = lifespanDistribution[index + 1]._id;
            } else {
                bin.max = "Infinity";
            }
        });

        return (
            <Grid container spacing={3}>
                {/* Summary Statistics */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Summary Statistics</Typography>
                        <Grid container spacing={2}>
                            {[
                                { label: 'Total Users', value: summary.totalUsers },
                                { label: 'Active Users', value: summary.activeUsers },
                                { label: 'Average Lifespan (days)', value: summary.avgLifespan?.toFixed(1) },
                                { label: 'Average Days Active', value: summary.avgDaysActive?.toFixed(1) },
                                { label: 'Median Days to Churn', value: summary.medianDaysToChurn?.toFixed(1) }
                            ].map((stat, index) => (
                                <Grid item xs={12} sm={4} md={2.4} key={index}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        {stat.label}
                                    </Typography>
                                    <Typography variant="h6">
                                        {stat.value || 'N/A'}
                                    </Typography>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Lifespan Distribution Chart */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>User Lifespan Distribution</Typography>
                        {renderHistogram({ kpi: 'User Lifespan Distribution', data: lifespanDistribution })}
                    </Paper>
                </Grid>

                {/* Days to Churn Distribution Chart */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Days to Churn Distribution</Typography>
                        {renderHistogram({ kpi: 'Days to Churn Distribution', data: daysToChurnDistribution })}
                    </Paper>
                </Grid>

                {/* Retention Cohorts Table */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Retention Cohorts</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Cohort</TableCell>
                                        <TableCell align="right">Total Users</TableCell>
                                        <TableCell align="right">Active Users</TableCell>
                                        <TableCell align="right">Retention Rate (%)</TableCell>
                                        <TableCell align="right">Avg Days Active</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {retentionCohorts.map((cohort, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{cohort.cohort}</TableCell>
                                            <TableCell align="right">{cohort.totalUsers}</TableCell>
                                            <TableCell align="right">{cohort.activeUsers}</TableCell>
                                            <TableCell align="right">{cohort.retentionRate.toFixed(1)}%</TableCell>
                                            <TableCell align="right">{cohort.avgDaysActive}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        );
    };

    const renderStripeMetrics = (data) => {
        const metrics = data.data;
        
        return (
            <Grid container spacing={3}>
                {/* Total Customers */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Total Customers: {metrics.totalCustomers}</Typography>
                    </Paper>
                </Grid>

                {/* Pro Subscriptions */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Pro Subscriptions</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Active Paid</TableCell>
                                        <TableCell align="right">{metrics.proSubscriptions.active}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Trial</TableCell>
                                        <TableCell align="right">{metrics.proSubscriptions.trial}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Cancelled</TableCell>
                                        <TableCell align="right">{metrics.proSubscriptions.cancelled}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* Basic Subscriptions */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Basic Subscriptions</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Active Paid</TableCell>
                                        <TableCell align="right">{metrics.basicSubscriptions.active}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Trial</TableCell>
                                        <TableCell align="right">{metrics.basicSubscriptions.trial}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Cancelled</TableCell>
                                        <TableCell align="right">{metrics.basicSubscriptions.cancelled}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* Conversion Metrics */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Conversion Metrics</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Overall Conversion Rate
                                </Typography>
                                <Typography variant="h6">
                                    {metrics.conversionRate.toFixed(1)}%
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Trial Conversion Rate
                                </Typography>
                                <Typography variant="h6">
                                    {metrics.trialConversionRate.toFixed(1)}%
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    No Subscription
                                </Typography>
                                <Typography variant="h6">
                                    {metrics.noSubscription}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        );
    };

    const renderCaseSubmissionAnalytics = (data) => {
        const { dailySubmissions, studyAnalytics, userDailySubmissions } = data.data;
        
        // Organize submissions by date
        const getSubmissionsByDate = () => {
            const submissionsByDate = {};
            
            // First, collect all submissions by date
            Object.entries(userDailySubmissions).forEach(([email, submissions]) => {
                submissions.forEach(dayData => {
                    if (!submissionsByDate[dayData.date]) {
                        submissionsByDate[dayData.date] = [];
                    }
                    const userStats = studyAnalytics.userScores.find(u => u.email === email) || {};
                    submissionsByDate[dayData.date].push({
                        email,
                        submissions: dayData.submissions,
                        count: dayData.count,
                        averageScore: userStats.averageScore || 0,
                        totalCases: userStats.totalCases || 0,
                        topics: userStats.topics || []
                    });
                });
            });

            // Convert to array and sort by date
            return Object.entries(submissionsByDate)
                .map(([date, users]) => ({
                    date,
                    users: users.sort((a, b) => b.count - a.count) // Sort users by submission count
                }))
                .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort dates in descending order
        };

        const submissionsByDate = getSubmissionsByDate();
        
        // Chart data for daily submissions
        const chartData = {
            kpi: 'Case Submissions Over Time',
            data: dailySubmissions.map(item => ({
                date: item.date,
                'Total Submissions': item.totalSubmissions,
                'Submissions Per User': parseFloat(item.submissionsPerUser.toFixed(2)),
                'Unique Users': item.uniqueUsers
            }))
        };

        const handleUserClick = (user) => {
            setSelectedCaseUser(selectedCaseUser?.email === user.email ? null : user);
        };

        const renderUserDetail = (user) => {
            const userSubmissions = userDailySubmissions[user.email] || [];
            const userChartData = {
                kpi: `Daily Submissions - ${user.email}`,
                data: userSubmissions.map(item => ({
                    date: item.date,
                    'Submissions': item.count,
                }))
            };

            return (
                <Paper sx={{ p: 2, mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        User Details - {user.email}
                    </Typography>
                    
                    {/* User Stats */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={4}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Total Cases
                            </Typography>
                            <Typography variant="h6">
                                {user.totalCases}
                            </Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Average Score
                            </Typography>
                            <Typography variant="h6">
                                {parseFloat(user.averageScore.toFixed(1))}%
                            </Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Topics Covered
                            </Typography>
                            <Typography variant="h6">
                                {Array.from(new Set(user.topics)).length}
                            </Typography>
                        </Grid>
                    </Grid>

                    {/* User's Daily Submissions Chart */}
                    <Typography variant="subtitle1" gutterBottom>
                        Daily Submissions
                    </Typography>
                    {renderChart(userChartData)}

                    {/* Detailed Submissions */}
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                        Recent Submissions
                    </Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Topic</TableCell>
                                    <TableCell align="right">Score</TableCell>
                                    <TableCell>Case ID</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {userSubmissions.flatMap(day => 
                                    day.submissions.map((submission, idx) => (
                                        <TableRow key={`${day.date}-${idx}`}>
                                            <TableCell>{day.date}</TableCell>
                                            <TableCell>{submission.topic}</TableCell>
                                            <TableCell align="right">
                                                {submission.score ? `${submission.score.toFixed(1)}%` : 'N/A'}
                                            </TableCell>
                                            <TableCell>{submission.caseId}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            );
        };

        return (
            <Grid container spacing={3}>
                {/* Overall Summary Statistics */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Overall Study Analytics</Typography>
                        <Grid container spacing={2}>
                            {[
                                { 
                                    label: 'Total Users', 
                                    value: studyAnalytics.totalUsers
                                },
                                { 
                                    label: 'Average Cases per User', 
                                    value: parseFloat(studyAnalytics.averageCasesPerUser.toFixed(1))
                                },
                                { 
                                    label: 'Average Score', 
                                    value: parseFloat(studyAnalytics.averageScore.toFixed(1)) + '%'
                                }
                            ].map((stat, index) => (
                                <Grid item xs={12} sm={4} key={index}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        {stat.label}
                                    </Typography>
                                    <Typography variant="h6">
                                        {stat.value || 'N/A'}
                                    </Typography>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Daily Submissions Chart */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Daily Case Submissions</Typography>
                        {renderChart(chartData)}
                    </Paper>
                </Grid>

                {/* Daily Users Submissions Table */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Daily User Submissions</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Users</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {submissionsByDate.map((dateData) => (
                                        <React.Fragment key={dateData.date}>
                                            <TableRow>
                                                <TableCell 
                                                    component="th" 
                                                    scope="row"
                                                    sx={{ fontWeight: 'bold' }}
                                                >
                                                    {dateData.date}
                                                    <Typography variant="caption" display="block" color="textSecondary">
                                                        {dateData.users.length} users
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Grid container spacing={1}>
                                                        {dateData.users.map((user) => (
                                                            <Grid item key={user.email}>
                                                                <Button
                                                                    variant={selectedCaseUser?.email === user.email ? "contained" : "outlined"}
                                                                    size="small"
                                                                    onClick={() => handleUserClick({
                                                                        email: user.email,
                                                                        averageScore: user.averageScore,
                                                                        totalCases: user.totalCases,
                                                                        topics: user.topics
                                                                    })}
                                                                    sx={{ mr: 1, mb: 1 }}
                                                                >
                                                                    {user.email.split('@')[0]} ({user.count})
                                                                </Button>
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                </TableCell>
                                            </TableRow>
                                            {selectedCaseUser && dateData.users.some(u => u.email === selectedCaseUser.email) && (
                                                <TableRow>
                                                    <TableCell colSpan={2} sx={{ py: 0 }}>
                                                        {renderUserDetail(selectedCaseUser)}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* User Performance Table */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>User Performance</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>User Email</TableCell>
                                        <TableCell align="right">Total Cases</TableCell>
                                        <TableCell align="right">Average Score</TableCell>
                                        <TableCell>Topics Attempted</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {studyAnalytics.userScores.map((user, index) => (
                                        <React.Fragment key={index}>
                                            <TableRow 
                                                hover
                                                onClick={() => handleUserClick(user)}
                                                sx={{ 
                                                    cursor: 'pointer',
                                                    backgroundColor: selectedCaseUser?.email === user.email ? 
                                                        'action.selected' : 'inherit'
                                                }}
                                            >
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell align="right">{user.totalCases}</TableCell>
                                                <TableCell align="right">
                                                    {parseFloat(user.averageScore.toFixed(1))}%
                                                </TableCell>
                                                <TableCell>
                                                    {Array.from(new Set(user.topics)).join(', ')}
                                                </TableCell>
                                            </TableRow>
                                            {selectedCaseUser?.email === user.email && (
                                                <TableRow>
                                                    <TableCell colSpan={4} sx={{ py: 0 }}>
                                                        {renderUserDetail(user)}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* Raw Submission Data */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Raw Submission Data</Typography>
                        {renderRawData({ kpi: 'Daily Case Submissions', data: dailySubmissions })}
                    </Paper>
                </Grid>
            </Grid>
        );
    };

    return (
        <Layout>
            <div className="content-wrapper">
                <PageTitle title="KPIs" />
                <section className="content">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12">
                                <div className="card card-primary">
                                    <div className="card-header">
                                        <h3 className="card-title">KPI Dashboard</h3>
                                    </div>
                                    <div className="card-body">
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={6}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Select KPIs</InputLabel>
                                                    <Select
                                                        multiple
                                                        value={selectedKPIs}
                                                        onChange={handleKPIChange}
                                                        renderValue={(selected) => selected.join(', ')}
                                                    >
                                                        {kpiOptions.map((kpi) => (
                                                            <MenuItem key={kpi} value={kpi}>
                                                                {kpi}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                    <DatePicker
                                                        label="Start Date"
                                                        value={startDate}
                                                        onChange={setStartDate}
                                                        renderInput={(params) => <TextField {...params} fullWidth />}
                                                    />
                                                </LocalizationProvider>
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                    <DatePicker
                                                        label="End Date"
                                                        value={endDate}
                                                        onChange={setEndDate}
                                                        renderInput={(params) => <TextField {...params} fullWidth />}
                                                    />
                                                </LocalizationProvider>
                                            </Grid>
                                            {isDistributionKPISelected && (
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Custom Bins (comma-separated)"
                                                        value={customBins}
                                                        onChange={handleCustomBinsChange}
                                                        helperText="Enter comma-separated values for custom bins (e.g., 0,1,5,10,20,50,100)"
                                                    />
                                                </Grid>
                                            )}
                                            <Grid item xs={12}>
                                                <Button variant="contained" color="primary" onClick={fetchKPIData}>
                                                    Fetch KPI Data
                                                </Button>
                                            </Grid>
                                        </Grid>
                                        
                                        {Object.entries(kpiData).map(([kpi, data]) => (
                                            <div key={kpi}>
                                                <Typography variant="h6" gutterBottom>{data.kpi}</Typography>
                                                {data.kpi === 'User Retention Metrics' ? (
                                                    renderRetentionMetrics(data.data)
                                                ) : data.kpi === 'Stripe Metrics' ? (
                                                    renderStripeMetrics(data)
                                                ) : data.kpi === 'Case Submission Analytics' ? (
                                                    renderCaseSubmissionAnalytics(data)
                                                ) : data.kpi === 'Token Usage Distribution' ? (
                                                    <>
                                                        {renderHistogram({kpi: 'Tokens In Distribution', data: data.data.tokensInDistribution})}
                                                        {renderHistogram({kpi: 'Tokens Out Distribution', data: data.data.tokensOutDistribution})}
                                                        {renderHistogram({kpi: 'Total Tokens Distribution', data: data.data.totalTokensDistribution})}
                                                    </>
                                                ) : data.kpi.includes('Distribution') ? (
                                                    renderHistogram(data)
                                                ) : (
                                                    renderChart(data)
                                                )}
                                                {data.kpi !== 'User Retention Metrics' && 
                                                 data.kpi !== 'Stripe Metrics' && 
                                                 data.kpi !== 'Case Submission Analytics' && (
                                                    <>
                                                        <Typography variant="h6" gutterBottom>Raw Data</Typography>
                                                        {renderRawData(data)}
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default KPIDashboard;