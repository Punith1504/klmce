// ========================================================================
// KLMCE (K.S.R.M. / KLM College of Engineering, Kadapa, Andhra Pradesh)
// Authentic Regional Institutional Dataset (JNTUA Affiliated, Rayalaseema)
// ========================================================================

export interface StudentRecord {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  phone: string;
  gender: "M" | "F";
  dob: string;
  region: string;
  district: string;
  department: string;
  programme: string;
  year: number;
  semester: string;
  cgpa: number;
  attendance_pct: number;
  fee_status: "Paid" | "Pending" | "Overdue";
  status: "Active" | "Warning" | "Good Standing";
  parentName: string;
  parentPhone: string;
  busRoute?: string;
  hostelRoom?: string;
}

export interface FacultyRecord {
  id: string;
  empId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  qualification: string;
  joining_date: string;
  courses_taught: number;
  publications: number;
  mentees_count: number;
  office_room: string;
}

export interface AdminRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  access_level: "Superuser" | "Editor" | "Viewer";
  office_location: string;
  department: string;
}

export interface BusRouteRecord {
  routeNo: string;
  routeName: string;
  stops: string[];
  driverName: string;
  driverPhone: string;
  busNo: string;
  capacity: number;
  occupied: number;
}

export interface HostelRecord {
  blockName: string;
  type: "Girls" | "Boys";
  wardenName: string;
  wardenPhone: string;
  totalRooms: number;
  occupiedRooms: number;
  messManager: string;
}

