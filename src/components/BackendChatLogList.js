import React, { useEffect, useState } from 'react';

const BackendChatLogList = () => {
    const [chatLogs, setChatLogs] = useState([]);

    useEffect(() => {
        fetch(process.env.REACT_APP_NODE_API_URL + '/api/backendchatlogs')
            .then(response => response.json())
            .then(data => setChatLogs(data));
    }, []);

    return (
        <div>
            {chatLogs.map((log, index) => (
                <div key={index}>
                    {/* Display log details here */}
                </div>
            ))}
        </div>
    );
};

export default BackendChatLogList;