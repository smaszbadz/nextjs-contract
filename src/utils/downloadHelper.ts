import { downloadFile, downloadFile_Amendment, downloadFile_Detail, downloadFile_Related } from "@/lib/api";

// utils/downloadHelper.ts
export const handleDownloadFile = async (contractType: string, id?: string, fileName?: string) => {
    try {
        const fileData = await downloadFile(contractType, id, fileName);

        // แปลง base64 เป็น Blob
        const byteCharacters = atob(fileData.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: fileData.contentType });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileData.filename;
        document.body.appendChild(link);
        link.click();

        // ทำความสะอาด
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download error:', error);
        // จัดการ error
    }
};

// utils/downloadHelper.ts
export const handleDownloadFile_Amendment = async (contractType: string, contractNo?: string, detailId?: string, fileName?: string) => {
    try {

        const fileData = await downloadFile_Amendment(contractType, contractNo, detailId, fileName);

        // แปลง base64 เป็น Blob
        const byteCharacters = atob(fileData.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: fileData.contentType });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileData.filename;
        document.body.appendChild(link);
        link.click();

        // ทำความสะอาด
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download error:', error);
        // จัดการ error
    }
};


export const handleDownloadFile_Related = async (contractType: string, contractNo?: string, detailId?: string, fileName?: string) => {
    try {

        const fileData = await downloadFile_Related(contractType, contractNo, detailId, fileName);

        // แปลง base64 เป็น Blob
        const byteCharacters = atob(fileData.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: fileData.contentType });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileData.filename;
        document.body.appendChild(link);
        link.click();

        // ทำความสะอาด
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download error:', error);
        // จัดการ error
    }
};

export const handleDownloadFile_Detail = async (contractNo?: string, fileName?: string) => {
    try {
        const fileData = await downloadFile_Detail(contractNo, fileName);

        // แปลง base64 เป็น Blob
        const byteCharacters = atob(fileData.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: fileData.contentType });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileData.filename;
        document.body.appendChild(link);
        link.click();

        // ทำความสะอาด
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download error:', error);
        // จัดการ error
    }
};