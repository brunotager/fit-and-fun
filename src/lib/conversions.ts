export const convertWeight = (currentVal: string, toUnit: 'lbs' | 'kg'): string => {
    const val = Number(currentVal);
    if (!val || isNaN(val)) return '';
    if (toUnit === 'kg') return String(Math.round(val * 0.453592));
    return String(Math.round(val * 2.20462));
};

export const convertHeight = (primaryStr: string | number, secondaryStr: string | number, toUnit: 'ft/in' | 'm/cm'): { primary: string, secondary: string } => {
    const p = Number(primaryStr) || 0;
    const s = Number(secondaryStr) || 0;
    if (p === 0 && s === 0) return { primary: '', secondary: '' };

    if (toUnit === 'm/cm') {
        const totalInches = (p * 12) + s;
        const totalCm = Math.round(totalInches * 2.54);
        return { primary: String(Math.floor(totalCm / 100)), secondary: String(totalCm % 100) };
    } else {
        const totalCm = (p * 100) + s;
        const totalInches = Math.round(totalCm / 2.54);
        return { primary: String(Math.floor(totalInches / 12)), secondary: String(totalInches % 12) };
    }
};
