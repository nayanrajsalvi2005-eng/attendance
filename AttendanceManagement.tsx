import {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { API_BASE_URL } from "./lib/api.js";
import DropdownSelect from "./components/DropdownSelect.jsx";

const iconPaths: Record<string, ReactNode> = {
  ArrowRight: <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
  Camera: <><path d="M14 4h-4L8 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/></>,
  Check: <path d="m5 12 4 4L19 6"/>,
  ChevronDown: <path d="m6 9 6 6 6-6"/>,
  ClipboardCheck: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5h6v3H9zM9 14l2 2 4-4"/></>,
  Clock3: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  Download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/></>,
  Plus: <><path d="M12 5v14M5 12h14"/></>,
  Search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  Trash2: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6"/><path d="M10 11v5m4-5v5"/></>,
  UserRoundCheck: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="m17 11 2 2 4-4"/></>,
  X: <><path d="m18 6-12 12M6 6l12 12"/></>,
};
type IconProps = { className?: string };
function Icon({ name, className = "" }: IconProps & { name: string }) {
  return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{iconPaths[name]}</svg>;
}
const ArrowRight = (props: IconProps) => <Icon name="ArrowRight" {...props} />;
const Camera = (props: IconProps) => <Icon name="Camera" {...props} />;
const Check = (props: IconProps) => <Icon name="Check" {...props} />;
const ClipboardCheck = (props: IconProps) => <Icon name="ClipboardCheck" {...props} />;
const Clock3 = (props: IconProps) => <Icon name="Clock3" {...props} />;
const Download = (props: IconProps) => <Icon name="Download" {...props} />;
const Plus = (props: IconProps) => <Icon name="Plus" {...props} />;
const Search = (props: IconProps) => <Icon name="Search" {...props} />;
const Trash2 = (props: IconProps) => <Icon name="Trash2" {...props} />;
const UserRoundCheck = (props: IconProps) => <Icon name="UserRoundCheck" {...props} />;
const X = (props: IconProps) => <Icon name="X" {...props} />;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string };
function Button({ variant = "default", size = "default", className = "", ...props }: ButtonProps) {
  const variants: Record<string, string> = {
    default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
    outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
    glow: "bg-gradient-to-r from-primary to-accent-strong text-primary-foreground shadow-glow hover:opacity-90",
    glass: "border border-glass-border bg-glass-strong text-foreground hover:bg-glass",
  };
  const sizes: Record<string, string> = { default: "h-9 px-4 py-2", sm: "h-8 rounded-md px-3 text-xs", lg: "h-10 rounded-md px-8", icon: "h-9 w-9" };
  const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";
  return <button {...props} className={`${base} ${variants[variant] ?? variants.default} ${sizes[size] ?? sizes.default} ${className}`} />;
}
function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const base = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";
  return <input {...props} className={`${base} ${props.className ?? ""}`} />;
}

const DialogOpenContext = createContext(false);
function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onOpenChange(false); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open, onOpenChange]);
  if (!open) return null;
  return <DialogOpenContext.Provider value={open}><div className="attendance-dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onOpenChange(false); }}>{children}</div></DialogOpenContext.Provider>;
}
function DialogContent({ className = "", children }: { className?: string; children: ReactNode }) {
  return useContext(DialogOpenContext) ? <div role="dialog" aria-modal="true" className={`attendance-dialog-content ${className}`}>{children}</div> : null;
}
function DialogHeader({ children }: { children: ReactNode }) { return <div className="mb-4 grid gap-1.5">{children}</div>; }
function DialogTitle({ className = "", children }: { className?: string; children: ReactNode }) { return <h2 className={className}>{children}</h2>; }
function DialogDescription({ children }: { children: ReactNode }) { return <p className="text-sm text-muted-foreground">{children}</p>; }

