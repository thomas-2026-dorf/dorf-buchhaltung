type Props = {
    assignments: unknown
}

export default function BankAssignmentsDebug({ assignments }: Props) {
    return (
        <div
            style={{
                padding: 16,
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                background: "#FFFFFF",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                display: "grid",
                gap: 12,
            }}
        >
            {JSON.stringify(assignments, null, 2)}
        </div>
    )
}