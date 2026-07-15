import { useEffect, useState } from "react";
import axios from "axios";

import { clearAuditLogs } from "../api/authApi";

import "../pages/auth/styles/AuditLogs.css"

const AuditLogs = () => {

    const [logs, setLogs] = useState([]);

    useEffect(() => {

        loadLogs();

    }, []);

    const handleClear = async () => {

    const confirmDelete = window.confirm(
        "Are you sure you want to clear all audit logs?"
    );

    if (!confirmDelete) return;

    await clearAuditLogs();

    loadLogs();

};

    const loadLogs = async () => {

        const token = localStorage.getItem("access_token");

        const res = await axios.get(
            "http://127.0.0.1:8000/audit/",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        setLogs(res.data);

    };

    return (

        <div className="page">

            <h2></h2>

            <div className="audit-header">

                <h2>Audit Logs</h2>

                <button
                    className="clear-btn"
                    onClick={handleClear}
                >
                    Clear Logs
                </button>

            </div>

            <table>

                <thead>

                    <tr>
                        <th>Company</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>IP Address</th>
                        <th>Browser</th>
                        <th>Timestamp</th>
                    </tr>

                </thead>

                <tbody>

                    {logs.map((log: any) => (

                        <tr key={log.id}>

                            <td>{log.company}</td>

                            <td>{log.user}</td>

                            <td>{log.action}</td>

                            <td>{log.ip_address}</td>

                            <td>{log.browser}</td>

                            <td>{log.timestamp}</td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

};

export default AuditLogs;