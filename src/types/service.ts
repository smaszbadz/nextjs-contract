import { Amendment } from "./amendment";
import { Related } from "./related";

export type Service = {
    id?: string;
    contractNo: string;
    baseNo: string;
    contractName: string;
    status: string;
    contractorEN: string;
    contractorTH: string;
    country: string;
    refNo: string;
    attachmentType: string;
    type: string;

    startDate: Date | null;
    endDate: Date | null;

    durationYear: string;
    durationMonth: string;
    durationDay: string;

    content: string;
    renewal: string;
    notify: string;
    stamped: string;
    note: string;

    pic_ID1: string;
    pic_Name1: string | undefined;
    pic_Email1: string;

    pic_ID2: string;
    pic_Name2: string | undefined;
    pic_Email2: string;

    createdID: string;
    createdBy: string;
    createdAt: Date | null;
    createdEmail: string;

    updatedID: string;
    updatedBy: string;
    updatedAt: Date | null;
    updatedEmail: string;

    uploadedID: string;
    uploadedBy: string;
    uploadedAt: Date | null;
    uploadedEmail: string;

    fileName: string;

    file?: File;

    amendments?: Amendment[]; // 👈 เพิ่มตรงนี้

    related_Contracts?: Related[]; // 👈 เพิ่มตรงนี้

    oldId: string;
    isRenewed: boolean
};

