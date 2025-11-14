
export type Related = {
    id: string;
    relatedNo: string;
    content: string;
    uploadedID: string;
    uploadedBy: string;
    uploadedAt: Date | null;
    uploadedEmail: string;
    fileName: string;
    file?: File;
};
