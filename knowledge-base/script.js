const blogList = document.getElementById("blog-list");

function renderPosts(postArray) {

    blogList.innerHTML = "";

    postArray.forEach(post => {

        const tagsHTML = post.tags
            .map(tag => `<span class="tag">${tag}</span>`)
            .join("");

        const article = document.createElement("article");

        article.onclick = () => {
            window.location.href = `post.html?id=${post.id}`;
        };

        article.className = "blog-card";

        article.innerHTML = `
            <div class="blog-meta">
                <span class="date">${post.date}</span>
                <span class="read-time">${post.readTime}</span>
            </div>

            <h2 class="blog-title">${post.title}</h2>

            <p>${post.description}</p>

            <div class="tag-container">
                ${tagsHTML}
            </div>

            <a href="post.html?id=${post.id}"
            class="read-more-btn">
            ${post.file}
            </a>
        `;

        blogList.appendChild(article);
    });
}


function openPost(postId) {
    window.location.href = `post.html?id=${postId}`;
}
function openPostModal(postId) {

    const post = posts.find(p => p.id === postId);

    if (!post) return;

    document.getElementById("postModalTitle").innerText = post.file;
    document.getElementById("postModalBody").innerHTML = post.content;

    document.getElementById("postModal").style.display = "block";

    document.body.style.overflow = "hidden";
}

function closePost() {
    document.getElementById("postModal").style.display = "none";
    document.body.style.overflow = "auto";
}

window.onclick = function (event) {

    const modal = document.getElementById("postModal");

    if (event.target === modal) {
        closePost();
    }
};

// Initial render
renderPosts(posts);

// Search functionality
const searchInput = document.getElementById("blogSearch");

searchInput.addEventListener("input", (e) => {

    const value = e.target.value.toLowerCase();

    const filteredPosts = posts.filter(post => {

        return (
            post.title.toLowerCase().includes(value) ||
            post.description.toLowerCase().includes(value) ||
            post.tags.join(" ").toLowerCase().includes(value)
        );

    });

    renderPosts(filteredPosts);
});