function createElementAndClass(element, classes) {
    result = document.createElement(element);
    result.className = classes;
    return result;
}

function createCopyButton(highlightDiv) {
    const codeBlockActionsCopyButton = createElementAndClass("button", "pf-c-button pf-m-plain");
    codeBlockActionsCopyButton.type = "button";
    codeBlockActionsCopyButton.addEventListener("click", () =>
        copyCodeToClipboard(codeBlockActionsCopyButton, highlightDiv)
    );
    const codeBlockActionsCopyButtonIcon = createElementAndClass("i", "fas fa-copy");
    codeBlockActionsCopyButton.appendChild(codeBlockActionsCopyButtonIcon);
    addCopyButtonToDom(codeBlockActionsCopyButton, highlightDiv);
}

async function copyCodeToClipboard(button, highlightDiv) {
    const codeToCopy = highlightDiv.querySelector(":last-child > .highlight > code")
    .innerText;
    try {
    result = await navigator.permissions.query({ name: "clipboard-write" });
    if (result.state == "granted" || result.state == "prompt") {
     await navigator.clipboard.writeText(codeToCopy);
    } else {
        copyCodeBlockExecCommand(codeToCopy, highlightDiv);
    }
    } catch (_) {
        copyCodeBlockExecCommand(codeToCopy, highlightDiv);
    } finally {

        codeWasCopied(button);
    }
}

function copyCodeBlockExecCommand(codeToCopy, highlightDiv) {
    const textArea = document.createElement("textArea");
    textArea.contentEditable = "true";
    textArea.readOnly = "false";
    textArea.className = "copyable-text-area";
    textArea.value = codeToCopy;
    highlightDiv.insertBefore(textArea, highlightDiv.firstChild);
    const range = document.createRange();
    range.selectNodeContents(textArea);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    textArea.setSelectionRange(0, 999999);
    document.execCommand("copy");
    highlightDiv.removeChild(textArea);
}

function codeWasCopied(button) {
    button.blur();
    const icon = document.createElement("i");
    icon.className = "fas fa-check";
    button.replaceChild(icon, button.firstChild);
    setTimeout(function () {
        const icon = document.createElement("i");
        icon.className = "fas fa-copy";
        button.replaceChild(icon, button.firstChild);
    }, 2000);
}

function addCopyButtonToDom(button, highlightDiv) {
    dataLang = highlightDiv.querySelector("pre > code[data-lang]").attributes["data-lang"].value;
    highlightDiv.classList.add("pf-c-code-block__content")
    pre = highlightDiv.getElementsByTagName("pre");
    pre[0].classList.add("pf-c-code-block__pre")
    code = pre[0].getElementsByTagName("code");
    code[0].classList.add("pf-c-code-block__code")
    console.log(highlightDiv);
    highlightDiv.insertBefore(button, highlightDiv.firstChild);
    const codeBlock = createElementAndClass("div", "pf-c-code-block");
    codeBlock.setAttribute("data-lang", dataLang)
    const codeBlockHeader = createElementAndClass("div", "pf-c-code-block__header");
    const codeBlockActions = createElementAndClass("div", "pf-c-code-block__actions");
    const codeBlockActionsCopy = createElementAndClass("div", "pf-c-code-block__actions-item");
    codeBlockActionsCopy.appendChild(button);
    codeBlockActions.appendChild(codeBlockActionsCopy);
    codeBlockHeader.appendChild(codeBlockActions);
    codeBlock.appendChild(codeBlockHeader);
    highlightDiv.parentNode.insertBefore(codeBlock, highlightDiv);
    codeBlock.appendChild(highlightDiv);
    // const wrapper = document.createElement("div");
    // wrapper.className = "highlight-wrapper";
    // highlightDiv.parentNode.insertBefore(wrapper, highlightDiv);
    // wrapper.appendChild(highlightDiv);
}

document.querySelectorAll(".listingblock .content").forEach((highlightDiv) => createCopyButton(highlightDiv));
