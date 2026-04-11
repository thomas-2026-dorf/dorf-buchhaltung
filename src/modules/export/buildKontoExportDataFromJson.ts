import type {
  BankBooking,
  SlimAssignmentMap,
} from "../bank-ui/types/bankSlimTypes";

type JsonData = {
  bookings?: any[];
  assignments?: Record<string, any>;
};

export function buildKontoExportDataFromJson(file: JsonData) {
  const bookings = Array.isArray(file.bookings) ? file.bookings : [];
  const assignments =
    file.assignments && typeof file.assignments === "object"
      ? file.assignments
      : {};

  const monatBookings: BankBooking[] = [];
  const monatAssignmentMap: SlimAssignmentMap = {};
  const exportBookings: BankBooking[] = [];
  const exportAssignmentMap: SlimAssignmentMap = {};

  for (const booking of bookings) {
    if (!booking?.bookingKey) continue;

    const mappedBooking: BankBooking = {
      bookingKey: booking.bookingKey,
      datum: typeof booking.datum === "string" ? booking.datum : "",
      betrag: typeof booking.betrag === "number" ? booking.betrag : 0,
      verwendungszweck:
        typeof booking.verwendungszweck === "string"
          ? booking.verwendungszweck
          : "",
    };

    monatBookings.push(mappedBooking);
    exportBookings.push(mappedBooking);

    const assignment = assignments[mappedBooking.bookingKey];

    const belegId =
      assignment &&
      typeof assignment === "object" &&
      "belegId" in assignment &&
      typeof assignment.belegId === "string"
        ? assignment.belegId
        : "";

    const bemerkung =
      assignment &&
      typeof assignment === "object" &&
      "bemerkung" in assignment &&
      typeof assignment.bemerkung === "string"
        ? assignment.bemerkung
        : "";

    monatAssignmentMap[mappedBooking.bookingKey] = {
      belegId,
      bemerkung,
    };

    exportAssignmentMap[mappedBooking.bookingKey] = {
      belegId,
      bemerkung,
    };
  }

  return {
    monatBookings,
    monatAssignmentMap,
    exportBookings,
    exportAssignmentMap,
  };
}
