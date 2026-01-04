import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function ItemStatusPieChart({ items }) {
    const { t } = useTranslation();

    const signature = useMemo(() => {
        const arr = items || [];
        let solved = 0;
        const ids = [];
        for (const it of arr) {
            if (it?.resolved) solved += 1;
            ids.push(it?.id);
        }
        return `${arr.length}:${solved}:${ids.join(",")}`;
    }, [items]);

    const data = useMemo(() => {
        const arr = items || [];
        const solved = arr.filter((i) => i.resolved).length;
        const unsolved = arr.length - solved;
        return [
            { name: t("overview.resolved"), value: solved },
            { name: t("overview.unresolved"), value: unsolved },
        ];
    }, [signature, t]);

    const hasAny = (items || []).length > 0;

    return (
        <div className="panel">
            <h3 className="panelTitle">{t("detail.statsTitle")}</h3>

            {!hasAny ? (
                <div className="muted">{t("items.empty")}</div>
            ) : (
                <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                                <Cell fill="var(--chart-1)" />
                                <Cell fill="var(--chart-2)" />
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
