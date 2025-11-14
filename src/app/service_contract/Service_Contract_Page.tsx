'use client'

import '@ant-design/v5-patch-for-react-19';
import { Service } from '@/types/service';
import { Eye, Plus, Copy, RefreshCw, FileText, ChevronDown, ChevronUp, EllipsisVertical, ScrollText, CircleX, FileStack } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox, Table, Dropdown } from 'antd';
import type { CheckboxOptionType, TableColumnsType, MenuProps } from 'antd';
import { DatePicker, TablePaginationConfig } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import 'antd/dist/reset.css';
import { Master } from '@/types/master';
import { User } from '@/types/user';
import { FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons';
import { handleDownloadFile } from '@/utils/downloadHelper';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf'
import { autoTable, CellHookData } from 'jspdf-autotable'
// นำเข้าไฟล์ฟอนต์
import '@/fonts/THSarabunNew.js';
import '@/fonts/THSarabunNewBold.js';
import Link from 'next/link';


type Props = {
    userRole: string | null,
    permission: string | null,
    services: Service[];
    core_Renewal_Masters: Master[];
    core_Notify_Masters: Master[];
    core_Status_Masters: Master[];
    core_PIC_Masters: User[];
    service_Type_Masters: Master[];
};

// Change DataType to Service to use actual data
type DataType = Service;

const formatDate = (dateString: string) => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
};

// กำหนด type ที่ชัดเจนให้กับ raw data
interface RawData {
    [index: number]: string;
}

// Function to handle Action button clicks
const handleActionClick = (action: string, record: Service) => {
    switch (action) {
        case 'copy':
            console.log(`Copying contract: ${record.contractNo}`);
            // Implement copy logic here
            window.location.href = `/service_contract/action/${record.id}/copy`;
            break;
        case 'renew':
            console.log(`Renewing contract: ${record.contractNo}`);
            // Implement renew logic here  
            window.location.href = `/service_contract/action/${record.id}/renew`;
            break;
        case 'amendment':
            console.log(`Adding amendment to contract: ${record.contractNo}`);
            // Implement amendment logic here
            window.location.href = `/service_contract/amendment/${record.id}`;
            break;
        case 'related':
            console.log(`Adding related to contract: ${record.contractNo}`);
            // Implement related logic here
            window.location.href = `/service_contract/related/${record.id}`;
            break;
    }
};

