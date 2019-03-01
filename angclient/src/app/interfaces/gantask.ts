export interface Gantask {
    id: number;
    text: string;
    type: string;
    start_date: Date;
    progress: number;
    duration: number;
    parent: number;
    open: boolean;
    department: string;
    camp: string;
    project: string;
    employer: string;
    numberofpeople: number;
    firstnight: string;
    lastnight: string;
    uid: string;
}
