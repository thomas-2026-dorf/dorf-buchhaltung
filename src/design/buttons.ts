import { colors } from "./colors";

export const primaryButton = {
    background: colors.primary,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(31,95,168,0.18)",
};

export const secondaryButton = {
    background: "#fff",
    color: colors.primary,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
};

export const warningButton = {
    background: colors.warning,
    color: "#fff",
    border: "1px solid #92400e",
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
};

export const buttonFullWidth = {
    width: "100%",
    justifyContent: "center" as const,
};

export const buttonDisabled = {
    opacity: 0.5,
};