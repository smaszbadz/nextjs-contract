import { Amendment } from "./amendment";
import { Insurance_Detail } from "./insurance_detail";

export type Insurance = {
    id?: string;
    contractNo: string;
    baseNo: string;
    contractName: string;
    status: string;
    companyEN: string;
    companyTH: string;
    insuredName: string;
    refNo: string;
    attachmentType: string;

    code: string;
    branch: string;
    startDate: Date | null;
    endDate: Date | null;

    durationYear: string;
    durationMonth: string;
    durationDay: string;

    premise: string;

    amount: number | null;
    premiumRate: number | null;
    net: number | null;
    stampDuty: number | null;
    vat: number | null;
    total: number | null;

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

    fileDetails: Insurance_Detail[];

    oldId: string;
    isRenewed: boolean
};

