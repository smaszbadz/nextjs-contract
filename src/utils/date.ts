export function formatDate(
    date: Date | string | null | undefined,
    includeTime = false
): string {
    if (!date) return "-";

    const dateObj = date instanceof Date ? date : new Date(date);

    // แปลงเป็นเวลาของ Bangkok
    const bangkokDate = new Date(dateObj.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = bangkokDate.getDate().toString().padStart(2, "0");
    const month = months[bangkokDate.getMonth()];
    const year = bangkokDate.getFullYear();

    let result = `${day} ${month} ${year}`;

    if (includeTime) {
        const hours = bangkokDate.getHours().toString().padStart(2, "0");
        const minutes = bangkokDate.getMinutes().toString().padStart(2, "0");
        result += ` ${hours}:${minutes}`;
    }

    return result;
}