// ------------------------------------------------------------------------
// 1. Regional Students (Kadapa, Rayalaseema, Andhra Pradesh)
// ------------------------------------------------------------------------
export const STUDENTS: StudentRecord[] = [
  {
    id: "STU2024001",
    rollNo: "219Y1A0501",
    name: "C. Lakshmi Priya",
    email: "lakshmi.priya@student.klmce.ac.in",
    phone: "+91 98480 23145",
    gender: "F",
    dob: "2003-05-14",
    region: "Kadapa",
    district: "YSR Kadapa",
    department: "Computer Science and Engineering",
    programme: "B.Tech",
    year: 4,
    semester: "Semester 7",
    cgpa: 9.42,
    attendance_pct: 92,
    fee_status: "Paid",
    status: "Good Standing",
    parentName: "C. Narayana Reddy",
    parentPhone: "+91 94401 22334",
    busRoute: "Route 01 - Kadapa City Loop",
    hostelRoom: "Chennamma Block B-204"
  },
  {
    id: "STU2024002",
    rollNo: "219Y1A0514",
    name: "K. Bhavani",
    email: "bhavani.k@student.klmce.ac.in",
    phone: "+91 98482 12908",
    gender: "F",
    dob: "2003-08-22",
    region: "Proddatur",
    district: "YSR Kadapa",
    department: "Computer Science and Engineering",
    programme: "B.Tech",
    year: 4,
    semester: "Semester 7",
    cgpa: 8.85,
    attendance_pct: 88,
    fee_status: "Paid",
    status: "Good Standing",
    parentName: "K. Venkata Subbaiah",
    parentPhone: "+91 98492 44556",
    busRoute: "Route 04 - Proddatur Express"
  },
  {
    id: "STU2024003",
    rollNo: "219Y1A0423",
    name: "V. Sai Teja",
    email: "saiteja.v@student.klmce.ac.in",
    phone: "+91 97014 55321",
    gender: "M",
    dob: "2003-11-09",
    region: "Pulivendula",
    district: "YSR Kadapa",
    department: "Electronics and Communication Engineering",
    programme: "B.Tech",
    year: 4,
    semester: "Semester 7",
    cgpa: 8.45,
    attendance_pct: 79,
    fee_status: "Paid",
    status: "Active",
    parentName: "V. Ramanjaneyulu",
    parentPhone: "+91 98481 99001",
    busRoute: "Route 07 - Pulivendula Fast Pass"
  },
  {
    id: "STU2024004",
    rollNo: "229Y1A0542",
    name: "P. Harika",
    email: "harika.p@student.klmce.ac.in",
    phone: "+91 96180 77412",
    gender: "F",
    dob: "2004-02-17",
    region: "Rayachoty",
    district: "Annamayya",
    department: "Computer Science and Engineering",
    programme: "B.Tech",
    year: 3,
    semester: "Semester 5",
    cgpa: 9.12,
    attendance_pct: 95,
    fee_status: "Paid",
    status: "Good Standing",
    parentName: "P. Gurivi Reddy",
    parentPhone: "+91 99890 33221",
    hostelRoom: "Sarojini Naidu Block A-112"
  },
  {
    id: "STU2024005",
    rollNo: "229Y1A1208",
    name: "M. Anusha",
    email: "anusha.m@student.klmce.ac.in",
    phone: "+91 95501 88320",
    gender: "F",
    dob: "2004-06-30",
    region: "Tirupati",
    district: "Tirupati",
    department: "Artificial Intelligence and Data Science",
    programme: "B.Tech",
    year: 3,
    semester: "Semester 5",
    cgpa: 8.76,
    attendance_pct: 84,
    fee_status: "Pending",
    status: "Active",
    parentName: "M. Krishna Murthy",
    parentPhone: "+91 94405 88990",
    hostelRoom: "Chennamma Block C-301"
  },
  {
    id: "STU2024006",
    rollNo: "229Y1A0215",
    name: "B. Sneha",
    email: "sneha.b@student.klmce.ac.in",
    phone: "+91 98662 33419",
    gender: "F",
    dob: "2004-09-12",
    region: "Jammalamadugu",
    district: "YSR Kadapa",
    department: "Electrical and Electronics Engineering",
    programme: "B.Tech",
    year: 3,
    semester: "Semester 5",
    cgpa: 7.94,
    attendance_pct: 73,
    fee_status: "Overdue",
    status: "Warning",
    parentName: "B. Chenna Reddy",
    parentPhone: "+91 98485 11223",
    busRoute: "Route 09 - Jammalamadugu Direct"
  },
  {
    id: "STU2024007",
    rollNo: "239Y1A0533",
    name: "G. Mounika",
    email: "mounika.g@student.klmce.ac.in",
    phone: "+91 97034 66120",
    gender: "F",
    dob: "2005-01-25",
    region: "Kurnool",
    district: "Kurnool",
    department: "Computer Science and Engineering",
    programme: "B.Tech",
    year: 2,
    semester: "Semester 3",
    cgpa: 9.31,
    attendance_pct: 94,
    fee_status: "Paid",
    status: "Good Standing",
    parentName: "G. Siva Reddy",
    parentPhone: "+91 94402 77889",
    hostelRoom: "Sarojini Naidu Block B-208"
  },
  {
    id: "STU2024008",
    rollNo: "239Y1A0550",
    name: "S. Keerthana",
    email: "keerthana.s@student.klmce.ac.in",
    phone: "+91 98850 44901",
    gender: "F",
    dob: "2005-04-10",
    region: "Badvel",
    district: "YSR Kadapa",
    department: "Computer Science and Engineering",
    programme: "B.Tech",
    year: 2,
    semester: "Semester 3",
    cgpa: 8.62,
    attendance_pct: 87,
    fee_status: "Paid",
    status: "Good Standing",
    parentName: "S. Venkatrami Reddy",
    parentPhone: "+91 98489 66778",
    busRoute: "Route 03 - Badvel Express"
  },
  {
    id: "STU2024009",
    rollNo: "239Y1A0412",
    name: "Y. Divya Vani",
    email: "divyavani.y@student.klmce.ac.in",
    phone: "+91 96521 99042",
    gender: "F",
    dob: "2005-07-18",
    region: "Mydukur",
    district: "YSR Kadapa",
    department: "Electronics and Communication Engineering",
    programme: "B.Tech",
    year: 2,
    semester: "Semester 3",
    cgpa: 8.15,
    attendance_pct: 81,
    fee_status: "Paid",
    status: "Active",
    parentName: "Y. Subbarayudu",
    parentPhone: "+91 99491 22880",
    busRoute: "Route 05 - Mydukur Bypass"
  },
  {
    id: "STU2024010",
    rollNo: "249Y1A0505",
    name: "R. Poojitha",
    email: "poojitha.r@student.klmce.ac.in",
    phone: "+91 94901 33719",
    gender: "F",
    dob: "2006-03-05",
    region: "Kadapa",
    district: "YSR Kadapa",
    department: "Computer Science and Engineering",
    programme: "B.Tech",
    year: 1,
    semester: "Semester 1",
    cgpa: 9.05,
    attendance_pct: 98,
    fee_status: "Paid",
    status: "Good Standing",
    parentName: "R. Ramana Reddy",
    parentPhone: "+91 98480 55112",
    busRoute: "Route 01 - Kadapa City Loop"
  },
  {
    id: "STU2024011",
    rollNo: "249Y1A1218",
    name: "D. Meghana",
    email: "meghana.d@student.klmce.ac.in",
    phone: "+91 98499 12340",
    gender: "F",
    dob: "2006-05-19",
    region: "Vempalli",
    district: "YSR Kadapa",
    department: "Artificial Intelligence and Data Science",
    programme: "B.Tech",
    year: 1,
    semester: "Semester 1",
    cgpa: 8.40,
    attendance_pct: 86,
    fee_status: "Pending",
    status: "Active",
    parentName: "D. Mallikarjuna",
    parentPhone: "+91 97004 88221",
    busRoute: "Route 08 - Vempalli Ring Road"
  },
  {
    id: "STU2024012",
    rollNo: "249Y1A0302",
    name: "T. Sushmitha",
    email: "sushmitha.t@student.klmce.ac.in",
    phone: "+91 97055 88123",
    gender: "F",
    dob: "2006-08-11",
    region: "Kamalapuram",
    district: "YSR Kadapa",
    department: "Mechanical Engineering",
    programme: "B.Tech",
    year: 1,
    semester: "Semester 1",
    cgpa: 8.12,
    attendance_pct: 89,
    fee_status: "Paid",
    status: "Active",
    parentName: "T. Obul Reddy",
    parentPhone: "+91 98484 77665",
    busRoute: "Route 02 - Kamalapuram Junction"
  }
];

