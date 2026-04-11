type Props = {
  activeTab: string;
  belegHeaderExtra?: React.ReactNode;
};

export default function ActiveTabHeader({ activeTab, belegHeaderExtra }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 10,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {activeTab}
      </div>

      {belegHeaderExtra && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 0,
            flex: 1,
            overflow: "hidden",
          }}
        >
          {belegHeaderExtra}
        </div>
      )}
    </div>
  );
}
