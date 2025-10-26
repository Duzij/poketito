document.addEventListener(
    "DOMContentLoaded",
    () => {
        // --- Add Note Functionality ---
        const addNoteBtn = document.getElementById("add-note");
        const notesList = document.getElementById("notes-list");

        addNoteBtn.addEventListener("click", () => {
            const noteText = prompt("Enter your new note:", "New note text...");
            if (noteText) {
                const newNote = document.createElement("li");
                const p = document.createElement("p");
                p.textContent = noteText;
                newNote.appendChild(p);
                notesList.appendChild(newNote);

                // Save to sessionStorage
                saveData();
            }
        });

        // --- Add Video Functionality ---
        const addVideoBtn = document.getElementById("add-video");
        const videosList = document.getElementById("videos-list");

        addVideoBtn.addEventListener("click", () => {
            const videoTitle = prompt("Enter the video title:", "My Awesome Video");
            if (videoTitle) {
                const newVideo = document.createElement("li");
                newVideo.className = "video-preview";

                const img = document.createElement("img");
                img.src = "https://placehold.co/600x400/0275d8/ffffff?text=New+Video";
                img.alt = "Video thumbnail";

                const p = document.createElement("p");
                p.textContent = videoTitle;

                newVideo.appendChild(img);
                newVideo.appendChild(p);
                videosList.appendChild(newVideo);

                // Save to sessionStorage
                saveData();
            }
        });

        // --- Add Link Functionality ---
        const addLinkBtn = document.getElementById("add-link");
        const linksList = document.getElementById("links-list");

        addLinkBtn.addEventListener("click", () => {
            const linkTitle = prompt("Enter the link title:", "Google");
            const linkUrl = prompt("Enter the URL:", "https://www.google.com");

            if (linkTitle && linkUrl) {
                const newLink = document.createElement("li");
                newLink.className = "link-preview";

                const a = document.createElement("a");
                a.textContent = linkTitle;
                a.href = linkUrl;
                a.target = "_blank"; // Open in new tab

                const span = document.createElement("span");
                span.className = "link-url";
                span.textContent = linkUrl;

                newLink.appendChild(a);
                newLink.appendChild(span);
                linksList.appendChild(newLink);

                // Save to sessionStorage
                saveData();
            }
        });

        // Function to save data to sessionStorage
        function saveData() {
            const notesArray = [];
            Array.from(notesList.children).forEach(note => {
                notesArray.push({ type: "note", content: note.textContent });
            });

            const videosArray = [];
            Array.from(videosList.children).forEach(video => {
                videosArray.push({
                    type: "video",
                    title: video.querySelector("p").textContent,
                    thumbnail: video.querySelector("img").src
                });
            });

            const linksArray = [];
            Array.from(linksList.children).forEach(link => {
                linksArray.push({
                    type: "link",
                    title: link.querySelector("a").textContent,
                    url: link.querySelector(".link-url").textContent
                });
            });

            const data = JSON.stringify({ notes: notesArray, videos: videosArray, links: linksArray });
            sessionStorage.setItem('savedData', data);
        }

        // Function to load data from sessionStorage and display it
        function loadData() {
            const savedData = sessionStorage.getItem('savedData');
            if (savedData) {
                const data = JSON.parse(savedData);

                data.notes.forEach(note => {
                    const newNote = document.createElement("li");
                    const p = document.createElement("p");
                    p.textContent = note.content;
                    newNote.appendChild(p);
                    notesList.appendChild(newNote);
                });

                data.videos.forEach(video => {
                    const newVideo = document.createElement("li");
                    newVideo.className = "video-preview";

                    const img = document.createElement("img");
                    img.src = video.thumbnail;
                    img.alt = "Video thumbnail";

                    const p = document.createElement("p");
                    p.textContent = video.title;

                    newVideo.appendChild(img);
                    newVideo.appendChild(p);
                    videosList.appendChild(newVideo);
                });

                data.links.forEach(link => {
                    const newLink = document.createElement("li");
                    newLink.className = "link-preview";

                    const a = document.createElement("a");
                    a.textContent = link.title;
                    a.href = link.url;
                    a.target = "_blank"; // Open in new tab

                    const span = document.createElement("span");
                    span.className = "link-url";
                    span.textContent = link.url;

                    newLink.appendChild(a);
                    newLink.appendChild(span);
                    linksList.appendChild(newLink);
                });
            }
        }

        // Load data on page load
        loadData();
    },
);
