// static/js/select-report-issue-hover.js

let reportButton = null;
let buttonTimeout = null;

const BUTTON_FADE_DURATION_MS = 6000; // Button disappears after 4 seconds

function removeReportButton() { //
    if (reportButton && reportButton.parentNode) {
        reportButton.parentNode.removeChild(reportButton);
        reportButton = null;
    }
    if (buttonTimeout) {
        clearTimeout(buttonTimeout);
        buttonTimeout = null;
    }
}

function showReportButton(x, y, selectedText) {
    removeReportButton();

    reportButton = document.createElement('button');
    reportButton.id = 'bug-report-button';
    reportButton.className = 'bug-report-button';
    reportButton.innerHTML = 'Report Bug <i class="fa-solid fa-bug"></i>'; // Changed to fa-solid based on your HTML

    // Set position to fixed and max z-index (still good practice)
    reportButton.style.position = 'fixed';
    reportButton.style.left = `${x}px`;
    reportButton.style.top = `${y - 40}px`; // Adjust Y to place it above selection
    reportButton.style.zIndex = '2147483647'; // Highest possible z-index

    // Store selected text and other context data on the button
    reportButton.dataset.selectedText = selectedText;
    reportButton.dataset.currentPageUrl = window.location.href;
    reportButton.dataset.githubFilePath = getGitHubFilePath();

    // DO NOT attach a click listener directly to the button here.
    // The click will be handled by the document listener below.

    document.documentElement.appendChild(reportButton); // Append to HTML element for broadest context

    // Start timeout to remove button if not clicked
    buttonTimeout = setTimeout(removeReportButton, BUTTON_FADE_DURATION_MS);
}

function getGitHubFilePath() {
    const bodyElement = document.querySelector('body');
    if (bodyElement && bodyElement.dataset.githubFile) {
        const repoBaseUrl = 'https://github.com/validatedpatterns/docs/blob/main/';
        return repoBaseUrl + bodyElement.dataset.githubFile;
    }
    return "Could not determine source file automatically. Please specify if known.";
}

// --- NEW EVENT DELEGATION LOGIC ---

// Listen for clicks on the entire document (or document.body)
// This listener WILL always fire, even if an overlay is present.
document.addEventListener('mouseup', function(event) { // <-- SET BREAKPOINT HERE (Around line 61 in the full code)
    const selectedText = window.getSelection().toString().trim(); // <--- ALSO SET A BREAKPOINT ON THIS LINE
    // ...
});
    // If a reportButton exists AND the click target is that button (or a child of it, like the icon)
    // This uses `contains` to check if the click was *inside* the button's DOM subtree.
    if (reportButton && reportButton.contains(event.target)) {
        event.preventDefault(); // Prevent any default behavior (like text selection or link following)
        event.stopPropagation(); // Stop the event from bubbling up further

        console.log('BUG REPORT BUTTON CLICKED (via event delegation)!'); // For debugging

        // Retrieve data from the button's dataset
        const text = reportButton.dataset.selectedText;
        const currentPageUrl = reportButton.dataset.currentPageUrl;
        const githubFilePath = reportButton.dataset.githubFilePath;

        const issueTitle = `Bug Report: Issue on "${text.substring(0, 50).replace(/\n/g, ' ')}..."`;
        let issueBody = `
**Description of the issue:**
\`\`\`
${text}
\`\`\`

---
**Context:**
- **Page URL:** ${currentPageUrl}
- **GitHub Source File:** ${githubFilePath}
        `;

        const encodedTitle = encodeURIComponent(issueTitle);
        const encodedBody = encodeURIComponent(issueBody);

        const githubRepo = 'validatedpatterns/docs'; // Your GitHub repository
        const githubIssueUrl = `https://github.com/${githubRepo}/issues/new?title=${encodedTitle}&body=${encodedBody}`;

        window.open(githubIssueUrl, '_blank');
        removeReportButton(); // Remove button after opening issue
    } else {
        // If the button exists but the click was NOT on it, remove it (equivalent to mousedown logic)
        removeReportButton();
    }
});

// Original mouseup listener (remains the same)
document.addEventListener('mouseup', function(event) {
    const selectedText = window.getSelection().toString().trim();

    if (selectedText.length > 0) {//
        const selection = window.getSelection(); //
        if (selection.rangeCount > 0) { //
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            const x = rect.left + window.scrollX + (rect.width / 2) - 50;
            const y = rect.top + window.scrollY;

            showReportButton(x, y, selectedText); //
        }
    } else {
        removeReportButton(); //
    }
});

// The previous mousedown listener is now essentially replaced by the first part of the new 'click' listener.
// You can remove the old document.addEventListener('mousedown', ...) function if you still have it.