// ------------------------------------------------------------------------
// 2. Regional Faculty (KSRMCE / KLMCE Eminent Faculty)
// ------------------------------------------------------------------------
export const FACULTY: FacultyRecord[] = [
  {
    id: "FAC001",
    empId: "KLM-FAC-101",
    name: "Dr. V. Lokeswara Reddy",
    email: "principal@klmce.ac.in",
    phone: "+91 94402 12345",
    department: "Computer Science and Engineering",
    designation: "Principal & Professor",
    qualification: "Ph.D. (IIT Madras), M.Tech (JNTUH)",
    joining_date: "2008-06-15",
    courses_taught: 4,
    publications: 32,
    mentees_count: 15,
    office_room: "Administrative Block - Principal Chamber"
  },
  {
    id: "FAC002",
    empId: "KLM-FAC-102",
    name: "Dr. K. Amaresh",
    email: "amaresh.k@klmce.ac.in",
    phone: "+91 98481 44556",
    department: "Electrical and Electronics Engineering",
    designation: "Professor & Head of Department",
    qualification: "Ph.D. (NIT Warangal), M.Tech (SVU Tirupati)",
    joining_date: "2010-08-01",
    courses_taught: 3,
    publications: 24,
    mentees_count: 18,
    office_room: "EEE Block - Room 201"
  },
  {
    id: "FAC003",
    empId: "KLM-FAC-103",
    name: "Dr. M. Venkatanarayana",
    email: "venkatanarayana.m@klmce.ac.in",
    phone: "+91 94405 88991",
    department: "Electronics and Communication Engineering",
    designation: "Professor & HoD (ECE)",
    qualification: "Ph.D. (JNTUA), M.E. (IISc Bangalore)",
    joining_date: "2012-07-10",
    courses_taught: 3,
    publications: 19,
    mentees_count: 20,
    office_room: "ECE Block - Room 105"
  },
  {
    id: "FAC004",
    empId: "KLM-FAC-104",
    name: "Prof. S. Khaja Fareeduddin",
    email: "dean.academics@klmce.ac.in",
    phone: "+91 98480 33445",
    department: "Computer Science and Engineering",
    designation: "Dean of Academic Affairs & Assoc. Prof",
    qualification: "M.Tech (JNTUA), (Ph.D.)",
    joining_date: "2014-06-20",
    courses_taught: 2,
    publications: 14,
    mentees_count: 15,
    office_room: "Academic Council Cell - Room 102"
  },
  {
    id: "FAC005",
    empId: "KLM-FAC-105",
    name: "Dr. T. Kiran Kumar",
    email: "coe@klmce.ac.in",
    phone: "+91 97012 34567",
    department: "Mechanical Engineering",
    designation: "Controller of Examinations (CoE)",
    qualification: "Ph.D. (SVU Tirupati), M.Tech (JNTUK)",
    joining_date: "2011-09-01",
    courses_taught: 2,
    publications: 16,
    mentees_count: 12,
    office_room: "Examination Branch - Confidential Chamber"
  },
  {
    id: "FAC006",
    empId: "KLM-FAC-106",
    name: "Dr. P. Radha Krishna",
    email: "radhakrishna.p@klmce.ac.in",
    phone: "+91 98852 99001",
    department: "Computer Science and Engineering",
    designation: "Associate Professor & Senior Mentor",
    qualification: "Ph.D. (JNTUA), M.Tech (CSE)",
    joining_date: "2015-11-15",
    courses_taught: 3,
    publications: 11,
    mentees_count: 22,
    office_room: "CSE Lab 3 - Mentor Cabin"
  },
  {
    id: "FAC007",
    empId: "KLM-FAC-107",
    name: "Mrs. C. Madhavi Latha",
    email: "madhavilatha.c@klmce.ac.in",
    phone: "+91 96180 22339",
    department: "Artificial Intelligence and Data Science",
    designation: "Assistant Professor",
    qualification: "M.Tech (Data Sciences), B.Tech (KLMCE Alumna)",
    joining_date: "2019-07-01",
    courses_taught: 3,
    publications: 6,
    mentees_count: 16,
    office_room: "AI&DS Block - Cabin 12"
  }
];

