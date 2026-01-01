import { ReactNode } from 'react';

interface DashboardCardProps {
    title: string;
    subtitle: string;
    icon: ReactNode;
    color: string;
}

export default function DashboardCard({ title, subtitle, icon, color }: DashboardCardProps) {
    return (
        <div className="card">
            <div
                className="card-icon-wrapper"
                style={{ backgroundColor: color }}
            >
                <div style={{ color: 'white' }}>
                    {icon}
                </div>
            </div>
            <h3 className="card-title">{title}</h3>
            <p className="card-subtitle">{subtitle}</p>
        </div>
    );
}
