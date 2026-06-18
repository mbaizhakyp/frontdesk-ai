/**
 * Booking via Cal.com. STUBBED for the demo — returns sample slots and echoes
 * bookings. Wire to the Cal.com API (or a PMS) before a real client.
 * Docs: https://cal.com/docs/api-reference
 */
export interface Slot {
  iso: string;
  label: string;
}

export async function checkAvailability(_slug: string): Promise<Slot[]> {
  // TODO: call Cal.com GET /slots with CALCOM_API_KEY + event type.
  const now = new Date();
  const mk = (addDays: number, hour: number): Slot => {
    const d = new Date(now);
    d.setDate(d.getDate() + addDays);
    d.setHours(hour, 0, 0, 0);
    return {
      iso: d.toISOString(),
      label: d.toLocaleString("en-US", {
        weekday: "long",
        hour: "numeric",
        minute: "2-digit",
      }),
    };
  };
  return [mk(1, 10), mk(1, 14), mk(2, 9)];
}

export async function createBooking(opts: {
  slug: string;
  name: string;
  phone: string;
  iso: string;
  service?: string;
}): Promise<{ ok: boolean }> {
  // TODO: call Cal.com POST /bookings with CALCOM_API_KEY.
  console.log("[calcom] (stub) booking", opts);
  return { ok: true };
}