// ------------------------------------------------------------------------
// 3. Regional Admins & Officers
// ------------------------------------------------------------------------
export const ADMINS: AdminRecord[] = [
  {
    id: "ADM001",
    name: "Sri K. Raja Mohan Reddy",
    email: "correspondent@klmce.ac.in",
    phone: "+91 98480 11111",
    role: "Chairman & Managing Trustee",
    access_level: "Superuser",
    office_location: "Trustee Office - Board Room",
    department: "Management"
  },
  {
    id: "ADM002",
    name: "Dr. V. Lokeswara Reddy",
    email: "principal@klmce.ac.in",
    phone: "+91 94402 12345",
    role: "Principal & Institutional Head",
    access_level: "Superuser",
    office_location: "Administrative Block - Room 101",
    department: "Academics"
  },
  {
    id: "ADM003",
    name: "Sri B. Chenna Kesava",
    email: "admissions@klmce.ac.in",
    phone: "+91 98482 66778",
    role: "Dean of Admissions & Student Affairs",
    access_level: "Editor",
    office_location: "Admissions Center - Counter 1",
    department: "Admissions"
  },
  {
    id: "ADM004",
    name: "Sri G. Ramanjaneyulu",
    email: "finance@klmce.ac.in",
    phone: "+91 94401 55667",
    role: "Accounts Officer & Comptroller",
    access_level: "Editor",
    office_location: "Finance Branch - SBI Campus Counter",
    department: "Finance"
  },
  {
    id: "ADM005",
    name: "Smt. K. Sugunamma",
    email: "warden@klmce.ac.in",
    phone: "+91 97003 44556",
    role: "Chief Hostel Warden (Ladies Hostels)",
    access_level: "Editor",
    office_location: "Rani Chennamma Hostel Office",
    department: "Hostels"
  },
  {
    id: "ADM006",
    name: "Sri P. Ramachandra Reddy",
    email: "transport@klmce.ac.in",
    phone: "+91 98490 77889",
    role: "Transport Fleet In-Charge",
    access_level: "Editor",
    office_location: "Campus Transport Depot",
    department: "Transport"
  }
];

