type JahresdateiLike = {
    belege?: Array<{ id?: string }>
    updatedAt?: string
    [key: string]: unknown
}

export function buildJahresdateiAfterBelegReset<T extends JahresdateiLike>(
    data: T,
    _belegId: string
): T {
    return {
        ...data,
        updatedAt: new Date().toISOString(),
    }
}
