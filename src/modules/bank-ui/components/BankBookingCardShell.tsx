import type { ReactNode } from "react"

type ViewLike = {
    bookingKey: string
    status: string
}

type Props = {
    view: ViewLike
    currentBelegId: string
    isSaved: boolean
    onOpen: () => void
    children: ReactNode
}

export default function BankBookingCardShell({
    view,
    currentBelegId,
    isSaved,
    onOpen,
    children,
}: Props) {
    return (
        <div
            key={view.bookingKey}
            onClick={onOpen}
            style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 12,
                display: "grid",
                gap: 8,
                cursor: "pointer",
                background:
                    view.status === "vermerkt"
                        ? "#EFF6FF"
                        : !currentBelegId
                            ? "#fff4f4"
                            : isSaved
                                ? "#f4fff4"
                                : "#fff8e6",
            }}
        >
            {children}
        </div>
    )
}