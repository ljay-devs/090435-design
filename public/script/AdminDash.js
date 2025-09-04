// ====== MOBILE SIDEBAR TOGGLE ======
const toggleBtn = document.getElementById("sidebarToggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("show");
  toggleBtn.classList.toggle("change");
  const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
  toggleBtn.setAttribute("aria-expanded", String(!expanded));
});

overlay.addEventListener("click", () => {
  sidebar.classList.remove("active");
  overlay.classList.remove("show");
  toggleBtn.classList.remove("change");
  toggleBtn.setAttribute("aria-expanded", "false");
});

// ====== SECTION SWITCHING (Single Page) ======
const links = document.querySelectorAll(".sidebar .nav-link");
const sections = document.querySelectorAll(".section");

links.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.getAttribute("data-section");
    // active style
    links.forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    // show section
    sections.forEach(sec => sec.classList.remove("visible"));
    document.getElementById(target).classList.add("visible");

    // close sidebar on mobile when clicking a link
    sidebar.classList.remove("active");
    overlay.classList.remove("show");
    toggleBtn.classList.remove("change");
    toggleBtn.setAttribute("aria-expanded", "false");
  });
});

// ====== MOCK DATA (replace with API later) ======
let sectionsData = {
  "7": [
    { name: "Sunflower", adviser: "Ms. Ramos", students: [] },
    { name: "Rose",       adviser: "Mr. Yulo",  students: [] },
    { name: "Lily",       adviser: "Ms. Cruz",  students: [] },
    { name: "Tulips",     adviser: "Mr. Dela Rosa", students: [] },
  ],
  "8": [{ name: "Emerald", adviser: "Ms. Lim", students: [] }],
  "9": [{ name: "Ruby", adviser: "Mr. Santos", students: [] }],
  "10": [{ name: "Sapphire", adviser: "Ms. Perez", students: [] }],
  "11": [{ name: "Aquila", adviser: "Mr. Reyes", students: [] }],
  "12": [{ name: "Orion", adviser: "Ms. Garcia", students: [] }],
};

let students = [
  { id: "S21-1001", first: "Juan", last: "Dela Cruz", gender: "Male", grade: "9", section: "Ruby" },
  { id: "S21-1002", first: "Ana", last: "Santos", gender: "Female", grade: "7", section: "Sunflower" },
  { id: "S21-1003", first: "Luis", last: "Garcia", gender: "Male", grade: "7", section: "Rose" },
];

let teachers = [
  { id: "T-2001", first: "Mario", last: "Santos", email: "mario.santos@example.com", subject: "Mathematics" },
  { id: "T-2002", first: "Liza", last: "Cruz", email: "liza.cruz@example.com", subject: "English" },
];

let subjects = [
  { code: "ENG7", name: "English 7", grade: "7" },
  { code: "MATH9", name: "Mathematics 9", grade: "9" },
  { code: "SCI10", name: "Science 10", grade: "10" },
];

// Reports: teachers who requested re-attempt approval
let reports = [
  { teacher: "Mario Santos", subject: "Mathematics", level: "Grade 9", reason: "Missed submission window", status: "Pending" },
  { teacher: "Liza Cruz", subject: "English", level: "Grade 7", reason: "System error", status: "Approved" },
];

// ====== HELPERS ======
const byLastName = (a, b) => a.last.localeCompare(b.last);
const fullName = (p) => `${p.last}, ${p.first}`;
const findSectionObj = (grade, secName) =>
  (sectionsData[grade] || []).find(s => s.name === secName);

// Build section student arrays from global students at load:
function rebuildSectionStudents() {
  // clear
  Object.keys(sectionsData).forEach(g => sectionsData[g].forEach(s => s.students = []));
  // place
  students.forEach(stu => {
    const sec = findSectionObj(stu.grade, stu.section);
    if (sec) sec.students.push(stu);
  });
  // sort each section by last name
  Object.keys(sectionsData).forEach(g => sectionsData[g].forEach(s => s.students.sort(byLastName)));
}

