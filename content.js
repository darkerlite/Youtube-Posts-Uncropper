function isPostPage() {
    const path = window.location.pathname;

    return (
        path.startsWith("/post/") ||
        /^\/@[^/]+\/posts\/?$/.test(path)
    );
}


function removeSizeParameter(url) {
    if (!url) return url;

    return url.replace(/=s[^&\s]+$/, "");
}


function fixImage(img) {
    // Fix src
    if (img.hasAttribute("src")) {
        const oldSrc = img.getAttribute("src");
        const newSrc = removeSizeParameter(oldSrc);

        if (oldSrc !== newSrc) {
            img.setAttribute("src", newSrc);
        }
    }

    // Fix srcset
    if (img.hasAttribute("srcset")) {
        const oldSrcset = img.getAttribute("srcset");

        const newSrcset = oldSrcset
            .split(",")
            .map(part => {
                const pieces = part.trim().split(/\s+/);

                if (pieces.length > 0) {
                    pieces[0] = removeSizeParameter(pieces[0]);
                }

                return pieces.join(" ");
            })
            .join(", ");

        if (oldSrcset !== newSrcset) {
            img.setAttribute("srcset", newSrcset);
        }
    }
}


function scanNode(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    if (node.tagName === "IMG") {
        fixImage(node);
    }

    node.querySelectorAll("img").forEach(fixImage);
}


// Fix images that already exist
if (isPostPage()) {
    document.querySelectorAll("img").forEach(fixImage);
}


// Watch for YouTube adding or changing images
const observer = new MutationObserver(mutations => {
    if (!isPostPage()) return;

    for (const mutation of mutations) {

        // New elements added to the page
        for (const node of mutation.addedNodes) {
            scanNode(node);
        }

        // Existing image changed
        if (
            mutation.type === "attributes" &&
            mutation.target.tagName === "IMG"
        ) {
            fixImage(mutation.target);
        }
    }
});


observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["src", "srcset"]
});