// ------------------------------------------------------------------------
// 4. College Bus Routes (Covering Rayalaseema Region)
// ------------------------------------------------------------------------
export const BUS_ROUTES: BusRouteRecord[] = [
  {
    routeNo: "01",
    routeName: "Kadapa City Loop",
    stops: ["Seven Roads Junction", "RIMS Hospital", "RTC Old Bus Stand", "Nagarajupet", "KLMCE Campus"],
    driverName: "S. Subba Rayudu",
    driverPhone: "+91 98483 11220",
    busNo: "AP 04 TU 1234",
    capacity: 55,
    occupied: 52
  },
  {
    routeNo: "02",
    routeName: "Kamalapuram - Vallur Route",
    stops: ["Kamalapuram Center", "Vallur Cross", "Thallapaka Road", "KLMCE Campus"],
    driverName: "M. Venkata Ramana",
    driverPhone: "+91 97014 99002",
    busNo: "AP 04 TU 1235",
    capacity: 50,
    occupied: 44
  },
  {
    routeNo: "03",
    routeName: "Badvel Express",
    stops: ["Badvel Clock Tower", "Muddanur Cross", "B.Mattam", "Kadapa Ring Road", "KLMCE Campus"],
    driverName: "G. Pedda Reddy",
    driverPhone: "+91 94408 33412",
    busNo: "AP 04 TU 1238",
    capacity: 55,
    occupied: 53
  },
  {
    routeNo: "04",
    routeName: "Proddatur Superfast",
    stops: ["Proddatur Sivalayam", "Bollavaram", "Koramangala Cross", "Yerraguntla Junction", "KLMCE Campus"],
    driverName: "K. Obulesu",
    driverPhone: "+91 98855 22110",
    busNo: "AP 04 TU 1240",
    capacity: 60,
    occupied: 58
  },
  {
    routeNo: "07",
    routeName: "Pulivendula Express",
    stops: ["Pulivendula Bus Stand", "Bakapuram", "Simhadripuram", "Vempalli", "KLMCE Campus"],
    driverName: "Y. Sivaram",
    driverPhone: "+91 99890 12098",
    busNo: "AP 04 TU 1242",
    capacity: 55,
    occupied: 51
  }
];

// ------------------------------------------------------------------------
// 5. Hostels (KLMCE Campus Ladies & Boys Hostels)
// ------------------------------------------------------------------------
export const HOSTEL_BLOCKS: HostelRecord[] = [
  {
    blockName: "Rani Chennamma Ladies Hostel - Block A & B",
    type: "Girls",
    wardenName: "Smt. K. Sugunamma",
    wardenPhone: "+91 97003 44556",
    totalRooms: 120,
    occupiedRooms: 114,
    messManager: "Sri. C. Ramaiah (Authentic Rayalaseema Cuisine)"
  },
  {
    blockName: "Sarojini Naidu Ladies Hostel - Block C",
    type: "Girls",
    wardenName: "Dr. B. Jayalakshmi",
    wardenPhone: "+91 98485 77890",
    totalRooms: 80,
    occupiedRooms: 76,
    messManager: "Smt. M. Parvathi"
  },
  {
    blockName: "Sir M. Visvesvaraya Boys Hostel",
    type: "Boys",
    wardenName: "Dr. P. Radha Krishna",
    wardenPhone: "+91 98852 99001",
    totalRooms: 100,
    occupiedRooms: 92,
    messManager: "Sri. K. Nagabhushanam"
  }
];

// ------------------------------------------------------------------------
// 6. JNTUA R20/R23 CBCS Academic Courses
// ------------------------------------------------------------------------
export const COURSES = [
  { code: "20A05301T", title: "Database Management Systems", credits: 3.0, type: "Theory", dept: "CSE", faculty: "Dr. V. Lokeswara Reddy" },
  { code: "20A05302T", title: "Operating Systems", credits: 3.0, type: "Theory", dept: "CSE", faculty: "Prof. S. Khaja Fareeduddin" },
  { code: "20A05303P", title: "Database & Operating Systems Lab", credits: 1.5, type: "Lab", dept: "CSE", faculty: "Dr. P. Radha Krishna" },
  { code: "20A04401T", title: "Analog & Digital Communications", credits: 3.0, type: "Theory", dept: "ECE", faculty: "Dr. M. Venkatanarayana" },
  { code: "20A02402T", title: "Electrical Machines & Control Systems", credits: 3.0, type: "Theory", dept: "EEE", faculty: "Dr. K. Amaresh" },
  { code: "20A12401T", title: "Machine Learning & Statistical Foundations", credits: 3.0, type: "Theory", dept: "AI&DS", faculty: "Mrs. C. Madhavi Latha" }
];