function computeStats() {
  document.getElementById("statStudents").textContent = students.length.toString();
  document.getElementById("statTeachers").textContent = teachers.length.toString();
  const totalSections = Object.values(sectionsData).reduce((acc, arr) => acc + arr.length, 0);
  document.getElementById("statSections").textContent = totalSections.toString();
  document.getElementById("statSubjects").textContent = subjects.length.toString();
}

// ====== MANAGE STUDENTS RENDER ======
const studentsTableBody = document.getElementById("studentsTableBody");
const studentSearch = document.getElementById("studentSearch");

function renderStudentsTable() {
  const q = (studentSearch.value || "").toLowerCase();
  studentsTableBody.innerHTML = "";
  students
    .filter(s =>
      [s.id, s.first, s.last, s.grade, s.section].some(v => String(v).toLowerCase().includes(q))
    )
    .sort(byLastName)
    .forEach(s => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s.id}</td>
        <td>${fullName(s)}</td>
        <td>${s.grade}</td>
        <td>${s.section}</td>
        <td>${s.gender}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary me-1" data-action="transfer" data-id="${s.id}">
            <i class="bi bi-arrow-left-right"></i> Transfer
          </button>
          <button class="btn btn-sm btn-outline-danger" data-action="remove" data-id="${s.id}">
            <i class="bi bi-trash"></i>
          </button>
        </td>`;
      studentsTableBody.appendChild(tr);
    });
}
studentSearch.addEventListener("input", renderStudentsTable);

// Actions (transfer/remove)
studentsTableBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = btn.getAttribute("data-id");
  const s = students.find(x => x.id === id);
  if (!s) return;

  if (btn.getAttribute("data-action") === "remove") {
    if (confirm(`Remove student ${fullName(s)}?`)) {
      students = students.filter(x => x.id !== id);
      rebuildSectionStudents();
      renderStudentsTable();
      renderSectionsGrid();
      if (currentSectionDetail) showSectionDetail(currentSectionDetail.grade, currentSectionDetail.name);
      computeStats();
    }
  }

  if (btn.getAttribute("data-action") === "transfer") {
    // open modal, preload options
    openTransferModal(s);
  }
});

// ====== ADD STUDENT MODAL ======
const formAddStudent = document.getElementById("formAddStudent");
const stuSectionSelect = document.getElementById("stuSection");
const stuGrade = document.getElementById("stuGrade");

function populateSectionSelect(selectEl, gradeVal) {
  selectEl.innerHTML = "";
  if (!gradeVal || !sectionsData[gradeVal]) return;
  sectionsData[gradeVal].forEach(sec => {
    const opt = document.createElement("option");
    opt.value = sec.name;
    opt.textContent = `${sec.name} (${sec.students.length}/50)`;
    selectEl.appendChild(opt);
  });
}
stuGrade.addEventListener("change", () => populateSectionSelect(stuSectionSelect, stuGrade.value));

formAddStudent.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("stuId").value.trim();
  const first = document.getElementById("stuFirst").value.trim();
  const last = document.getElementById("stuLast").value.trim();
  const gender = document.getElementById("stuGender").value;
  const grade = stuGrade.value;
  const section = stuSectionSelect.value;

  if (!id || !first || !last || !gender || !grade || !section) return;

  const secObj = findSectionObj(grade, section);
  if (!secObj) return alert("Section not found.");
  if (secObj.students.length >= 50) return alert("This section is at full capacity (50).");

  students.push({ id, first, last, gender, grade, section });
  rebuildSectionStudents();
  renderStudentsTable();
  renderSectionsGrid();
  computeStats();

  // reset + close
  e.target.reset();
  const m = bootstrap.Modal.getInstance(document.getElementById("modalAddStudent"));
  m?.hide();
});

// ====== MANAGE TEACHERS ======
const teachersTableBody = document.getElementById("teachersTableBody");
const teacherSearch = document.getElementById("teacherSearch");

function renderTeachersTable() {
  const q = (teacherSearch.value || "").toLowerCase();
  teachersTableBody.innerHTML = "";
  teachers
    .filter(t => [t.id, t.first, t.last, t.email, t.subject].some(v => String(v).toLowerCase().includes(q)))
    .sort((a, b) => a.last.localeCompare(b.last))
    .forEach(t => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${t.id}</td>
        <td>${t.last}, ${t.first}</td>
        <td>${t.email}</td>
        <td>${t.subject}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary me-1" data-action="editTeacher" data-id="${t.id}">
            <i class="bi bi-pencil-square"></i> Edit
          </button>
          <button class="btn btn-sm btn-outline-danger" data-action="removeTeacher" data-id="${t.id}">
            <i class="bi bi-trash"></i>
          </button>
        </td>`;
      teachersTableBody.appendChild(tr);
    });
}
teacherSearch.addEventListener("input", renderTeachersTable);

