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
    ToggleButtonGroup
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
        'combinedFeatureInteractions'
    ];
    const fetchKPIData = async () => {
        try {
            let endpoint = `${API_BASE_URL}/api/kpi/get-kpi`
            const promises = selectedKPIs.map(kpi =>
                axios.get(endpoint, {
                    params: {
                        kpi: kpi,
                        startDate: startDate.toISOString(),
                        endDate: endDate.toISOString()
                    }
                })
            );
            const responses = await Promise.all(promises);
            const newKpiData = {};
            responses.forEach((response, index) => {
                newKpiData[selectedKPIs[index]] = response.data;
            });
            setKpiData(newKpiData);
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

                if (kpi_name === 'Combined Feature Interactions') {
                    series = [
                        { name: 'Calculator Submitted', data: data.map(item => item.calculator_submitted) },
                        { name: 'Source Interactions', data: data.map(item => item.source_interactions) },
                        { name: 'Clicked Chat History Thread', data: data.map(item => item.clicked_chat_history_thread) },
                        { name: 'Opened Modal', data: data.map(item => item.opened_modal) }
                    ];
                } else {
                    const dataKeys = Object.keys(data[0]).filter(key => 
                        !['weekStart', 'weekEnd', 'date', 'year', 'week', '_id'].includes(key)
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
                            const dataPoint = data[opts.dataPointIndex];
                            return dataPoint.weekStart && dataPoint.weekEnd 
                                ? `${dataPoint.weekStart} to ${dataPoint.weekEnd}`
                                : val;
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

    const renderRawData = (kpi) => {
        const data = kpi.data
        const kpi_name = kpi.kpi
        if (!data || data.length === 0) return null;
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
                                            <Grid item xs={12}>
                                                <Button variant="contained" color="primary" onClick={fetchKPIData}>
                                                    Fetch KPI Data
                                                </Button>
                                            </Grid>
                                        </Grid>
                                        
                                        {Object.entries(kpiData).map(([kpi, data]) => (
                                            <div key={kpi}>
                                                <Typography variant="h6" gutterBottom>{data.kpi}</Typography>
                                                {renderChart(data)}
                                                <Typography variant="h6" gutterBottom>Raw Data</Typography>
                                                {renderRawData(data)}
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