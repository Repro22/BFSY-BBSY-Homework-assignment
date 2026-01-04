import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

export default function ListsItemsBarChart({ lists }) {
    const { t } = useTranslation();

    const data = useMemo(() => {
        const maxLabelLength = lists.length > 6 ? 10 : 14;

        return (lists || []).map((l) => {
            const unresolved = l.unresolvedItemsCount ?? 0;
            const total = l.itemsCount ?? 0;
            const resolved = Math.max(0, total - unresolved);

            return {
                name:
                    l.name.length > maxLabelLength
                        ? `${l.name.slice(0, maxLabelLength)}…`
                        : l.name,
                resolved,
                unresolved,
                total,
                _fullName: l.name,
            };
        });
    }, [lists]);

    if (!data.length) return null;

    return (
        <div className="panel" style={{ marginTop: 12 }}>
            <h3 className="panelTitle">{t("overview.chartTitle")}</h3>
            <div style={{ width: "100%", height: 280, margin:"auto" }}>
                <ResponsiveContainer>
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 16, left: 0, bottom: 40 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                            dataKey="name"
                            interval="preserveStartEnd"
                            angle={0}
                            textAnchor="middle"
                            height={60}
                        />

                        <YAxis allowDecimals={false} />
                        <Tooltip
                            labelFormatter={(_label, payload) => payload?.[0]?.payload?._fullName || _label}
                            content={({ active, payload, label }) => {
                                if (!active || !payload || !payload.length) return null;

                                const row = payload[0].payload; // your data object
                                const resolved = row.resolved ?? 0;
                                const unresolved = row.unresolved ?? 0;
                                const total = row.total ?? resolved + unresolved;

                                return (
                                    <div
                                        style={{
                                            background: "var(--card)",
                                            border: "1px solid var(--border)",
                                            borderRadius: 8,
                                            padding: 10,
                                            boxShadow: "var(--shadow)",
                                            color: "var(--text)",
                                            fontSize: 13,
                                        }}
                                    >
                                        <div style={{ fontWeight: 600, marginBottom: 6 }}>
                                            {row._fullName || label}
                                        </div>

                                        <div>{t("overview.totalItems")}: {total}</div>
                                        <div>{t("overview.resolved")}: {resolved}</div>
                                        <div>{t("overview.unresolved")}: {unresolved}</div>
                                    </div>
                                );
                            }}
                        />
                        <Legend
                            formatter={(value) => {
                                const labelMap = {
                                    resolved: t("overview.resolved"),
                                    unresolved: t("overview.unresolved"),
                                };
                                return labelMap[value] || value;
                            }}
                        />
                        <Bar dataKey="resolved" stackId="a" fill="var(--chart-1)" />
                        <Bar dataKey="unresolved" stackId="a" fill="var(--chart-2)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
