type Variant = 'RFC3548' | 'RFC4648' | 'RFC4648-HEX' | 'Crockford'
declare function base32Encode(buffer: ArrayBuffer, variant: Variant): string
export = base32Encode
