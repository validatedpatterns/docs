// static/js/select-report-issue.js (or wherever you prefer to store static assets)

document.addEventListener('mouseup', function() {
    const selectedText = window.getSelection().toString().trim();

    if (selectedText.length > 0) {
        // You might want to add a small button or popup here instead of direct confirmation
        // For simplicity, we'll keep the confirmation for now.

        const currentPageUrl = window.location.href;
        const githubFilePath = getGitHubFilePath(); // This will now be more accurate for Hugo

        const issueTitle = `Bug Report: Issue on "${selectedText.substring(0, 50).replace(/\n/g, ' ')}..."`;
        let issueBody = `
**Description of the issue:**
\`\`\`
${selectedText}
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

        const confirmation = confirm("Do you want to create an issue on GitHub for the selected text?");
        if (confirmation) {
            window.open(githubIssueUrl, '_blank');
        }
    }
});


// Hugo-specific function to get the GitHub file path
function getGitHubFilePath() {
    // This assumes you've added a data-github-file attribute to your body or a container.
    const bodyElement = document.querySelector('body');
    if (bodyElement && bodyElement.dataset.githubFile) {
        // Construct the full GitHub blob URL
        // Assuming your source files are in the 'content' directory of your repo
        // And you're using the 'main' branch
        const repoBaseUrl = 'https://github.com/validatedpatterns/docs/blob/main/';
        return repoBaseUrl + bodyElement.dataset.githubFile;
    }

    // Fallback if the data attribute isn't found (shouldn't happen with Hugo setup)
    return "Could not determine source file automatically. Please specify if known.";
}


// --- Introducing DOMContentLoaded for the Jira Button Logic ---
document.addEventListener('DOMContentLoaded', function() {
    // Select the Jira bug button using its NEW ID
    const jiraBugButton = document.getElementById('report-doc-bug-btn'); // <--- CHANGED THIS LINE

    if (jiraBugButton) {
        console.log("Jira bug button found!", jiraBugButton); // For debugging: confirm it's found
        jiraBugButton.removeAttribute('href'); // Remove the original href

        jiraBugButton.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();

            let selectedText = window.getSelection().toString().trim();
            if (selectedText.length === 0) {
                selectedText = "No specific text was selected. Reporting a general page issue.";
            }

            const currentPageUrl = window.location.href;
            const githubFilePath = getGitHubFilePath();

            const issueTitle = `Documentation Bug Report: ${selectedText.substring(0, 70).replace(/\n/g, ' ')}...`;
            let issueBody = `
**Issue Description:**
\`\`\`
${selectedText}
\`\`\`

---
**Context:**
- **Page URL:** ${currentPageUrl}
- **GitHub Source File:** ${githubFilePath}
            `;

            const encodedTitle = encodeURIComponent(issueTitle);
            const encodedBody = encodeURIComponent(issueBody);

            const githubRepo = 'validatedpatterns/docs';
            const githubIssueUrl = `https://github.com/${githubRepo}/issues/new?title=${encodedTitle}&body=${encodedBody}`;

            const confirmation = confirm("Do you want to report this as a documentation bug on GitHub?");
            if (confirmation) {
                window.open(githubIssueUrl, '_blank');
            }
        });
    } else {
        // This warning will now be more accurate if the ID is truly missing/typo'd
        console.warn("Jira bug button (ID: 'report-doc-bug-btn') not found.");
    }

    // --- Cleanup for previous button (keep this) ---
    const existingFloatingButton = document.getElementById('bug-report-button');
    if (existingFloatingButton) {
        existingFloatingButton.parentNode.removeChild(existingFloatingButton);
    }
});