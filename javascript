let currentMood = "";

// STEP 1: Mood selection → show diary
function selectMood(mood) {
    currentMood = mood;

    document.getElementById("moodScreen").style.display = "none";
    document.getElementById("diaryScreen").style.display = "block";

    document.getElementById("selectedMood").innerText = "Mood: " + mood;

    updateTime();   // start time only after diary opens
    displayEntries();
}

// STEP 2: Date + Day + Time
function getDateTime() {
    const now = new Date();

    const day = now.toLocaleDateString("en-IN", { weekday: "long" });
    const date = now.toLocaleDateString("en-IN");
    const time = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
    });

    return `${day}, ${date} - ${time}`;
}

// Update time safely
function updateTime() {
    const el = document.getElementById("datetime");
    if (el) {
        el.innerText = getDateTime();
    }
    setTimeout(updateTime, 1000);
}

// STEP 3: Save entry (THIS WAS YOUR MAIN ISSUE AREA)
function saveEntry() {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    if (title.trim() === "" || content.trim() === "") {
        alert("Write something first!");
        return;
    }

    const entry = {
        title: title,
        content: content,
        mood: currentMood,
        datetime: getDateTime()
    };

    let data = JSON.parse(localStorage.getItem("diary")) || [];
    data.push(entry);

    localStorage.setItem("diary", JSON.stringify(data));

    // CLEAR INPUTS (important)
    document.getElementById("title").value = "";
    document.getElementById("content").value = "";

    displayEntries();
}

// STEP 4: Show entries
function displayEntries() {
    const container = document.getElementById("entries");
    container.innerHTML = "";

    let data = JSON.parse(localStorage.getItem("diary")) || [];

    data.reverse().forEach(e => {
        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <h3>${e.title}</h3>
            <p>${e.content}</p>
            <p>${e.mood}</p>
            <small>${e.datetime}</small>
        `;

        container.appendChild(div);
    });
}