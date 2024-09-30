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
    const [histogramData, setHistogramData] = useState({});
    const [customBins, setCustomBins] = useState('');

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
    ];
    const fetchKPIData = async () => {
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
            console.log('responses',responses)
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
                height: 350
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
                    const minValue = typeof bin.min === 'number' ? bin.min.toFixed(2) : bin.min;
                    let maxValue;
                    if (bin.max === "Infinity" || index === data.length - 1) {
                        return `${minValue}+`;
                    } else {
                        maxValue = typeof bin.max === 'number' ? (bin.max - 1).toFixed(2) : bin.max;
                        return `${minValue} - ${maxValue}`;
                    }
                }),
                title: {
                    text: 'Bins'
                }
            },
            yaxis: {
                title: {
                    text: 'Count'
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

        return <Chart options={options} series={series} type="bar" height={350} />;
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
                                                {data.kpi === 'Token Usage Distribution' ? (
                                                    <>
                                                        {renderHistogram({kpi: 'Tokens In Distribution', data: data.data.tokensInDistribution})}
                                                        {renderHistogram({kpi: 'Tokens Out Distribution', data: data.data.tokensOutDistribution})}
                                                        {renderHistogram({kpi: 'Total Tokens Distribution', data: data.data.totalTokensDistribution})}
                                                    </>
                                                ) : data.kpi.includes('Distribution') ? renderHistogram(data) : renderChart(data)}
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