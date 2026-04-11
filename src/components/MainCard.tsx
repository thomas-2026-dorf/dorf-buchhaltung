import type { ReactNode } from "react";
import { cardStyle } from "../design/styles";

type Props = {
  children: ReactNode;
};

export default function MainCard({ children }: Props) {
  return (
    <div
      style={{
        ...cardStyle,
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        overflowX: "hidden",
        boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
      }}
    >
      {children}
    </div>
  );
}
