// types/jspdf-font.d.ts

import "jspdf";

declare module "jspdf" {
    interface jsPDF {
        addFileToVFS(fileName: string, fileData: string): void;
        addFont(postScriptName: string, fontName: string, fontStyle: string): void;
    }
}
