export interface Project {
  id: string;
  name: string;
  manager: string;
  progress: number;
  status: 'red' | 'yellow' | 'green';
  projectedEnd: string;
  dueDate: string;
  division: string;
  chains: Chain[];
}

export interface Chain {
  id: string;
  name: string;
  progress: number;
  startDate: string;
  endDate: string;
  projectedEnd: string;
  status: 'red' | 'yellow' | 'green';
  tasks: Task[];
}

export interface Task {
  id: string;
  name: string;
  duration: string;
  status: 'NS' | 'IP' | 'CO' | 'STUCK';
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  manager?: string;
  department?: string;
  progress: number;
  category?: string;
}

export const mockProjects: Project[] = [
  {
    id: 'N-2402', name: 'CR REWINDING -800 MM', manager: 'Aditya Saini', progress: 36,
    status: 'green', projectedEnd: '15-Nov-26', dueDate: '30-Sep-25', division: 'DEFAULT',
    chains: [
      {
        id: 'c1', name: 'Category 3/4 - Engg', progress: 82, startDate: '01-Jan-25',
        endDate: '15-Jun-26', projectedEnd: '20-Jul-26', status: 'red',
        tasks: [
          { id: 't1', name: 'K.O.M', duration: '5d', status: 'CO', plannedStart: '01-Jan-25', plannedEnd: '05-Jan-25', progress: 100, category: 'Engg' },
          { id: 't2', name: 'GA Drawing', duration: '15d', status: 'CO', plannedStart: '06-Jan-25', plannedEnd: '20-Jan-25', progress: 100, category: 'Engg' },
          { id: 't3', name: 'Detail Design', duration: '30d', status: 'IP', plannedStart: '21-Jan-25', plannedEnd: '19-Feb-25', progress: 65, category: 'Engg', manager: 'Aditya Saini' },
        ],
      },
      {
        id: 'c2', name: 'Category 5 - Ordering And Manufacturing', progress: 45, startDate: '01-Mar-25',
        endDate: '30-Dec-26', projectedEnd: '15-Jan-27', status: 'yellow',
        tasks: [
          { id: 't4', name: 'Ordering of BOIs & Equipment', duration: '20d', status: 'IP', plannedStart: '01-Mar-25', plannedEnd: '20-Mar-25', progress: 30, category: 'Ordering' },
        ],
      },
    ],
  },
  {
    id: 'N-2239', name: 'TRIMMER -1650MM', manager: 'Aditya Saini', progress: 47,
    status: 'green', projectedEnd: '12-Aug-26', dueDate: '30-Jun-25', division: 'DEFAULT',
    chains: [],
  },
  {
    id: 'N-2532', name: 'BMWIL - SLITTING 2000 MM', manager: 'Om Dev', progress: 0,
    status: 'green', projectedEnd: '20-Mar-27', dueDate: '28-Feb-27', division: 'DEFAULT',
    chains: [],
  },
  {
    id: 'N-2602', name: 'BMWIL - HR SLITTING LINE', manager: 'Om Dev', progress: 0,
    status: 'green', projectedEnd: '15-Apr-27', dueDate: '31-Mar-27', division: 'DEFAULT',
    chains: [],
  },
  {
    id: 'N-2603', name: 'BMWIL - REWINDING CU LINE', manager: 'Kunal Dagar', progress: 0,
    status: 'green', projectedEnd: '10-May-27', dueDate: '30-Apr-27', division: 'DEFAULT',
    chains: [],
  },
  {
    id: '2529', name: 'CCL 1500 MM @ 30 MPM', manager: 'Saurabh Jangra', progress: 60,
    status: 'red', projectedEnd: '12-May-27', dueDate: '30-Sep-25', division: 'DEFAULT',
    chains: [
      {
        id: 'c3', name: 'Category 3/4 - Engg', progress: 90, startDate: '01-Oct-24',
        endDate: '15-Jun-26', projectedEnd: '30-Jun-26', status: 'green',
        tasks: [
          { id: 't5', name: 'Structural Drawings', duration: '25d', status: 'CO', plannedStart: '01-Oct-24', plannedEnd: '25-Oct-24', progress: 100, category: 'Engg' },
        ],
      },
      {
        id: 'c4', name: 'Category 5 - Ordering And Manufacturing', progress: 48, startDate: '01-Jan-25',
        endDate: '30-Sep-26', projectedEnd: '15-Dec-26', status: 'red',
        tasks: [
          { id: 't6', name: 'Piping Work - Process Piping', duration: '60d', status: 'IP', plannedStart: '01-Mar-25', plannedEnd: '30-Apr-25', progress: 46, category: 'Manufacturing' },
        ],
      },
    ],
  },
  {
    id: 'N-2534', name: 'BMWIL - TRIMMING -1500 MM', manager: 'Om Dev', progress: 40,
    status: 'yellow', projectedEnd: '20-Jan-27', dueDate: '31-Dec-26', division: 'DEFAULT',
    chains: [],
  },
  {
    id: 'N-2540', name: 'HOT STRIP MILL -1250 MM', manager: 'Deepak Tiwari', progress: 25,
    status: 'red', projectedEnd: '08-Feb-27', dueDate: '15-Sep-26', division: 'DEFAULT',
    chains: [],
  },
];

