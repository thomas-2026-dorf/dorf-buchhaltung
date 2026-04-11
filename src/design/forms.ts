export const formStyles = {
    label: {
        fontSize: 12,
        opacity: 0.9,
        color: "#475569",
    },

    field: {
        display: "flex",
        flexDirection: "column" as const,
        gap: 6,
        marginTop: 10,
    },

    input: {
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #D7E0EA",
        background: "#FFFFFF",
        color: "#1E293B",
    },

    select: {
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #D7E0EA",
        background: "#FFFFFF",
        color: "#1E293B",
        minWidth: 180,
    },

    textarea: {
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #D7E0EA",
        background: "#FFFFFF",
        color: "#1E293B",
        minHeight: 90,
        resize: "vertical" as const,
    },

    small: {
        fontSize: 12,
        opacity: 0.9,
        color: "#64748B",
    },

    error: {
        marginTop: 8,
        fontSize: 12,
        color: "#B91C1C",
    },
};