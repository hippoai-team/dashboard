import React from "react";
import Chart from "react-apexcharts";
import { Card, CardContent, CardHeader } from "@mui/material";


const ChartGraph = (props) => {
    const { series, labels, title } = props;

return (

<Card sx={'sm'}>
<CardHeader title={title} />
<CardContent>
            <Chart
              options={{
                chart: {
                  id: "basic-bar",
                },
                labels: labels,
              }}
              series={series}
              type="donut"
              width="380"
              >

            </Chart>
            </CardContent>
            </Card>
);
}

export default ChartGraph;
