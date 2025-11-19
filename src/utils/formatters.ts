export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export const formatDateForDisplay = (dateString?: string): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // The date string from AI is 'YYYY-MM-DD'. Appending T12:00:00 ensures it's parsed correctly in any local timezone.
    const targetDate = dateString ? new Date(dateString + 'T12:00:00') : today;
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === -1) return 'Hôm qua';
    if (diffDays === 1) return 'Ngày mai';

    return new Intl.DateTimeFormat('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    }).format(targetDate);
};

/**
 * Returns the user's local date as a 'YYYY-MM-DD' string.
 * This correctly handles the timezone offset, so a user in GMT+7 at 2 AM
 * will get the correct local day, not the previous day which might still be UTC time.
 * @param date Optional date object. Defaults to now.
 * @returns The local date string in YYYY-MM-DD format.
 */
export const getLocalDateAsString = (date: Date = new Date()): string => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};