// แปลง columns จาก constant เป็น function ที่รับ userID และ userRole
const getColumns = (userRole: string | null, permission: string | null): TableColumnsType<DataType> => [
    {
        title: 'Action',
        key: 'actions',
        width: '1%',
        className: 'thead-align-center align-top text-center',
        render: (_, record) => {
            const items: MenuProps['items'] = [
                ...((userRole === 'ADMIN' || permission === 'Full Access') ? [{
                    key: '1',
                    label: 'Copy',
                    icon: <Copy size={16} className="text-mint-500 hover:text-mint-600" />,
                    onClick: () => handleActionClick('copy', record),
                }] : []),
                ...((!record.isRenewed && (userRole == 'ADMIN' || permission === 'Full Access')) ? [{
                    key: '2',
                    label: 'Renewal',
                    icon: <RefreshCw size={16} className="text-mint-500 hover:text-mint-600" />,
                    onClick: () => handleActionClick('renew', record),
                }] : []),
                ...(((record.status === 'Contract active / สัญญาถูกใช้งาน' || record.status === 'Contract is automatically activated / สัญญาถูกใช้งานอัตโนมัติ') && (userRole == 'ADMIN' || permission === 'Full Access')) ? [
                    {
                        key: '3',
                        label: 'Amendment',
                        icon: <ScrollText size={16} className="text-mint-500 hover:text-mint-600" />,
                        onClick: () => handleActionClick('amendment', record),
                    }
                ] : []),
                ...(((record.status === 'Contract active / สัญญาถูกใช้งาน' || record.status === 'Contract is automatically activated / สัญญาถูกใช้งานอัตโนมัติ') && (userRole == 'ADMIN' || permission === 'Full Access')) ? [
                    {
                        key: '4',
                        label: 'Related Contracts',
                        icon: <FileStack size={16} className="text-mint-500 hover:text-mint-600" />,
                        onClick: () => handleActionClick('related', record),
                    }
                ] : []),
            ];

            return (
                <Dropdown
                    menu={{ items }}
                    placement="bottom"
                    trigger={['click']}
                >
                    <button className="text-gray-600 hover:text-gray-700 cursor-pointer">
                        <EllipsisVertical size={18} />
                    </button>
                </Dropdown>
            );
        },
        rowSpan: 2
    },
    {
        title: 'View',
        key: 'view',
        width: '1%',
        className: 'thead-align-center align-top text-center',
        render: (_, record) => (
            <div className="flex justify-center">
                <a href={`/service_contract/view/${record.id}`} className="text-mint-500 hover:text-mint-600" title="View">
                    <Eye size={18} />
                </a>
            </div>
        ),
        rowSpan: 2
    },
    {
        title: 'File',
        key: 'file',
        width: '1%',
        className: 'thead-align-center align-top text-center',
        render: (_, record) => (
            record.fileName ? (
                <div className="flex justify-center">
                    <span className="text-biscuit-500 hover:text-biscuit-600 cursor-pointer" title="File"
                        onClick={() => handleDownloadFile('Service Contract', record.id, record.fileName)}>
                        <FileText size={18} />
                    </span>
                </div>
            ) : null // ไม่แสดงอะไรหาก fileName เป็นค่าว่าง
        ),
        rowSpan: 2
    },
    {
        title: 'Contract Name',
        dataIndex: 'contractName',
        key: 'contractName',
        rowSpan: 2,
        className: 'thead-align-center text-nowrap align-top',
        sorter: (a, b) => a.contractName.length - b.contractName.length,
    },
    {
        title: 'Contract No.',
        dataIndex: 'contractNo',
        key: 'contractNo',
        rowSpan: 2,
        className: 'thead-align-center text-nowrap align-top',
        sorter: (a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0); // Use a default date (e.g., 1970-01-01) if null
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0); // Same for the other date
            return dateA.getTime() - dateB.getTime(); // Compare timestamps
        },
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        rowSpan: 2,
        className: 'thead-align-center text-nowrap align-top',
        sorter: (a, b) => a.status.length - b.status.length,
    },
    {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        rowSpan: 2,
        className: 'thead-align-center text-nowrap align-top',
        sorter: (a, b) => a.type.length - b.type.length,
    },
    {
        title: 'Contractor (EN)',
        dataIndex: 'contractorEN',
        key: 'contractorEN',
        rowSpan: 2,
        className: 'thead-align-center text-nowrap align-top',
        sorter: (a, b) => a.contractorEN.length - b.contractorEN.length,
    },
    {
        title: 'Contractor (TH)',
        dataIndex: 'contractorTH',
        key: 'contractorTH',
        rowSpan: 2,
        className: 'thead-align-center text-nowrap align-top',
        sorter: (a, b) => a.contractorTH.length - b.contractorTH.length,
    },
    {
        title: 'Country',
        dataIndex: 'country',
        key: 'country',
        rowSpan: 2,
        className: 'thead-align-center text-nowrap align-top',
        sorter: (a, b) => a.country.length - b.country.length,
    },
    {
        title: 'Attachment',
        key: 'attachmentTypeGroup',
        rowSpan: 2,
        className: 'thead-align-center align-top text-center',
        sorter: (a, b) => a.contractorTH.length - b.contractorTH.length,
        render: (_, record) => {
            if (record.attachmentType === 'New Contract') {
                return <span className="badge-mint text-xs font-montserrat font-semibold">New</span>;
            } else if (record.attachmentType === 'Renewed') {
                return <span className="badge-biscuit text-xs font-montserrat font-semibold">Renewal</span>;
            } else if (record.attachmentType === 'Amendment') {
                return <span className="badge-sea text-xs font-montserrat font-semibold">Amendment</span>
            } else if (record.attachmentType === 'Related Contracts') {
                return <span className="badge-sea text-xs font-montserrat font-semibold">Related Contracts</span>
            } else {
                return null;
            }
        }
    },
    {
        title: 'Contract Period',
        key: 'contractPeriod',
        children: [
            {
                title: 'Start',
                dataIndex: 'startDate',
                key: 'startDate',
                align: 'center',
                className: 'text-nowrap align-top',
                sorter: (a, b) => {
                    const dateA = a.startDate ? new Date(a.startDate) : new Date(0); // Use a default date (e.g., 1970-01-01) if null
                    const dateB = b.startDate ? new Date(b.startDate) : new Date(0); // Same for the other date
                    return dateA.getTime() - dateB.getTime(); // Compare timestamps
                },
                render: (date) => formatDate(date)
            },
            {
                title: 'End',
                dataIndex: 'endDate',
                key: 'endDate',
                align: 'center',
                className: 'text-nowrap align-top',
                sorter: (a, b) => {
                    const dateA = a.endDate ? new Date(a.endDate) : new Date(0); // Use a default date (e.g., 1970-01-01) if null
                    const dateB = b.endDate ? new Date(b.endDate) : new Date(0); // Same for the other date
                    return dateA.getTime() - dateB.getTime(); // Compare timestamps
                },
                render: (date) => formatDate(date)
            },
            {
                title: 'Duration',
                key: 'durationYear',
                align: 'center',
                className: 'text-nowrap align-top',
                render: (_, record) => {
                    const years = `${record.durationYear}Y`
                    const months = `${record.durationMonth}M`
                    const days = `${record.durationDay}D`

                    // Join with spaces, filtering out empty strings
                    return [years, months, days].filter(Boolean).join(' ');
                }
            }
        ]
    },
    {
        title: 'Notice',
        key: 'notice',
        children: [
            {
                title: 'Contract Renewal',
                dataIndex: 'renewal',
                key: 'renewal',
                className: 'text-nowrap align-top',
                sorter: (a, b) => a.renewal.length - b.renewal.length,
            },
            {
                title: 'Notify Before Expire',
                dataIndex: 'notify',
                key: 'notify',
                className: 'text-nowrap align-top',
                sorter: (a, b) => a.notify.length - b.notify.length,
            }
        ]
    },
    {
        title: 'Stamped',
        dataIndex: 'stamped',
        key: 'stamped',
        rowSpan: 2,
        className: 'thead-align-center text-nowrap align-top',
        sorter: (a, b) => a.stamped.length - b.stamped.length,
    },
    {
        title: 'Note',
        dataIndex: 'note',
        key: 'note',
        rowSpan: 2,
        className: 'thead-align-center align-top',
        width: '15%',
        sorter: (a, b) => a.note.length - b.note.length,
    },
    {
        title: 'Person In Charge',
        key: 'pic',
        rowSpan: 2,
        className: 'thead-align-center text-nowrap align-top',
        sorter: (a, b) => (a.pic_Name1?.length || 0) - (b.pic_Name1?.length || 0),
        render: (_, record) => {
            const pic_1 = `${record.pic_Name1}`
            const pic_2 = `${record.pic_Name2}`
            if (pic_2) {
                return [pic_1, pic_2].join(', ');
            }
            return pic_1;
        }
    },
    {
        title: 'Created By',
        dataIndex: 'createdBy',
        key: 'createdBy',
        rowSpan: 2,
        className: 'thead-align-center text-nowrap align-top',
        sorter: (a, b) => a.createdBy.length - b.createdBy.length,
    },
    {
        title: 'Updated By',
        dataIndex: 'updatedBy',
        key: 'updatedBy',
        rowSpan: 2,
        className: 'thead-align-center text-nowrap align-top',
        sorter: (a, b) => a.updatedBy.length - b.updatedBy.length,
    },
];