// Add teacher modal
const formAddTeacher = document.getElementById("formAddTeacher");
formAddTeacher.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("tchId").value.trim();
  const email = document.getElementById("tchEmail").value.trim();
  const first = document.getElementById("tchFirst").value.trim();
  const last = document.getElementById("tchLast").value.trim();
  const subject = document.getElementById("tchSubject").value.trim();
  if (!id || !email || !first || !last || !subject) return;

  teachers.push({ id, email, first, last, subject });
  renderTeachersTable();
  computeStats();
  e.target.reset();
  bootstrap.Modal.getInstance(document.getElementById("modalAddTeacher"))?.hide();
});

teachersTableBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = btn.getAttribute("data-id");
  if (btn.getAttribute("data-action") === "removeTeacher") {
    const t = teachers.find(x => x.id === id);
    if (t && confirm(`Remove ${t.first} ${t.last}?`)) {
      teachers = teachers.filter(x => x.id !== id);
      renderTeachersTable();
      computeStats();
    }
  }
  if (btn.getAttribute("data-action") === "editTeacher") {
    alert("Demo: Edit Teacher modal can be added here similarly to Add Teacher.");
  }
});

// ====== MANAGE SUBJECTS ======
const subjectsTableBody = document.getElementById("subjectsTableBody");
const subjectSearch = document.getElementById("subjectSearch");

