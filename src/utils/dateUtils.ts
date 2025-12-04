
export function formatDate(dateInput: string | Date | undefined): string {
    if (!dateInput) return '-';
    const d = new Date(dateInput);
    
    // التأكد من صحة التاريخ
    if (isNaN(d.getTime())) return '-';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
}

export function formatTime(dateInput: string | Date | undefined): string {
    if (!dateInput) return '-';
    const d = new Date(dateInput);

    // التأكد من صحة التاريخ
    if (isNaN(d.getTime())) return '-';

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const isPM = hours >= 12;
    const suffix = isPM ? 'م' : 'ص';
    
    hours = hours % 12;
    if (hours === 0) hours = 12; // الساعة 0 تعني 12

    // إضافة صفر في اليسار للساعات الفردية (اختياري، لكن أجمل)
    const hStr = String(hours).padStart(2, '0');
    
    return `${hStr}:${minutes} ${suffix}`;
}

export function formatDateTime(dateInput: string | Date | undefined): string {
    if (!dateInput) return '-';
    return `${formatDate(dateInput)} - ${formatTime(dateInput)}`;
}