function Service_Contract_Page({ userRole, permission, services, core_Renewal_Masters,
    core_Notify_Masters, core_Status_Masters, core_PIC_Masters, service_Type_Masters }: Props) {

    // State for tracking client-side rendering
    const [isClient, setIsClient] = useState(false);

    // สร้าง columns โดยส่ง userID และ userRole เข้าไป
    const columns = useMemo(() => getColumns(userRole, permission), [userRole, permission]);
    const [isOpen, setIsOpen] = useState(true);
    // คำนวณ defaultCheckedList จาก columns ที่สร้างใหม่
    const defaultCheckedList = useMemo(() =>
        columns
            .filter(({ key }) => key !== "actions" && key !== "view" && key !== "file")
            .map((item) => item.key as string),
        [columns]
    );

    // Column visibility state
    const [checkedList, setCheckedList] = useState<string[]>(defaultCheckedList);
    const initialFilters = {
        contractorEN: '',
        contractorTH: '',
        status: '',
        startDate: null as Date | null,
        endDate: null as Date | null,
        contractName: '',
        serviceType: '',
        attachmentType: '',
        pic: '',
        stamped: '',
        expiry: '',
        renewal: '',
        notify: '',
        contractNo: ''
    };
    // Form input states
    const [filters, setFilters] = useState(initialFilters);

    // New state for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Pagination options
    const PAGINATION_OPTIONS = [10, 20, 50, 100];

    // UseEffect to handle client-side initialization and localStorage
    useEffect(() => {
        // Mark as client-side
        setIsClient(true);

        // Restore column visibility
        const savedColumns = localStorage.getItem('serviceContractColumns');
        if (savedColumns) {
            try {
                const parsedColumns = JSON.parse(savedColumns);
                const validColumns = parsedColumns.filter((col: string) =>
                    defaultCheckedList.includes(col)
                );
                setCheckedList(validColumns.length > 0 ? validColumns : defaultCheckedList);
            } catch (error) {
                console.error('Error parsing saved columns', error);
            }

            // Restore other form states
            const restoreFormState = () => {
                setFilters(prev => ({ ...prev, contractorEN: localStorage.getItem('contractorEN') || '' }));
                setFilters(prev => ({ ...prev, contractorTH: localStorage.getItem('contractorTH') || '' }));
                setFilters(prev => ({ ...prev, status: localStorage.getItem('status') || '' }));
                setFilters(prev => ({ ...prev, contractName: localStorage.getItem('contractName') || '' }));
                setFilters(prev => ({ ...prev, attachmentType: localStorage.getItem('attachmentType') || '' }));
                setFilters(prev => ({ ...prev, pic: localStorage.getItem('pic') || '' }));
                setFilters(prev => ({ ...prev, stamped: localStorage.getItem('stamped') || '' }));
                setFilters(prev => ({ ...prev, expiry: localStorage.getItem('expiry') || '' }));
                setFilters(prev => ({ ...prev, renewal: localStorage.getItem('renewal') || '' }));
                setFilters(prev => ({ ...prev, notify: localStorage.getItem('notify') || '' }));
                setFilters(prev => ({ ...prev, contractNo: localStorage.getItem('contractNo') || '' }));

                const savedStartDate = localStorage.getItem('startDate');
                const savedEndDate = localStorage.getItem('endDate');

                setFilters(prev => ({ ...prev, startDate: savedStartDate ? new Date(savedStartDate) : null }));
                setFilters(prev => ({ ...prev, endDate: savedEndDate ? new Date(savedEndDate) : null }));

            };

            restoreFormState();
        }
    }, [defaultCheckedList]); // เพิ่ม defaultCheckedList เป็น dependency

    useEffect(() => {
        // Only run on client-side
        if (typeof window !== 'undefined') {
            // Attempt to restore from localStorage
            const savedPage = localStorage.getItem('serviceContractCurrentPage');
            const savedPageSize = localStorage.getItem('serviceContractPageSize');

            if (savedPage) {
                setCurrentPage(parseInt(savedPage, 10));
            }

            if (savedPageSize) {
                setPageSize(parseInt(savedPageSize, 10));
            }
        }
    }, []);

    useEffect(() => {
        // Only run on client-side
        if (!isClient) return;

        // Define a mapping of state keys to their values
        const stateToLocalStorage = {
            'serviceContractColumns': JSON.stringify(checkedList),
            'contractorEN': filters.contractorEN,
            'contractorTH': filters.contractorTH,
            'status': filters.status,
            'contractName': filters.contractName,
            'attachmentType': filters.attachmentType,
            'startDate': filters.startDate ? filters.startDate.toISOString() : '',
            'endDate': filters.endDate ? filters.endDate.toISOString() : '',
            'pic': filters.pic,
            'stamped': filters.stamped,
            'expiry': filters.expiry,
            'renewal': filters.renewal,
            'notify': filters.notify,
            'contractNo': filters.contractNo
        };

        // Iterate through the mapping and set localStorage
        Object.entries(stateToLocalStorage).forEach(([key, value]) => {
            try {
                localStorage.setItem(key, value);
            } catch (error) {
                console.error(`Error saving ${key} to localStorage`, error);
            }
        });
    }, [
        isClient,
        checkedList,
        filters
    ]);

    const filteredDataSource = useMemo(() => {
        return services?.filter(service => {

            // Contractor EN filter (case-insensitive, partial match)
            const matchContractorEN = !filters.contractorEN ||
                service.contractorEN.toLowerCase().includes(filters.contractorEN.toLowerCase());

            // Status filter
            const matchStatus = !status || service.status === status;

            // Contract Name filter (case-insensitive, partial match)
            const matchContractName = !filters.contractName ||
                service.contractName.toLowerCase().includes(filters.contractName.toLowerCase());

            // Start and End Date filter
            const matchDateRange = (!filters.startDate || !filters.endDate) ||
                (service.startDate && service.endDate &&
                    // Service starts before or on the end date
                    new Date(service.startDate) <= filters.endDate &&
                    // Service ends after or on the start date
                    new Date(service.endDate) >= filters.startDate
                );

            // Contractor TH filter
            const matchContractorTH = !filters.contractorTH ||
                service.contractorTH.toLowerCase().includes(filters.contractorTH.toLowerCase());

            // Attachment filter
            const matchAttachmentType = !filters.attachmentType ||
                service.attachmentType === filters.attachmentType;

            // PIC filter
            const matchPIC = !filters.pic || service.pic_ID1 === filters.pic || service.pic_ID2 === filters.pic;

            // Country filter
            // const matchCountry = !country ||
            //     service.country.toLowerCase().includes(country.toLowerCase());

            // Stamped filter
            const matchStamped = !filters.stamped || service.stamped === filters.stamped;

            // Service Type filter
            const matchServiceType = !filters.serviceType || service.type === filters.serviceType;

            const matchRenewal = !filters.renewal || service.renewal === filters.renewal;

            const matchNotify = !filters.notify || service.notify === filters.notify;

            const matchContractNo = !filters.contractNo ||
                service.contractNo.toLowerCase().includes(filters.contractNo.toLowerCase());

            // Expiry filter
            const matchExpiry = !filters.expiry || (
                (filters.expiry === 'Expires in 7 Days' &&
                    service.endDate &&
                    dayjs(service.endDate).diff(dayjs(), 'day') <= 7 &&
                    dayjs(service.endDate).diff(dayjs(), 'day') > 0
                ) ||
                (filters.expiry === 'Expired' &&
                    service.endDate &&
                    dayjs(service.endDate).isBefore(dayjs())
                )
            );

            // Combine all filters
            return matchContractorEN &&
                matchStatus &&
                matchContractName &&
                matchDateRange &&
                matchContractorTH &&
                matchAttachmentType &&
                matchPIC &&
                // matchCountry &&
                matchStamped &&
                matchServiceType &&
                matchExpiry &&
                matchRenewal &&
                matchNotify &&
                matchContractNo;
        });
    }, [
        services,
        filters
    ]);

    const options = columns
        .filter(({ key }) => key !== "actions" && key !== "view" && key !== "file")
        .map(({ key, title }) => ({
            label: title,
            value: key,
        }));

    const newColumns = columns?.map((item) => ({
        ...item,
        hidden: item.key !== "actions" && item.key !== "view" && item.key !== "file" && !checkedList.includes(item.key as string),
    }));

    // ฟังก์ชันสำหรับ update startDate และเคลียร์ค่า endDate
    const handleStartDateChange = (date: Dayjs | null) => {
        setFilters(prev => ({ ...prev, startDate: date ? date.toDate() : null }));
        setFilters(prev => ({ ...prev, endDate: null }));
    };

    // อัปเดต endDate และคำนวณระยะเวลา
    const handleEndDateChange = (date: Dayjs | null) => {
        if (date && filters.startDate) {
            setFilters(prev => ({ ...prev, endDate: date.toDate() }));
        } else {
            setFilters(prev => ({ ...prev, endDate: date ? date.toDate() : null }));
        }
    };

    const disabledEndDate = (current: Dayjs) => {
        if (!current || !filters.startDate) {
            return false;
        }
        // ไม่อนุญาตให้เลือกวันที่ก่อน startDate
        // แปลง service.startDate เป็น Dayjs ก่อนเปรียบเทียบ
        return current.isBefore(dayjs(filters.startDate), 'day');
    };

    const clearAllFilters = () => {
        // Reset all form input states
        setFilters(initialFilters)

        // Clear localStorage
        const keysToRemove = [
            'contractorEN',
            'contractorTH',
            'status',
            'contractName',
            'attachmentType',
            'startDate',
            'endDate',
            'pic',
            'stamped',
            'serviceContractColumns',
            'expiry',
            'renewal',
            'notify',
            'contractNo'
        ];

        keysToRemove.forEach(key => {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error(`Error removing ${key} from localStorage`, error);
            }
        });
    };

    const handleTableChange = (newPagination: TablePaginationConfig) => {
        const newCurrentPage = newPagination.current || 1;
        const newPageSize = newPagination.pageSize || 10;

        // Update states
        setCurrentPage(newCurrentPage);
        setPageSize(newPageSize);

        try {
            localStorage.setItem('serviceContractCurrentPage', newCurrentPage.toString());
            localStorage.setItem('serviceContractPageSize', newPageSize.toString());
        } catch (error) {
            console.error('Error saving pagination to localStorage', error);
        }
    };

    const exportToExcel = async (data: Service[], fileName: string = 'service_contracts.xlsx') => {
        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Service Contracts');

        // Define which columns to include in the export based on checkedList
        const visibleColumns = columns
            .filter(col =>
                // Keep only columns that are in the checkedList or are special columns
                (checkedList.includes(col.key as string)))
            .filter(col => col.key !== 'actions' && col.key !== 'view' && col.key !== 'file')
            .map(col => ({
                key: col.key as string,
                title: col.title as string,
                dataIndex: 'dataIndex' in col ? col.dataIndex as string : undefined,
                render: col.render
            }));

        // Process column headers
        const headers: string[] = [];

        visibleColumns.forEach(col => {

            console.log('### col.key: ' + col.key)
            if (col.key === 'contractPeriod') {
                // Only add these subheaders if 'contractPeriod' is in checkedList
                if (checkedList.includes('contractPeriod')) {
                    headers.push('Start Date', 'End Date', 'Duration');
                }
            } else if (col.key === 'notice') {
                // Only add these subheaders if 'notice' is in checkedList
                if (checkedList.includes('notice')) {
                    headers.push('Contract Renewal', 'Notify Before Expire');
                }
            } else if (col.key === 'attachmentTypeGroup') {
                headers.push('Attachment');
            } else if (col.key === 'pic') {
                headers.push('Person In Charge');
            } else if (col.title) {
                headers.push(col.title as string);
            }
        });

        // Add headers to worksheet
        worksheet.addRow(headers);

        // Style the header row
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '42A196' } // Yellow
            };
            cell.font = {
                bold: true,
                size: 12,
                color: { argb: 'FFFFFF' }
            };
            cell.alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Add data rows
        data.forEach(record => {
            const rowValues: (string | number)[] = [];

            visibleColumns.forEach(col => {
                if (col.key === 'contractPeriod' && checkedList.includes('contractPeriod')) {
                    rowValues.push(
                        formatDate(record.startDate ? record.startDate.toString() : ''),
                        formatDate(record.endDate ? record.endDate.toString() : ''),
                        `${record.durationYear}Y ${record.durationMonth}M ${record.durationDay}D`
                    );
                } else if (col.key === 'notice' && checkedList.includes('notice')) {
                    rowValues.push(record.renewal, record.notify);
                } else if (col.key === 'attachmentTypeGroup') {
                    rowValues.push(record.attachmentType);
                } else if (col.key === 'pic') {
                    rowValues.push(record.pic_Name2 ? `${record.pic_Name1}, ${record.pic_Name2}` : record.pic_Name1 ?? '');
                } else if (col.dataIndex) {
                    const value = record[col.dataIndex as keyof Service];
                    if (value instanceof Date) {
                        rowValues.push(value.toISOString());
                    } else if (Array.isArray(value)) {
                        rowValues.push(value.map(v => v.toString()).join(', '));
                    } else if (value instanceof File) {
                        rowValues.push(value.name); // or any other File property you need
                    } else if (typeof value === 'boolean') {
                        rowValues.push(value ? '✅ Yes' : '❌ No'); // ✅ สำหรับ boolean
                    } else {
                        rowValues.push(value ?? '');
                    }
                }
            });
            const row = worksheet.addRow(rowValues);

            // Add borders to each cell in the row
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // Auto-size columns based on content
        worksheet.columns.forEach((column) => {
            if (column && column.eachCell) {  // Ensure column is defined and has the `eachCell` method
                let maxLength = 0;
                column.eachCell({ includeEmpty: true }, (cell) => {
                    const columnLength = cell.value ? cell.value.toString().length : 10;
                    if (columnLength > maxLength) {
                        maxLength = columnLength;
                    }
                });
                column.width = maxLength + 2;
            }
        });

        // Generate Excel file and trigger download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, fileName);
    };

    // Update the Excel button click handler
    const handleExcelExport = () => {
        exportToExcel(filteredDataSource);
    };




    const exportToPdf = async (data: Service[], fileName = 'service_contracts.pdf') => {
        // Create a new PDF document in landscape orientation
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });


        // ตั้งค่าใช้ฟอนต์ไทย



        // Define which columns to include in the export (same logic as Excel export)
        const visibleColumns = columns
            .filter(col =>
                // Keep only columns that are in the checkedList or are special columns
                (checkedList.includes(col.key as string)))
            .filter(col => !col.hidden && col.key !== 'actions' && col.key !== 'view' && col.key !== 'file')
            .map(col => ({
                key: col.key,
                title: col.title,
                dataIndex: 'dataIndex' in col ? col.dataIndex : undefined,
                render: col.render
            }));

        // Process column headers
        const headers: string[] = [];
        visibleColumns.forEach(col => {
            if (col.key === 'contractPeriod') {
                headers.push('Start Date', 'End Date', 'Duration');
            } else if (col.key === 'notice') {
                headers.push('Contract Renewal', 'Notify Before Expire');
            } else if (col.key === 'attachmentTypeGroup') {
                headers.push('Attachment');
            } else if (col.key === 'pic') {
                headers.push('Person In Charge');
            } else if (col.title) {
                headers.push(col.title as string);
            }
        });

        // Prepare data for PDF table
        const rows = data.map(record => {
            const rowValues: (string | number)[] = [];
            visibleColumns.forEach(col => {
                if (col.key === 'contractPeriod') {
                    rowValues.push(
                        formatDate(record.startDate ? record.startDate.toString() : ''),
                        formatDate(record.endDate ? record.endDate.toString() : ''),
                        `${record.durationYear}Y ${record.durationMonth}M ${record.durationDay}D`
                    );
                } else if (col.key === 'notice') {
                    rowValues.push(record.renewal, record.notify);
                } else if (col.key === 'attachmentTypeGroup') {
                    rowValues.push(record.attachmentType);
                } else if (col.key === 'pic') {
                    rowValues.push(record.pic_Name2 ? `${record.pic_Name1}, ${record.pic_Name2}` : record.pic_Name1 ?? '');
                } else if (col.dataIndex) {
                    const value = record[col.dataIndex as keyof Service];
                    if (value instanceof Date) {
                        rowValues.push(value.toISOString());
                    } else if (Array.isArray(value)) {
                        rowValues.push(value.map(v => v.toString()).join(', '));
                    } else if (value instanceof File) {
                        rowValues.push(value.name); // or any other File property you need
                    } else if (typeof value === 'boolean') {
                        rowValues.push(value ? '✅ Yes' : '❌ No'); // ✅ สำหรับ boolean
                    } else {
                        rowValues.push(value ?? '');
                    }
                }
            });
            return rowValues;
        });

        // Add title
        pdf.setFont('THSarabunNewBold', 'bold'); // ใช้ฟอนต์ THSarabunNew แบบตัวหนา
        pdf.setFontSize(16);
        pdf.text('Service Contract', 14, 15); // Thai title

        pdf.setFont('THSarabunNew', 'normal');
        // Add generation date
        pdf.setFontSize(12);
        pdf.text(`Printed Date: ${new Date().toLocaleDateString('th-TH')} ${new Date().toLocaleTimeString('th-TH')}`, 14, 22); // Thai date

        // Calculate the starting y position based on filter text
        const startY = 30;

        // Add the table with data
        autoTable(pdf, {
            head: [headers],
            body: rows,
            startY: startY,
            theme: 'grid',
            styles: {
                fontSize: 12,
                cellPadding: 2,
                overflow: 'linebreak',
                halign: 'left',
                valign: 'middle',
                font: 'THSarabunNew' // Use Thai font for table content
            },
            headStyles: {
                fillColor: [67, 160, 151], // Mint color
                textColor: [255, 255, 255], // White text
                fontStyle: 'bold',
                fontSize: 14,
                halign: 'center',
                lineWidth: 0.1,
                lineColor: [169, 169, 169],
                font: 'THSarabunNewBold' // Use Thai font for headers
            },
            alternateRowStyles: {
                fillColor: [244, 246, 248]
            },


            // Handle special formatting for different types of data
            didDrawCell: (data: CellHookData) => {
                // If this is an Attachment cell, add colors similar to your badges
                if (headers[data.column.index] === 'Attachment' && data.row.raw) {
                    const rawData = data.row.raw as unknown as RawData;
                    const cellValue = rawData[data.column.index];


                    if (cellValue === 'New Contract') {
                        pdf.setFillColor(67, 160, 151); // Mint
                        pdf.rect(data.cell.x + 1, data.cell.y + 1, data.cell.width - 2, data.cell.height - 2, 'F');
                        pdf.setTextColor(255, 255, 255); // White text
                        pdf.setFont('THSarabunNew');
                        pdf.text('New', data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, { align: 'center', baseline: 'middle' });
                    } else if (cellValue === 'Renewed') {
                        pdf.setFillColor(240, 180, 140); // Biscuit
                        pdf.rect(data.cell.x + 1, data.cell.y + 1, data.cell.width - 2, data.cell.height - 2, 'F');
                        pdf.setTextColor(255, 255, 255); // White text
                        pdf.setFont('THSarabunNew');
                        pdf.text('Renewed', data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, { align: 'center', baseline: 'middle' });
                    } else if (cellValue === 'Amendment') {
                        pdf.setFillColor(70, 130, 180); // Sea
                        pdf.rect(data.cell.x + 1, data.cell.y + 1, data.cell.width - 2, data.cell.height - 2, 'F');
                        pdf.setTextColor(255, 255, 255); // White text
                        pdf.setFont('THSarabunNew');
                        pdf.text('Amendment', data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, { align: 'center', baseline: 'middle' });
                    }
                }
            }
        });

        // Add pagination
        const totalPages = pdf.internal.pages.length;
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setFont('THSarabunNew');
            pdf.text(`หน้า ${i} จาก ${totalPages}`, pdf.internal.pageSize.getWidth() - 20, pdf.internal.pageSize.getHeight() - 10);
        }

        // Save the PDF file
        pdf.save(fileName);
    };
    // Modify the handlePdfExport function to be called from your UI button
    const handlePdfExport = () => {
        exportToPdf(filteredDataSource);
    };


    // Add this handler function
    const handleClearAllColumns = () => {

        // Clear all columns
        setCheckedList([]);

        try {
            localStorage.setItem('serviceContractColumns', JSON.stringify([]));
        } catch (error) {
            console.error('Error saving columns to localStorage', error);
        }

    };

    return (
        <main>
            <div className="mx-auto px-5 pb-5">
                <div className="flex items-center gap-2">
                    <span className="text-3xl text-mint-500 font-montserrat font-bold">Service Contract Management</span>

                    <div className="space-x-2 ml-auto">
                        {
                            (userRole == "ADMIN" || permission == "Full Access") &&
                            <Link href="/service_contract/create" className="btn btn-mint inline-flex items-center font-montserrat">
                                <Plus className="w-5 h-5 mr-2" />
                                Create
                            </Link>
                        }

                        {/* <Link href="/master/service_type" className="btn btn-outlineMint inline-flex items-center font-montserrat">
                            <Settings className="w-5 h-5 mr-2" />
                            Master
                        </Link> */}
                    </div>
                </div>


                <div className="card my-8 w-full">
                    <div className="flex justify-between items-center mb-4">
                        <label className="font-montserrat text-sm font-bold text-mint-600 me-2">Filter By</label>
                        <button onClick={() => setIsOpen(!isOpen)} className="text-mint-500 cursor-pointer">
                            {isOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                        </button>
                    </div>
                    {/* Toggle Content */}
                    <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-4">
                                <div className="col-span-2 xl:col-span-1 2xl:col-span-1 text-left xl:text-right">
                                    <label className="text-title">Contractor <span className="font-normal text-xs">(EN/TH)</span></label>
                                </div>
                                <div className="col-span-2 xl:col-span-4 2xl:col-span-4">
                                    <input value={filters.contractorEN} onChange={(e) => setFilters(prev => ({ ...prev, contractorEN: e.target.value }))} className="input-formcontrol" />
                                </div>
                                <div className="col-span-2 xl:col-span-1 2xl:col-span-1 text-left xl:text-right">
                                    <label className="text-title">Attachment</label>
                                </div>
                                <div className="col-span-2 xl:col-span-2 2xl:col-span-2">
                                    <select
                                        className="input-formcontrol"
                                        value={filters.attachmentType}
                                        onChange={(e) => setFilters(prev => ({ ...prev, attachmentType: e.target.value }))}
                                        required
                                    >
                                        <option value="">All</option>
                                        <option key={'New'} value={'New Contract'}>New Contract</option>
                                        <option key={'Renewed'} value={'Renewed'}>Renewed</option>
                                        <option key={'Amendment'} value={'Amendment'}>Amendment</option>
                                        <option key={'Related'} value={'Related'}>Related</option>
                                    </select>
                                    {/* <input className="input-formcontrol w-4/12" placeholder="Amendment No." /> */}
                                </div>
                                <div className="col-span-2 xl:col-span-2 2xl:col-span-1 text-left xl:text-right">
                                    <label className="text-title">Contract Expiry</label>
                                </div>
                                <div className="col-span-2 xl:col-span-2 2xl:col-span-2">
                                    <select className="input-formcontrol"
                                        value={filters.expiry}
                                        onChange={(e) => setFilters(prev => ({ ...prev, expiry: e.target.value }))}
                                    >
                                        <option value="" >-</option>
                                        <option value="Expires in 7 Days" >Expires in 7 Days</option>
                                        <option value="Expired" >Expired</option>
                                        <></>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-4">
                                <div className="col-span-2 xl:col-span-1 2xl:col-span-1 text-left xl:text-right">
                                    <label className="text-title">Contract Name</label>
                                </div>
                                <div className="col-span-2 xl:col-span-4 2xl:col-span-4">
                                    <input value={filters.contractName} onChange={(e) => setFilters(prev => ({ ...prev, contractorEN: e.target.value }))} className="input-formcontrol" />
                                </div>
                                <div className="col-span-2 xl:col-span-1 2xl:col-span-1 text-left xl:text-right">
                                    <label className="text-title">Status</label>
                                </div>
                                <div className="col-span-2 xl:col-span-6 2xl:col-span-5">
                                    <select
                                        className="input-formcontrol"
                                        value={filters.status}
                                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                        required
                                    >
                                        <option value="">All</option>
                                        {core_Status_Masters?.map((item) => (
                                            <option key={item.id} value={item.description}>
                                                {item.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* <div className="col-span-2 xl:col-span-1 text-left xl:text-right">
                                    <label className="text-title">Country</label>
                                </div>
                                <div className="col-span-2 xl:col-span-1">
                                    <input value={country} onChange={(e) => setCountry(e.target.value)} className="input-formcontrol" />
                                </div> */}


                            <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-4">
                                <div className="col-span-2 xl:col-span-1 2xl:col-span-1 text-left xl:text-right">
                                    <label className="text-title">Type</label>
                                </div>
                                <div className="col-span-2 xl:col-span-4 2xl:col-span-4">
                                    <select className="input-formcontrol"
                                        value={filters.serviceType}
                                        onChange={(e) => setFilters(prev => ({ ...prev, serviceType: e.target.value }))}
                                    >
                                        <option value="" >All</option>
                                        {service_Type_Masters?.map((item) => (
                                            <option key={item.id} value={item.description}>
                                                {item.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2 xl:col-span-1 2xl:col-span-1 text-left xl:text-right">
                                    <label className="text-title">Stamped</label>
                                </div>
                                <div className="col-span-2 xl:col-span-3 2xl:col-span-2">
                                    <div className="flex flex-col xl:flex-row justify-start items-start xl:items-center gap-2">
                                        <select
                                            className="input-formcontrol"
                                            value={filters.stamped}
                                            onChange={(e) => setFilters(prev => ({ ...prev, stamped: e.target.value }))}
                                            required
                                        >
                                            <option value="">All</option>
                                            <option value="Pending Stamp Duty">Pending Stamp Duty</option>
                                            <option value="Stamp Duty Paid">Stamp Duty Paid</option>
                                            <option value="No Stamp Duty">No Stamp Duty</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-span-2 xl:col-span-1 2xl:col-span-1 text-left xl:text-right">
                                    <label className="text-title">Contract No.</label>
                                </div>
                                <div className="col-span-2 xl:col-span-2 2xl:col-span-2">
                                    <input value={filters.contractNo} onChange={(e) => setFilters(prev => ({ ...prev, contractNo: e.target.value }))} className="input-formcontrol" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-4">
                                <div className="col-span-2 xl:col-span-1 2xl:col-span-1 text-left xl:text-right">
                                    <label className="text-title">From</label>
                                </div>
                                <div className="col-span-2 xl:col-span-4 2xl:col-span-4">
                                    <div className="flex items-center">
                                        <DatePicker
                                            value={filters.startDate ? dayjs(filters.startDate) : null}
                                            onChange={handleStartDateChange}
                                            format="DD MMM YYYY"
                                            placeholder="Start Date"
                                            className="input-formcontrol"
                                            required
                                        />
                                        <label className="text-title w-22 2xl:w-36 text-center ms-2">To</label>
                                        <DatePicker
                                            value={filters.endDate ? dayjs(filters.endDate) : null}
                                            onChange={handleEndDateChange}
                                            format="DD MMM YYYY"
                                            placeholder="End Date"
                                            disabledDate={disabledEndDate}
                                            disabled={!filters.startDate} // ปิดการใช้งานถ้ายังไม่ได้เลือก startDate
                                            className="input-formcontrol"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2 xl:col-span-1 2xl:col-span-1 text-left xl:text-right">
                                    <label className="text-title">PIC</label>
                                </div>
                                <div className="col-span-2 xl:col-span-3 2xl:col-span-2">
                                    <select className="input-formcontrol"
                                        value={filters.pic}
                                        onChange={(e) => setFilters(prev => ({ ...prev, pic: e.target.value }))}
                                    >
                                        <option value="" >
                                            All
                                        </option>
                                        {core_PIC_Masters?.map((item) => (
                                            <option key={item.id} value={item.userID}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 xl:grid-cols-12 items-center gap-4">
                                <div className="col-span-2 xl:col-span-1 2xl:col-span-1 text-left xl:text-right">
                                    <label className="text-title">Notice</label>
                                </div>

                                <div className="col-span-2 xl:col-span-4 2xl:col-span-4">
                                    <select className="input-formcontrol"
                                        value={filters.renewal}
                                        onChange={(e) => setFilters(prev => ({ ...prev, contractorEN: e.target.value }))}
                                        required
                                    >
                                        <option value="">
                                            - Please select a Contract Renewal -
                                        </option>
                                        {core_Renewal_Masters?.map((item) => (
                                            <option key={item.id} value={item.description}>
                                                {item.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-span-2 xl:col-span-5 2xl:col-span-3">
                                    <select className="input-formcontrol"
                                        value={filters.notify}
                                        onChange={(e) => setFilters(prev => ({ ...prev, notify: e.target.value }))}
                                        required
                                    >
                                        <option value="" >
                                            - Please select a Notify Before Expire -
                                        </option>
                                        {core_Notify_Masters?.map((item) => (
                                            <option key={item.id} value={item.description}>
                                                {item.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2 xl:col-span-2 2xl:col-span-1">
                                    <button onClick={clearAllFilters} className="btn btn-sm btn-biscuit items-center">Clear Filter</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-2 mt-14 items-stretch">
                    <div >
                        <div className="card h-full">
                            <div className="flex items-start gap-2">
                                <label className="font-montserrat text-sm font-bold text-biscuit-500 me-2">Columns Displayed</label>
                                <div className="ml-auto">
                                    <div className="flex items-center">
                                        <CircleX onClick={handleClearAllColumns} className="inline-flex w-3.5 h-3.5 text-red-400 me-2 cursor-pointer" />
                                        <span onClick={handleClearAllColumns} className="text-xs text-nowrap text-gray-400 cursor-pointer">Clear All Columns</span>
                                    </div>
                                    {/* <Checkbox
                                    checked={clearAllChecked}
                                    onChange={handleClearAllColumns}
                                > */}
                                    {/* <span className="text-nowrap text-gray-400">Clear All Columns</span>
                            </Checkbox> */}
                                </div>
                            </div>
                            <div className="w-full mt-2">
                                <div className="grid grid-cols-5 2xl:grid-cols-8 gap-x-4 gap-y-2 w-full mt-2">
                                    {(options as CheckboxOptionType[]).map((option) => (
                                        <Checkbox
                                            key={option.value}
                                            value={option.value}
                                            checked={checkedList.includes(option.value)}
                                            onChange={(e) => {
                                                const value = option.value;
                                                setCheckedList((prev) =>
                                                    e.target.checked
                                                        ? [...prev, value]
                                                        : prev.filter((v) => v !== value)
                                                );
                                            }}
                                        >
                                            {option.label}
                                        </Checkbox>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="card h-full">
                            <label className="font-montserrat text-sm font-bold text-mint-600 me-2">Report</label>
                            <div className=" flex item-center flex-nowrap gap-2 mt-2">
                                <button className="btn btn-sm btn-outlineGreen inline-flex" onClick={handleExcelExport}><FileExcelOutlined className="me-1" /> Excel</button>
                                <button className="btn btn-sm btn-outlineRed inline-flex" onClick={handlePdfExport}><FilePdfOutlined className="me-1" />PDF</button>
                                {/* <a href="/service_contract/create" className=" btn-outlineMint inline-flex items-center font-montserrat">
                                <FileInput className="w-5 h-5 mr-2" />
                                Export Excel
                            </a> */}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card mt-2">
                    <Table<DataType>
                        bordered={true}
                        columns={newColumns.filter(col => !col.hidden)}
                        dataSource={filteredDataSource}
                        style={{ maxWidth: '100%' }}
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            total: filteredDataSource?.length,
                            showSizeChanger: true,

                            pageSizeOptions: PAGINATION_OPTIONS,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                        }}
                        onChange={handleTableChange}
                        scroll={{ x: 'max-content' }}
                        rowKey="id"
                    />
                </div>
            </div>



        </main >
    );
}

export default Service_Contract_Page;