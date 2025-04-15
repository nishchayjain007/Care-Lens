"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Day 1', vitals: 4000, alerts: 2400, amt: 2400 },
    { name: 'Day 2', vitals: 3000, alerts: 1398, amt: 2210 },
    { name: 'Day 3', vitals: 2000, alerts: 9800, amt: 2290 },
    { name: 'Day 4', vitals: 2780, alerts: 3908, amt: 2000 },
    { name: 'Day 5', vitals: 1890, alerts: 4800, amt: 2181 },
    { name: 'Day 6', vitals: 2390, alerts: 3800, amt: 2500 },
    { name: 'Day 7', vitals: 3490, alerts: 4300, amt: 2100 },
];

const Dashboard = () => {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Real-time Vitals &amp; Alerts</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="vitals" barSize={20} fill="hsl(var(--chart-1))" />
                        <Bar dataKey="alerts" barSize={20} fill="hsl(var(--chart-2))" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default Dashboard;
