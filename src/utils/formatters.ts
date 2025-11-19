export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export const formatDateForDisplay = (dateString?: string): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // The date string from AI is 'YYYY-MM-DD'. Appending T00:00:00 ensures it's parsed in the local timezone.
    const targetDate = dateString ? new Date(dateString + 'T00:00:00') : today;
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