function renderSubjectsTable() {
  const q = (subjectSearch.value || "").toLowerCase();
  subjectsTableBody.innerHTML = "";
  subjects
    .filter(s => [s.code, s.name, s.grade].some(v => String(v).toLowerCase().includes(q)))
    .sort((a, b) => a.code.localeCompare(b.code))
    .forEach(s => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s.code}</td>
        <td>${s.name}</td>
        <td>${s.grade}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary me-1" data-action="editSubject" data-code="${s.code}">
            <i class="bi bi-pencil-square"></i> Edit
          </button>
          <button class="btn btn-sm btn-outline-danger" data-action="removeSubject" data-code="${s.code}">
            <i class="bi bi-trash"></i>
          </button>
        </td>`;
      subjectsTableBody.appendChild(tr);
    });
}
subjectSearch.addEventListener("input", renderSubjectsTable);

// Add subject
const formAddSubject = document.getElementById("formAddSubject");
formAddSubject.addEventListener("submit", (e) => {
  e.preventDefault();
  const code = document.getElementById("subjCode").value.trim();
  const grade = document.getElementById("subjGrade").value;
  const name = document.getElementById("subjName").value.trim();
  if (!code || !grade || !name) return;
  subjects.push({ code, name, grade });
  renderSubjectsTable();
  computeStats();
  e.target.reset();
  bootstrap.Modal.getInstance(document.getElementById("modalAddSubject"))?.hide();
});

subjectsTableBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const code = btn.getAttribute("data-code");
  if (btn.getAttribute("data-action") === "removeSubject") {
    if (confirm(`Remove subject ${code}?`)) {
      subjects = subjects.filter(s => s.code !== code);
      renderSubjectsTable();
      computeStats();
    }
  }
  if (btn.getAttribute("data-action") === "editSubject") {
    alert("Demo: Edit Subject modal can be added here similar to Add Subject.");
  }
});

// ====== MANAGE SECTIONS ======
const sectionGradeFilter = document.getElementById("sectionGradeFilter");
const sectionsGrid = document.getElementById("sectionsGrid");
const sectionDetail = document.getElementById("sectionDetail");
const secDetailName = document.getElementById("secDetailName");
const secDetailAdviser = document.getElementById("secDetailAdviser");
const sectionStudentsBody = document.getElementById("sectionStudentsBody");
const secCapCount = document.getElementById("secCapCount");
const closeSectionDetailBtn = document.getElementById("closeSectionDetail");

let currentSectionDetail = null; // { grade, name }

function renderSectionsGrid() {
  const grade = sectionGradeFilter.value;
  sectionsGrid.innerHTML = "";
  const gradesToRender = grade === "All" ? Object.keys(sectionsData) : [grade];

  gradesToRender.forEach(g => {
    sectionsData[g].forEach(sec => {
      const col = document.createElement("div");
      col.className = "col-sm-6 col-lg-4";
      col.innerHTML = `
        <div class="section-card">
          <div>
            <div class="fw-bold">${sec.name} <span class="badge text-bg-light ms-1">${sec.students.length}/50</span></div>
            <div class="small text-white-50">Grade ${g} • Adviser: ${sec.adviser}</div>
          </div>
          <button class="btn btn-outline-light btn-sm" data-open-section data-grade="${g}" data-sec="${sec.name}">
            View
          </button>
        </div>`;
      sectionsGrid.appendChild(col);
    });
  });
}

sectionsGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-open-section]");
  if (!btn) return;
  const g = btn.getAttribute("data-grade");
  const name = btn.getAttribute("data-sec");
  showSectionDetail(g, name);
});

function showSectionDetail(grade, secName) {
  const sec = findSectionObj(grade, secName);
  if (!sec) return;

  currentSectionDetail = { grade, name: secName };

  secDetailName.textContent = `${secName} — Grade ${grade}`;
  secDetailAdviser.textContent = sec.adviser;

  // list students sorted by last name
  const list = [...sec.students].sort(byLastName);
  sectionStudentsBody.innerHTML = "";
  list.forEach((s, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${s.id}</td>
      <td>${fullName(s)}</td>
      <td>${s.gender}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-secondary me-1" data-transfer="${s.id}">
          <i class="bi bi-arrow-left-right"></i> Edit
        </button>
        <button class="btn btn-sm btn-outline-danger" data-remove="${s.id}">
          <i class="bi bi-trash"></i>
        </button>
      </td>`;
    sectionStudentsBody.appendChild(tr);
  });
  secCapCount.textContent = sec.students.length.toString();

  sectionDetail.classList.remove("d-none");
  sectionDetail.scrollIntoView({ behavior: "smooth" });
}

closeSectionDetailBtn.addEventListener("click", () => {
  sectionDetail.classList.add("d-none");
  currentSectionDetail = null;
});

// Actions in section detail (edit/transfer/remove)
sectionStudentsBody.addEventListener("click", (e) => {
  const btnTransfer = e.target.closest("button[data-transfer]");
  const btnRemove = e.target.closest("button[data-remove]");
  if (btnTransfer) {
    const id = btnTransfer.getAttribute("data-transfer");
    const stu = students.find(s => s.id === id);
    if (!stu) return;
    openTransferModal(stu);
  }
  if (btnRemove) {
    const id = btnRemove.getAttribute("data-remove");
    const stu = students.find(s => s.id === id);
    if (stu && confirm(`Remove ${fullName(stu)} from this section?`)) {
      students = students.filter(x => x.id !== id);
      rebuildSectionStudents();
      renderStudentsTable();
      showSectionDetail(currentSectionDetail.grade, currentSectionDetail.name);
      renderSectionsGrid();
      computeStats();
    }
  }
});