async function attendanceRequest(path: string, method = "GET", body?: unknown) {
  const url = `${API_BASE_URL}${path}`;
  const payload = body;
  const response = await fetch(url, {
    method,
    headers: payload === undefined ? undefined : { "Content-Type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((data as { detail?: string }).detail || `Request failed (${response.status})`);
  return { data };
}
const axios = {
  get: (path: string) => attendanceRequest(path),
  post: (path: string, body: unknown) => attendanceRequest(path, "POST", body),
  delete: (path: string) => attendanceRequest(path, "DELETE"),
};


// =====================================================
// TYPES
// =====================================================

type Status =
  | "Present"
  | "Late"
  | "Absent"
  | "On leave"
  | "Holiday"
  | "Not marked";


type Student = {
  id: number;
  name: string;
  status: Status;
  time: string | undefined;
};


type AttendanceRecord = {
  id: number;
  student: string;
  status: Status;
  date: string;
  time: string | null;
};

type WeeklyAttendance = {
  attendanceDate: string;
  present: number;
  absent: number;
  late: number;
};

const ROSTER_PAGE_SIZE = 40;
const MONTHLY_PAGE_SIZE = 40;


// =====================================================
// STATUS STYLE
// =====================================================

const statusStyles:
  Record<Status, string> = {

  Present:
    "bg-success/10 text-success",

  Late:
    "bg-warning/15 text-warning",

  Absent:
    "bg-danger/10 text-danger",

  "On leave":
    "bg-lavender/10 text-lavender",

  Holiday:
    "bg-primary/10 text-primary",

  "Not marked":
    "bg-foreground/5 text-muted-foreground",
};


// =====================================================
// LOCAL DATE
// =====================================================

function getLocalDate() {

  const today =
    new Date();

  return (
    `${today.getFullYear()}-` +
    `${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-` +
    `${String(
      today.getDate()
    ).padStart(2, "0")}`
  );
}


// =====================================================
// CURRENT MONTH
// =====================================================

function getCurrentMonth() {

  return getLocalDate().slice(
    0,
    7
  );
}


// =====================================================
// MAIN COMPONENT
// =====================================================

export default function AttendanceManagement() {

  // ===================================================
  // STUDENTS
  // ===================================================

  const [
    students,
    setStudents,
  ] = useState<Student[]>([]);

  const [weeklyAttendance, setWeeklyAttendance] = useState<WeeklyAttendance[]>([]);


  // ===================================================
  // SEARCH
  // ===================================================

  const [
    query,
    setQuery,
  ] = useState("");


  // ===================================================
  // FILTER
  // ===================================================

  const [
    filter,
    setFilter,
  ] =
    useState<
      Status | "All"
    >("All");


  // ===================================================
  // SHOW ALL
  // ===================================================

  const [
    showAll,
    setShowAll,
  ] = useState(false);

  const [rosterPage, setRosterPage] = useState(1);
  const [monthlyPage, setMonthlyPage] = useState(1);

  const [activeNav, setActiveNav] = useState("overview");


  // ===================================================
  // ADD STUDENT NAME
  // ===================================================

  const [
    newStudentName,
    setNewStudentName,
  ] = useState("");


  // ===================================================
  // ADD STUDENT DIALOG
  // ===================================================

  const [
    addStudentOpen,
    setAddStudentOpen,
  ] = useState(false);


  // ===================================================
  // MODAL
  // ===================================================

  const [
    modal,
    setModal,
  ] =
    useState<
      "manual" |
      "scanner" |
      null
    >(null);


  // ===================================================
  // SELECTED STUDENT
  // ===================================================

  const [
    selectedId,
    setSelectedId,
  ] =
    useState<
      number | ""
    >("");


  // ===================================================
  // SELECTED STATUS
  // ===================================================

  const [
    selectedStatus,
    setSelectedStatus,
  ] =
    useState<Status>(
      "Present"
    );


  // ===================================================
  // NOTICE
  // ===================================================

  const [
    notice,
    setNotice,
  ] = useState("");


  // ===================================================
  // CAMERA ERROR
  // ===================================================

  const [
    cameraError,
    setCameraError,
  ] = useState("");


  // ===================================================
  // DATE
  // ===================================================

  const [
    selectedDate,
    setSelectedDate,
  ] =
    useState<string>(
      getLocalDate()
    );


  // ===================================================
  // MONTHLY MONTH
  // ===================================================

  const [
    monthlyMonth,
    setMonthlyMonth,
  ] =
    useState<string>(
      getCurrentMonth()
    );


  // ===================================================
  // MONTHLY DATA
  // ===================================================

  const [
    monthlyData,
    setMonthlyData,
  ] =
    useState<
      AttendanceRecord[]
    >([]);

  const monthlyStatusIndex = useMemo(() => {
    const index = new Map<string, AttendanceRecord>();
    for (const record of monthlyData) {
      const key = `${record.student}\u0000${record.date.slice(0, 10)}`;
      const previous = index.get(key);
      if (!previous || record.id > previous.id) index.set(key, record);
    }
    return index;
  }, [monthlyData]);


  // ===================================================
  // MONTHLY SEARCH
  // ===================================================

  const [
    monthlySearch,
    setMonthlySearch,
  ] = useState("");


  // ===================================================
  // SELECTED MONTHLY DAY
  // ===================================================

  const [
    selectedMonthlyDay,
    setSelectedMonthlyDay,
  ] = useState<number | null>(null);

  const [
    selectedMonthlyStatus,
    setSelectedMonthlyStatus,
  ] = useState<"Present" | "Absent" | "On leave" | null>(null);


  // ===================================================
  // REFS
  // ===================================================

  const videoRef =
    useRef<HTMLVideoElement>(
      null
    );

  const rosterRef =
    useRef<HTMLElement>(
      null
    );

  const trendRef =
    useRef<HTMLElement>(
      null
    );

  const monthlyRef =
    useRef<HTMLElement>(
      null
    );

  const rosterCacheRef = useRef<Student[] | null>(null);
  const rosterRequestRef = useRef<Promise<Student[] | null> | null>(null);
  const attendanceDateLoadRef = useRef(0);


  // ===================================================
  // STATUS COUNTS
  // ===================================================

  const counts =
    useMemo(
      () => ({

        Present:
          students.filter(
            s =>
              s.status ===
              "Present"
          ).length,

        Late:
          students.filter(
            s =>
              s.status ===
              "Late"
          ).length,

        Absent:
          students.filter(
            s =>
              s.status ===
              "Absent"
          ).length,

        "On leave":
          students.filter(
            s =>
              s.status ===
              "On leave"
          ).length,

        Holiday:
          students.filter(
            s =>
              s.status ===
              "Holiday"
          ).length,

      }),

      [students]
    );


  // ===================================================
  // FILTER + SEARCH
  // ===================================================

  const visible = useMemo(
    () => students.filter(
      student => {

        const matchesSearch =
          student.name
            .toLowerCase()
            .includes(
              query
                .toLowerCase()
                .trim()
            );

        const matchesFilter =
          filter === "All" ||
          student.status ===
            filter;

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    ),
    [students, query, filter],
  );

  const rosterExpanded = showAll || query.trim() !== "" || filter !== "All";
  const rosterPageCount = Math.max(1, Math.ceil(visible.length / ROSTER_PAGE_SIZE));
  const currentRosterPage = Math.min(rosterPage, rosterPageCount);


  // ===================================================
  // LISTED STUDENTS
  // ===================================================

  const listed = rosterExpanded
    ? visible.slice(
        (currentRosterPage - 1) * ROSTER_PAGE_SIZE,
        currentRosterPage * ROSTER_PAGE_SIZE,
      )
    : visible.slice(0, 3);

  useEffect(() => {
    setRosterPage(1);
  }, [query, filter, showAll]);

  useEffect(() => {
    setMonthlyPage(1);
  }, [monthlySearch, monthlyMonth]);


  // ===================================================
  // GET STUDENTS FROM DATABASE
  // ===================================================

  async function getStudents(): Promise<
    Student[] | null
  > {

    try {

      const response =
        await axios.get(
          "/attendance/students"
        );

      const data =
        response.data;

      const databaseStudents:
        Student[] =
        data.map(
          (
            student: {
              id: number;
              name: string;
            }
          ) => ({

            id:
              student.id,

            name:
              student.name,

            status:
              "Not marked",

            time:
              undefined,

          })
        );

      rosterCacheRef.current = databaseStudents;

      setStudents(
        databaseStudents
      );

      return databaseStudents;

    } catch (error) {

      console.log(
        "Students load error:",
        error
      );

      setStudents([]);
      rosterCacheRef.current = null;
      rosterRequestRef.current = null;

      setNotice(
        "Students load nahi hue"
      );

      return null;
    }
  }


  // ===================================================
  // GET ATTENDANCE BY DATE
  // ===================================================

  async function getAttendanceByDate(
    date: string,
    studentList?: Student[],
    requestId?: number,
  ) {

    try {

      const response =
        await axios.get(
          `/attendance?attendance_date=${encodeURIComponent(date)}`
        );

      const data =
        response.data;

      if (requestId !== undefined && requestId !== attendanceDateLoadRef.current) return;

      const latestAttendanceByStudent = new Map<string, AttendanceRecord>();
      for (const record of data as AttendanceRecord[]) {
        const previous = latestAttendanceByStudent.get(record.student);
        if (!previous || record.id > previous.id) {
          latestAttendanceByStudent.set(record.student, record);
        }
      }

      setStudents(
        current => {

          const list =
            studentList ??
            current;

          return list.map(
            student => {

              const record = latestAttendanceByStudent.get(student.name) ?? null;

              if (record) {

                return {
                  ...student,

                  status:
                    record.status,

                  time:
                    record.time ??
                    undefined,
                };

              }

              return {
                ...student,

                status:
                  "Not marked",

                time:
                  undefined,
              };

            }
          );

        }
      );

    } catch (error) {

      console.log(
        error
      );

      setNotice(
        "Attendance load nahi hui"
      );

    }
  }


  // ===================================================
  // DATE CHANGE + INITIAL LOAD
  // ===================================================

  useEffect(
    () => {
      getWeeklySummary();
    },
    [],
  );

  useEffect(
    () => {
      const requestId = ++attendanceDateLoadRef.current;

      async function loadAttendanceForDate() {
        let databaseStudents = rosterCacheRef.current;
        const hadCachedRoster = databaseStudents !== null;

        if (!databaseStudents) {
          rosterRequestRef.current ??= getStudents();
          databaseStudents = await rosterRequestRef.current;
        }

        if (!databaseStudents || requestId !== attendanceDateLoadRef.current) return;

        await getAttendanceByDate(
          selectedDate,
          hadCachedRoster ? undefined : databaseStudents,
          requestId,
        );
      }

      loadAttendanceForDate();

      return () => {
        if (attendanceDateLoadRef.current === requestId) attendanceDateLoadRef.current++;
      };

    },

    [selectedDate]
  );


  // ===================================================
  // MONTHLY API
  // ===================================================

  async function getMonthlySummary(
    month: string
  ) {

    try {

      const response =
        await axios.get(
          `/monthly-summary?month=${month}`
        );

      console.log(
        "Monthly data:",
        response.data
      );

      setMonthlyData(
        response.data
      );

    } catch (error) {

      console.log(
        error
      );

      setNotice(
        "Monthly data load nahi hua"
      );

    }
  }

  async function getWeeklySummary() {
    try {
      const response = await axios.get("/attendance/summary");
      setWeeklyAttendance(response.data.map((row: WeeklyAttendance) => ({
        attendanceDate: row.attendanceDate,
        present: Number(row.present || 0),
        absent: Number(row.absent || 0),
        late: Number(row.late || 0),
      })));
    } catch (error) {
      console.log("Weekly attendance load error:", error);
      setWeeklyAttendance([]);
    }
  }

  const weeklyChart = useMemo(() => {
    const recent = [...weeklyAttendance]
      .sort((a, b) => a.attendanceDate.localeCompare(b.attendanceDate))
      .slice(-5);
    const days = recent.map(row => {
      const total = students.length || row.present + row.absent + row.late;
      return {
        day: new Date(`${row.attendanceDate}T00:00:00`).toLocaleDateString("en-US", { weekday: "short" }),
        value: total ? Math.round(((row.present + row.late) / total) * 100) : 0,
      };
    });
    const average = days.length
      ? Math.round(days.reduce((sum, item) => sum + item.value, 0) / days.length)
      : null;
    return { days, average };
  }, [weeklyAttendance, students]);


  // ===================================================
  // MONTH CHANGE
  // ===================================================

  useEffect(
    () => {

      getMonthlySummary(
        monthlyMonth
      );

    },

    [monthlyMonth]
  );


  // ===================================================
  // MONTH DAYS
  // ===================================================

  const monthlyDays =
    useMemo(
      () => {

        const parts =
          monthlyMonth.split(
            "-"
          );

        const year =
          Number(
            parts[0]
          );

        const month =
          Number(
            parts[1]
          );

        if (
          !year ||
          !month
        ) {

          return [];

        }

        const totalDays =
          new Date(
            year,
            month,
            0
          ).getDate();

        return Array.from(
          {
            length:
              totalDays,
          },
          (_, index) =>
            index + 1
        );

      },

      [monthlyMonth]
    );

  const monthlyDailySummaries = useMemo(() => {
    const summaries = new Map<number, {
      present: number;
      absent: number;
      leave: number;
      holiday: number;
      totalStudent: number;
    }>();
    const rosterNames = new Set(students.map(student => student.name));

    for (const day of monthlyDays) {
      summaries.set(day, {
        present: 0,
        absent: 0,
        leave: 0,
        holiday: 0,
        totalStudent: students.length,
      });
    }

    for (const record of monthlyStatusIndex.values()) {
      if (!rosterNames.has(record.student) || record.date.slice(0, 7) !== monthlyMonth) continue;
      const day = Number(record.date.slice(8, 10));
      const summary = summaries.get(day);
      if (!summary) continue;

      if (record.status === "Present" || record.status === "Late") summary.present++;
      else if (record.status === "Absent") summary.absent++;
      else if (record.status === "On leave") summary.leave++;
      else if (record.status === "Holiday") summary.holiday++;
    }

    return summaries;
  }, [monthlyDays, monthlyMonth, monthlyStatusIndex, students]);


  // ===================================================
  // MONTHLY STATUS
  // ===================================================

  function getMonthlyStatus(
    studentName: string,
    day: number
  ): Status | "-" {

    const date =
      `${monthlyMonth}-${String(
        day
      ).padStart(
        2,
        "0"
      )}`;

    const record = monthlyStatusIndex.get(`${studentName}\u0000${date}`) ?? null;

    if (record) {

      return record.status;

    }

    const today =
      getLocalDate();

    if (date > today) {

      return "-";

    }

    return "Not marked";
  }


  // ===================================================
  // DAILY SUMMARY
  // ===================================================

  function getDailySummary(day: number) {
    return monthlyDailySummaries.get(day) ?? {
      present: 0,
      absent: 0,
      leave: 0,
      holiday: 0,
      totalStudent: students.length,
    };
  }


  // ===================================================
  // SELECTED DATE STUDENTS
  // ===================================================

  const selectedDateStudents = useMemo(() => {
    if (
      selectedMonthlyDay === null ||
      selectedMonthlyStatus === null
    ) {
      return [];
    }

    return students
      .map(student => ({
        ...student,
        monthlyStatus: getMonthlyStatus(
          student.name,
          selectedMonthlyDay
        ),
      }))
      .filter(student => {
        if (selectedMonthlyStatus === "Present") {
          return (
            student.monthlyStatus === "Present" ||
            student.monthlyStatus === "Late"
          );
        }

        return student.monthlyStatus === selectedMonthlyStatus;
      });
  }, [students, selectedMonthlyDay, selectedMonthlyStatus, monthlyMonth, monthlyStatusIndex]);


  // ===================================================
  // MONTHLY STUDENT COUNT
  // ===================================================

  function getStudentMonthlyCount(
    studentName: string
  ) {

    let present = 0;
    let late = 0;
    let absent = 0;
    let leave = 0;
    let holiday = 0;

    monthlyDays.forEach(
      day => {

        const status =
          getMonthlyStatus(
            studentName,
            day
          );

        if (
          status ===
          "Present"
        ) {
          present++;
        }

        if (
          status ===
          "Late"
        ) {
          late++;
        }

        if (
          status ===
          "Absent"
        ) {
          absent++;
        }

        if (
          status ===
          "On leave"
        ) {
          leave++;
        }

        if (
          status ===
          "Holiday"
        ) {
          holiday++;
        }

      }
    );

    return {

      present,

      late,

      absent,

      leave,

      holiday,

      totalDays: monthlyDays.length,

    };
  }


  // ===================================================
  // ADD STUDENT
  // ===================================================

  async function addStudent() {

    const studentName =
      newStudentName.trim();

    if (
      studentName === ""
    ) {

      setNotice(
        "Student name enter karo"
      );

      return;

    }


    const alreadyExists =
      students.some(
        student =>
          student.name
            .toLowerCase() ===
          studentName
            .toLowerCase()
      );


    if (
      alreadyExists
    ) {

      setNotice(
        "Ye student already added hai"
      );

      return;

    }


    try {

      await axios.post(
        "/crm/students",
        {
          name:
            studentName,
        }
      );


      const databaseStudents =
        await getStudents();


      if (
        databaseStudents
      ) {

        await getAttendanceByDate(
          selectedDate,
          databaseStudents
        );

      }


      setNewStudentName(
        ""
      );

      setAddStudentOpen(
        false
      );

      setShowAll(
        true
      );

      setNotice(
        `${studentName} added successfully`
      );

      window.setTimeout(
        () =>
          setNotice(""),
        3000
      );

    } catch (error) {

      console.log(
        "Add student error:",
        error
      );

      setNotice(
        "Student add nahi hua"
      );

    }

  }


  // ===================================================
  // REMOVE STUDENT
  // ===================================================

  async function removeStudent(
    studentId: number
  ) {

    const student =
      students.find(
        s =>
          s.id ===
          studentId
      );

    if (!student) {

      return;

    }


    const confirmDelete =
      window.confirm(
        `Remove ${student.name}?`
      );


    if (
      !confirmDelete
    ) {

      return;

    }


    try {

      await axios.delete(
        `/attendance/students/${studentId}`
      );


      const databaseStudents =
        await getStudents();


      if (
        databaseStudents
      ) {

        await getAttendanceByDate(
          selectedDate,
          databaseStudents
        );

      }


      setNotice(
        `${student.name} removed`
      );

      window.setTimeout(
        () =>
          setNotice(""),
        3000
      );

    } catch (error) {

      console.log(
        "Remove student error:",
        error
      );

      setNotice(
        "Student remove nahi hua"
      );

    }

  }


  // ===================================================
  // CAMERA
  // ===================================================

  useEffect(
    () => {

      if (
        modal !==
        "scanner"
      ) {

        return;

      }

      let stream:
        | MediaStream
        | undefined;

      let canceled =
        false;

      navigator.mediaDevices
        ?.getUserMedia({
          video: {
            facingMode:
              "environment",
          },
        })
        .then(
          s => {

            if (
              canceled
            ) {

              s.getTracks()
                .forEach(
                  track =>
                    track.stop()
                );

              return;

            }

            stream =
              s;

            if (
              videoRef.current
            ) {

              videoRef.current.srcObject =
                s;

            }

          }
        )
        .catch(
          () => {

            setCameraError(
              "Camera access isn't available here. Use manual entry instead."
            );

          }
        );

      if (
        !navigator.mediaDevices
      ) {

        setCameraError(
          "Camera access isn't available here. Use manual entry instead."
        );

      }

      return () => {

        canceled =
          true;

        stream
          ?.getTracks()
          .forEach(
            track =>
              track.stop()
          );

      };

    },

    [modal]
  );


  // ===================================================
  // OPEN MANUAL
  // ===================================================

  function openManual(
    id?: number
  ) {

    setSelectedId(
      id ?? ""
    );

    setSelectedStatus(

      id === undefined

        ? "Present"

        : students.find(
            s =>
              s.id ===
              id
          )?.status ??
            "Present"

    );

    setModal(
      "manual"
    );

  }


  // ===================================================
  // SAVE ATTENDANCE
  // ===================================================

  async function saveAttendance(
    studentId: number,
    status: Status
  ) {

    const student =
      students.find(
        s =>
          s.id ===
          studentId
      );

    if (!student) {

      return;

    }

    try {

      const response =
        await axios.post(
          "/attendance",
          {
            attendanceDate: selectedDate,
            records: [{ studentName: student.name, status }],
          }
        );

      console.log(
        "Save response:",
        response.data
      );


      setStudents(
        current =>
          current.map(
            s => {

              if (
                s.id !==
                studentId
              ) {

                return s;

              }

              return {
                ...s,

                status:
                  status,

                time:
                  status ===
                    "Absent" ||
                  status ===
                    "On leave" ||
                  status ===
                    "Holiday"

                    ? undefined

                    : new Date()
                        .toLocaleTimeString(
                          "en-GB",
                          {
                            hour:
                              "2-digit",
                            minute:
                              "2-digit",
                          }
                        ),
              };

            }
          )
      );


      setSelectedId(
        studentId
      );

      setSelectedStatus(
        status
      );

      setNotice(
        `${student.name} marked ${status}.`
      );

      setModal(
        null
      );


      await getMonthlySummary(
        monthlyMonth
      );


      window.setTimeout(
        () =>
          setNotice(""),
        3000
      );

    } catch (error) {

      console.log(
        error
      );

      setNotice(
        "Attendance save nahi hui"
      );

    }

  }


  // ===================================================
  // MARK ALL STUDENTS HOLIDAY
  // ===================================================

  async function markHoliday() {

    if (
      students.length ===
      0
    ) {

      setNotice(
        "Koi student nahi hai"
      );

      return;

    }


    const confirmHoliday =
      window.confirm(
        `Kya ${selectedDate} ko sabhi students ki attendance Holiday mark karni hai?`
      );


    if (
      !confirmHoliday
    ) {

      return;

    }


    try {

      await Promise.all(
        students.map(
          student =>
            axios.post(
              "/attendance",
              {
                attendanceDate: selectedDate,
                records: [{ studentName: student.name, status: "Holiday" }],
              }
            )
        )
      );


      await getAttendanceByDate(
        selectedDate
      );

      await getMonthlySummary(
        monthlyMonth
      );


      setNotice(
        `All students marked Holiday for ${selectedDate}`
      );

      window.setTimeout(
        () =>
          setNotice(""),
        3000
      );

    } catch (error) {

      console.log(
        "Holiday error:",
        error
      );

      setNotice(
        "Holiday save nahi hui"
      );

    }

  }


  // ===================================================
  // SCROLL
  // ===================================================

  function scrollTo(
    section:
      | "roster"
      | "trend"
      | "monthly"
  ) {

    const ref =
      section ===
        "roster"

        ? rosterRef

        : section ===
          "trend"

          ? trendRef

          : monthlyRef;

    ref.current?.scrollIntoView(
      {
        behavior:
          "smooth",

        block:
          "start",
      }
    );

  }


  // ===================================================
  // DAILY CSV
  // ===================================================

  function downloadReport() {

    const csv =
      [
        "Name,Status,Check-in time",

        ...students.map(
          s =>
            `"${s.name}",${s.status},${
              s.time ??
              ""
            }`
        ),
      ].join(
        "\n"
      );

    const url =
      URL.createObjectURL(
        new Blob(
          [csv],
          {
            type:
              "text/csv",
          }
        )
      );

    const link =
      document.createElement(
        "a"
      );

    link.href =
      url;

    link.download =
      "attendio-attendance.csv";

    link.click();

    URL.revokeObjectURL(
      url
    );

  }


  // ===================================================
  // MONTHLY CSV
  // ===================================================

  function downloadMonthlyReport() {

    const header = [

      "Student",

      ...monthlyDays.map(
        day =>
          String(day)
      ),

      "Present",

      "Late",

      "Absent",

      "On Leave",

      "Holiday",

      "Total Days",

    ];


    const rows =
      students.map(
        student => {

          const studentName =
            student.name;

          const count =
            getStudentMonthlyCount(
              studentName
            );

          const dayValues =
            monthlyDays.map(
              day => {

                const status =
                  getMonthlyStatus(
                    studentName,
                    day
                  );

                if (
                  status ===
                  "Present"
                ) {

                  return "P";

                }

                if (
                  status ===
                  "Late"
                ) {

                  return "L";

                }

                if (
                  status ===
                  "Absent"
                ) {

                  return "A";

                }

                if (
                  status ===
                  "On leave"
                ) {

                  return "LV";

                }

                if (
                  status ===
                  "Holiday"
                ) {

                  return "H";

                }

                return "-";

              }
            );

          return [

            studentName,

            ...dayValues,

            count.present,

            count.late,

            count.absent,

            count.leave,

            count.holiday,

            count.totalDays,

          ];

        }
      );


    const csv = [

      header.join(","),

      ...rows.map(
        row =>
          row
            .map(
              value =>
                `"${value}"`
            )
            .join(",")
      ),

    ].join(
      "\n"
    );


    const url =
      URL.createObjectURL(
        new Blob(
          [csv],
          {
            type:
              "text/csv",
          }
        )
      );


    const link =
      document.createElement(
        "a"
      );

    link.href =
      url;

    link.download =
      `attendance-${monthlyMonth}.csv`;

    link.click();

    URL.revokeObjectURL(
      url
    );

  }


  // ===================================================
  // MONTHLY SEARCHED STUDENTS
  // ===================================================

  const monthlyStudents = useMemo(
    () => students.filter(
      student =>
        student.name
          .toLowerCase()
          .includes(
            monthlySearch
              .toLowerCase()
              .trim()
          )
    ),
    [students, monthlySearch],
  );

  const monthlyPageCount = Math.max(1, Math.ceil(monthlyStudents.length / MONTHLY_PAGE_SIZE));
  const currentMonthlyPage = Math.min(monthlyPage, monthlyPageCount);
  const pagedMonthlyStudents = monthlyStudents.slice(
    (currentMonthlyPage - 1) * MONTHLY_PAGE_SIZE,
    currentMonthlyPage * MONTHLY_PAGE_SIZE,
  );


  // ===================================================
  // UI
  // ===================================================

  return (

    <div className="attendance-management-root ambient-surface min-h-screen overflow-hidden text-foreground">

      <div className="attendance-page-shell relative mx-auto max-w-[1200px] px-4 py-5 sm:px-7 sm:py-8 lg:px-8">


        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <header className="attendance-header glass-panel flex min-h-20 items-center justify-between gap-4 rounded-2xl px-4 py-3 sm:px-6">

          <nav className="attendance-header-nav hidden items-center gap-7 text-[13px] font-medium text-muted-foreground md:flex" aria-label="Attendance sections">

            <Button
              variant="ghost"
              size="sm"
              className={`attendance-nav-link${activeNav === "overview" ? " is-active" : ""}`}
              onClick={() =>
                {
                  setActiveNav("overview");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }
            >
              Overview
            </Button>


            <Button
              variant="ghost"
              size="sm"
              className={`attendance-nav-link${activeNav === "live" ? " is-active" : ""}`}
              onClick={() => { setActiveNav("live"); scrollTo("roster"); }}
            >
              Live
            </Button>


            <Button
              variant="ghost"
              size="sm"
              className={`attendance-nav-link${activeNav === "records" ? " is-active" : ""}`}
              onClick={() => {

                setActiveNav("records");

                setShowAll(
                  true
                );

                scrollTo(
                  "roster"
                );

              }}
            >
              Records
            </Button>


            <Button
              variant="ghost"
              size="sm"
              className={`attendance-nav-link${activeNav === "reports" ? " is-active" : ""}`}
              onClick={() => { setActiveNav("reports"); scrollTo("monthly"); }}
            >
              Reports
            </Button>

          </nav>


          <div className="attendance-header-actions flex items-center gap-3">

            <Button
              variant="glow"
              className="attendance-header-checkin h-10 rounded-xl px-4 text-[13px]"
              onClick={() =>
                openManual()
              }
            >

              <span className="attendance-header-checkin-label">
                Check in
              </span>

            </Button>


            <div className="attendance-header-avatar avatar-gradient grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-primary-foreground">
              RM
            </div>

          </div>

        </header>


        <main>


          {/* ================================================= */}
          {/* TOP */}
          {/* ================================================= */}

          <div className="attendance-top-grid mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">


            {/* SESSION */}

            <section className="attendance-session-card glass-panel rounded-3xl p-6 sm:p-8 lg:col-span-8">

              <div className="flex flex-wrap items-start justify-between gap-4">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Live session · 09:00–10:30
                  </p>


                  <h1 className="mt-3 font-display text-[28px] font-bold leading-tight sm:text-[34px]">
                    Morning Assembly
                  </h1>


                  <p className="mt-1 text-sm text-muted-foreground">
                    Block C · {students.length} students expected
                  </p>

                </div>


                <div className="text-left sm:text-right">

                  <p className="text-[11px] uppercase text-muted-foreground">
                    Present
                  </p>


                  <p className="font-display text-[46px] font-bold leading-none text-success">

                    {
                      counts.Present + counts.Late
                    }

                    <span className="text-xl text-muted-foreground">
                      /{students.length}
                    </span>

                  </p>

                </div>

              </div>


              {/* DATE */}

              <div className="mt-5">

                <label className="text-xs font-medium text-muted-foreground">
                  Attendance Date
                </label>


                <div className="flex flex-wrap items-center gap-3">

                  <input
                    type="date"
                    value={
                      selectedDate
                    }
                    onChange={e =>
                      setSelectedDate(
                        e.target.value
                      )
                    }
                    className="glass-inset mt-2 h-10 rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />


                  <Button
                    variant="glow"
                    className="mt-2 h-10 rounded-xl"
                    onClick={
                      markHoliday
                    }
                  >
                    Holiday
                  </Button>

                </div>

              </div>


              {/* PROGRESS */}

              <div className="attendance-progress-track mt-6 h-3 overflow-hidden rounded-full bg-foreground/8">

                <div
                  className="attendance-gradient h-full rounded-full transition-all duration-500"
                  style={{
                    width:
                      `${
                        students.length
                          ? (
                              (counts.Present + counts.Late) /
                              students.length
                            ) *
                            100
                          : 0
                      }%`,
                  }}
                />

              </div>


              {/* STATUS CARDS */}

              <div className="attendance-status-grid mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">

                {(
                  [
                    "Present",
                    "Late",
                    "Absent",
                    "On leave",
                  ] as Status[]
                ).map(
                  status => (

                    <button
                      key={
                        status
                      }
                      type="button"
                      onClick={() => {

                        setFilter(
                          status
                        );

                        setShowAll(
                          true
                        );

                        scrollTo(
                          "roster"
                        );

                      }}
                      className="glass-inset rounded-2xl p-4 text-left transition hover:scale-[1.02] sm:p-5"
                    >

                      <p className="text-xs text-muted-foreground">
                        {
                          status
                        }
                      </p>

                      <p
                        className={`mt-1 font-display text-[28px] font-bold ${
                          status ===
                          "Present"

                            ? "text-success"

                            : status ===
                              "Late"

                              ? "text-warning"

                              : status ===
                                "Absent"

                                ? "text-danger"

                                : "text-lavender"
                        }`}
                      >

                        {
                          counts[
                            status
                          ]
                        }

                      </p>

                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Click to view
                      </p>

                    </button>

                  )
                )}

              </div>

            </section>


            {/* SCANNER */}

            <section className="attendance-scanner-card glass-panel flex flex-col items-center rounded-3xl p-7 text-center lg:col-span-4">

              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Scan to check in
              </h2>


              <div className="attendance-qr-wrap relative my-6">

                <div className="attendance-qr-pulse scan-pulse absolute inset-0 rounded-full border-2 border-primary/40" />

                <div className="attendance-qr-ring brand-gradient grid size-40 place-items-center rounded-full shadow-glow">

                  <div className="attendance-qr-inner grid size-28 place-items-center rounded-full bg-glass-strong">

                    <div className="attendance-qr-pattern grid size-16 grid-cols-5 grid-rows-5 gap-1">

                      {[
                        0,
                        1,
                        3,
                        5,
                        8,
                        12,
                        13,
                        16,
                        19,
                        22,
                      ].map(
                        i => (

                          <span
                            key={
                              i
                            }
                            className="attendance-qr-dot rounded-[2px] bg-foreground"
                            style={{
                              gridColumn:
                                (i %
                                  5) +
                                1,
                              gridRow:
                                Math.floor(
                                  i /
                                    5
                                ) +
                                1,
                            }}
                          />

                        )
                      )}

                    </div>

                  </div>

                </div>

              </div>


              <Button
                variant="glow"
                className="h-12 w-full rounded-xl"
                onClick={() => {

                  setCameraError(
                    ""
                  );

                  setModal(
                    "scanner"
                  );

                }}
              >

                <Camera />

                Open QR scanner

              </Button>


              <Button
                variant="glass"
                className="mt-3 h-12 w-full rounded-xl"
                onClick={() =>
                  openManual()
                }
              >

                <ClipboardCheck />

                Manual entry

              </Button>

            </section>

          </div>


          {/* ================================================= */}
          {/* ROSTER + WEEKLY */}
          {/* ================================================= */}

          <div className="attendance-records-grid mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">


            {/* ROSTER */}

            <section
              ref={
                rosterRef
              }
              className="attendance-roster-card glass-panel scroll-mt-6 rounded-3xl p-6 sm:p-7 lg:col-span-7"
            >

              <div className="flex flex-wrap items-center justify-between gap-3">

                <div>

                  <h2 className="font-display text-lg font-bold">
                    Who's in the room
                  </h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {students.length} students
                  </p>

                </div>


                <div className="flex items-center gap-2">

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary"
                    onClick={() =>
                      setShowAll(
                        !showAll
                      )
                    }
                  >

                    {
                      showAll
                        ? "Show less"
                        : "View all"
                    }

                    <ArrowRight className="size-4" />

                  </Button>

                </div>

              </div>


              {/* SEARCH */}

              <div className="attendance-roster-toolbar mt-5 flex flex-col gap-3 sm:flex-row">

                <div className="attendance-roster-search relative flex-1">

                  <Search className="attendance-roster-search-icon absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />


                  <Input
                    placeholder="Search students"
                    value={
                      query
                    }
                    onChange={e =>
                      setQuery(
                        e.target.value
                      )
                    }
                    className="attendance-roster-search-input glass-inset h-10 rounded-xl pl-9"
                  />

                </div>


                <div className="relative">

                  <DropdownSelect
                    value={filter}
                    onChange={value => setFilter(value as Status | "All")}
                    placeholder="All"
                    className="attendance-custom-select"
                    style={{ width: "100%" }}
                    options={["All", "Present", "Late", "Absent", "On leave", "Not marked"].map(value => ({ value, label: value }))}
                  />
                </div>

              </div>


              {/* STUDENTS */}

              <div className="attendance-student-grid mt-5">

                {listed.map(
                  student => (

                    <div
                      key={
                        student.id
                      }
                      className="attendance-student-tile"
                    >

                      <div className="flex items-center gap-3">

                        <div
                          className={`attendance-student-avatar grid size-10 shrink-0 place-items-center rounded-full text-xs font-semibold text-primary-foreground ${
                            student.status ===
                            "Late"

                              ? "is-late"

                              : student.status ===
                                "Absent"

                                ? "is-absent"

                                : "is-present"
                          }`}
                        >

                          {student.name
                            .split(
                              " "
                            )
                            .map(
                              part =>
                                part[
                                  0
                                ]
                            )
                            .join(
                              ""
                            )}

                        </div>


                        <div className="min-w-0 flex-1">

                          <p className="attendance-student-name truncate font-semibold">
                            {
                              student.name
                            }
                          </p>

                          <p className="attendance-checkin-time text-muted-foreground">

                            {
                              student.time
                                ? `Checked in ${student.time}`
                                : "No check-in yet"
                            }

                          </p>

                        </div>


                        <span
                          className={`attendance-status-badge attendance-status-badge-${student.status === "On leave" ? "leave" : student.status.toLowerCase().replaceAll(" ", "-")} shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyles[student.status]}`}
                        >
                          {
                            student.status
                          }
                        </span>


                        <Button
                          variant="ghost"
                          size="icon"
                          className="attendance-icon-button attendance-delete-icon-button size-8 shrink-0 text-danger hover:bg-danger/10 hover:text-danger"
                          title="Remove student"
                          onClick={() =>
                            removeStudent(
                              student.id
                            )
                          }
                        >

                          <Trash2 className="size-4" />

                        </Button>

                      </div>


                      {/* FOUR STATUS BUTTONS */}

                      <div className="attendance-mark-grid mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">

                        <button
                          type="button"
                          onClick={() =>
                            saveAttendance(
                              student.id,
                              "Present"
                            )
                          }
                          className={`attendance-mark-button attendance-mark-present rounded-xl px-3 py-2 text-xs font-semibold transition ${
                            student.status ===
                            "Present"

                              ? "bg-success text-white"

                              : "bg-success/10 text-success hover:bg-success/20"
                          }`}
                        >
                          Present
                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            saveAttendance(
                              student.id,
                              "Late"
                            )
                          }
                          className={`attendance-mark-button attendance-mark-late rounded-xl px-3 py-2 text-xs font-semibold transition ${
                            student.status ===
                            "Late"

                              ? "bg-warning text-white"

                              : "bg-warning/10 text-warning hover:bg-warning/20"
                          }`}
                        >
                          Late
                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            saveAttendance(
                              student.id,
                              "Absent"
                            )
                          }
                          className={`attendance-mark-button attendance-mark-absent rounded-xl px-3 py-2 text-xs font-semibold transition ${
                            student.status ===
                            "Absent"

                              ? "bg-danger text-white"

                              : "bg-danger/10 text-danger hover:bg-danger/20"
                          }`}
                        >
                          Absent
                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            saveAttendance(
                              student.id,
                              "On leave"
                            )
                          }
                          className={`attendance-mark-button attendance-mark-leave rounded-xl px-3 py-2 text-xs font-semibold transition ${
                            student.status ===
                            "On leave"

                              ? "bg-lavender text-white"

                              : "bg-lavender/10 text-lavender hover:bg-lavender/20"
                          }`}
                        >
                          On leave
                        </button>

                      </div>

                    </div>

                  )
                )}


                {listed.length ===
                  0 && (

                  <div className="py-8 text-center">

                    <Search className="mx-auto size-8 text-muted-foreground" />

                    <p className="mt-2 text-sm text-muted-foreground">
                      No students found.
                    </p>

                  </div>

                )}

                {rosterExpanded && visible.length > ROSTER_PAGE_SIZE && (
                  <div className="attendance-pagination">
                    <span>
                      Showing {(currentRosterPage - 1) * ROSTER_PAGE_SIZE + 1}–{Math.min(currentRosterPage * ROSTER_PAGE_SIZE, visible.length)} of {visible.length} students
                    </span>
                    <div className="attendance-pagination-actions">
                      <Button variant="outline" size="sm" disabled={currentRosterPage === 1} onClick={() => setRosterPage(page => Math.max(1, page - 1))} aria-label="Previous roster page">
                        Previous
                      </Button>
                      <span>Page {currentRosterPage} of {rosterPageCount}</span>
                      <Button variant="outline" size="sm" disabled={currentRosterPage === rosterPageCount} onClick={() => setRosterPage(page => Math.min(rosterPageCount, page + 1))} aria-label="Next roster page">
                        Next
                      </Button>
                    </div>
                  </div>
                )}

              </div>

            </section>


            {/* WEEKLY */}

            <section
              ref={
                trendRef
              }
              className="attendance-weekly-card glass-panel rounded-3xl p-6 sm:p-7 lg:col-span-5"
            >

              <div className="flex items-center justify-between">

                <h2 className="font-display text-lg font-bold">
                  Weekly attendance
                </h2>

                <Button
                  variant="ghost"
                  size="icon"
                  className="attendance-icon-button attendance-download-icon-button"
                  onClick={
                    downloadReport
                  }
                >

                  <Download />

                </Button>

              </div>


              {weeklyChart.days.length ? (
                <div className="attendance-weekly-bars mt-6 flex h-40 items-end justify-between gap-3">
                  {weeklyChart.days.map(({ day, value }) => (
                    <div key={day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                      <div
                        className={`attendance-weekly-bar${value < 60 ? " is-low" : ""}`}
                        style={{ height: `${value}%` }}
                      />
                      <span className="text-[11px] text-muted-foreground">{day}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="attendance-weekly-empty mt-6">No attendance recorded this week.</div>
              )}

              <p className="mt-5 text-xs text-muted-foreground">
                {weeklyChart.average === null
                  ? "Attendance data will appear here after attendance is recorded."
                  : <>Average attendance <span className="font-semibold text-foreground">{weeklyChart.average}%</span> this week</>}
              </p>

            </section>

          </div>


          {/* ================================================= */}
          {/* MONTHLY ATTENDANCE */}
          {/* ================================================= */}

          <section
            ref={
              monthlyRef
            }
            className="attendance-monthly-panel glass-panel mt-6 scroll-mt-6 rounded-3xl p-6 sm:p-7"
          >

            <div className="attendance-monthly-heading flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Monthly report
                </p>

                <h2 className="mt-2 font-display text-xl font-bold">
                  Monthly Attendance
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  All students — Excel sheet style
                </p>

              </div>


              <div className="attendance-monthly-controls flex flex-wrap items-center gap-3">

                {/* MONTHLY SEARCH */}

                <div className="attendance-monthly-search relative">

                  <Search className="attendance-monthly-search-icon absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    placeholder="Search student"
                    value={
                      monthlySearch
                    }
                    onChange={e =>
                      setMonthlySearch(
                        e.target.value
                      )
                    }
                    className="attendance-monthly-search-input glass-inset h-10 w-48 rounded-xl pl-9"
                  />

                </div>


                <input
                  type="month"
                  value={
                    monthlyMonth
                  }
                  onChange={e =>
                    setMonthlyMonth(
                      e.target.value
                    )
                  }
                  className="glass-inset h-10 rounded-xl px-3 text-sm outline-none"
                />


                <Button
                  variant="glow"
                  className="h-10 rounded-xl"
                  onClick={
                    downloadMonthlyReport
                  }
                >

                  <Download />

                  Excel/CSV

                </Button>

              </div>

            </div>


            {/* LEGEND */}

            <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">

              <span>
                <b className="text-success">
                  P
                </b>{" "}
                Present
              </span>

              <span>
                <b className="text-warning">
                  L
                </b>{" "}
                Late
              </span>

              <span>
                <b className="text-danger">
                  A
                </b>{" "}
                Absent
              </span>

              <span>
                <b className="text-lavender">
                  LV
                </b>{" "}
                On leave
              </span>

              <span>
                <b className="text-primary">
                  H
                </b>{" "}
                Holiday
              </span>

              <span>
                <b>-</b>{" "}
                Future
              </span>

            </div>


            {/* EXCEL TABLE */}

            <div className="mt-5 overflow-x-auto rounded-2xl border border-border/40">

              <table className="w-max min-w-full border-collapse text-xs">

                <thead>

                  <tr className="bg-foreground/5">

                    <th className="sticky left-0 z-10 min-w-[170px] border-b border-r border-border/40 bg-background/95 px-4 py-3 text-left font-semibold">
                      Student
                    </th>


                    {monthlyDays.map(
                      day => (

                        <th
                          key={day}
                          className="min-w-[45px] border-b border-r border-border/40 px-2 py-3 text-center font-semibold"
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedMonthlyDay(day)}
                            className={`attendance-month-day-button${selectedMonthlyDay === day ? " is-selected" : ""}`}
                            title={`View attendance for day ${day}`}
                            aria-pressed={selectedMonthlyDay === day}
                          >
                            {day}
                          </button>
                        </th>

                      )
                    )}


                    <th className="min-w-[70px] border-b border-r border-border/40 px-2 py-3 text-center font-semibold text-success">
                      Present
                    </th>

                    <th className="min-w-[60px] border-b border-r border-border/40 px-2 py-3 text-center font-semibold text-warning">
                      Late
                    </th>

                    <th className="min-w-[65px] border-b border-r border-border/40 px-2 py-3 text-center font-semibold text-danger">
                      Absent
                    </th>

                    <th className="min-w-[65px] border-b border-r border-border/40 px-2 py-3 text-center font-semibold text-lavender">
                      Leave
                    </th>

                    <th className="min-w-[70px] border-b border-r border-border/40 px-2 py-3 text-center font-semibold text-primary">
                      Holiday
                    </th>

                    <th className="min-w-[90px] border-b border-border/40 px-2 py-3 text-center font-semibold text-primary">
                      Total Days
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {pagedMonthlyStudents.map(
                    (
                      student,
                      studentIndex
                    ) => {

                      const count =
                        getStudentMonthlyCount(
                          student.name
                        );

                      return (

                        <tr
                          key={
                            student.id
                          }
                          className={
                            studentIndex %
                              2 ===
                            0
                              ? "bg-background/20"
                              : "bg-foreground/[0.02]"
                          }
                        >

                          <td className="sticky left-0 z-10 border-b border-r border-border/30 bg-background/95 px-4 py-3 font-medium">

                            {
                              student.name
                            }

                          </td>


                          {monthlyDays.map(
                            day => {

                              const status =
                                getMonthlyStatus(
                                  student.name,
                                  day
                                );

                              return (

                                <td
                                  key={
                                    day
                                  }
                                  className="border-b border-r border-border/30 px-2 py-3 text-center"
                                >

                                  {status ===
                                  "Present" ? (

                                    <span className="font-bold text-success">
                                      P
                                    </span>

                                  ) : status ===
                                    "Late" ? (

                                    <span className="font-bold text-warning">
                                      L
                                    </span>

                                  ) : status ===
                                    "Absent" ? (

                                    <span className="font-bold text-danger">
                                      A
                                    </span>

                                  ) : status ===
                                    "On leave" ? (

                                    <span className="font-bold text-lavender">
                                      LV
                                    </span>

                                  ) : status ===
                                    "Holiday" ? (

                                    <span className="font-bold text-primary">
                                      H
                                    </span>

                                  ) : (

                                    <span className="text-muted-foreground">
                                      -
                                    </span>

                                  )}

                                </td>

                              );

                            }
                          )}


                          <td className="border-b border-r border-border/30 px-2 py-3 text-center font-semibold text-success">
                            {
                              count.present
                            }
                          </td>

                          <td className="border-b border-r border-border/30 px-2 py-3 text-center font-semibold text-warning">
                            {
                              count.late
                            }
                          </td>

                          <td className="border-b border-r border-border/30 px-2 py-3 text-center font-semibold text-danger">
                            {
                              count.absent
                            }
                          </td>

                          <td className="border-b border-r border-border/30 px-2 py-3 text-center font-semibold text-lavender">
                            {
                              count.leave
                            }
                          </td>

                          <td className="border-b border-r border-border/30 px-2 py-3 text-center font-bold text-primary">
                          {
                            count.holiday
                          }
                        </td>

                          <td className="border-b border-border/30 px-2 py-3 text-center font-bold text-primary">
                            {
                              count.totalDays
                            }
                          </td>

                        </tr>

                      );

                    }
                  )}


                  {/* DAILY SUMMARY ROWS */}

                  {[
                    { label: "Present", key: "present", className: "text-success" },
                    { label: "Absent", key: "absent", className: "text-danger" },
                    { label: "On Leave", key: "leave", className: "text-lavender" },
                    { label: "Total Student", key: "totalStudent", className: "text-primary" },
                  ].map(summary => (
                    <tr key={summary.label} className="bg-foreground/5">
                      <td className={`sticky left-0 z-10 border-b border-r border-border/30 bg-background/95 px-4 py-3 font-semibold ${summary.className}`}>
                        {summary.label}
                      </td>

                      {monthlyDays.map(day => {
                        const daily = getDailySummary(day);
                        return (
                          <td
                            key={day}
                            className={`border-b border-r border-border/30 px-2 py-3 text-center font-semibold ${summary.className}`}
                          >
                            {daily[summary.key as keyof typeof daily]}
                          </td>
                        );
                      })}

                      <td
                        colSpan={6}
                        className={`border-b border-border/30 px-2 py-3 text-center font-semibold ${summary.className}`}
                      >
                        —
                      </td>
                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

            {monthlyStudents.length > MONTHLY_PAGE_SIZE && (
              <div className="attendance-pagination">
                <span>
                  Showing {(currentMonthlyPage - 1) * MONTHLY_PAGE_SIZE + 1}–{Math.min(currentMonthlyPage * MONTHLY_PAGE_SIZE, monthlyStudents.length)} of {monthlyStudents.length} students
                </span>
                <div className="attendance-pagination-actions">
                  <Button variant="outline" size="sm" disabled={currentMonthlyPage === 1} onClick={() => setMonthlyPage(page => Math.max(1, page - 1))} aria-label="Previous monthly attendance page">
                    Previous
                  </Button>
                  <span>Page {currentMonthlyPage} of {monthlyPageCount}</span>
                  <Button variant="outline" size="sm" disabled={currentMonthlyPage === monthlyPageCount} onClick={() => setMonthlyPage(page => Math.min(monthlyPageCount, page + 1))} aria-label="Next monthly attendance page">
                    Next
                  </Button>
                </div>
              </div>
            )}


            <div className="mt-4 rounded-xl bg-primary/5 p-3 text-xs text-muted-foreground">
              <b className="text-foreground">Total Days</b>
              = selected month ke total calendar days. Day number par click karke us din ki attendance details dekh sakte ho.
            </div>


            {/* SELECTED DATE DETAILS */}

            {selectedMonthlyDay !== null && (
              <div className="mt-4 rounded-2xl border border-border/40 bg-foreground/5 p-4">

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      Daily attendance
                    </p>
                    <h3 className="mt-1 font-display text-lg font-bold">
                      {monthlyMonth}-{String(selectedMonthlyDay).padStart(2, "0")}
                    </h3>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedMonthlyDay(null);
                      setSelectedMonthlyStatus(null);
                    }}
                    title="Close"
                  >
                    <X />
                  </Button>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {[
                    {
                      label: "Present",
                      key: "present" as const,
                      className: "text-success",
                    },
                    {
                      label: "Absent",
                      key: "absent" as const,
                      className: "text-danger",
                    },
                    {
                      label: "On Leave",
                      key: "leave" as const,
                      className: "text-lavender",
                    },
                  ].map(item => {
                    const daily = getDailySummary(selectedMonthlyDay);
                    const count = daily[item.key];
                    const status =
                      item.label === "On Leave"
                        ? "On leave"
                        : item.label;

                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() =>
                          setSelectedMonthlyStatus(
                            status as "Present" | "Absent" | "On leave"
                          )
                        }
                        className={`rounded-xl border border-border/40 bg-background/60 p-3 text-left transition hover:bg-background ${
                          selectedMonthlyStatus === status
                            ? "ring-2 ring-primary"
                            : ""
                        }`}
                      >
                        <div className={`text-sm font-semibold ${item.className}`}>
                          {item.label}
                        </div>
                        <div className="mt-1 text-2xl font-bold">
                          {count}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedMonthlyStatus !== null && (
                  <div className="mt-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h4 className="font-semibold">
                        {selectedMonthlyStatus === "On leave"
                          ? "On Leave Students"
                          : `${selectedMonthlyStatus} Students`}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {selectedDateStudents.length} student(s)
                      </span>
                    </div>

                    {selectedDateStudents.length === 0 ? (
                      <div className="rounded-xl bg-background/50 p-4 text-sm text-muted-foreground">
                        Is date par {
                          selectedMonthlyStatus === "On leave"
                            ? "On Leave"
                            : selectedMonthlyStatus
                        } student nahi hai.
                      </div>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {selectedDateStudents.map(student => (
                          <div
                            key={student.id}
                            className="glass-inset flex items-center justify-between gap-3 rounded-xl p-3"
                          >
                            <span className="truncate text-sm font-medium">
                              {student.name}
                            </span>

                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                student.monthlyStatus === "Present"
                                  ? statusStyles.Present
                                  : student.monthlyStatus === "Late"
                                    ? statusStyles.Late
                                    : student.monthlyStatus === "Absent"
                                      ? statusStyles.Absent
                                      : statusStyles["On leave"]
                              }`}
                            >
                              {student.monthlyStatus}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

          </section>

        </main>

      </div>


      {/* ================================================= */}
      {/* NOTICE */}
      {/* ================================================= */}

      {notice && (

        <div
          role="status"
          className="glass-panel fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm shadow-lg"
        >

          <UserRoundCheck className="size-4 text-success" />

          {
            notice
          }

          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() =>
              setNotice("")
            }
          >

            <X className="size-3" />

          </Button>

        </div>

      )}


      {/* ================================================= */}
      {/* ADD STUDENT DIALOG */}
      {/* ================================================= */}

      <Dialog
        open={
          addStudentOpen
        }
        onOpenChange={
          setAddStudentOpen
        }
      >

        <DialogContent className="glass-panel max-w-md rounded-2xl border-glass-border p-6">

          <DialogHeader>

            <DialogTitle className="font-display text-xl">
              Add Student
            </DialogTitle>

            <DialogDescription>
              Student ka naam enter karo.
            </DialogDescription>

          </DialogHeader>


          <div className="mt-3 space-y-4">

            <div>

              <label className="text-sm font-medium">
                Student Name
              </label>

              <Input
                autoFocus
                placeholder="Example: Rahul Sharma"
                value={
                  newStudentName
                }
                onChange={e =>
                  setNewStudentName(
                    e.target.value
                  )
                }
                onKeyDown={e => {

                  if (
                    e.key ===
                    "Enter"
                  ) {

                    addStudent();

                  }

                }}
                className="glass-inset mt-2 h-11 rounded-xl"
              />

            </div>


            <div className="flex gap-2">

              <Button
                variant="glass"
                className="h-11 flex-1 rounded-xl"
                onClick={() => {

                  setNewStudentName(
                    ""
                  );

                  setAddStudentOpen(
                    false
                  );

                }}
              >
                Cancel
              </Button>


              <Button
                variant="glow"
                className="h-11 flex-1 rounded-xl"
                onClick={
                  addStudent
                }
              >

                <Plus />

                Add Student

              </Button>

            </div>

          </div>

        </DialogContent>

      </Dialog>


      {/* ================================================= */}
      {/* MANUAL / SCANNER DIALOG */}
      {/* ================================================= */}

      <Dialog
        open={
          modal !==
          null
        }
        onOpenChange={
          open => {

            if (!open) {

              setModal(
                null
              );

            }

          }
        }
      >

        <DialogContent className="glass-panel max-w-md rounded-2xl border-glass-border p-6">


          {/* ================================================= */}
          {/* MANUAL */}
          {/* ================================================= */}

          {modal ===
          "manual" ? (

            <>

              <DialogHeader>

                <DialogTitle className="font-display text-xl">
                  Mark attendance
                </DialogTitle>

                <DialogDescription>
                  Select student and status.
                </DialogDescription>

              </DialogHeader>


              <div className="mt-2 space-y-4">

                <label className="block text-sm font-medium">

                  Student

                  <DropdownSelect
                    value={selectedId === "" ? "" : String(selectedId)}
                    onChange={value => setSelectedId(value === "" ? "" : Number(value))}
                    placeholder="Select a student"
                    className="attendance-custom-select"
                    style={{ width: "100%", marginTop: 8 }}
                    searchable
                    searchPlaceholder="Type a student name..."
                    options={[{ value: "", label: "Select a student" }, ...students.map(student => ({ value: String(student.id), label: student.name }))]}
                  />

                </label>


                <div>

                  <p className="mb-2 text-sm font-medium">
                    Status
                  </p>

                  <div className="grid grid-cols-2 gap-2">

                    {(
                      [
                        "Present",
                        "Late",
                        "Absent",
                        "On leave",
                      ] as Status[]
                    ).map(
                      status => (

                        <Button
                          key={
                            status
                          }
                          variant={
                            selectedStatus ===
                            status
                              ? "glow"
                              : "glass"
                          }
                          className="h-10 rounded-xl"
                          disabled={
                            selectedId ===
                            ""
                          }
                          onClick={() => {

                            if (
                              selectedId ===
                              ""
                            ) {

                              return;

                            }

                            saveAttendance(
                              selectedId,
                              status
                            );

                          }}
                        >

                          {
                            status
                          }

                        </Button>

                      )
                    )}

                  </div>

                </div>


                <p className="text-center text-xs text-muted-foreground">

                  Status select karte hi attendance automatically save ho jayegi.

                </p>

              </div>

            </>

          ) : (

            /* ================================================= */
            /* SCANNER */
            /* ================================================= */

            <>

              <DialogHeader>

                <DialogTitle className="font-display text-xl">
                  Scan to check in
                </DialogTitle>

                <DialogDescription>
                  Point your camera at a student's attendance code.
                </DialogDescription>

              </DialogHeader>


              <div className="glass-inset mt-2 flex aspect-video items-center justify-center overflow-hidden rounded-xl">

                {cameraError ? (

                  <p className="px-6 text-center text-sm text-muted-foreground">
                    {
                      cameraError
                    }
                  </p>

                ) : (

                  <video
                    ref={
                      videoRef
                    }
                    autoPlay
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />

                )}

              </div>


              <p className="flex items-center gap-2 text-xs text-muted-foreground">

                <Clock3 className="size-4" />

                Camera preview only; use manual entry to record attendance.

              </p>


              <Button
                variant="glow"
                className="h-11 rounded-xl"
                onClick={() =>
                  openManual()
                }
              >

                <ClipboardCheck />

                Manual entry

              </Button>

            </>

          )}

        </DialogContent>

      </Dialog>

    </div>

  );
}



