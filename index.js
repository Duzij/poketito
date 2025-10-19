document.addEventListener(
    "DOMContentLoaded",
    () => {
        // --- Add Note Functionality ---
        const addNoteBtn = document.getElementById(
            "add-note",
        );
        const notesList = document.getElementById(
            "notes-list",
        );

        addNoteBtn.addEventListener("click", () => {
            const noteText = prompt(
                "Enter your new note:",
                "New note text...",
            );
            if (noteText) {
                const newNote = document
                    .createElement("li");
                const p = document.createElement(
                    "p",
                );
                p.textContent = noteText;
                newNote.appendChild(p);
                notesList.appendChild(newNote);
            }
        });

        // --- Add Video Functionality ---
        const addVideoBtn = document.getElementById(
            "add-video",
        );
        const videosList = document.getElementById(
            "videos-list",
        );

        addVideoBtn.addEventListener(
            "click",
            () => {
                const videoTitle = prompt(
                    "Enter the video title:",
                    "My Awesome Video",
                );
                if (videoTitle) {
                    const newVideo = document
                        .createElement("li");
                    newVideo.className =
                        "video-preview";

                    const img = document
                        .createElement("img");
                    img.src =
                        "https://placehold.co/600x400/0275d8/ffffff?text=New+Video";
                    img.alt = "Video thumbnail";

                    const p = document
                        .createElement("p");
                    p.textContent = videoTitle;

                    newVideo.appendChild(img);
                    newVideo.appendChild(p);
                    videosList.appendChild(
                        newVideo,
                    );
                }
            },
        );

        // --- Add Link Functionality ---
        const addLinkBtn = document.getElementById(
            "add-link",
        );
        const linksList = document.getElementById(
            "links-list",
        );

        addLinkBtn.addEventListener("click", () => {
            const linkTitle = prompt(
                "Enter the link title:",
                "Google",
            );
            const linkUrl = prompt(
                "Enter the URL:",
                "https://www.google.com",
            );

            if (linkTitle && linkUrl) {
                const newLink = document
                    .createElement("li");
                newLink.className = "link-preview";

                const a = document.createElement(
                    "a",
                );
                a.textContent = linkTitle;
                a.href = linkUrl;
                a.target = "_blank"; // Open in new tab

                const span = document.createElement(
                    "span",
                );
                span.className = "link-url";
                span.textContent = linkUrl;

                newLink.appendChild(a);
                newLink.appendChild(span);
                linksList.appendChild(newLink);
            }
        });
    },
);