// Add section
const formAddSection = document.getElementById("formAddSection");
formAddSection.addEventListener("submit", (e) => {
  e.preventDefault();
  const grade = document.getElementById("secGrade").value;
  const name = document.getElementById("secName").value.trim();
  const adviser = document.getElementById("secAdviser").value.trim();
  if (!grade || !name || !adviser) return;
  sectionsData[grade] = sectionsData[grade] || [];
  if (sectionsData[grade].some(s => s.name.toLowerCase() === name.toLowerCase())) {
    return alert("Section with the same name already exists in this grade.");
  }
  sectionsData[grade].push({ name, adviser, students: [] });
  renderSectionsGrid();
  computeStats();
  e.target.reset();
  bootstrap.Modal.getInstance(document.getElementById("modalAddSection"))?.hide();
});

// Add student to current section
const formAddStudentToSection = document.getElementById("formAddStudentToSection");
formAddStudentToSection.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentSectionDetail) return alert("Open a section first.");
  const { grade, name } = currentSectionDetail;
  const sec = findSectionObj(grade, name);
  if (!sec) return;
  if (sec.students.length >= 50) return alert("Section is at full capacity (50).");

  const id = document.getElementById("secAddStuId").value.trim();
  const first = document.getElementById("secAddStuFirst").value.trim();
  const last = document.getElementById("secAddStuLast").value.trim();
  const gender = document.getElementById("secAddStuGender").value;
  if (!id || !first || !last || !gender) return;

  students.push({ id, first, last, gender, grade, section: name });
  rebuildSectionStudents();
  renderStudentsTable();
  showSectionDetail(grade, name);
  renderSectionsGrid();
  computeStats();

  e.target.reset();
  bootstrap.Modal.getInstance(document.getElementById("modalAddStudentToSection"))?.hide();
});

// Transfer modal helpers
const formTransferStudent = document.getElementById("formTransferStudent");
const transferStudentId = document.getElementById("transferStudentId");
const transferTargetSection = document.getElementById("transferTargetSection");

function openTransferModal(stu) {
  transferStudentId.value = stu.id;
  // list all sections for that student's grade
  transferTargetSection.innerHTML = "";
  (sectionsData[stu.grade] || []).forEach(sec => {
    const opt = document.createElement("option");
    opt.value = sec.name;
    opt.textContent = `${sec.name} (${sec.students.length}/50)`;
    transferTargetSection.appendChild(opt);
  });
  const modalEl = document.getElementById("modalTransferStudent");
  new bootstrap.Modal(modalEl).show();
}

formTransferStudent.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = transferStudentId.value;
  const targetSec = transferTargetSection.value;
  const stu = students.find(s => s.id === id);
  if (!stu) return;

  const target = findSectionObj(stu.grade, targetSec);
  if (!target) return alert("Target section not found.");
  if (target.students.length >= 50) return alert("Target section is full (50).");

  stu.section = targetSec;
  rebuildSectionStudents();
  renderStudentsTable();
  renderSectionsGrid();
  if (currentSectionDetail) showSectionDetail(currentSectionDetail.grade, currentSectionDetail.name);
  bootstrap.Modal.getInstance(document.getElementById("modalTransferStudent"))?.hide();
});

// ====== SCHOOL YEAR ======
const syForm = document.getElementById("schoolYearForm");
const syPreview = document.getElementById("syPreview");
const syInput = document.getElementById("syInput");
const syStart = document.getElementById("syStart");
const syEnd = document.getElementById("syEnd");

syForm.addEventListener("submit", (e) => {
  e.preventDefault();
  syPreview.textContent = `School Year ${syInput.value}: ${syStart.value} to ${syEnd.value}`;
  alert("School year saved!");
});

// quick modal SY
document.getElementById("modalSchoolYearForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const sy = document.getElementById("mSyInput").value;
  const st = document.getElementById("mSyStart").value;
  const en = document.getElementById("mSyEnd").value;
  syInput.value = sy; syStart.value = st; syEnd.value = en;
  syPreview.textContent = `School Year ${sy}: ${st} to ${en}`;
  bootstrap.Modal.getInstance(document.getElementById("modalSchoolYear"))?.hide();
});

