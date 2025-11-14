import { Amendment } from "./amendment";
import { Lease_Detail } from "./lease_detail";
import { Related } from "./related";

export type Lease = {
    id?: string;
    contractNo: string;
    baseNo: string;
    contractName: string;
    status: string;
    lessorEN: string;
    lessorTH: string;
    refNo: string;
    attachmentType: string;

    usage: string;
    branch: string;
    startDate: Date | null;
    endDate: Date | null;

    durationYear: string;
    durationMonth: string;
    durationDay: string;

    category: string;
    formulaType: string;

    quantity: number | null;

    area_Size: number | null;
    area_Unit: string;

    priceType: string;
    price: number | null;
    pricingPeriod: string;

    rentalFee: number | null;

    address: string;

    renewal: string;
    notify: string;
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
    related_Contracts?: Related[];

    details: Lease_Detail[];

    oldId: string;
    isRenewed: boolean
};

