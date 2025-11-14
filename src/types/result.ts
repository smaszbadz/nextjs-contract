// types.ts
export type Result = {
    success: boolean;
    message: string;
    id?: string; // มีเฉพาะตอน success เท่านั้น
};
