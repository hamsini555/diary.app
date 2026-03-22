const API_URL = 'http://localhost:3000';
const PASSWORD = '1234';

let mood = "";
let currentPassword = "";

function selectMood(m) {
  mood = m;
  document.getElementById("moodSection").style.display = "none";
  document.getElementById("diary").style.display = "block";
  document.getElementById("moodText").innerText = "Mood: " + mood;
  updateTime();
}

function getDateTime() {
  return new Date().toLocaleString();
}

function updateTime() {
  document.getElementById("datetime").innerText = getDateTime();
  setTimeout(updateTime, 1000);
}

async function saveEntry() {
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;

  if (!title || !content) {
    alert("Please write something!");
    return;
  }

  const entry = {
    title,
    content,
    mood,
    datetime: getDateTime(),
    password: PASSWORD
  };

  try {
    const response = await fetch(`${API_URL}/api/save-entry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry)
    });

    const data = await response.json();

    if (response.ok) {
      alert("✨ Entry saved successfully!");
      document.getElementById("title").value = "";
      document.getElementById("content").value = "";
    } else {
      alert("Error: " + data.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert("Connection error. Make sure backend is running!");
  }
}

function askPassword() {
  const pass = prompt("Enter password (1234):");

  if (!pass) return;

  if (pass !== PASSWORD) {
    alert("❌ Wrong password!");
    return;
  }

  currentPassword = pass;
  openDiary();
}

async function openDiary() {
  document.getElementById("popup").style.display = "block";
  
  try {
    const response = await fetch(`${API_URL}/api/get-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: currentPassword })
    });

    const data = await response.json();

    if (response.ok) {
      displayEntries(data.entries);
    } else {
      alert("Error: " + data.error);
      closeDiary();
    }
  } catch (error) {
    console.error('Error:', error);
    alert("Connection error. Make sure backend is running!");
    closeDiary();
  }
}

function displayEntries(entries) {
  const container = document.getElementById("entries");
  container.innerHTML = "";

  if (entries.length === 0) {
    container.innerHTML = "<p>No entries yet. Start writing! 📝</p>";
    return;
  }

  entries.forEach(e => {
    const div = document.createElement("div");
    div.style.marginBottom = "20px";
    div.style.padding = "15px";
    div.style.backgroundColor = "#f9f9f9";
    div.style.borderRadius = "10px";
    div.style.textAlign = "left";

    div.innerHTML = `
      <h3>${e.title}</h3>
      <p><strong>Mood:</strong> ${e.mood}</p>
      <p>${e.content}</p>
      <small style="color: #888;">📅 ${e.datetime}</small>
      <br><br>
      <button onclick="editEntry(${e.id}, '${e.title.replace(/'/g, "\\'")}', '${e.content.replace(/'/g, "\\'")}', '${e.mood}')" 
              style="margin-right: 5px; padding: 5px 10px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Edit ✏️
      </button>
      <button onclick="deleteEntry(${e.id})" 
              style="padding: 5px 10px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Delete 🗑️
      </button>
    `;

    container.appendChild(div);
  });
}

async function editEntry(id, title, content, mood) {
  const newTitle = prompt("Edit title:", title);
  if (!newTitle) return;

  const newContent = prompt("Edit content:", content);
  if (!newContent) return;

  try {
    const response = await fetch(`${API_URL}/api/update-entry/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: newTitle,
        content: newContent,
        mood: mood,
        password: currentPassword
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert("✨ Entry updated!");
      openDiary(); // Refresh
    } else {
      alert("Error: " + data.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert("Connection error!");
  }
}

async function deleteEntry(id) {
  if (!confirm("Are you sure you want to delete this entry?")) return;

  try {
    const response = await fetch(`${API_URL}/api/delete-entry/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: currentPassword })
    });

    const data = await response.json();

    if (response.ok) {
      alert("✨ Entry deleted!");
      openDiary(); // Refresh
    } else {
      alert("Error: " + data.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert("Connection error!");
  }
}

function closeDiary() {
  document.getElementById("popup").style.display = "none";
}
