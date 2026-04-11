import type React from "react";

export const appStyles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#F3F6FA",
    overflow: "hidden",
  },

  header: {
    padding: "12px 16px 10px 16px",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    background: "white",
    boxSizing: "border-box",
    flexShrink: 0,
  },

  title: {
    fontSize: 18,
    fontWeight: 800,
  },

  subtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },

  rightHeader: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },

  selectWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },

  body: {
    flex: 1,
    display: "flex",
    gap: 12,
    padding: 12,
    minHeight: 0,
    overflow: "hidden",
    boxSizing: "border-box",
  },

  sidebar: {
    width: 92,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: 12,
    background: "white",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.08)",
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    width: "100%",
    minHeight: 0,
    overflow: "auto",
  },

  split: {
    display: "grid",
    gridTemplateColumns:
      "minmax(260px, 30fr) minmax(220px, 22fr) minmax(320px, 48fr)",
    gap: 14,
    alignItems: "stretch",
    marginTop: 12,
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },

  left: {
    minWidth: 0,
    width: "100%",
  },

  right: {
    minWidth: 0,
    width: "100%",
    height: "100%",
    minHeight: 0,
    overflowY: "auto",
  },

  mono: {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 12,
  },

  list: {
    marginTop: 10,
    paddingLeft: 18,
  },
};