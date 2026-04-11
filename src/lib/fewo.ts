export type FewoType = 'Tina' | 'Tinchen' | 'Harmony' | 'RS' | 'Privat';

export function normalizeFewo(input: string | undefined | null): FewoType | '' {
    const value = String(input ?? '').trim().toLowerCase();

    if (value.includes('tinchen')) return 'Tinchen';
    if (value.includes('tina')) return 'Tina';
    if (value.includes('harmony')) return 'Harmony';
    if (value === 'rs' || value.includes('vermietung rs')) return 'RS';
    if (value.includes('privat')) return 'Privat';

    return '';
}