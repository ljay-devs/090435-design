 const studentsData = {
      Ruby: [
        { id: 'S21-1001', name: 'Ruby Jane', grade: 89 },
        { id: 'S21-1002', name: 'Carlos Miguel', grade: 91 }
      ],
      Emerald: [
        { id: 'S21-2001', name: 'Emerald Anne', grade: 85 },
        { id: 'S21-2002', name: 'Daniel Cruz', grade: 90 }
      ],
      Sapphire: [
        { id: 'S21-3001', name: 'Sapphire Rose', grade: 92 },
        { id: 'S21-3002', name: 'Liam Garcia', grade: 87 }
      ]
    }

    function openSubject(subject, grade) {
      document.getElementById('subjects').classList.add('d-none');
      document.getElementById('studentListView').classList.remove('d-none');
      document.getElementById('subjectTitle').textContent = subject.toUpperCase();
      document.getElementById('gradeInfo').textContent = `Grade: ${grade}`;
      loadStudents(document.getElementById('sectionSelect').value);
    }
    function goBackToSubjects() {
      document.getElementById('studentListView').classList.add('d-none');
      document.getElementById('subjects').classList.remove('d-none');
    }



    function loadStudents(section) {
      const tbody = document.getElementById('studentTableBody');
      tbody.innerHTML = '';
      studentsData[section].forEach(student => {
        const row = `
          <tr>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td><input type="number" class="form-control" value="${student.grade}" /></td>
          </tr>`;
        tbody.innerHTML += row;
      });
    }


    
     function showSection(section) {
      const sections = ['subjects', 'profile', 'studentListView'];
      const buttons = document.querySelectorAll('.sidebar .btn, .mobile-navbar .btn');

      sections.forEach(id => document.getElementById(id)?.classList.add('d-none'));
      document.getElementById(section)?.classList.remove('d-none');

      buttons.forEach(btn => btn.classList.remove('active'));
      buttons.forEach(btn => {
        if (btn.getAttribute('onclick')?.includes(section)) {
          btn.classList.add('active');
        }
      });
    }