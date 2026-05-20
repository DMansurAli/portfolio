document.addEventListener('DOMContentLoaded', () => {
    const projectData = {
backoffice: {
    title: "Project_Details: Backoffice System v1",
    content: `
        <p>
            <span style="color:var(--code-purple)">[Summary]</span>
            Backoffice and e-commerce system built for Cronysoft, serving
            USA-based retailers, shops, and B2B clients.
        </p>

        <ul>
            <li>
                Developed RESTful backend APIs using <strong>.NET Core Web API</strong>
                with <strong>Clean Architecture</strong> and the <strong>Repository Pattern</strong>,
                backed by <strong>MS SQL Server</strong>.
            </li>

            <li>
                Built e-commerce and backoffice modules covering orders, customer operations,
                purchasing, and refund workflows.
            </li>

            <li>
                Collaborated with the Flutter team to support cross-platform apps
                across mobile, tablet, web, and desktop.
            </li>

            <li>
                Built internal operational portals using <strong>ASP.NET Core MVC</strong>
                for support and backoffice workflows.
            </li>

            <li>
                Integrated third-party payment gateways, email services,
                and <strong>Twilio</strong> SMS notifications.
            </li>

            <li>
                Implemented real-time screen updates using <strong>SignalR</strong>.
            </li>

            <li>
                Secured APIs with <strong>OAuth 2.0</strong> and <strong>JWT</strong>-based authentication.
            </li>

            <li>
                Deployed on <strong>Azure</strong>, using Blob Storage for
                document and image management.
            </li>

            <li>
                Managed source control and team collaboration using <strong>Git</strong>.
            </li>
        </ul>
    `
},
    };

    // Make functions global so HTML onclick can see them
    window.openModal = function (id) {
        const modal = document.getElementById('projectModal');
        document.getElementById('modalTitle').innerText = projectData[id].title;
        document.getElementById('modalBody').innerHTML = projectData[id].content;
        modal.style.display = "block";
        document.body.style.overflow = "hidden"; // Prevent scroll
    }

    window.closeModal = function () {
        document.getElementById('projectModal').style.display = "none";
        document.body.style.overflow = "auto";
    }

    window.onclick = function (event) {
        let modal = document.getElementById('projectModal');
        if (event.target == modal) { closeModal(); }
    }

    // Add Escape key support
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") closeModal();
    });
});