// ====== GRADE INPUT DATES ======
const gradeDatesPreview = document.getElementById("gradeDatesPreview");
document.getElementById("formQuarters").addEventListener("submit", (e) => {
  e.preventDefault();
  const q1f = document.getElementById("q1From").value;
  const q1t = document.getElementById("q1To").value;
  const q2f = document.getElementById("q2From").value;
  const q2t = document.getElementById("q2To").value;
  gradeDatesPreview.textContent = `Quarters: Q1 ${q1f}–${q1t}, Q2 ${q2f}–${q2t}`;
  alert("Quarter dates saved!");
});
document.getElementById("formSemesters").addEventListener("submit", (e) => {
  e.preventDefault();
  const pf = document.getElementById("prelimFrom").value;
  const pt = document.getElementById("prelimTo").value;
  const mf = document.getElementById("midtermFrom").value;
  const mt = document.getElementById("midtermTo").value;
  const sf = document.getElementById("semifinalsFrom").value;
  const st = document.getElementById("semifinalsTo").value;
  const ff = document.getElementById("finalsFrom").value;
  const ft = document.getElementById("finalsTo").value;
  gradeDatesPreview.textContent = `Semesters: Prelim ${pf}–${pt}, Midterm ${mf}–${mt}, Semi-Finals ${sf}–${st}, Finals ${ff}–${ft}`;
  alert("Semester dates saved!");
});
// quick modal save
document.getElementById("btnQuickSaveGradeDates").addEventListener("click", () => {
  const q1f = document.getElementById("mQ1From").value || "—";
  const q1t = document.getElementById("mQ1To").value || "—";
  const q2f = document.getElementById("mQ2From").value || "—";
  const q2t = document.getElementById("mQ2To").value || "—";
  gradeDatesPreview.textContent = `Quarters: Q1 ${q1f}–${q1t}, Q2 ${q2f}–${q2t}`;
  bootstrap.Modal.getInstance(document.getElementById("modalGradeDates"))?.hide();
  alert("Grade input dates saved!");
});

// ====== REPORTS ======
const reportsTableBody = document.getElementById("reportsTableBody");
const reportFilter = document.getElementById("reportFilter");

function renderReports() {
  const f = reportFilter.value;
  reportsTableBody.innerHTML = "";
  reports
    .filter(r => (f === "All" ? true : r.status === f))
    .forEach(r => {
      const tr = document.createElement("tr");
      const statusBadge =
        r.status === "Pending" ? "warning" :
        r.status === "Approved" ? "success" : "secondary";
      tr.innerHTML = `
        <td>${r.teacher}</td>
        <td>${r.subject}</td>
        <td>${r.level}</td>
        <td>${r.reason}</td>
        <td><span class="badge text-bg-${statusBadge}">${r.status}</span></td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-success me-1" data-approve>Approve</button>
          <button class="btn btn-sm btn-outline-danger" data-reject>Reject</button>
        </td>`;
      reportsTableBody.appendChild(tr);
    });
}
reportFilter.addEventListener("change", renderReports);

reportsTableBody.addEventListener("click", (e) => {
  const row = e.target.closest("tr");
  if (!row) return;
  const name = row.children[0].textContent;
  const idx = reports.findIndex(r => r.teacher === name);
  if (idx < 0) return;

  if (e.target.matches("[data-approve]")) {
    reports[idx].status = "Approved";
  }
  if (e.target.matches("[data-reject]")) {
    reports[idx].status = "Rejected";
  }
  renderReports();
});

// ====== INITIALIZE ======
function init() {
  rebuildSectionStudents();
  renderStudentsTable();
  renderTeachersTable();
  renderSubjectsTable();
  renderSectionsGrid();
  renderReports();
  computeStats();
  // default visible section is dashboard; ensure its link is active
  links.forEach(l => l.classList.remove("active"));
  document.querySelector('.sidebar .nav-link[data-section="dashboard"]').classList.add("active");
  sections.forEach(sec => sec.classList.remove("visible"));
  document.getElementById("dashboard").classList.add("visible");
}
init();
