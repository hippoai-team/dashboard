import React from "react";
import Chart from "react-apexcharts";
import { Card, CardContent, CardHeader } from "@mui/material";


const ChartGraph = (props) => {
    const { series, labels, title, options, type, width, height } = props;
return (

<Card sx={'sm'}>
<CardHeader title={title} sx={{backgroundColor: '#3f51b5', color: '#fff'}}/>
<CardContent>
            <Chart
              options= {options}
              series={series}
              type={type}
              width={width}
                height={height}
                labels={labels}
              >

            </Chart>
            </CardContent>
            </Card>
);
}

export default ChartGraph;