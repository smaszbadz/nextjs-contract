
export type Amendment = {
    id: string;
    amendmentNo: string;
    content: string;
    uploadedID: string;
    uploadedBy: string;
    uploadedAt: Date | null;
    uploadedEmail: string;
    fileName: string;
    file?: File;
};