export const performanceData = {
  timeline: {
    red: 58, yellow: 2, green: 6,
    totalProjects: 72,
    averageDelay: 254,
    financialImpact: 'NO FINANCIAL IMPACT',
    trendPercent: 37,
    trendDirection: 'up' as const,
  },
  sCurve: {
    achieved: 43.42,
    target: 100,
    projected: 46.36,
    projectedTrendDirection: 'down' as const,
    fiscalYear: 'FY25-26',
  },
  taskThroughput: {
    achieved: 325,
    target: 500,
    projected: 380,
    trendPercent: 8,
  },
  fullKit: {
    onTime: 42,
    avgReadiness: 68,
    avgDelay: 65.3,
  },
  overallHealth: {
    score: 45,
    trend: -3,
  },
};

export const effectivenessData = {
  stuckTasks: {
    red: 475, redTotal: 490,
    yellow: 0, yellowTotal: 0,
    green: 9, greenTotal: 12,
    stuckCount: 484,
    stuckPercent: 96,
    ipTasks: 502,
    trendPercent: 2.22,
    trendDirection: 'down' as const,
  },
  tasks: {
    ipCount: 369,
    closedCount: 256,
    avgCycleTime: 42.34,
    totalClosures: 325,
    cycleTrend: 11,
    cycleTrendDirection: 'down' as const,
  },
  issues: {
    openCount: 89,
    closedCount: 156,
    avgClosureTime: 18.5,
    totalClosures: 156,
    trendPercent: 5,
    trendDirection: 'down' as const,
  },
  actionItems: {
    openCount: 34,
    closedCount: 78,
    avgClosureTime: 7.2,
  },
};

export const mockTasks: Task[] = [
  { id: 'T-001', name: 'K.O.M', duration: '5d', status: 'STUCK', plannedStart: '01-Jan-25', plannedEnd: '05-Jan-25', progress: 40, manager: 'Aditya Saini', department: 'Engineering', category: 'Engg' },
  { id: 'T-002', name: 'UNCOILER ASSY#1 - Ordering', duration: '20d', status: 'STUCK', plannedStart: '15-Feb-25', plannedEnd: '07-Mar-25', progress: 82, manager: 'Saurabh Jangra', department: 'Procurement', category: 'Ordering' },
  { id: 'T-003', name: 'GA Drawing Review', duration: '10d', status: 'IP', plannedStart: '10-Mar-25', plannedEnd: '20-Mar-25', progress: 55, manager: 'Aditya Saini', department: 'Engineering', category: 'Engg' },
  { id: 'T-004', name: 'Piping Work - Process Piping', duration: '60d', status: 'IP', plannedStart: '01-Mar-25', plannedEnd: '30-Apr-25', progress: 46, manager: 'Om Dev', department: 'Manufacturing', category: 'Manufacturing' },
  { id: 'T-005', name: 'Structural Fabrication', duration: '45d', status: 'NS', plannedStart: '01-May-25', plannedEnd: '15-Jun-25', progress: 0, manager: 'Deepak Tiwari', department: 'Manufacturing', category: 'Manufacturing' },
  { id: 'T-006', name: 'Electrical Wiring', duration: '30d', status: 'NS', plannedStart: '16-Jun-25', plannedEnd: '16-Jul-25', progress: 0, manager: 'Kunal Dagar', department: 'Electrical', category: 'Engg' },
  { id: 'T-007', name: 'BRUSHING ROLL ASSY - Manufacturing', duration: '35d', status: 'STUCK', plannedStart: '20-Jan-25', plannedEnd: '24-Feb-25', progress: 70, manager: 'Saurabh Jangra', department: 'Manufacturing', category: 'Manufacturing' },
  { id: 'T-008', name: 'CCM1 - Site Installation', duration: '40d', status: 'IP', plannedStart: '01-Apr-25', plannedEnd: '10-May-25', progress: 20, manager: 'Om Dev', department: 'Site', category: 'Installation' },
];

export const fullKits = [
  { id: 'FK-001', stepType: 'UNCOILER GEAR BOX ASSY', task: 'Category 2 - STEP TYPE UNCOILER ASSY#1 - Ord...', manager: 'Not Assigned', populated: false },
  { id: 'FK-002', stepType: 'RECOILER DRIVE ASSEMBLY', task: 'Category 3 - Recoiler Assembly', manager: 'Aditya Saini', populated: true },
  { id: 'FK-003', stepType: 'TENSION LEVELLER ROLLS', task: 'Category 2 - Tension Leveller Unit', manager: 'Om Dev', populated: true },
];
