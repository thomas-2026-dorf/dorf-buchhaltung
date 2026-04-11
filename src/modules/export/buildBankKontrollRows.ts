import { formatBankAmount } from "./exportFormatters";

type BookingLike = {
  bookingKey: string;
  datum?: string;
  betrag: number;
  verwendungszweck?: string;
};

type ViewLike = {
  bookingKey?: string;
  belegId?: string;
  status?: string;
  fewo?: string;
  konto?: string;
  bemerkung?: string;
  lieferant?: string;
  pfad?: string;
  splitAssignments?: Array<{
    belegId: string;
    betrag?: string;
  }>;
};

export function buildBankKontrollRows(
  bookings: BookingLike[],
  views: ViewLike[],
  baseFolder: string
) {
  return bookings.map((booking) => {
    const view = views.find(
      (entry) => entry.bookingKey === booking.bookingKey
    );

    const splitBelegeText = (view?.splitAssignments || [])
      .map((item) =>
        item.betrag?.trim()
          ? `${item.belegId} (${item.betrag})`
          : item.belegId
      )
      .join(" | ");

    const pdfPath = String(view?.pfad || "").trim()
      ? `${baseFolder}/Export-STB/Belege/${String(view?.pfad || "")
          .split("/")
          .pop() || ""}`
      : "";

    return {
      datum: booking.datum || "",
      belegId: view?.belegId || "",
      verwendungszweck: booking.verwendungszweck || "",
      betrag: formatBankAmount(booking.betrag),
      status: view?.status || "offen",
      fewo: view?.fewo || "",
      konto: view?.konto || "",
      splitBelege: splitBelegeText,
      bemerkung: view?.bemerkung || "",
      lieferant: view?.lieferant || "",
      pdfPath,
    };
  });
}
